// Embedding on other sites: the /embed player page, oEmbed (what WordPress's Embed block reads), and the
// discovery link on watch pages. Public and unlisted videos embed; private ones don't.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startInstance, setupAdmin, uploadReady } from './helpers.js';

let inst, alice, video, secret;

before(async () => {
  inst = await startInstance('embed');
  alice = await setupAdmin(inst, 'alice', 'Embed Test');
  await alice.patch('/api/admin/settings', { public_url: inst.url });
  video = await uploadReady(alice, { title: 'Boss fight <b>"no hit"</b>' });
  secret = await uploadReady(alice, { title: 'Just for me', visibility: 'private' });
});
after(async () => {
  await inst?.stop();
});

const oembed = (url, extra = '') => fetch(`${inst.url}/api/oembed?url=${encodeURIComponent(url)}${extra}`).then(async (r) => ({ status: r.status, body: await r.json().catch(() => null) }));

test('the embed page is a plain player, with the title escaped', async () => {
  const r = await fetch(`${inst.url}/embed/${video.id}?start=12&autoplay=1`);
  assert.equal(r.status, 200);
  const html = await r.text();
  assert.match(html, new RegExp(`<video id="v" src="${inst.url}/media/videos/${video.id}\\.mp4#t=12"`));
  assert.match(html, / autoplay muted/);
  assert.match(html, /Boss fight &lt;b&gt;&quot;no hit&quot;&lt;\/b&gt;/);
  assert.doesNotMatch(html, /<b>"no hit"<\/b>/);
  assert.equal((await fetch(`${inst.url}/embed/${secret.id}`)).status, 404, 'private videos do not embed');
});

test('oEmbed gives WordPress the player, sized to fit', async () => {
  const r = await oembed(`${inst.url}/watch/${video.id}?t=12`);
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.type, 'video');
  assert.equal(r.body.provider_name, 'Embed Test');
  assert.equal(r.body.author_name, 'alice');
  // The test clip is 320x240: 560 wide, 420 tall.
  assert.deepEqual([r.body.width, r.body.height], [560, 420]);
  assert.match(r.body.html, new RegExp(`^<iframe src="${inst.url}/embed/${video.id}\\?start=12" width="560" height="420" `));
  assert.match(r.body.html, /allowfullscreen/);
  const small = await oembed(`${inst.url}/watch/${video.id}`, '&maxwidth=280');
  assert.deepEqual([small.body.width, small.body.height], [280, 210]);
  assert.equal((await oembed(`${inst.url}/shorts/${video.id}`)).status, 200, 'Shorts links too');
  assert.equal((await oembed(`${inst.url}/watch/${secret.id}`)).status, 404);
  assert.equal((await oembed(`https://elsewhere.example/watch/${video.id}`)).status, 404, 'only links to this site');
  assert.equal((await oembed(`${inst.url}/watch/${video.id}`, '&format=xml')).status, 501);
});

test('watch pages point oEmbed readers at it', async () => {
  const html = await (await fetch(`${inst.url}/watch/${video.id}`)).text();
  const link = /<link rel="alternate" type="application\/json\+oembed" href="([^"]+)"/.exec(html);
  assert.ok(link, 'discovery link present');
  const href = link[1].replace(/&amp;/g, '&');
  assert.equal(href, `${inst.url}/api/oembed?url=${encodeURIComponent(`${inst.url}/watch/${video.id}`)}&format=json`);
  assert.equal((await fetch(href)).status, 200);
});
