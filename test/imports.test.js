// Imports: YouTube through yt-dlp (a fake one here, test/fake-ytdlp.mjs) only once an admin turns it on, and
// Immich through a shared link or a connected account (a small fake Immich below). An imported video arrives like
// an upload, with its title, description, chapters, tags, thumbnail and original date, without notifying anyone,
// and isn't imported twice. This server doesn't allow private addresses, so only its admin can reach the fake Immich.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import { ROOT, startInstance, setupAdmin, registerUser, testClip, tempDir, waitFor, Client } from './helpers.js';

const SHARE_KEY = 'goodsharekey';
const API_KEY = 'immich-api-key-0123456789abcdef';
const BEACH = '11111111-1111-4111-8111-111111111111';
const PHOTO = '22222222-2222-4222-8222-222222222222';
const PARTY = '33333333-3333-4333-8333-333333333333';
// The moving part of a motion photo, as Immich keeps it (and as it did before 1.133).
const MOTION = '44444444-4444-4444-8444-444444444444';
const OLD_MOTION = '55555555-5555-4555-8555-555555555555';

let inst, immich, immichUrl, alice, bob, carol, thumb;

const asset = (id, type, name, caption, date) => ({
  id,
  type,
  originalFileName: name,
  fileCreatedAt: date,
  duration: type === 'VIDEO' ? '0:00:04.000000' : '0:00:00.00000',
  exifInfo: { description: caption, fileSizeInByte: fs.statSync(testClip()).size },
});
const ASSETS = {
  [BEACH]: asset(BEACH, 'VIDEO', 'VID_0001.mp4', 'Beach day\nwith everyone', '2021-07-04T15:00:00.000Z'),
  [PHOTO]: asset(PHOTO, 'IMAGE', 'IMG_0002.jpg', '', '2021-07-04T15:01:00.000Z'),
  [PARTY]: asset(PARTY, 'VIDEO', 'Birthday party.mov', '', '2022-02-02T10:00:00.000Z'),
  [MOTION]: { ...asset(MOTION, 'VIDEO', 'PXL_0003.MP.mp4', '', '2023-01-01T09:00:00.000Z'), visibility: 'hidden' },
  [OLD_MOTION]: { ...asset(OLD_MOTION, 'VIDEO', 'MVIMG_0004.mp4', '', '2023-01-01T09:00:00.000Z'), isVisible: false },
};

/** A tiny Immich: shared links answer with ?key=, the account with the x-api-key header. */
function fakeImmich() {
  return http.createServer(async (req, res) => {
    const u = new URL(req.url, 'http://x');
    const key = u.searchParams.get('key');
    const viaShare = key === SHARE_KEY || key === 'nodownloads';
    const viaKey = req.headers['x-api-key'] === API_KEY;
    const json = (status, body) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(body));
    };
    if (!viaShare && !viaKey) return json(401, { message: 'Authentication required' });
    if (u.pathname === '/api/shared-links/me' && viaShare) {
      return json(200, { allowDownload: key === SHARE_KEY, album: { id: 'album-1', albumName: 'Summer 2021' }, assets: [] });
    }
    if (u.pathname === '/api/albums/album-1' && viaShare) return json(200, { assets: [ASSETS[BEACH], ASSETS[PHOTO], ASSETS[MOTION]] });
    if (u.pathname === '/api/search/metadata' && req.method === 'POST' && viaKey) {
      // A first page of nothing but motion photos' clips, then the real videos.
      let body = '';
      for await (const c of req) body += c;
      const page = JSON.parse(body || '{}').page || 1;
      return json(200, page === 1 ? { assets: { items: [ASSETS[MOTION], ASSETS[OLD_MOTION]], nextPage: '2' } } : { assets: { items: [ASSETS[PARTY], ASSETS[BEACH]], nextPage: null } });
    }
    if (u.pathname === '/api/users/me' && viaKey) return json(200, { name: 'Alice in Immich', email: 'alice@example.com' });
    const m = /^\/api\/assets\/([0-9a-f-]{36})(\/original|\/thumbnail)?$/.exec(u.pathname);
    if (m && ASSETS[m[1]]) {
      // A shared link only reaches what's in it.
      if (viaShare && m[1] === PARTY) return json(403, { message: 'Not in this share' });
      if (!m[2]) return json(200, ASSETS[m[1]]);
      res.writeHead(200, { 'Content-Type': m[2] === '/original' ? 'video/mp4' : 'image/jpeg' });
      return fs.createReadStream(m[2] === '/original' ? testClip() : thumb).pipe(res);
    }
    json(404, { message: 'Not found' });
  });
}

const importsDone = (c, n) =>
  waitFor(
    async () => {
      const items = (await c.get('/api/imports')).data.items;
      const failed = items.find((i) => i.status === 'failed');
      if (failed) throw new Error(`import failed: ${failed.error}`);
      return items.filter((i) => i.status === 'done').length >= n ? items : null;
    },
    { timeout: 60000, what: `${n} imports to finish` },
  );
const ready = (c, id) =>
  waitFor(
    async () => {
      const v = (await c.get(`/api/videos/${id}`)).data.video;
      if (v.status === 'failed') throw new Error(`processing failed: ${v.error}`);
      return v.status === 'ready' ? v : null;
    },
    { timeout: 60000, what: `video ${id} to process` },
  );

before(async () => {
  thumb = path.join(tempDir('imports-thumb'), 'thumb.jpg');
  execFileSync(ffmpegPath, ['-y', '-v', 'error', '-f', 'lavfi', '-i', 'color=c=orange:size=320x180', '-frames:v', '1', thumb]);
  immich = fakeImmich();
  await new Promise((r) => immich.listen(0, '127.0.0.1', r));
  immichUrl = `http://127.0.0.1:${immich.address().port}`;
  inst = await startInstance('imports', {
    allowPrivate: false,
    env: { YTDLP_PATH: path.join(ROOT, 'test', 'fake-ytdlp.mjs'), FAKE_YTDLP_CLIP: testClip(), FAKE_YTDLP_THUMB: thumb },
  });
  alice = await setupAdmin(inst, 'alice', 'Imports Test');
  [bob, carol] = await Promise.all([registerUser(inst, 'bob'), registerUser(inst, 'carol')]);
  await carol.post('/api/users/bob/subscribe');
});
after(async () => {
  await inst?.stop();
  immich?.close();
});

test('YouTube imports are off until an admin turns them on', async () => {
  assert.deepEqual((await bob.get('/api/imports')).data.youtube, { enabled: false, available: null });
  assert.equal((await bob.post('/api/imports/youtube/list', { url: 'https://www.youtube.com/@bob' })).status, 403);
  assert.equal((await bob.post('/api/imports', { source: 'youtube', rights: true, videos: [{ ref: 'AAAAAAAAAAA' }] })).status, 403);
  assert.equal((await bob.patch('/api/admin/settings', { imports_youtube: true })).status, 403);
  assert.equal((await alice.patch('/api/admin/settings', { imports_youtube: true })).status, 200);
  assert.deepEqual((await bob.get('/api/imports')).data.youtube, { enabled: true, available: true });
});

test('a YouTube channel is listed, and a picked video arrives with its details and date, quietly', async () => {
  assert.equal((await bob.post('/api/imports/youtube/list', { url: 'https://vimeo.com/123' })).status, 400);
  const list = await bob.post('/api/imports/youtube/list', { url: 'https://www.youtube.com/@bob' });
  assert.equal(list.status, 200, JSON.stringify(list.data));
  assert.deepEqual(list.data.videos.map((v) => [v.ref, v.title, v.imported]), [['AAAAAAAAAAA', 'First fake', false], ['BBBBBBBBBBB', 'Second fake', false]]);

  const pick = { source: 'youtube', visibility: 'public', videos: [{ ref: 'AAAAAAAAAAA', title: 'First fake' }] };
  assert.equal((await bob.post('/api/imports', pick)).status, 400, 'needs the rights checkbox');
  const r = await bob.post('/api/imports', { ...pick, rights: true });
  assert.deepEqual(r.data, { started: 1, skipped: 0 });
  const [done] = await importsDone(bob, 1);
  const v = await ready(bob, done.video_id);
  assert.equal(v.title, 'Imported AAAAAAAAAAA');
  assert.match(v.description, /^From the fake YouTube\n\nChapters:\n0:00 Start\n0:02 The end$/);
  assert.deepEqual(v.tags, ['fake', 'speedrun']);
  assert.equal(v.created_at, Date.UTC(2019, 2, 15, 12));
  assert.equal(v.visibility, 'public');
  assert.ok(v.thumbnail_url);
  assert.equal((await fetch(inst.url + v.thumbnail_url)).status, 200);

  // Already here: marked in the list, and skipped if picked again.
  assert.equal((await bob.post('/api/imports/youtube/list', { url: 'https://www.youtube.com/@bob' })).data.videos[0].imported, true);
  assert.deepEqual((await bob.post('/api/imports', { ...pick, rights: true })).data, { started: 0, skipped: 1 });
  // A back catalogue doesn't ring every subscriber's bell.
  await new Promise((r) => setTimeout(r, 1500));
  assert.ok(!(await carol.get('/api/notifications')).data.notifications.some((n) => /Imported AAAAAAAAAAA/.test(n.title || '')));
});

test('when YouTube wants the server to sign in, the error says what to do', async () => {
  const r = await bob.post('/api/imports/youtube/list', { url: 'https://www.youtube.com/@blocked' });
  assert.equal(r.status, 502);
  assert.match(r.data.error, /youtube-cookies\.txt/);
});

test('an Immich shared link: only videos (not photos or motion photos), only with downloads allowed, and only for admins on a private address', async () => {
  const link = `${immichUrl}/share/${SHARE_KEY}`;
  const refused = await bob.post('/api/imports/immich/list', { link });
  assert.equal(refused.status, 400);
  assert.match(refused.data.error, /private network/);
  assert.equal((await alice.post('/api/imports/immich/list', { link: 'https://example.com/photos/abc' })).status, 400);
  const noDl = await alice.post('/api/imports/immich/list', { link: `${immichUrl}/share/nodownloads` });
  assert.equal(noDl.status, 400);
  assert.match(noDl.data.error, /Allow download/);

  const list = await alice.post('/api/imports/immich/list', { link });
  assert.equal(list.status, 200, JSON.stringify(list.data));
  assert.equal(list.data.title, 'Summer 2021');
  assert.deepEqual(list.data.videos.map((v) => [v.ref, v.title, v.duration]), [[BEACH, 'Beach day', 4]]);
  assert.equal(list.data.videos[0].thumbnail, `${immichUrl}/api/assets/${BEACH}/thumbnail?size=thumbnail&key=${SHARE_KEY}`);

  // Into a family group, keeping the date it was filmed.
  const group = (await alice.post('/api/groups', { name: 'Family' })).data.group;
  await alice.post(`/api/groups/${group.id}/members`, { username: 'bob' });
  const r = await alice.post('/api/imports', { source: 'immich', link, visibility: 'group', group_id: group.id, videos: [{ ref: BEACH, title: 'Beach day' }] });
  assert.deepEqual(r.data, { started: 1, skipped: 0 });
  const [done] = await importsDone(alice, 1);
  const v = await ready(alice, done.video_id);
  assert.equal(v.title, 'Beach day');
  assert.equal(v.created_at, Date.parse('2021-07-04T15:00:00.000Z'));
  assert.equal(v.visibility, 'group');
  assert.equal((await bob.get(`/api/videos/${v.id}`)).status, 200);
  assert.equal((await carol.get(`/api/videos/${v.id}`)).status, 404);
  assert.equal((await new Client(inst.url).get(`/api/videos/${v.id}`)).status, 404);
});

test('a connected Immich account: the key is checked and never shown, its videos (past pages of motion photos) listed with thumbnails through here', async () => {
  const bad = await alice.req('PUT', '/api/imports/immich/account', { url: immichUrl, api_key: 'wrong-key-0123456789abcdef' });
  assert.equal(bad.status, 400);
  const ok = await alice.req('PUT', '/api/imports/immich/account', { url: `${immichUrl}/api/`, api_key: API_KEY });
  assert.equal(ok.status, 200, JSON.stringify(ok.data));
  assert.deepEqual(ok.data.immich, { connected: true, url: immichUrl, name: 'Alice in Immich' });
  const status = await alice.get('/api/imports');
  assert.deepEqual(status.data.immich, { connected: true, url: immichUrl, name: 'Alice in Immich' });
  assert.doesNotMatch(JSON.stringify(status.data), new RegExp(API_KEY));

  const list = (await alice.post('/api/imports/immich/list', {})).data;
  assert.deepEqual(list.videos.map((v) => [v.ref, v.title, v.imported]), [[PARTY, 'Birthday party', false], [BEACH, 'Beach day', true]]);
  assert.equal(list.videos[0].thumbnail, `/api/imports/immich/thumbnail/${PARTY}`);
  const t = await fetch(inst.url + list.videos[0].thumbnail, { headers: { Cookie: alice.cookie } });
  assert.equal(t.status, 200);
  assert.equal(t.headers.get('content-type'), 'image/jpeg');
  assert.equal((await bob.get(`/api/imports/immich/thumbnail/${PARTY}`)).status, 400, 'bob has no account connected');

  await alice.post('/api/imports', { source: 'immich', visibility: 'private', videos: [{ ref: PARTY, title: 'Birthday party' }] });
  const items = await importsDone(alice, 2);
  const v = await ready(alice, items.find((i) => i.title === 'Birthday party').video_id);
  assert.equal(v.visibility, 'private');
  assert.equal(v.created_at, Date.parse('2022-02-02T10:00:00.000Z'));

  assert.deepEqual((await alice.del('/api/imports/immich/account')).data.immich, { connected: false });
  assert.equal((await alice.post('/api/imports/immich/list', {})).status, 400);
});
