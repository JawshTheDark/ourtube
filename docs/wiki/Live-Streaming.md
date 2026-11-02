# Live Streaming

Stream from OBS (or any app that streams over RTMP or SRT) to your channel, with a live chat, and keep the
stream as a video afterwards. Live streaming is optional: an admin turns it on for the server first (see
[Turning it on](#turning-it-on-admins)).

- [Going live](#going-live)
- [OBS step by step](#obs-step-by-step)
- [Your stream settings](#your-stream-settings)
- [Watching and chatting](#watching-and-chatting)
- [Live on other servers](#live-on-other-servers)
- [After the stream](#after-the-stream)
- [Turning it on (admins)](#turning-it-on-admins)
- [How it works](#how-it-works)
- [Troubleshooting](#troubleshooting)

## Going live

1. Open your account menu (your picture, top right) → **Settings** → **Channel** (the first tab, `/settings#live`)
   and scroll to **Live streaming**. It shows a **Server** and a **Stream key**. If it says *Live streaming isn't set
   up on this server*, ask your admin. (The rest of that tab is described in
   [Accounts and Settings](Accounts-and-Settings.md#live-streaming).)
2. In OBS: **Settings → Stream**, service **Custom**, paste the server (for example `rtmp://clips.example.com/live`)
   and the stream key, then **Start Streaming**. The details are in [OBS step by step](#obs-step-by-step).
3. Your stream plays at `/live/<your name>`, and your subscribers get a notification.

The live page has a **Stream settings** button for you, and a channel's live page says *Set up OBS to go live* to
its owner while nothing is streaming; both lead to the same section of Settings.

**The stream key** is like a password: anyone who has it can stream as you. It is hidden until you click **Show**;
**Copy** copies it without showing it. **New key** makes a fresh one (*Make a new stream key? The old one stops
working, so update OBS afterwards.*). The key you copy is your user name followed by `?key=` and a secret; paste
all of it into OBS.

**SRT** works too, when the admin has set an SRT address: Settings then shows **SRT (optional)**, the full
`srt://` address with your key in it (hidden until you click **Show** next to the stream key).

## OBS step by step

The names below are OBS's own; they move a little between OBS versions.

1. **Copy the server.** In OurTube, account menu → **Settings** → **Channel** → **Live streaming** → **Server** →
   **Copy**.
2. **Point OBS at it.** In OBS, open **Settings → Stream**. Set **Service** to **Custom...**, paste the address into
   **Server**, and paste the stream key (from **Stream key** → **Copy**) into **Stream Key**. Leave
   authentication off: the key carries it.
3. **Pick the encoder.** **Settings → Output**. In **Advanced** output mode, on the **Streaming** tab:
   - **Encoder**: H.264, either x264 (the CPU) or the H.264 encoder of your graphics card (NVENC, Quick Sync,
     AMF). The stream reaches viewers as it is, without re-encoding, so pick H.264, which every browser plays.
   - **Rate Control**: CBR.
   - **Bitrate**: what your upload can carry with room to spare: about 6000 kbps for 1080p60, 3500 kbps for 720p.
   - **Keyframe Interval**: 1 or 2 seconds. Viewers start and catch up at keyframes, so a short interval keeps
     the delay low.
   - Audio: AAC, OBS's default.
4. **Set the picture size.** **Settings → Video**: the **Output (Scaled) Resolution** and **FPS** that go with the
   bitrate you chose.
5. **Go live.** Click **OK**, then **Start Streaming**. Open `/live/<your name>` to check: the stream shows up within
   a few seconds.
6. **Stop.** **Stop Streaming** in OBS ends the stream (see [After the stream](#after-the-stream)).

**Apps that take one address** instead of a server and a key (many phone apps) want the two joined with a slash:
`rtmp://clips.example.com/live/yourname?key=…`.

**SRT in OBS:** set **Server** to the whole `srt://` address from Settings and leave **Stream Key** empty.

## Your stream settings

The rest of the **Live streaming** section describes your next stream:

| Field | What it does |
| --- | --- |
| **Title** | The stream's title. Empty means *<your name> is live*. |
| **Description** | Shown under the player on the live page. |
| **Game** | A game from this server's list, so the stream shows the game and its recording is filed under it. A name that isn't in the list is left out. |
| **Who can watch** | **Public: on Home and the network, and subscribers are told**, or **Unlisted: only people with the link**. |
| **Keep each stream as a draft video when it ends** | Keeps the recording (see [After the stream](#after-the-stream)). Off, the recording is deleted. |

Click **Save**. *Changes here reach a stream that is on right now too*: a new title or game shows on the live page
at once.

While you are live, the section starts with *You're live:* and a link to your stream, with the viewer count.

## Watching and chatting

**Where people find a stream**

- **Live now** at the top of Home lists the public streams on this server and on the rest of the network, with
  the channel's picture, a *LIVE · 12 viewers* badge, the title, the channel and game, and the server it's on. It
  checks for new streams every 30 seconds and is hidden while nobody is live.
- A channel that is live shows a **LIVE** banner with the stream's title on its page; it leads to the live page.
- Subscribers get a notification, *<name> is live: <title>* (public streams only).
- Webhooks can post it to a chat channel or a bot (the `live.started` event; see [Webhooks](Webhooks.md)).

**The live page** (`/live/<name>`) plays the stream about two to four seconds behind real time (low-latency HLS).
There is no seek bar: the **LIVE** button in the player jumps back to the live edge if you fell behind. Under the
player are the title, a **LIVE** badge with the number of people watching (everyone with the page open, signed
in or not), the channel, the game, when it started and the description. **Share** copies the page's link.

When the channel isn't live, the page says *<name> isn't live right now*, with the last public stream (*Last live
2 hours ago: <title>*) and a **watch it** link when its recording was kept.

**Chat** (**Live chat**, beside the player):

- Anyone can watch. To chat, people with an account here are themselves; anyone else types a name in *Pick a name
  to chat* and clicks **Join** (2 to 32 characters, remembered in that browser).
- The chat opens with the stream (*The chat opens with the stream.*): messages can only be sent while it's live.
  Messages are up to 500 characters, and people arriving later see the last 100.
- Reactions: the row of emoji under the player floats them up over the video for everyone (for people in the chat,
  while live).
- Anyone can **remove** their own messages. The streamer, the site's moderators and admins can **remove** anyone's
  and **ban** someone (*Remove <name> from the chat?*). A banned person can still watch, but can't chat on that
  channel again (*You were removed from this chat*).
- Chat and reactions are rate limited like watch parties' (*Slow down a little*).

## Live on other servers

- **Live now** on Home includes public streams from the other OurTube servers in the network (up to 20 per
  server), tagged with their server. Clicking one opens its live page on that server, in a new tab. To chat there,
  sign in on that server or join its chat under a name.
- Your public streams show in **Live now** on the other servers the same way. Unlisted streams never do.
- Fediverse followers of your account or channel (on Mastodon, for example) get a post saying you're live, with
  the title and the link, when a public stream starts.

## After the stream

When the stream stops (or its connection drops for more than 45 seconds), it ends and the live page goes back to
*isn't live right now*. A connection that drops and comes back within those 45 seconds continues the same stream,
with the same chat and the same recording.

If **Keep each stream as a draft video when it ends** was on, the recording becomes a **draft video**:

- you get a notification, *Your stream "<title>" was saved as a draft*, which opens its details page;
- it has the stream's title, description and game, and only you can see it until you publish it;
- trim it in the timeline editor if you like, then **Save and publish** like any upload. It is published as public
  or unlisted, like the stream was, unless you change that first. See
  [Uploading and Editing](Uploading-and-Editing.md#drafts-nothing-goes-out-until-you-save).

Otherwise the recording is deleted.

## Turning it on (admins)

Live streaming runs a second container, [MediaMTX](https://github.com/bluenviron/mediamtx), next to OurTube.
It is off until you turn it on:

1. Add these lines to `.env` next to `docker-compose.yml` (pick your own long random secret):

   ```bash
   COMPOSE_PROFILES=live
   LIVE_SERVER=cliptube-live
   LIVE_SECRET=change-me-to-a-long-random-string
   ```

   `LIVE_RTMP_URL` sets the address shown to streamers if it isn't `rtmp://<your public host>/live` (the host of
   the Public URL, Admin → Overview).

2. Make sure `data/live` exists and belongs to the container user (`PUID:PGID`). OurTube creates it at startup, so
   this normally is already the case.
3. `docker compose up -d`. The `cliptube-live` container starts next to OurTube.
4. Let streamers reach **TCP port 1935** (RTMP): the `cliptube-live` container listens on that port of the host
   itself. Open it in the firewall, or forward it on your router for a server at home. SRT is optional: UDP port
   8890, with `LIVE_SRT_URL=srt://your.site:8890` in `.env`.

Viewers need nothing extra: the stream reaches them through OurTube's own address (`/live/hls/...`), so the
reverse proxy you already have is enough. MediaMTX's control API (port 9997) and its HLS (port 8888) stay on the
Docker network.

**Checking it.** **Admin → Debugging → Network and fediverse → Live streaming** says *on, MediaMTX answers* when
all is well, *on, but MediaMTX doesn't answer* when OurTube can't reach the container, and *off* when `LIVE_SERVER`
or `LIVE_SECRET` is missing. Once it's on, the **Live streaming** section in everyone's Settings shows a server and
a stream key instead of *Live streaming isn't set up on this server*.

**Without Docker,** run MediaMTX yourself with `live/mediamtx.yml`, point its `authHTTPAddress` at OurTube's
`/api/live/auth?secret=<LIVE_SECRET>`, have it record into OurTube's `data/live` folder (or set
`LIVE_RECORDINGS_DIR`), and set `LIVE_SERVER` to the host it runs on.

**What it costs:** almost no CPU, since nothing is re-encoded. Bandwidth adds up: every viewer pulls the stream
from your server, so a 6 Mbps stream with ten viewers needs about 60 Mbps of upload. Recordings take disk space
while a stream runs (about 2.7 GB per hour at 6 Mbps) until they are saved as a video or deleted.

## How it works

- MediaMTX asks OurTube about every connection (`/api/live/auth`, with the shared secret). A stream to
  `live/<name>` is accepted only with that channel's key; reading is allowed only to OurTube itself, so the HLS
  can only be watched through OurTube.
- OurTube asks MediaMTX's control API which streams are coming in, to notice when one ends.
- MediaMTX records every stream as fragmented MP4; when the stream ends, OurTube joins the pieces and hands them
  to the normal upload pipeline (an OBS stream is H.264, so it is ready in seconds).
- Viewers follow the chat and the viewer count over server-sent events, like watch parties.
- Other OurTube servers in the network read `GET /api/live/now` to show your streams in their **Live now**.
  Fediverse followers get a post with a link when a public stream starts.

`scripts/live-sandbox.sh <ssh-host>` runs all of this with the real MediaMTX in a private Docker sandbox: it
streams a test picture with ffmpeg and checks the stream, the HLS and the saved recording.

## Troubleshooting

**Settings says live streaming isn't set up.** `LIVE_SERVER` and `LIVE_SECRET` aren't both in `.env`, or the
OurTube container wasn't recreated after adding them (`docker compose up -d`).

**OBS says it can't connect.** Port 1935 isn't reachable: check the firewall and the router's port forward. From
another network, `nc -vz your.site 1935` should connect. Admin → Debugging shows whether MediaMTX answers.

**OBS connects and is disconnected at once.** The stream key is wrong (copy it again from Settings, or make a
new one), or the server URL and key are swapped. After 20 wrong keys from one address within ten minutes, the
server refuses that address for a while; wait a few minutes before trying again with the right key.

**The live page says the channel isn't live, but OBS is streaming.** Check `docker logs cliptube-live` for
"authentication failed", and that `LIVE_SECRET` in `.env` is the same for both containers (they both read it
from there).

**The stream stutters or keeps buffering.** The bitrate is more than your upload (or the server's) can carry for
everyone watching. Lower it in OBS.

**No recording was saved.** "Keep each stream" was off, or `data/live` isn't writable by the container user:
`docker logs cliptube-live` shows the error.
