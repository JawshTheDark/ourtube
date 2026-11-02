// Pure-function tests. Server modules open the database on import, so point them at a temp folder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tempDir } from './helpers.js';

process.env.DATA_DIR = tempDir('unit');

const { parseTags, escapeHtml } = await import('../server/util.js');
const { normalizeInstanceUrl, isPrivateIp, cleanItem } = await import('../server/network.js');
const { normalizeEdit } = await import('../server/routes/videos.js');
const { refusedForGood } = await import('../server/ap/deliver.js');
const { trustProxySetting, PRIVATE_PROXIES } = await import('../server/config.js');

test('trustProxySetting: "1" trusts private proxies only, a number counts hops, anything else lists addresses', () => {
  for (const off of [undefined, '', '0', 'false', 'off']) assert.equal(trustProxySetting(off), false);
  for (const on of ['1', 'true', 'YES']) assert.equal(trustProxySetting(on), PRIVATE_PROXIES);
  assert.equal(trustProxySetting('2'), 2);
  assert.equal(trustProxySetting(' 203.0.113.7, 10.0.0.0/8 '), '203.0.113.7, 10.0.0.0/8');
});

test('refusedForGood: a refusal stops deliveries, a key that could not be fetched just then does not', () => {
  assert.equal(refusedForGood(410, 'HTTP 410: Gone'), true);
  assert.equal(refusedForGood(403, 'HTTP 403: {"error":"blocked"}'), true);
  assert.equal(refusedForGood(429, 'HTTP 429'), false);
  assert.equal(refusedForGood(502, 'HTTP 502'), false);
  assert.equal(refusedForGood(undefined, 'fetch failed'), false);
  // tilvids.com, while one of our servers was restarting:
  const peertube = 'HTTP 403: {"type":"about:blank","title":"Forbidden","detail":"ActivityPub signature could not be checked","status":403}';
  assert.equal(refusedForGood(403, peertube), false);
  assert.equal(refusedForGood(401, 'HTTP 401: {"error":"Unable to fetch key JSON at https://clips.example.com/ap/actor#main-key"}'), false);
});

test('parseTags cleans, lowercases, dedupes and caps tags', () => {
  assert.deepEqual(parseTags('Valorant, #ACE, valorant,  clutch  '), ['valorant', 'ace', 'clutch']);
  assert.deepEqual(parseTags(['a'.repeat(31), 'ok']), ['ok']);
  assert.equal(parseTags(Array.from({ length: 30 }, (_, i) => `t${i}`)).length, 15);
});

test('escapeHtml escapes markup', () => {
  assert.equal(escapeHtml('<a href="x">&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
});

test('normalizeInstanceUrl reduces addresses to their origin', () => {
  assert.equal(normalizeInstanceUrl('clips.example.com'), 'https://clips.example.com');
  assert.equal(normalizeInstanceUrl('https://Clips.Example.com/some/path?x=1'), 'https://clips.example.com');
  assert.equal(normalizeInstanceUrl('http://localhost:3000/'), 'http://localhost:3000');
  assert.throws(() => normalizeInstanceUrl('https://user:pw@example.com'));
  assert.throws(() => normalizeInstanceUrl('ftp://example.com'));
  assert.throws(() => normalizeInstanceUrl(''));
});

test('isPrivateIp recognises private, loopback and link-local ranges', () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '192.168.1.97', '172.20.0.5', '169.254.169.254', '100.64.0.1', '::1', 'fe80::1', 'fd00::1', '::ffff:10.0.0.1']) {
    assert.equal(isPrivateIp(ip), true, ip);
  }
  for (const ip of ['8.8.8.8', '1.1.1.1', '9.9.9.9', '2606:4700::1111']) assert.equal(isPrivateIp(ip), false, ip);
});

test('cleanItem rejects media that is not hosted on the origin', () => {
  const origin = 'https://clips.example.com';
  const good = {
    id: 'abc123',
    title: 'Clip',
    video_url: `${origin}/media/videos/abc123.mp4`,
    watch_url: `${origin}/watch/abc123`,
    uploader: { username: 'bob' },
  };
  assert.equal(cleanItem(good, origin).remote_id, 'abc123');
  assert.equal(cleanItem({ ...good, video_url: 'https://evil.example/x.mp4' }, origin), null);
  assert.equal(cleanItem({ ...good, watch_url: 'javascript:alert(1)' }, origin), null);
  assert.equal(cleanItem({ ...good, id: '../etc' }, origin), null);
});

test('normalizeEdit sorts, merges touching parts and validates', () => {
  const e = normalizeEdit({ segments: [{ start: 5, end: 7 }, { start: 1, end: 3 }, { start: 3, end: 4 }], volume: 1.5 }, 10);
  assert.deepEqual(e.segments, [{ start: 1, end: 4 }, { start: 5, end: 7 }]);
  assert.equal(e.volume, 1.5);
  assert.throws(() => normalizeEdit({ segments: [{ start: 1, end: 5 }, { start: 4, end: 6 }] }, 10), /overlap/);
  assert.throws(() => normalizeEdit({ segments: [] }, 10));
  assert.equal(normalizeEdit({ segments: [{ start: 0, end: 99 }] }, 10).segments[0].end, 10);
});
