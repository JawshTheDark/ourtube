import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useTitle } from '../auth.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { Icon } from '../components/Icons.jsx';
import { useToast } from '../components/Toast.jsx';
import { Empty, VideoGrid } from '../components/VideoCard.jsx';
import { forgetGroups } from '../components/VisibilityField.jsx';
import { copyText } from '../util.js';

/** Your groups: families and circles of friends to share videos with. */
export function Groups() {
  const toast = useToast();
  const nav = useNavigate();
  const [groups, setGroups] = useState(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  useTitle('Groups');
  useEffect(() => {
    api('/groups')
      .then((r) => setGroups(r.groups))
      .catch((e) => toast(e.message));
  }, [toast]);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api('/groups', { method: 'POST', body: { name } });
      forgetGroups();
      nav(`/groups/${r.group.id}`);
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page page-narrow">
      <h1>
        <Icon name="group" /> Groups
      </h1>
      <p className="page-sub flush">
        Share videos with just your family or a circle of friends. A video set to a group is only seen by the people in it: it stays off Home, search and the
        network.
      </p>
      <form className="follow-form card-panel" onSubmit={create}>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name a new group, like Family" maxLength={60} aria-label="Group name" />
        <button className="btn btn-primary" disabled={busy || !name.trim()}>
          Make a group
        </button>
      </form>
      {groups === null ? (
        <div className="spinner" />
      ) : groups.length === 0 ? (
        <Empty icon="group" title="No groups yet">
          <p>Make one above, then add people or send them the join link.</p>
        </Empty>
      ) : (
        <div className="group-list">
          {groups.map((g) => (
            <Link key={g.id} to={`/groups/${g.id}`} className="card-panel group-row">
              <span className="group-icon">
                <Icon name="group" />
              </span>
              <span className="group-main">
                <b>{g.name}</b>
                <span className="muted">
                  {g.members} {g.members === 1 ? 'person' : 'people'} · {g.videos} {g.videos === 1 ? 'video' : 'videos'}
                  {!g.is_owner && ` · made by ${g.owner.display_name}`}
                </span>
              </span>
              <span className="group-go" aria-hidden="true">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/** One group: its videos, its people, and (for its owner) adding people and the join link. */
export function GroupPage() {
  const { id } = useParams();
  const toast = useToast();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const load = () =>
    api(`/groups/${id}`)
      .then(setData)
      .catch(setError);
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  useTitle(data?.group.name || 'Group');

  if (error) return <Empty icon="lock" title={error.message} />;
  if (!data) return <div className="spinner" />;
  const g = data.group;
  const run = async (fn, msg) => {
    setBusy(true);
    try {
      await fn();
      if (msg) toast(msg);
      await load();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy(false);
    }
  };
  const link = g.invite_url ? `${window.location.origin}${g.invite_url}` : null;

  return (
    <div className="page page-wide">
      <div className="group-head">
        <h1>
          <Icon name="group" /> {g.name}
        </h1>
        <span className="muted">
          {g.members} {g.members === 1 ? 'person' : 'people'} · made by {g.owner.display_name}
        </span>
        <span className="spacer" />
        <Link to="/upload" className="btn btn-primary">
          <Icon name="upload" /> Share a video
        </Link>
      </div>
      <p className="hint">Upload or edit a video and pick this group under Visibility. Only the people below can watch it.</p>

      {data.videos.length ? (
        <VideoGrid videos={data.videos} />
      ) : (
        <Empty icon="video" title="Nothing shared yet">
          <p>Videos set to this group show up here.</p>
        </Empty>
      )}

      <div className="admin-grid top-gap">
        <section className="card-panel">
          <h2>People</h2>
          <div className="fed-list">
            {data.members.map((m) => (
              <div key={m.id} className="fed-item">
                <Link to={`/c/${m.username}`} className="group-member">
                  <Avatar user={m} size={32} />
                  <span>
                    <b>{m.display_name}</b> <span className="muted">@{m.username}</span>
                    {m.is_owner && <span className="badge">Owner</span>}
                  </span>
                </Link>
                {g.is_owner && !m.is_owner && (
                  <button
                    className="icon-btn"
                    title={`Remove ${m.display_name}`}
                    disabled={busy}
                    onClick={() =>
                      window.confirm(`Remove ${m.display_name} from ${g.name}? Videos they shared with the group become private.`) &&
                      run(() => api(`/groups/${g.id}/members/${m.id}`, { method: 'DELETE' }), 'Removed')
                    }
                  >
                    <Icon name="close" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {g.is_owner && (
            <form
              className="follow-form top-gap"
              onSubmit={(e) => {
                e.preventDefault();
                run(() => api(`/groups/${g.id}/members`, { method: 'POST', body: { username } }), 'Added').then(() => setUsername(''));
              }}
            >
              <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Their username here" aria-label="Username" />
              <button className="btn" disabled={busy || !username.trim()}>
                Add
              </button>
            </form>
          )}
        </section>

        {g.is_owner ? (
          <section className="card-panel">
            <h2>Join link</h2>
            <p className="hint">
              Anyone with the link can join after signing in (or making an account), so send it only to the people you mean. A new link stops the old one working.
            </p>
            {link ? (
              <>
                <div className="share-row top-gap">
                  <input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Join link" />
                  <button className="btn btn-primary" onClick={() => copyText(link).then((ok) => toast(ok ? 'Link copied' : 'Select the link and copy it'))}>
                    Copy
                  </button>
                </div>
                <div className="row-actions top-gap">
                  <button className="btn btn-sm" disabled={busy} onClick={() => run(() => api(`/groups/${g.id}/invite`, { method: 'POST' }), 'New link made')}>
                    New link
                  </button>
                  <button className="btn btn-sm btn-ghost" disabled={busy} onClick={() => run(() => api(`/groups/${g.id}/invite`, { method: 'DELETE' }), 'Link turned off')}>
                    Turn off
                  </button>
                </div>
              </>
            ) : (
              <button className="btn top-gap" disabled={busy} onClick={() => run(() => api(`/groups/${g.id}/invite`, { method: 'POST' }))}>
                Make a join link
              </button>
            )}
            <h3 className="sub-h">Settings</h3>
            <div className="row-actions">
              <button
                className="btn btn-sm"
                disabled={busy}
                onClick={() => {
                  const name = window.prompt('New name for the group', g.name);
                  if (name && name.trim()) run(() => api(`/groups/${g.id}`, { method: 'PATCH', body: { name } }).then(forgetGroups), 'Renamed');
                }}
              >
                Rename
              </button>
              <button
                className="btn btn-sm btn-danger"
                disabled={busy}
                onClick={() => {
                  if (!window.confirm(`Delete ${g.name}? Its videos become private to whoever shared them.`)) return;
                  api(`/groups/${g.id}`, { method: 'DELETE' })
                    .then(() => {
                      forgetGroups();
                      nav('/groups');
                    })
                    .catch((e) => toast(e.message));
                }}
              >
                Delete group
              </button>
            </div>
          </section>
        ) : (
          <section className="card-panel">
            <h2>Leave</h2>
            <p className="hint">Videos you shared with the group become private to you.</p>
            <button
              className="btn"
              onClick={() => {
                if (!window.confirm(`Leave ${g.name}?`)) return;
                api(`/groups/${g.id}/members/${data.me}`, { method: 'DELETE' })
                  .then(() => {
                    forgetGroups();
                    nav('/groups');
                  })
                  .catch((e) => toast(e.message));
              }}
            >
              Leave this group
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

/** A join link: who made the group, and a button to join it. */
export function JoinGroup() {
  const { token } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useTitle('Join a group');
  useEffect(() => {
    api(`/groups/invite/${token}`)
      .then(setData)
      .catch(setError);
  }, [token]);
  if (error) return <Empty icon="warning" title={error.message} />;
  if (!data) return <div className="spinner" />;
  const join = () =>
    api(`/groups/invite/${token}/join`, { method: 'POST' })
      .then((r) => {
        forgetGroups();
        nav(`/groups/${r.group.id}`);
      })
      .catch((e) => toast(e.message));
  return (
    <div className="page page-narrow">
      <section className="card-panel join-card">
        <span className="group-icon big">
          <Icon name="group" size={36} />
        </span>
        <h1>{data.group.name}</h1>
        <p className="muted">
          {data.group.owner.display_name} invited you. {data.group.members} {data.group.members === 1 ? 'person is' : 'people are'} in it, and only they see the
          videos shared with it.
        </p>
        {data.member ? (
          <Link to={`/groups/${data.group.id}`} className="btn btn-primary">
            You're in: open the group
          </Link>
        ) : (
          <button className="btn btn-primary" onClick={join}>
            Join {data.group.name}
          </button>
        )}
      </section>
    </div>
  );
}
