/**
 * Imports: bringing your videos in from elsewhere, picked from a list.
 *
 * - YouTube (a channel, a playlist or single videos), through yt-dlp (ytdlp.js). Off until an admin turns it on
 *   (imports_youtube), since YouTube changes often and blocks some servers; people confirm the videos are theirs
 *   or that they may post them.
 * - Immich: a shared link made in Immich (no account needed), or the person's whole library through an Immich API
 *   key they connect here. Addresses in this server's own network are only reachable for admins (outbound.js).
 *
 * Each picked video is fetched in the background, one at a time (the transfer lane), and becomes a video of the
 * importer's like an upload: processed, with its title, description, tags and thumbnail, and its original date
 * when they ask for it. Imports don't notify subscribers or fire webhooks (a whole back catalogue would flood
 * them), and a video already imported is skipped.
 */
import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { db, getSettings } from './db.js';
import { DIRS } from './config.js';
import { requireAuth } from './auth.js';
import { HttpError, newId, now, parseTags, str } from './util.js';
import { defineJob, enqueueJob } from './jobs.js';
import { convertImage, enqueue as enqueueProcessing } from './media.js';
import { setTags, storageFor } from './routes/videos.js';
import { checkServerSpace } from './storage.js';
import { indexVideo } from './search.js';
import { pickVisibility } from './groups.js';
import { download, mayReachPrivate, request, requestJson } from './outbound.js';
import { downloadYoutube, listYoutube, ytdlpVersion } from './ytdlp.js';

export const importsRouter = Router();
importsRouter.use(requireAuth);

const youtubeOn = () => getSettings().imports_youtube === 'true';
const VISIBILITIES = new Set(['public', 'unlisted', 'private', 'group']);
const MAX_PICK = 500;

/** Which of these import keys this person already has, as a video or an import on its way. */
function alreadyHave(userId, keys) {
  const have = new Set();
  for (const k of keys) {
    if (db.prepare('SELECT 1 FROM videos WHERE user_id = ? AND import_key = ?').get(userId, k)) have.add(k);
    else if (db.prepare("SELECT 1 FROM imports WHERE user_id = ? AND import_key = ? AND status IN ('queued', 'running', 'done')").get(userId, k)) have.add(k);
  }
  return have;
}

const importRow = (r) => ({
  id: r.id,
  source: r.source,
  title: r.title,
  status: r.status,
  progress: r.progress,
  error: r.error,
  video_id: r.video_id,
  created_at: r.created_at,
  finished_at: r.finished_at,
});

importsRouter.get('/', async (req, res) => {
  const items = db.prepare('SELECT * FROM imports WHERE user_id = ? ORDER BY created_at DESC LIMIT 200').all(req.user.id).map(importRow);
  const acct = db.prepare('SELECT url, name FROM immich_accounts WHERE user_id = ?').get(req.user.id);
  res.json({
    youtube: { enabled: youtubeOn(), available: youtubeOn() ? !!(await ytdlpVersion()) : null },
    immich: acct ? { connected: true, url: acct.url, name: acct.name } : { connected: false },
    items,
  });
});

// ---- YouTube ------------------------------------------------------------------------------------------------

importsRouter.post('/youtube/list', async (req, res) => {
  if (!youtubeOn()) throw new HttpError(403, 'Importing from YouTube is turned off on this server');
  const list = await listYoutube(req.body?.url, { limit: MAX_PICK });
  const have = alreadyHave(req.user.id, list.videos.map((v) => `youtube#${v.id}`));
  res.json({ title: list.title, videos: list.videos.map((v) => ({ ...v, ref: v.id, imported: have.has(`youtube#${v.id}`) })) });
});

// ---- Immich -------------------------------------------------------------------------------------------------

/** An Immich shared link: its server, and how to name it to the API (?key= or ?slug=). */
function shareLink(input) {
  let u;
  try {
    u = new URL(String(input || '').trim());
  } catch {
    throw new HttpError(400, 'Paste the shared link from Immich (it looks like https://your-immich/share/...)');
  }
  const m = /^(.*)\/(share|s)\/([A-Za-z0-9_-]+)\/?$/.exec(u.pathname);
  if (!/^https?:$/.test(u.protocol) || !m) throw new HttpError(400, 'That is not an Immich shared link (it should have /share/ in it)');
  return { origin: `${u.origin}${m[1]}`, param: m[2] === 's' ? 'slug' : 'key', value: m[3] };
}

/** How to reach a person's Immich: through a shared link, or their connected account. */
function immichAuth(user, opts) {
  if (opts.share) {
    const q = `${opts.share.param}=${encodeURIComponent(opts.share.value)}`;
    return { origin: opts.share.origin, query: (p) => `${p}${p.includes('?') ? '&' : '?'}${q}`, headers: {}, allowPrivate: mayReachPrivate(user.id) };
  }
  const acct = db.prepare('SELECT * FROM immich_accounts WHERE user_id = ?').get(user.id);
  if (!acct) throw new HttpError(400, 'Connect your Immich first');
  return { origin: acct.url, query: (p) => p, headers: { 'x-api-key': acct.api_key }, allowPrivate: mayReachPrivate(user.id) };
}

// Immich durations look like 0:01:23.456000.
const seconds = (d) => {
  const p = String(d || '').split(':').map(Number);
  return p.length === 3 && p.every(Number.isFinite) ? Math.round(p[0] * 3600 + p[1] * 60 + p[2]) : null;
};
const assetTitle = (a) => {
  const caption = str(a.exifInfo?.description, 500).trim().split('\n')[0];
  return (caption || path.basename(String(a.originalFileName || ''), path.extname(String(a.originalFileName || ''))) || 'Untitled video').slice(0, 120);
};

async function immichAssets(auth, link, page) {
  const get = (p) => requestJson(`${auth.origin}${auth.query(p)}`, { headers: auth.headers, allowPrivate: auth.allowPrivate });
  if (link) {
    const share = await get('/api/shared-links/me');
    if (share.allowDownload === false) throw new HttpError(400, 'This shared link doesn\'t allow downloads. In Immich, edit the link and turn on "Allow download".');
    let assets = Array.isArray(share.assets) ? share.assets : [];
    if (!assets.length && share.album?.id) assets = (await get(`/api/albums/${encodeURIComponent(share.album.id)}`)).assets || [];
    return { title: share.album?.albumName || share.description || '', assets, next: null };
  }
  const r = await requestJson(`${auth.origin}/api/search/metadata`, {
    method: 'POST',
    headers: auth.headers,
    allowPrivate: auth.allowPrivate,
    body: { type: 'VIDEO', page: page || 1, size: 100, order: 'desc', withExif: true },
  });
  return { title: '', assets: r.assets?.items || [], next: r.assets?.nextPage ? Number(r.assets.nextPage) : null };
}

importsRouter.post('/immich/list', async (req, res) => {
  const share = req.body?.link ? shareLink(req.body.link) : null;
  const auth = immichAuth(req.user, { share });
  const host = new URL(auth.origin).host;
  const { title, assets, next } = await immichAssets(auth, !!share, Number(req.body?.page) || 1);
  const videos = assets
    .filter((a) => a && a.type === 'VIDEO' && typeof a.id === 'string' && /^[0-9a-f-]{36}$/i.test(a.id))
    .slice(0, MAX_PICK)
    .map((a) => ({
      ref: a.id,
      title: assetTitle(a),
      duration: seconds(a.duration),
      created_at: Date.parse(a.fileCreatedAt || a.localDateTime || '') || null,
      // A shared link's thumbnails load straight from Immich; an account's go through here (they need the key).
      thumbnail: share ? `${auth.origin}${auth.query(`/api/assets/${a.id}/thumbnail?size=thumbnail`)}` : `/api/imports/immich/thumbnail/${a.id}`,
    }));
  const have = alreadyHave(req.user.id, videos.map((v) => `immich#${host}#${v.ref}`));
  res.json({ title, next, videos: videos.map((v) => ({ ...v, imported: have.has(`immich#${host}#${v.ref}`) })) });
});

importsRouter.get('/immich/thumbnail/:id', async (req, res) => {
  if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) throw new HttpError(404, 'Not found');
  const auth = immichAuth(req.user, {});
  const r = await request(`${auth.origin}/api/assets/${req.params.id}/thumbnail?size=thumbnail`, { headers: auth.headers, allowPrivate: auth.allowPrivate });
  if (r.statusCode >= 400 || !/^image\//.test(String(r.headers['content-type'] || ''))) {
    r.resume();
    throw new HttpError(404, 'Not found');
  }
  res.set({ 'Content-Type': r.headers['content-type'], 'Cache-Control': 'private, max-age=3600' });
  r.pipe(res);
});

// Connecting an account: the key is checked against Immich, kept here, and never shown again.
importsRouter.put('/immich/account', async (req, res) => {
  let url;
  try {
    const u = new URL(String(req.body?.url || '').trim());
    if (!/^https?:$/.test(u.protocol)) throw new Error();
    url = `${u.origin}${u.pathname.replace(/\/+$/, '').replace(/\/api$/, '')}`;
  } catch {
    throw new HttpError(400, 'Enter your Immich address, like https://photos.example.com');
  }
  const key = String(req.body?.api_key || '').trim();
  if (!/^[A-Za-z0-9_-]{20,200}$/.test(key)) throw new HttpError(400, 'Paste the API key from Immich (Account settings, API keys)');
  const opts = { headers: { 'x-api-key': key }, allowPrivate: mayReachPrivate(req.user.id) };
  await requestJson(`${url}/api/search/metadata`, { ...opts, method: 'POST', body: { type: 'VIDEO', page: 1, size: 1 } });
  const me = await requestJson(`${url}/api/users/me`, opts).catch(() => null);
  db.prepare('INSERT INTO immich_accounts (user_id, url, api_key, name, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET url = excluded.url, api_key = excluded.api_key, name = excluded.name').run(
    req.user.id, url, key, str(me?.name || me?.email || '', 80) || null, now(),
  );
  res.json({ immich: { connected: true, url, name: me?.name || me?.email || null } });
});

importsRouter.delete('/immich/account', (req, res) => {
  db.prepare('DELETE FROM immich_accounts WHERE user_id = ?').run(req.user.id);
  res.json({ immich: { connected: false } });
});

// ---- starting, retrying and clearing imports ----------------------------------------------------------------

importsRouter.post('/', (req, res) => {
  const b = req.body || {};
  const picked = (Array.isArray(b.videos) ? b.videos : []).slice(0, MAX_PICK);
  if (!picked.length) throw new HttpError(400, 'Pick at least one video');
  const visibility = VISIBILITIES.has(b.visibility) ? b.visibility : 'private';
  const choice = pickVisibility(req.user, visibility, b.group_id);
  const options = { visibility: choice.visibility, group_id: choice.group_id, keep_dates: b.keep_dates !== false };
  let source;
  let items;
  if (b.source === 'youtube') {
    if (!youtubeOn()) throw new HttpError(403, 'Importing from YouTube is turned off on this server');
    if (b.rights !== true) throw new HttpError(400, 'Confirm that these are your videos, or that you may post them here');
    source = 'youtube';
    items = picked
      .filter((p) => /^[A-Za-z0-9_-]{6,20}$/.test(String(p?.ref || '')))
      .map((p) => ({ ref: `https://www.youtube.com/watch?v=${p.ref}`, key: `youtube#${p.ref}`, title: str(p.title, 200) }));
  } else if (b.source === 'immich') {
    source = 'immich';
    const share = b.link ? shareLink(b.link) : null;
    const auth = immichAuth(req.user, { share });
    if (share) options.share = share;
    const host = new URL(auth.origin).host;
    items = picked
      .filter((p) => /^[0-9a-f-]{36}$/i.test(String(p?.ref || '')))
      .map((p) => ({ ref: p.ref, key: `immich#${host}#${p.ref}`, title: str(p.title, 200) }));
  } else {
    throw new HttpError(400, 'Import from youtube or immich');
  }
  const have = alreadyHave(req.user.id, items.map((i) => i.key));
  const t = now();
  const started = [];
  for (const it of items) {
    if (have.has(it.key)) continue;
    have.add(it.key);
    const id = newId();
    db.prepare('INSERT INTO imports (id, user_id, source, ref, import_key, title, options, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      id, req.user.id, source, it.ref, it.key, it.title, JSON.stringify(options), t,
    );
    enqueueJob('import.run', { id }, { dedupe: `import:${id}` });
    started.push(id);
  }
  res.status(201).json({ started: started.length, skipped: items.length - started.length });
});

importsRouter.post('/:id/retry', (req, res) => {
  const r = db.prepare("SELECT * FROM imports WHERE id = ? AND user_id = ? AND status = 'failed'").get(String(req.params.id), req.user.id);
  if (!r) throw new HttpError(404, 'Import not found');
  db.prepare("UPDATE imports SET status = 'queued', progress = 0, error = NULL, finished_at = NULL WHERE id = ?").run(r.id);
  enqueueJob('import.run', { id: r.id }, { dedupe: `import:${r.id}:${now()}` });
  res.json({ ok: true });
});

// Clears an import from the list; one still waiting is cancelled. One already running finishes first.
importsRouter.delete('/:id', (req, res) => {
  const r = db.prepare('SELECT * FROM imports WHERE id = ? AND user_id = ?').get(String(req.params.id), req.user.id);
  if (!r) throw new HttpError(404, 'Import not found');
  if (r.status === 'running') throw new HttpError(409, 'This one is being fetched right now; clear it when it finishes');
  db.prepare('DELETE FROM imports WHERE id = ?').run(r.id);
  res.json({ ok: true });
});

// ---- the work, in the background ------------------------------------------------------------------------------

/** Chapters yt-dlp read, written into the description the way the player reads them, when it doesn't have them. */
function withChapters(description, chapters) {
  if (!Array.isArray(chapters) || chapters.length < 2 || /(^|\n)\s*\(?0?0:00\b/.test(description)) return description;
  const ts = (s) => {
    const t = Math.max(0, Math.floor(Number(s) || 0));
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const sec = String(t % 60).padStart(2, '0');
    return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
  };
  return `${description ? `${description}\n\n` : ''}Chapters:\n${chapters.map((c) => `${ts(c.start_time)} ${str(c.title, 100)}`).join('\n')}`.slice(0, 5000);
}

function roomFor(user, bytes) {
  checkServerSpace(bytes);
  const { used, quota } = storageFor(user.id);
  if (quota > 0 && used + bytes > quota) throw new HttpError(413, 'This video would go over your storage quota');
}

async function fetchYoutube(imp, user, dir, onProgress) {
  if (!youtubeOn()) throw new HttpError(403, 'Importing from YouTube was turned off on this server');
  const { file, info, thumbnail } = await downloadYoutube(imp.ref, dir, { maxHeight: Number(getSettings().max_height) || 1080, onProgress });
  const d = /^(\d{4})(\d{2})(\d{2})$/.exec(String(info.upload_date || ''));
  return {
    file,
    thumbnail,
    title: str(info.title, 120).trim() || imp.title || 'Untitled video',
    description: withChapters(str(info.description, 5000), info.chapters),
    tags: (Array.isArray(info.tags) ? info.tags : []).slice(0, 15),
    date: info.timestamp ? info.timestamp * 1000 : d ? Date.UTC(+d[1], +d[2] - 1, +d[3], 12) : null,
  };
}

async function fetchImmich(imp, user, dir, onProgress) {
  const opts = JSON.parse(imp.options || '{}');
  const auth = immichAuth(user, opts);
  const asset = await requestJson(`${auth.origin}${auth.query(`/api/assets/${imp.ref}`)}`, { headers: auth.headers, allowPrivate: auth.allowPrivate });
  if (asset.type !== 'VIDEO') throw new HttpError(400, 'That is not a video');
  const size = Number(asset.exifInfo?.fileSizeInByte) || 0;
  roomFor(user, size);
  const ext = (path.extname(String(asset.originalFileName || '')).toLowerCase().match(/^\.[a-z0-9]{1,5}$/) || ['.mp4'])[0];
  const file = path.join(dir, `original${ext}`);
  await download(`${auth.origin}${auth.query(`/api/assets/${imp.ref}/original`)}`, file, { headers: auth.headers, allowPrivate: auth.allowPrivate, onProgress });
  return {
    file,
    thumbnail: null,
    title: assetTitle(asset),
    description: str(asset.exifInfo?.description, 5000),
    tags: [],
    date: Date.parse(asset.fileCreatedAt || asset.localDateTime || '') || null,
  };
}

/** Makes the fetched file a video of the importer's, like an upload. Returns its id. */
async function createVideo(imp, user, got) {
  const existing = db.prepare('SELECT id FROM videos WHERE user_id = ? AND import_key = ?').get(user.id, imp.import_key);
  if (existing) return existing.id;
  const size = fs.statSync(got.file).size;
  roomFor(user, size);
  const opts = JSON.parse(imp.options || '{}');
  // The group may be gone, or the importer no longer in it, since the import was picked.
  let choice;
  try {
    choice = pickVisibility(user, opts.visibility || 'private', opts.group_id);
  } catch {
    choice = { visibility: 'private', group_id: null };
  }
  const id = newId();
  const ext = path.extname(got.file).toLowerCase() || '.mp4';
  const original = `${id}${ext}`;
  fs.copyFileSync(got.file, path.join(DIRS.originals, original));
  let thumb = null;
  if (got.thumbnail) {
    try {
      await convertImage(got.thumbnail, path.join(DIRS.thumbs, `${id}.jpg`), 'thumb');
      thumb = `${id}.jpg`;
    } catch {}
  }
  const t = now();
  const created = opts.keep_dates !== false && got.date && got.date < t ? got.date : t;
  db.prepare(
    `INSERT INTO videos (id, user_id, title, description, visibility, group_id, status, original_name, original_path, size_bytes, created_at, updated_at, published_at,
       thumb_path, custom_thumb, import_key, notified_at)
     VALUES (?, ?, ?, ?, ?, ?, 'queued', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id, user.id, got.title, got.description, choice.visibility, choice.group_id, path.basename(got.file).slice(0, 255), original, size, created, t, created,
    thumb, thumb ? 1 : 0, imp.import_key, t,
  );
  setTags(id, parseTags(got.tags));
  indexVideo(id);
  enqueueProcessing(id);
  return id;
}

defineJob('import.run', {
  lane: 'transfer',
  maxAttempts: 1,
  handler: async ({ id }) => {
    const imp = db.prepare('SELECT * FROM imports WHERE id = ?').get(id);
    // 'running' is one the server stopped in the middle of; its job comes back after a restart and starts over.
    if (!imp || (imp.status !== 'queued' && imp.status !== 'running')) return;
    const fail = (msg) => db.prepare("UPDATE imports SET status = 'failed', error = ?, finished_at = ? WHERE id = ?").run(str(msg, 500), now(), imp.id);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(imp.user_id);
    if (!user || user.status !== 'active') return fail('This account is not active');
    db.prepare("UPDATE imports SET status = 'running', progress = 0 WHERE id = ?").run(imp.id);
    let last = 0;
    const onProgress = (p) => {
      if (Date.now() - last < 1000) return;
      last = Date.now();
      db.prepare('UPDATE imports SET progress = ? WHERE id = ?').run(Math.round(p * 1000) / 1000, imp.id);
    };
    const dir = path.join(DIRS.tmp, `import-${imp.id}`);
    fs.mkdirSync(dir, { recursive: true });
    try {
      const got = imp.source === 'youtube' ? await fetchYoutube(imp, user, dir, onProgress) : await fetchImmich(imp, user, dir, onProgress);
      const videoId = await createVideo(imp, user, got);
      db.prepare("UPDATE imports SET status = 'done', progress = 1, video_id = ?, title = ?, finished_at = ? WHERE id = ?").run(videoId, got.title, now(), imp.id);
    } catch (e) {
      fail(e.message);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  },
});
