/**
 * yt-dlp, for importing videos from YouTube. The Docker image carries the standalone yt-dlp for its CPU in
 * /opt/yt-dlp (kept up to date with `yt-dlp -U`, at most once a day, since YouTube changes often); elsewhere it
 * is YTDLP_PATH or `yt-dlp` on PATH. It solves YouTube's JavaScript with this server's own Node.js, and uses
 * data/youtube-cookies.txt when present, for servers that YouTube asks to sign in.
 */
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './config.js';
import { ffmpegBin, run } from './media.js';
import { HttpError } from './util.js';

const BUNDLED = '/opt/yt-dlp/yt-dlp';
const BIN = process.env.YTDLP_PATH || (fs.existsSync(BUNDLED) ? BUNDLED : 'yt-dlp');
const COOKIES = path.join(DATA_DIR, 'youtube-cookies.txt');
// A script (the tests' stand-in) runs under this Node.js.
const command = (args) => (/\.(m?js)$/.test(BIN) ? [process.execPath, [BIN, ...args]] : [BIN, args]);

const common = () => [
  '--ignore-config',
  '--no-warnings',
  '--js-runtimes',
  `node:${process.execPath}`,
  '--ffmpeg-location',
  ffmpegBin,
  ...(fs.existsSync(COOKIES) ? ['--cookies', COOKIES] : []),
];

let checked = null;
/** The installed version, or null when yt-dlp isn't there. */
export async function ytdlpVersion() {
  if (checked && Date.now() - checked.at < 3600_000) return checked.version;
  let version = null;
  try {
    const [bin, args] = command(['--version']);
    version = (await run(bin, args)).stdout.trim().split('\n')[0] || null;
  } catch {}
  checked = { at: Date.now(), version };
  return version;
}

let updatedAt = 0;
/** Brings the bundled yt-dlp up to date, once a day at most (YouTube breaks older versions). */
async function selfUpdate() {
  if (BIN !== BUNDLED || Date.now() - updatedAt < 24 * 3600_000) return;
  updatedAt = Date.now();
  try {
    await run(BIN, ['-U']);
    checked = null;
  } catch (e) {
    console.warn(`[imports] could not update yt-dlp: ${e.message.split('\n')[0]}`);
  }
}

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be']);
/** A YouTube address (a video, a Short, a playlist or a channel), or a 400. */
export function youtubeUrl(input) {
  let u;
  try {
    u = new URL(String(input || '').trim());
  } catch {
    throw new HttpError(400, 'Paste the address of a YouTube channel, playlist or video');
  }
  if (!/^https?:$/.test(u.protocol) || !YOUTUBE_HOSTS.has(u.hostname.toLowerCase())) throw new HttpError(400, 'That is not a YouTube address');
  return u.href;
}

function failure(e) {
  const text = String(e.message || '');
  if (/confirm you.re not a bot|Sign in to confirm/i.test(text)) {
    return new HttpError(502, 'YouTube wants this server to sign in before it shares videos. An admin can put a cookies.txt from a YouTube login in data/youtube-cookies.txt.');
  }
  if (/was not found on this server|ENOENT/i.test(text)) return new HttpError(503, 'yt-dlp is not installed on this server');
  // The runner's message ends with yt-dlp's last lines, joined with " | ".
  const m = /ERROR:\s*([^|]+)/.exec(text);
  return new HttpError(502, `YouTube: ${(m ? m[1] : text).trim().slice(0, 300)}`);
}

const entryOf = (e) => {
  const id = e?.id;
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{6,20}$/.test(id)) return null;
  return {
    id,
    title: String(e.title || '').slice(0, 200) || 'Untitled video',
    duration: Number(e.duration) || null,
    url: `https://www.youtube.com/watch?v=${id}`,
    thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
    short: /\/shorts\//.test(String(e.url || '')),
  };
};

async function flat(url, limit) {
  const [bin, args] = command([...common(), '--flat-playlist', '-J', '--playlist-end', String(limit), url]);
  return JSON.parse((await run(bin, args)).stdout);
}

/** The videos behind a YouTube address, newest first as YouTube lists them (up to `limit`). */
export async function listYoutube(input, { limit = 500 } = {}) {
  const url = youtubeUrl(input);
  await selfUpdate();
  let info;
  try {
    info = await flat(url, limit);
  } catch (e) {
    throw failure(e);
  }
  if (info._type !== 'playlist') {
    const one = entryOf(info);
    return { title: one?.title || '', videos: one ? [one] : [] };
  }
  const videos = [];
  for (const e of info.entries || []) {
    if (videos.length >= limit) break;
    // A channel's address lists its tabs (Videos, Shorts, Live): read each.
    if (e?._type === 'url' && /\/(videos|shorts|streams)\/?$/.test(String(e.url || ''))) {
      try {
        const tab = await flat(e.url, limit - videos.length);
        for (const t of tab.entries || []) {
          const v = entryOf(t);
          if (v) videos.push({ ...v, short: v.short || /\/shorts\/?$/.test(e.url) });
        }
      } catch {}
      continue;
    }
    const v = entryOf(e);
    if (v) videos.push(v);
  }
  const seen = new Set();
  return { title: String(info.title || info.channel || '').slice(0, 200), videos: videos.filter((v) => !seen.has(v.id) && seen.add(v.id)) };
}

/**
 * Downloads one video into `dir` as video.mp4, with video.info.json and video.jpg (its thumbnail), at most
 * `maxHeight` tall. Returns the paths and what yt-dlp said about it.
 */
export async function downloadYoutube(input, dir, { maxHeight = 1080, onProgress } = {}) {
  const url = youtubeUrl(input);
  await selfUpdate();
  const h = Math.max(144, Number(maxHeight) || 1080);
  const [bin, args] = command([
    ...common(),
    '--no-playlist',
    '--newline',
    '-f',
    `bv*[height<=${h}][ext=mp4]+ba[ext=m4a]/bv*[height<=${h}]+ba/b[height<=${h}]/b`,
    '--merge-output-format',
    'mp4',
    '--write-info-json',
    '--write-thumbnail',
    '--convert-thumbnails',
    'jpg',
    '-o',
    path.join(dir, 'video.%(ext)s'),
    url,
  ]);
  try {
    await run(bin, args, {
      onStdoutLine: (line) => {
        const m = /\[download\]\s+([\d.]+)%/.exec(line);
        if (m && onProgress) onProgress(Math.min(1, Number(m[1]) / 100));
      },
    });
  } catch (e) {
    throw failure(e);
  }
  const file = ['video.mp4', 'video.mkv', 'video.webm'].map((f) => path.join(dir, f)).find((f) => fs.existsSync(f));
  if (!file) throw new HttpError(502, 'yt-dlp finished without a video file');
  let info = {};
  try {
    info = JSON.parse(fs.readFileSync(path.join(dir, 'video.info.json'), 'utf8'));
  } catch {}
  const thumb = path.join(dir, 'video.jpg');
  return { file, info, thumbnail: fs.existsSync(thumb) ? thumb : null };
}
