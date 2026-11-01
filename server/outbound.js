/**
 * Requests this server makes to addresses people give it (an Immich server, for imports). Addresses in the
 * server's own network (localhost, the LAN, Docker networks) are only reachable for admins, as with webhooks:
 * the DNS lookup itself leaves private addresses out, so the address connected to is the address checked, and
 * each redirect is checked again.
 */
import dns from 'node:dns';
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import { ALLOW_PRIVATE_FEDERATION, VERSION } from './config.js';
import { db } from './db.js';
import { HttpError, isPrivateIp } from './util.js';

export const mayReachPrivate = (userId) => ALLOW_PRIVATE_FEDERATION || !!db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId)?.is_admin;

const publicLookup = (hostname, options, cb) =>
  dns.lookup(hostname, { ...options, all: true }, (err, addrs) => {
    if (err) return cb(err);
    const ok = addrs.filter((a) => !isPrivateIp(a.address));
    if (!ok.length) return cb(Object.assign(new Error(`${hostname} is in a private network, which only admins can reach from here`), { code: 'EPRIVATE' }));
    if (options.all) cb(null, ok);
    else cb(null, ok[0].address, ok[0].family);
  });

/** A GET or POST that answers with the response stream (following up to three redirects). */
export function request(url, { method = 'GET', headers = {}, body, allowPrivate = false, timeout = 20_000 } = {}, hops = 0) {
  return new Promise((resolve, reject) => {
    let u;
    try {
      u = new URL(url);
    } catch {
      return reject(new HttpError(400, `Not an address: ${url}`));
    }
    if (!/^https?:$/.test(u.protocol)) return reject(new HttpError(400, 'Only http and https addresses'));
    const host = u.hostname.replace(/^\[|\]$/g, '');
    if (!allowPrivate && net.isIP(host) && isPrivateIp(host)) return reject(new HttpError(400, `${host} is in a private network, which only admins can reach from here`));
    const payload = body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body);
    const req = (u.protocol === 'https:' ? https : http).request(
      u,
      {
        method,
        headers: {
          'User-Agent': `OurTube/${VERSION}`,
          Accept: 'application/json',
          ...(payload !== undefined ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers,
        },
        ...(allowPrivate ? {} : { lookup: publicLookup }),
        timeout,
      },
      (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && hops < 3) {
          res.resume();
          const next = new URL(res.headers.location, u).href;
          return resolve(request(next, { method: res.statusCode === 303 ? 'GET' : method, headers, body: res.statusCode === 303 ? undefined : body, allowPrivate, timeout }, hops + 1));
        }
        resolve(res);
      },
    );
    req.on('timeout', () => req.destroy(new Error(`${u.host} did not answer in time`)));
    req.on('error', (e) => reject(e.code === 'EPRIVATE' ? new HttpError(400, e.message) : new HttpError(502, `Could not reach ${u.host}: ${e.message}`)));
    req.end(payload);
  });
}

/** JSON from an address; errors carry the remote status and message. */
export async function requestJson(url, opts = {}) {
  const res = await request(url, opts);
  let text = '';
  res.setEncoding('utf8');
  for await (const chunk of res) {
    text += chunk;
    if (text.length > 20 * 1048576) throw new HttpError(502, 'The answer was too large');
  }
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}
  if (res.statusCode >= 400) {
    const msg = data?.message || data?.error || `HTTP ${res.statusCode}`;
    throw Object.assign(new HttpError(res.statusCode === 401 || res.statusCode === 403 ? 400 : 502, `${new URL(url).host} said: ${Array.isArray(msg) ? msg.join(', ') : msg}`), {
      remoteStatus: res.statusCode,
    });
  }
  if (data === null) throw new HttpError(502, `${new URL(url).host} did not answer with JSON`);
  return data;
}

/** Saves a file from an address, reporting progress; refuses one larger than `maxBytes`. */
export async function download(url, file, { headers, allowPrivate, maxBytes = Infinity, onProgress } = {}) {
  const res = await request(url, { headers, allowPrivate, timeout: 60_000 });
  if (res.statusCode >= 400) {
    res.resume();
    throw Object.assign(new HttpError(502, `${new URL(url).host} answered HTTP ${res.statusCode}`), { remoteStatus: res.statusCode });
  }
  const total = Number(res.headers['content-length']) || 0;
  if (total > maxBytes) {
    res.destroy();
    throw new HttpError(413, 'The file is larger than the room you have left');
  }
  let got = 0;
  let last = 0;
  const count = new Transform({
    transform(chunk, _enc, cb) {
      got += chunk.length;
      if (got > maxBytes) return cb(new HttpError(413, 'The file is larger than the room you have left'));
      if (onProgress && total && Date.now() - last > 1000) {
        last = Date.now();
        onProgress(got / total);
      }
      cb(null, chunk);
    },
  });
  await pipeline(res, count, fs.createWriteStream(file));
  return got;
}
