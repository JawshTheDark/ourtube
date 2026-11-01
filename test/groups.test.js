// Groups: a video only for a family or circle of friends is seen by its members and admins, and by no one else:
// not its page, not its file, not lists, previews or embeds. Members hear about it; the join link, removing
// people and deleting the group work as they say.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startInstance, setupAdmin, registerUser, uploadReady, waitFor, Client } from './helpers.js';

let inst, alice, bob, carol, dave, group, video;

before(async () => {
  inst = await startInstance('groups');
  alice = await setupAdmin(inst, 'alice', 'Groups Test');
  await alice.patch('/api/admin/settings', { public_url: inst.url });
  await alice.patch('/api/mod/settings', { spam_hold_first_comments: false });
  [bob, carol, dave] = await Promise.all([registerUser(inst, 'bob'), registerUser(inst, 'carol'), registerUser(inst, 'dave')]);
});
after(async () => {
  await inst?.stop();
});

const canSee = async (c, id) => (await c.get(`/api/videos/${id}`)).status === 200;
const canPlay = async (c, id) => (await c.req('GET', `/media/videos/${id}.mp4`)).status === 200;

test('a group video is for its members only', async () => {
  const r = await bob.post('/api/groups', { name: 'Family' });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  group = r.data.group;
  assert.equal((await bob.post(`/api/groups/${group.id}/members`, { username: 'carol' })).status, 201);
  assert.equal((await bob.post(`/api/groups/${group.id}/members`, { username: 'nobody' })).status, 404);
  // Only groups you're in.
  const sneaky = await dave.upload((await import('./helpers.js')).testClip(), { title: 'Not mine to share', visibility: 'group', group_id: group.id });
  assert.equal(sneaky.status, 400);

  video = await uploadReady(bob, { title: 'Grandma turns 90', visibility: 'group', group_id: group.id });
  assert.equal(video.visibility, 'group');
  assert.deepEqual(video.group, { id: group.id, name: 'Family' });
  for (const [who, c, ok] of [['bob', bob, true], ['carol', carol, true], ['alice (admin)', alice, true], ['dave', dave, false], ['nobody signed in', new Client(inst.url), false]]) {
    assert.equal(await canSee(c, video.id), ok, `${who} sees the page`);
    assert.equal(await canPlay(c, video.id), ok, `${who} gets the file`);
  }
  // Not in lists, search, link previews or embeds.
  assert.ok(!(await dave.get('/api/videos?sort=new')).data.videos.some((v) => v.id === video.id));
  assert.ok(!(await carol.get('/api/videos?sort=new')).data.videos.some((v) => v.id === video.id), 'not on Home even for members');
  assert.ok(!(await dave.get('/api/search?q=Grandma')).data.videos.some((v) => v.id === video.id));
  assert.doesNotMatch(await (await fetch(`${inst.url}/watch/${video.id}`)).text(), /Grandma turns 90/);
  assert.equal((await fetch(`${inst.url}/embed/${video.id}`)).status, 404);

  // Carol hears about it, and finds it on the group's page.
  await waitFor(async () => (await carol.get('/api/notifications')).data.notifications.some((n) => n.kind === 'group' && /Grandma turns 90/.test(n.title)), {
    what: 'the group notification',
  });
  const page = (await carol.get(`/api/groups/${group.id}`)).data;
  assert.deepEqual(page.videos.map((v) => v.id), [video.id]);
  assert.deepEqual(page.members.map((m) => m.username).sort(), ['bob', 'carol']);
  assert.equal((await dave.get(`/api/groups/${group.id}`)).status, 404);
});

test('the join link lets someone in, and the owner can take them out again', async () => {
  const link = (await bob.post(`/api/groups/${group.id}/invite`)).data.group.invite_url;
  const token = link.split('/').pop();
  assert.equal((await dave.get(`/api/groups/invite/${token}`)).data.member, false);
  assert.equal((await dave.post(`/api/groups/invite/${token}/join`)).status, 200);
  assert.equal(await canSee(dave, video.id), true);
  // A new link stops the old one.
  await bob.post(`/api/groups/${group.id}/invite`);
  assert.equal((await carol.get(`/api/groups/invite/${token}`)).status, 404);
  // Only the owner removes people; then dave is out.
  const daveId = (await dave.get('/api/auth/me')).data.user.id;
  assert.equal((await carol.del(`/api/groups/${group.id}/members/${daveId}`)).status, 403);
  assert.equal((await bob.del(`/api/groups/${group.id}/members/${daveId}`)).status, 200);
  assert.equal(await canSee(dave, video.id), false);
});

test('a member who leaves takes their group videos with them, and deleting the group makes the rest private', async () => {
  const mine = await uploadReady(carol, { title: 'Carol at the beach', visibility: 'group', group_id: group.id });
  assert.equal(await canSee(bob, mine.id), true);
  const carolId = (await carol.get('/api/auth/me')).data.user.id;
  assert.equal((await carol.del(`/api/groups/${group.id}/members/${carolId}`)).status, 200);
  assert.equal((await carol.get(`/api/videos/${mine.id}`)).data.video.visibility, 'private');
  assert.equal(await canSee(bob, mine.id), false);

  assert.equal((await bob.del(`/api/groups/${group.id}`)).status, 200);
  const v = (await bob.get(`/api/videos/${video.id}`)).data.video;
  assert.equal(v.visibility, 'private');
  assert.equal(v.group, null);
});
