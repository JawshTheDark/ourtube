/**
 * Embedding videos on other sites (WordPress, blogs, forums):
 *
 * - /embed/<id> is a small player page made to sit in an iframe: no app bundle, no sign-in, no calls back to the
 *   API (so it also works in the locked-down iframes WordPress uses), the video's MP4 and poster, the title and
 *   the site's name. ?start=<seconds>, ?autoplay=1 (muted, as browsers require) and ?loop=1 work.
 * - /api/oembed answers oEmbed (https://oembed.com) for watch, Shorts and embed links, so pasting a link into
 *   WordPress's Embed block (or anything else that speaks oEmbed) finds the player. Watch pages name it in a
 *   <link rel="alternate" type="application/json+oembed"> (server/index.js).
 *
 * Public and unlisted videos embed, like sharing their link; private, unfinished or removed ones don't.
 */
import { Router } from 'express';
import { db, getSettings } from './db.js';
import { HttpError, escapeHtml } from './util.js';

export const embedRouter = Router();

const siteBase = (req) => (getSettings().public_url || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');

function embeddable(id) {
  const v = db
    .prepare(
      `SELECT v.id, v.title, v.width, v.height, v.duration, v.thumb_path, v.visibility, u.username, u.display_name
       FROM videos v JOIN users u ON u.id = v.user_id
       WHERE v.id = ? AND v.status = 'ready' AND v.visibility IN ('public', 'unlisted') AND v.moderation_status IS NULL`,
    )
    .get(String(id));
  if (!v) throw new HttpError(404, 'This video is not available');
  return v;
}

/** The player's size: 560 wide for landscape, 560 tall for vertical, made to fit maxwidth / maxheight. */
function frameSize(v, maxWidth, maxHeight) {
  const w = v.width > 0 ? v.width : 16;
  const h = v.height > 0 ? v.height : 9;
  let width = h > w ? Math.round((560 * w) / h) : 560;
  let height = h > w ? 560 : Math.round((560 * h) / w);
  const scale = Math.min(1, maxWidth > 0 ? maxWidth / width : 1, maxHeight > 0 ? maxHeight / height : 1);
  width = Math.max(1, Math.floor(width * scale));
  height = Math.max(1, Math.floor(height * scale));
  return { width, height };
}

const seconds = (s) => {
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 10) / 10 : 0;
};

embedRouter.get('/embed/:id', (req, res) => {
  let v;
  try {
    v = embeddable(req.params.id);
  } catch {
    return res.status(404).type('html').send('<!doctype html><meta charset="utf-8"><body style="margin:0;background:#0e0d16;color:#a19db8;font:15px system-ui;display:grid;place-items:center;height:100vh">This video is not available.</body>');
  }
  const settings = getSettings();
  const base = siteBase(req);
  const start = seconds(req.query.start ?? req.query.t);
  const autoplay = req.query.autoplay === '1';
  const loop = req.query.loop === '1';
  const watchUrl = `${base}/${v.height > v.width ? 'shorts' : 'watch'}/${v.id}${start ? `?t=${start}` : ''}`;
  const src = `${base}/media/videos/${v.id}.mp4${start ? `#t=${start}` : ''}`;
  const poster = v.thumb_path ? `${base}/media/thumbs/${v.thumb_path}` : '';
  // Counting the view needs nothing back, so a no-cors POST works from any iframe, sandboxed or not.
  const viewUrl = JSON.stringify(`${base}/api/videos/${v.id}/view`).replace(/</g, '\\u003c');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.type('html').send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="same-origin">
<title>${escapeHtml(v.title)} - ${escapeHtml(settings.site_name)}</title>
<link rel="canonical" href="${escapeHtml(watchUrl)}">
<style>
  html, body { margin: 0; height: 100%; background: #000; overflow: hidden; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; }
  video { display: block; width: 100%; height: 100%; background: #000; object-fit: contain; }
  .bar { position: absolute; top: 0; left: 0; right: 0; display: flex; align-items: center; gap: 10px; padding: 10px 14px 24px;
    background: linear-gradient(rgba(8, 6, 16, 0.85), transparent); color: #fff; transition: opacity 0.2s; pointer-events: none; }
  .bar a { min-width: 0; overflow: hidden; color: #fff; font-size: 15px; font-weight: 700; text-decoration: none; text-overflow: ellipsis; white-space: nowrap; pointer-events: auto; }
  .bar a:hover { text-decoration: underline; }
  .site { flex-shrink: 0; margin-left: auto; padding: 2px 8px; border-radius: 6px; background: rgba(124, 77, 255, 0.85); font-size: 12px; font-weight: 700; }
  body.playing .bar { opacity: 0; }
  body.playing:hover .bar { opacity: 1; }
</style>
</head>
<body>
<video id="v" src="${escapeHtml(src)}"${poster ? ` poster="${escapeHtml(poster)}"` : ''} controls playsinline preload="metadata"${autoplay ? ' autoplay muted' : ''}${loop ? ' loop' : ''}></video>
<div class="bar"><a href="${escapeHtml(watchUrl)}" target="_blank" rel="noopener">${escapeHtml(v.title)}</a><span class="site">${escapeHtml(settings.site_name)}</span></div>
<script>
  const v = document.getElementById('v');
  let counted = false;
  v.addEventListener('play', () => {
    document.body.classList.add('playing');
    if (!counted) {
      counted = true;
      fetch(${viewUrl}, { method: 'POST', mode: 'no-cors' }).catch(() => {});
    }
  });
  v.addEventListener('pause', () => document.body.classList.remove('playing'));
</script>
</body>
</html>`);
});

/** oEmbed for this site's watch, Shorts and embed links. */
embedRouter.get('/api/oembed', (req, res) => {
  if (req.query.format && req.query.format !== 'json') throw new HttpError(501, 'Only the JSON format is available');
  const base = siteBase(req);
  let u;
  try {
    u = new URL(String(req.query.url || ''));
  } catch {
    throw new HttpError(404, 'Not a link to a video here');
  }
  const m = /^\/(?:watch|shorts|embed)\/([A-Za-z0-9_-]+)\/?$/.exec(u.pathname);
  if (u.host !== new URL(base).host || !m) throw new HttpError(404, 'Not a link to a video here');
  const v = embeddable(m[1]);
  const settings = getSettings();
  const { width, height } = frameSize(v, Number(req.query.maxwidth), Number(req.query.maxheight));
  const start = seconds(u.searchParams.get('t') ?? u.searchParams.get('start'));
  const src = `${base}/embed/${v.id}${start ? `?start=${start}` : ''}`;
  const thumbH = v.width > 0 && v.height > 0 ? Math.round((1280 * v.height) / v.width) : 720;
  res.json({
    version: '1.0',
    type: 'video',
    provider_name: settings.site_name,
    provider_url: `${base}/`,
    title: v.title,
    author_name: v.display_name || v.username,
    author_url: `${base}/c/${v.username}`,
    ...(v.thumb_path ? { thumbnail_url: `${base}/media/thumbs/${v.thumb_path}`, thumbnail_width: 1280, thumbnail_height: thumbH } : {}),
    width,
    height,
    html: `<iframe src="${escapeHtml(src)}" width="${width}" height="${height}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${escapeHtml(v.title)}"></iframe>`,
  });
});
