/**
 * Groups: a family or a circle of friends. Anyone signed in can make one, add people by their username here or
 * with a join link, and share videos with it. A video whose visibility is 'group' is seen only by that group's
 * members and the site's admins: it stays off Home, search, feeds, the network and the fediverse, can't be
 * embedded, and the group's members hear about it when it's published.
 *
 * The owner is a member like the others (group_members), but only the owner renames the group, adds and removes
 * people, and turns the join link on or off. Someone who leaves takes their videos for the group with them:
 * those turn private.
 */
import { Router } from 'express';
import { db } from './db.js';
import { requireAuth } from './auth.js';
import { HttpError, newId, newToken, now, str } from './util.js';
import { notify } from './notify.js';
import { serializeVideo, videoSelect } from './routes/videos.js';

export const groupsRouter = Router();
groupsRouter.use(requireAuth);

/** Whether someone is in a group (owners are). */
export const isMember = (groupId, userId) => !!groupId && !!userId && !!db.prepare('SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?').get(groupId, userId);

/**
 * The visibility to store for a video: 'group' needs a group the person is in. Returns { visibility, group_id }.
 */
export function pickVisibility(user, visibility, groupId) {
  if (visibility !== 'group') return { visibility, group_id: null };
  const id = String(groupId || '');
  if (!id) throw new HttpError(400, 'Pick the group to share it with');
  if (!isMember(id, user.id)) throw new HttpError(400, 'You can only share with groups you are in');
  return { visibility: 'group', group_id: id };
}

/** SQL for "videos this person may see in a list": public and unlisted, their own, and their groups'. Two ? for the user. */
export const VISIBLE_TO = (a = 'v') =>
  `(${a}.visibility IN ('public', 'unlisted') OR ${a}.user_id = ? OR (${a}.visibility = 'group' AND ${a}.group_id IN (SELECT group_id FROM group_members WHERE user_id = ?)))`;

const loadGroup = (id) => db.prepare('SELECT * FROM user_groups WHERE id = ?').get(String(id));
function memberGroup(id, user) {
  const g = loadGroup(id);
  if (!g || !(isMember(g.id, user.id) || user.is_admin)) throw new HttpError(404, 'Group not found');
  return g;
}
function ownedGroup(id, user) {
  const g = memberGroup(id, user);
  if (g.owner_id !== user.id && !user.is_admin) throw new HttpError(403, 'Only the group owner can do that');
  return g;
}
const cleanName = (s) => {
  const name = str(s, 60).trim();
  if (!name) throw new HttpError(400, 'Give the group a name');
  return name;
};
const inviteUrl = (g) => (g.invite_token ? `/groups/join/${g.invite_token}` : null);
const avatarUrl = (u) => (u.avatar ? `/media/avatars/${u.avatar}` : null);

function summary(g, user) {
  const count = (sql) => db.prepare(sql).get(g.id).n;
  const owner = db.prepare('SELECT username, display_name FROM users WHERE id = ?').get(g.owner_id) || {};
  return {
    id: g.id,
    name: g.name,
    owner: { id: g.owner_id, username: owner.username, display_name: owner.display_name || owner.username },
    is_owner: g.owner_id === user.id,
    members: count('SELECT COUNT(*) AS n FROM group_members WHERE group_id = ?'),
    videos: count("SELECT COUNT(*) AS n FROM videos WHERE group_id = ? AND visibility = 'group' AND status = 'ready'"),
    invite_url: g.owner_id === user.id ? inviteUrl(g) : null,
    created_at: g.created_at,
  };
}

groupsRouter.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT g.* FROM user_groups g JOIN group_members m ON m.group_id = g.id AND m.user_id = ? ORDER BY g.name COLLATE NOCASE')
    .all(req.user.id);
  res.json({ groups: rows.map((g) => summary(g, req.user)) });
});

groupsRouter.post('/', (req, res) => {
  const name = cleanName(req.body?.name);
  if (db.prepare('SELECT COUNT(*) AS n FROM user_groups WHERE owner_id = ?').get(req.user.id).n >= 50) throw new HttpError(400, 'You have made the most groups allowed (50)');
  const id = newId();
  const t = now();
  db.prepare('INSERT INTO user_groups (id, owner_id, name, created_at) VALUES (?, ?, ?, ?)').run(id, req.user.id, name, t);
  db.prepare('INSERT INTO group_members (group_id, user_id, added_at) VALUES (?, ?, ?)').run(id, req.user.id, t);
  res.status(201).json({ group: summary(loadGroup(id), req.user) });
});

// The join link's page: what group it is (for anyone signed in who has the link).
groupsRouter.get('/invite/:token', (req, res) => {
  const g = db.prepare('SELECT * FROM user_groups WHERE invite_token = ?').get(String(req.params.token));
  if (!g) throw new HttpError(404, 'This join link is not valid any more. Ask for a new one.');
  const s = summary(g, req.user);
  res.json({ group: { id: s.id, name: s.name, owner: s.owner, members: s.members }, member: isMember(g.id, req.user.id) });
});

groupsRouter.post('/invite/:token/join', (req, res) => {
  const g = db.prepare('SELECT * FROM user_groups WHERE invite_token = ?').get(String(req.params.token));
  if (!g) throw new HttpError(404, 'This join link is not valid any more. Ask for a new one.');
  if (!isMember(g.id, req.user.id)) {
    db.prepare('INSERT INTO group_members (group_id, user_id, added_at) VALUES (?, ?, ?)').run(g.id, req.user.id, now());
    notify(g.owner_id, {
      kind: 'group',
      title: `${req.user.display_name || req.user.username} joined ${g.name}`,
      url: `/groups/${g.id}`,
      actor_label: req.user.username,
      dedupe: `group-join:${g.id}:${req.user.id}`,
    });
  }
  res.json({ group: summary(g, req.user) });
});

groupsRouter.get('/:id', (req, res) => {
  const g = memberGroup(req.params.id, req.user);
  const members = db
    .prepare('SELECT u.id, u.username, u.display_name, u.avatar, m.added_at FROM group_members m JOIN users u ON u.id = m.user_id WHERE m.group_id = ? ORDER BY u.display_name COLLATE NOCASE')
    .all(g.id)
    .map((u) => ({ id: u.id, username: u.username, display_name: u.display_name || u.username, avatar_url: avatarUrl(u), is_owner: u.id === g.owner_id, added_at: u.added_at }));
  const videos = db
    .prepare(`${videoSelect()} WHERE v.visibility = 'group' AND v.group_id = ? AND v.status = 'ready' AND v.moderation_status IS NULL ORDER BY v.created_at DESC LIMIT 300`)
    .all(g.id)
    .map(serializeVideo);
  res.json({ group: summary(g, req.user), members, videos, me: req.user.id });
});

groupsRouter.patch('/:id', (req, res) => {
  const g = ownedGroup(req.params.id, req.user);
  if (req.body?.name !== undefined) db.prepare('UPDATE user_groups SET name = ? WHERE id = ?').run(cleanName(req.body.name), g.id);
  res.json({ group: summary(loadGroup(g.id), req.user) });
});

// Deleting a group makes its videos private (to their uploaders), rather than visible to more people.
groupsRouter.delete('/:id', (req, res) => {
  const g = ownedGroup(req.params.id, req.user);
  db.prepare("UPDATE videos SET visibility = 'private', group_id = NULL WHERE group_id = ?").run(g.id);
  db.prepare("UPDATE videos SET draft_visibility = 'private', group_id = NULL WHERE draft = 1 AND draft_visibility = 'group' AND group_id = ?").run(g.id);
  db.prepare('DELETE FROM user_groups WHERE id = ?').run(g.id);
  res.json({ ok: true });
});

groupsRouter.post('/:id/members', (req, res) => {
  const g = ownedGroup(req.params.id, req.user);
  const name = String(req.body?.username || '').trim().replace(/^@/, '');
  const u = db.prepare("SELECT id, username, display_name FROM users WHERE username = ? COLLATE NOCASE AND remote_instance_id IS NULL AND status = 'active'").get(name);
  if (!u) throw new HttpError(404, `There is no one called @${name} on this site. Send them the join link instead.`);
  if (!isMember(g.id, u.id)) {
    db.prepare('INSERT INTO group_members (group_id, user_id, added_at) VALUES (?, ?, ?)').run(g.id, u.id, now());
    notify(u.id, {
      kind: 'group',
      title: `${req.user.display_name || req.user.username} added you to ${g.name}`,
      body: 'Videos shared with the group show on its page.',
      url: `/groups/${g.id}`,
      actor_label: req.user.username,
      dedupe: `group-add:${g.id}:${u.id}`,
    });
  }
  res.status(201).json({ group: summary(g, req.user) });
});

// The owner removes someone, or someone leaves. Their videos for the group turn private.
groupsRouter.delete('/:id/members/:userId', (req, res) => {
  const g = memberGroup(req.params.id, req.user);
  const who = String(req.params.userId);
  if (who !== req.user.id && g.owner_id !== req.user.id && !req.user.is_admin) throw new HttpError(403, 'Only the group owner can remove people');
  if (who === g.owner_id) throw new HttpError(400, 'The owner can delete the group, but not leave it');
  db.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?').run(g.id, who);
  db.prepare("UPDATE videos SET visibility = 'private', group_id = NULL WHERE user_id = ? AND group_id = ?").run(who, g.id);
  db.prepare("UPDATE videos SET draft_visibility = 'private', group_id = NULL WHERE user_id = ? AND draft = 1 AND group_id = ?").run(who, g.id);
  res.json({ ok: true });
});

// The join link: on (a fresh one each time, so an old link stops working) or off.
groupsRouter.post('/:id/invite', (req, res) => {
  const g = ownedGroup(req.params.id, req.user);
  db.prepare('UPDATE user_groups SET invite_token = ? WHERE id = ?').run(newToken().slice(0, 24), g.id);
  res.json({ group: summary(loadGroup(g.id), req.user) });
});
groupsRouter.delete('/:id/invite', (req, res) => {
  const g = ownedGroup(req.params.id, req.user);
  db.prepare('UPDATE user_groups SET invite_token = NULL WHERE id = ?').run(g.id);
  res.json({ group: summary(loadGroup(g.id), req.user) });
});
