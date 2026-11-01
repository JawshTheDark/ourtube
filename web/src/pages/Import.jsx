import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useTitle } from '../auth.jsx';
import { Icon } from '../components/Icons.jsx';
import { useToast } from '../components/Toast.jsx';
import { VisibilityField } from '../components/VisibilityField.jsx';
import { formatDate, formatDuration } from '../util.js';

const STATUS = { queued: ['', 'Waiting'], running: ['warn', 'Fetching'], done: ['ok', 'Done'], failed: ['err', 'Failed'] };

/** The videos found, with boxes to pick them (already imported ones can't be picked again). */
function PickList({ videos, picked, setPicked }) {
  const open = videos.filter((v) => !v.imported);
  const all = open.length > 0 && open.every((v) => picked.has(v.ref));
  const toggle = (ref) => setPicked((p) => {
    const n = new Set(p);
    if (n.has(ref)) n.delete(ref);
    else n.add(ref);
    return n;
  });
  return (
    <>
      <div className="row-actions top-gap">
        <span className="muted">
          {videos.length} {videos.length === 1 ? 'video' : 'videos'} found, {picked.size} picked
        </span>
        <span className="spacer" />
        <button className="btn btn-sm btn-ghost" onClick={() => setPicked(all ? new Set() : new Set(open.map((v) => v.ref)))}>
          {all ? 'Pick none' : 'Pick all'}
        </button>
      </div>
      <div className="import-list">
        {videos.map((v) => (
          <label key={v.ref} className={`import-pick ${v.imported ? 'done' : ''}`}>
            <input type="checkbox" checked={picked.has(v.ref)} disabled={v.imported} onChange={() => toggle(v.ref)} />
            <span className="import-thumb">{v.thumbnail ? <img src={v.thumbnail} alt="" loading="lazy" /> : <Icon name="video" />}</span>
            <span className="import-text">
              <b>{v.title}</b>
              <span className="muted">
                {v.duration ? formatDuration(v.duration) : ''}
                {v.created_at ? ` · ${formatDate(v.created_at)}` : ''}
                {v.short ? ' · Short' : ''}
                {v.imported ? ' · already here' : ''}
              </span>
            </span>
          </label>
        ))}
      </div>
    </>
  );
}

/** How the imported videos come in: who sees them, and their dates. */
function ImportOptions({ opts, setOpts, youtube }) {
  return (
    <div className="import-options">
      <VisibilityField visibility={opts.visibility} groupId={opts.group_id} onChange={(c) => setOpts((o) => ({ ...o, ...c }))} label="Imported videos are" />
      <label className="checkbox field">
        <input type="checkbox" checked={opts.keep_dates} onChange={(e) => setOpts((o) => ({ ...o, keep_dates: e.target.checked }))} />
        Keep their original dates, so they sit in your channel where they were
      </label>
      {youtube && (
        <label className="checkbox field">
          <input type="checkbox" checked={opts.rights} onChange={(e) => setOpts((o) => ({ ...o, rights: e.target.checked }))} />
          These are my videos, or I'm allowed to post them here
        </label>
      )}
    </div>
  );
}

function useFinder(onStarted) {
  const toast = useToast();
  const [found, setFound] = useState(null);
  const [picked, setPicked] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [opts, setOpts] = useState({ visibility: 'private', group_id: null, keep_dates: true, rights: false });
  const find = async (path, body, append = false) => {
    setBusy(true);
    try {
      const r = await api(path, { method: 'POST', body });
      setFound((f) => (append && f ? { ...r, videos: [...f.videos, ...r.videos] } : r));
      if (!append) setPicked(new Set());
      if (!r.videos.length && !append) toast('No videos found there');
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy(false);
    }
  };
  const start = async (body) => {
    setBusy(true);
    try {
      const videos = found.videos.filter((v) => picked.has(v.ref)).map((v) => ({ ref: v.ref, title: v.title }));
      const r = await api('/imports', { method: 'POST', body: { ...body, videos, ...opts } });
      toast(`${r.started} ${r.started === 1 ? 'video is' : 'videos are'} on the way${r.skipped ? ` (${r.skipped} already here)` : ''}`);
      setFound(null);
      setPicked(new Set());
      onStarted();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy(false);
    }
  };
  return { found, picked, setPicked, busy, opts, setOpts, find, start };
}

function YoutubeImport({ info, onStarted }) {
  const [url, setUrl] = useState('');
  const f = useFinder(onStarted);
  if (info.available === false) return <p className="error">yt-dlp is not installed on this server, so YouTube imports can't run. The Docker image includes it.</p>;
  return (
    <>
      <p className="hint">
        Paste a YouTube channel (its address or @handle page), a playlist, or a video. You pick which videos come over; each is fetched in its best quality up to
        this server&apos;s limit, with its title, description, tags, chapters and thumbnail. YouTube sometimes refuses servers, so a big channel can take a few
        tries.
      </p>
      <form
        className="follow-form"
        onSubmit={(e) => {
          e.preventDefault();
          f.find('/imports/youtube/list', { url });
        }}
      >
        <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/@yourchannel" aria-label="YouTube address" />
        <button className="btn btn-primary" disabled={f.busy || !url.trim()}>
          {f.busy && !f.found ? 'Looking…' : 'Find videos'}
        </button>
      </form>
      {f.found && (
        <>
          {f.found.title && <h3 className="sub-h">{f.found.title}</h3>}
          <PickList videos={f.found.videos} picked={f.picked} setPicked={f.setPicked} />
          <ImportOptions opts={f.opts} setOpts={f.setOpts} youtube />
          <button className="btn btn-primary" disabled={f.busy || !f.picked.size || !f.opts.rights} onClick={() => f.start({ source: 'youtube' })}>
            Import {f.picked.size || ''} {f.picked.size === 1 ? 'video' : 'videos'}
          </button>
        </>
      )}
    </>
  );
}

function ImmichImport({ info, onChanged }) {
  const toast = useToast();
  const [mode, setMode] = useState('link');
  const [link, setLink] = useState('');
  const [acct, setAcct] = useState({ url: '', api_key: '' });
  const [page, setPage] = useState(1);
  const f = useFinder(onChanged);
  const connect = async (e) => {
    e.preventDefault();
    try {
      await api('/imports/immich/account', { method: 'PUT', body: acct });
      setAcct({ url: '', api_key: '' });
      toast('Immich connected');
      onChanged();
    } catch (err) {
      toast(err.message);
    }
  };
  return (
    <>
      <div className="chips flush">
        <button className={`chip ${mode === 'link' ? 'active' : ''}`} onClick={() => setMode('link')}>
          From a shared link
        </button>
        <button className={`chip ${mode === 'account' ? 'active' : ''}`} onClick={() => setMode('account')}>
          From your Immich library
        </button>
      </div>
      {mode === 'link' ? (
        <>
          <p className="hint">
            In Immich (the website or the app), select your videos, click <b>Share</b>, make a link with <b>Allow download</b> on, and paste it here.
          </p>
          <form
            className="follow-form"
            onSubmit={(e) => {
              e.preventDefault();
              f.find('/imports/immich/list', { link });
            }}
          >
            <input className="input" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://photos.example.com/share/…" aria-label="Immich shared link" />
            <button className="btn btn-primary" disabled={f.busy || !link.trim()}>
              Find videos
            </button>
          </form>
        </>
      ) : !info.connected ? (
        <form className="import-connect" onSubmit={connect}>
          <p className="hint">
            In Immich, open <b>Account settings → API keys</b>, make a new key (it needs to read and download assets) and paste it here with your Immich address. The
            key is kept on this server and never shown again.
          </p>
          <div className="field">
            <label>Immich address</label>
            <input className="input" value={acct.url} onChange={(e) => setAcct((a) => ({ ...a, url: e.target.value }))} placeholder="https://photos.example.com" />
          </div>
          <div className="field">
            <label>API key</label>
            <input className="input" type="password" value={acct.api_key} onChange={(e) => setAcct((a) => ({ ...a, api_key: e.target.value }))} autoComplete="off" />
          </div>
          <button className="btn btn-primary" disabled={!acct.url.trim() || !acct.api_key.trim()}>
            Connect Immich
          </button>
        </form>
      ) : (
        <>
          <div className="row-actions">
            <span className="muted">
              Connected to {info.url}
              {info.name ? ` as ${info.name}` : ''}
            </span>
            <button className="btn btn-sm btn-ghost" onClick={() => api('/imports/immich/account', { method: 'DELETE' }).then(onChanged)}>
              Disconnect
            </button>
            <span className="spacer" />
            <button
              className="btn btn-primary"
              disabled={f.busy}
              onClick={() => {
                setPage(1);
                f.find('/imports/immich/list', { page: 1 });
              }}
            >
              Show my videos
            </button>
          </div>
        </>
      )}
      {f.found && (
        <>
          <PickList videos={f.found.videos} picked={f.picked} setPicked={f.setPicked} />
          {mode === 'account' && f.found.next && (
            <button
              className="btn btn-ghost top-gap"
              disabled={f.busy}
              onClick={() => {
                const next = page + 1;
                setPage(next);
                f.find('/imports/immich/list', { page: next }, true);
              }}
            >
              Show more
            </button>
          )}
          <ImportOptions opts={f.opts} setOpts={f.setOpts} />
          <button className="btn btn-primary" disabled={f.busy || !f.picked.size} onClick={() => f.start(mode === 'link' ? { source: 'immich', link } : { source: 'immich' })}>
            Import {f.picked.size || ''} {f.picked.size === 1 ? 'video' : 'videos'}
          </button>
        </>
      )}
    </>
  );
}

/** Import videos from YouTube (when the server allows it) and Immich, and follow how they're doing. */
export default function Import() {
  const toast = useToast();
  const [state, setState] = useState(null);
  const [tab, setTab] = useState(null);
  useTitle('Import videos');
  const load = () =>
    api('/imports')
      .then((r) => {
        setState(r);
        setTab((t) => t || (r.youtube.enabled ? 'youtube' : 'immich'));
      })
      .catch((e) => toast(e.message));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const busy = state?.items.some((i) => i.status === 'queued' || i.status === 'running');
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);
  if (!state) return <div className="spinner" />;
  const act = (fn) => fn().then(load).catch((e) => toast(e.message));

  return (
    <div className="page page-narrow">
      <h1>
        <Icon name="download" /> Import videos
      </h1>
      <p className="page-sub flush">
        Bring your videos over and pick which ones. Each becomes a video of yours, like an upload. Subscribers aren&apos;t notified about imports. Or{' '}
        <Link to="/upload">upload files</Link>.
      </p>
      <div className="tabs settings-tabs">
        {state.youtube.enabled && (
          <button className={`tab ${tab === 'youtube' ? 'active' : ''}`} onClick={() => setTab('youtube')}>
            From YouTube
          </button>
        )}
        <button className={`tab ${tab === 'immich' ? 'active' : ''}`} onClick={() => setTab('immich')}>
          From Immich
        </button>
      </div>
      <section className="card-panel">
        {tab === 'youtube' ? <YoutubeImport info={state.youtube} onStarted={load} /> : <ImmichImport info={state.immich} onChanged={load} />}
      </section>

      {state.items.length > 0 && (
        <section className="card-panel">
          <h2>Your imports</h2>
          <div className="fed-list">
            {state.items.map((i) => (
              <div key={i.id} className="fed-item">
                <div className="fed-main">
                  <div className="fed-name">
                    {i.status === 'done' && i.video_id ? <Link to={`/watch/${i.video_id}`}>{i.title || 'Untitled'}</Link> : i.title || 'Untitled'}{' '}
                    <span className={`badge ${STATUS[i.status]?.[0] || ''}`}>
                      {STATUS[i.status]?.[1] || i.status}
                      {i.status === 'running' && i.progress > 0 ? ` ${Math.round(i.progress * 100)}%` : ''}
                    </span>
                  </div>
                  <div className="fed-sub">
                    {i.source === 'youtube' ? 'YouTube' : 'Immich'}
                    {i.error && <span className="error-text"> · {i.error}</span>}
                  </div>
                </div>
                {i.status === 'failed' && (
                  <button className="btn btn-sm" onClick={() => act(() => api(`/imports/${i.id}/retry`, { method: 'POST' }))}>
                    Retry
                  </button>
                )}
                {i.status !== 'running' && (
                  <button className="icon-btn" title={i.status === 'queued' ? 'Cancel' : 'Clear'} onClick={() => act(() => api(`/imports/${i.id}`, { method: 'DELETE' }))}>
                    <Icon name="close" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
