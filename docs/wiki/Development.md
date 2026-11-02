# Development

- [Getting started](#getting-started)
- [Repository layout](#repository-layout)
- [Tests](#tests)
- [Database migrations](#database-migrations)
- [Background jobs](#background-jobs)
- [Federation work](#federation-work)
- [Live streaming work](#live-streaming-work)
- [Releasing](#releasing)
- [This wiki](#this-wiki)

## Getting started

You need Node.js 22.13 or newer (24 recommended; it's what CI and the Docker image use). The server uses the
built-in `node:sqlite`, which older versions don't have.

```bash
git clone https://github.com/JawshTheDark/ourtube.git
cd ourtube
npm install
npm run dev
```

`npm run dev` starts two things:

- the **API** on http://localhost:3000, restarted whenever a file in `server/` changes, with request logging and
  private-address federation allowed (`--log --allow-private-federation`);
- **Vite** on http://localhost:5173 with hot reload, passing `/api`, `/media`, `/feeds` and `/.well-known` to
  the API.

Open http://localhost:5173 and create the first account with the setup code printed in the console. Data goes
to `./data` (ignored by git); delete the folder to start over.

To try the production build the way a server runs it: `npm run build`, then `npm start` (http://localhost:3000).
`docker compose up -d --build` builds the Docker image from your working tree (see
[Installation](Installation.md#docker-behind-a-reverse-proxy-recommended)).

## Repository layout

```text
server/              the Express app (ES modules)
├── index.js         startup, routes, static files and link previews
├── config.js        environment variables and the data folder's layout
├── db.js            the SQLite database and the default settings
├── migrations.js    numbered database migrations
├── jobs.js          the persistent job queue
├── routes/          the videos, users, media and admin APIs
├── ap/              ActivityPub: actors, inbox, delivery, HTTP signatures, keys, peering, sharing, moves
├── network.js       the OurTube network: hub directory, admission switches, block lists, game catalog
├── media.js         FFprobe and FFmpeg: processing, thumbnails, edits, editor filmstrips and waveforms
├── renditions.js    adaptive streaming (HLS) and the 720p copy for other platforms
├── uploads.js       uploads in pieces that resume
├── live.js          live streaming with MediaMTX
├── rooms.js         real-time rooms over server-sent events: live chat and watch parties
├── imports.js       imports from YouTube (ytdlp.js) and Immich, with outbound.js for requests to given addresses
├── intake.js        every new comment, like and report passes through here (spam, holds, federation)
├── diagnostics.js   Admin → Debugging
├── updates.js       the check for a newer version
├── cli.js           the admin command line
└── …                groups, games, SteamGridDB, search, feeds, embeds, notifications, email, web push,
                     webhooks, API keys, moderation, spam, privacy, stats, channel transfers
web/                 the React app, built by Vite into web/dist
├── src/pages/       one file per page
├── src/components/  the player, pickers, dialogs and other shared pieces
└── public/          the service worker (web push) and the icon
mobile/              the Android app (Expo)
test/                node:test suites; helpers.js starts real servers for them
live/                mediamtx.yml, the settings of the live streaming server
scripts/             deploy.sh, publish-wiki.sh, fediverse-sandbox.sh, live-sandbox.sh, fake-live.mjs
sandbox/             the Docker setups the two sandbox scripts run
docs/                the federation design, this wiki and the screenshots
.github/workflows/   CI, the Docker image, the Android app and the wiki
```

How to build and release the Android app in `mobile/`: [Android App](Android-App.md#building-and-releasing).

## Tests

```bash
npm test                              # every suite, one file at a time
npm run test:unit                     # the quick ones only: unit.test.js and jobs.test.js
node --test test/network.test.js      # one file
```

Most suites start **real OurTube servers** (`startInstance` in `test/helpers.js`), each in a temporary data folder,
on its own free port, with private-address federation allowed, the setup code `testcode` and the update check off,
and talk to them over HTTP. Network and ActivityPub tests therefore exercise the real code, including signatures
and the job queue (`waitFor` waits for asynchronous deliveries). `testClip` makes small test videos with the
bundled FFmpeg.

Outside services are replaced by small stand-ins:

| Stand-in | For | How |
| --- | --- | --- |
| `test/fakeTube.js` | PeerTube and the rest of the fediverse | A tiny ActivityPub server that checks OurTube's HTTP signatures with its own code |
| `test/fake-ytdlp.mjs` | yt-dlp and YouTube | Passed as `YTDLP_PATH`; lists two videos for any channel, and a channel called `@blocked` answers the way YouTube does when it wants a sign-in |
| In `test/live.test.js` | MediaMTX | A small server playing MediaMTX's control API and HLS (`LIVE_API_URL`, `LIVE_HLS_URL`) |
| In `test/artwork.test.js` | SteamGridDB | `STEAMGRIDDB_BASE_URL` points the client at a fake server |

`npm test` runs the files one after the other (`--test-concurrency=1`), with five minutes per test. CI
(`.github/workflows/ci.yml`) runs `npm ci`, `npm run build` and `npm test` on Node.js 24 for every push and pull
request.

## Database migrations

The schema lives in `server/migrations.js` as a list of numbered migrations (24 so far). The server applies the
pending ones at startup, in order, each inside a transaction, records each in the `schema_version` table, and
logs `[db] schema is at version <N>`. Before it changes a database that has accounts, it copies it with
`VACUUM INTO` to `data/backups/pre-migration-v<N>-<time>.db` and keeps the 10 most recent copies.

Schema changes go at the end of the list as a new migration; never change or reorder one that has been released.
Migration 1 is the baseline and is written to be idempotent, since databases from before migrations existed
already have most of it. Admin → Debugging shows a server's schema version. What this means for people running a
server: [Upgrading and Backups](Upgrading-and-Backups.md#what-happens-when-the-new-version-starts).

## Background jobs

Slow and retryable work runs through the job queue in `server/jobs.js`:

```js
defineJob('games.artwork', { maxAttempts: 3, handler: async ({ id }) => { /* ... */ } });
enqueueJob('games.artwork', { id }, { dedupe: `games-artwork:${id}` });
```

Jobs are stored in the `jobs` table, so they survive restarts: jobs that were running when the server stopped go
back in the queue at the next start. A failed attempt is retried with a growing delay (30 seconds, doubling, up to
six hours, with some jitter) until `maxAttempts`; throw a `PermanentError` to give up at once. With `dedupe`, a
second job with the same key is ignored while the first is still waiting. Finished jobs are deleted after a week,
failed ones after 30 days; Admin → Debugging shows the queue and the recent failures.

Each job type belongs to a lane, and each lane has its own number of workers, so a long transcode never holds up
deliveries:

| Lane | Workers | Used for |
| --- | --- | --- |
| `media` | 1 | FFmpeg work: processing, renditions, edits, clips, exports, saved live streams |
| `network` | 4 | ActivityPub deliveries, incoming activities, backfills, follower moves, webhooks, linked-account checks |
| `transfer` | 1 | Channel exports and imports, and imports from YouTube and Immich |
| `default` | 2 | Everything else |

## Federation work

- The design, the OurTube extensions and the reasoning behind them are in
  [docs/federation.md](https://github.com/JawshTheDark/ourtube/blob/main/docs/federation.md).
- To check changes against real fediverse software, run
  `scripts/fediverse-sandbox.sh <ssh-host> [--keep]`: it builds OurTube from your working tree and runs the
  interop checks against PeerTube and GoToSocial in a private Docker sandbox on that host (see
  [Fediverse](Fediverse.md#checked-against-real-servers)).

## Live streaming work

Tests replace MediaMTX with a small stand-in (`test/live.test.js`). To check against the real one,
`scripts/live-sandbox.sh <ssh-host>` builds OurTube from your working tree, runs it with MediaMTX in a private
Docker sandbox, streams a test picture with ffmpeg, and checks the stream, the HLS through OurTube and the saved
recording (see [Live Streaming](Live-Streaming.md#how-it-works)). With `--keep` the sandbox stays up, and
`ssh -N -L 3320:127.0.0.1:3320 <ssh-host>` shows it in your browser at http://localhost:3320.

To work on a live player (the live page, or the Android app) without Docker, `scripts/fake-live.mjs` stands in
for MediaMTX next to a local server: it makes a live test picture with the bundled ffmpeg, serves it as HLS and
tells OurTube the channel went live. Build the web app (`npm run build`), start OurTube pointed at the script,
copy a channel's stream key from Settings, and run the script with the same secret:

```bash
LIVE_SERVER=127.0.0.1 LIVE_SECRET=dev-live-secret LIVE_API_URL=http://127.0.0.1:8897 LIVE_HLS_URL=http://127.0.0.1:8897 LIVE_END_GRACE_MS=5000 node server/index.js --port 3300
LIVE_SECRET=dev-live-secret node scripts/fake-live.mjs http://127.0.0.1:3300 'alice?key=...' 10
```

The stream plays at http://127.0.0.1:3300/live/alice (from an Android emulator, http://10.0.2.2:3300) for ten
minutes or until Ctrl+C; it is plain HLS, a few seconds behind, where the real MediaMTX sends low-latency HLS.
`FAKE_LIVE_PORT` moves the script off port 8897.

## Releasing

1. Set the new version: `npm version 1.5.0 --no-git-tag-version` (updates `package.json` and
   `package-lock.json`).
2. Update [PLAN.md](https://github.com/JawshTheDark/ourtube/blob/main/PLAN.md) and
   [TODO.md](https://github.com/JawshTheDark/ourtube/blob/main/TODO.md), and the README and this wiki if features
   changed.
3. Run `npm test`.
4. Commit, tag (`git tag -a v1.5.0 -m "v1.5.0: ..."`) and push the branch and the tag.
5. Deploy with `scripts/deploy.sh`, one server at a time, and run `network sync` on each (see
   [Upgrading and Backups](Upgrading-and-Backups.md#deploying-from-another-machine)).

What a push to `main` sets off:

- **CI** runs the tests (on every branch, too).
- **The Docker image** (`.github/workflows/image.yml`) is built for `linux/amd64` and `linux/arm64` and pushed to
  `ghcr.io/jawshthedark/ourtube`, tagged `latest` and with the version from `package.json`. Pushes that only change
  `mobile/`, `docs/`, Markdown files or the Android workflow don't build one. **Run workflow** on the Actions tab
  builds it again by hand.
- **Every server's update check** reads the version in `package.json` on `main`, so admins everywhere are told
  about the new version within 12 hours, possibly before the image is finished.
- **The wiki** is published if pages changed (see [This wiki](#this-wiki)).

The Android app is released separately, with `android-v*` tags (see
[Android App](Android-App.md#building-and-releasing)).

## This wiki

The wiki's pages live in the repository under `docs/wiki/`, so they change in the same commits as the code
they describe, and the screenshots are in `docs/images/`. Pages link to each other as `Page.md` so they also work
when browsing `docs/wiki` on GitHub; the published copy drops the `.md`.

The Wiki tab updates by itself: on every push to `main` that changes `docs/wiki/`, `docs/images/` or
`scripts/publish-wiki.sh`, the workflow `.github/workflows/wiki.yml` runs `scripts/publish-wiki.sh` with the
workflow's `GITHUB_TOKEN`. To publish again without a change, open the **Wiki** workflow on the Actions tab and
click **Run workflow**. Running the script by hand still works too, with your own access to the repository:

```bash
scripts/publish-wiki.sh
```

Either way, `docs/wiki` is the source: pages edited on github.com are replaced. The Wiki tab has to be turned on in
the repository's settings, with one page created on github.com first; GitHub only offers wikis on private
repositories with a paid plan.
