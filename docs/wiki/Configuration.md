# Configuration

Almost everything is set in the **Admin** pages and takes effect immediately. The few things the server
needs before it starts are environment variables. Where the admin pages are and a tour of each:
[Admin Guide](Admin-Guide.md).

- [Environment variables](#environment-variables)
- [Admin → Overview](#admin--overview)
- [Admin → Moderation](#admin--moderation)
- [Admin → Games](#admin--games)
- [Admin → Legal](#admin--legal)
- [Admin → Network](#admin--network)
- [Admin → Debugging](#admin--debugging)
- [Passwords and API keys](#passwords-and-api-keys)
- [Settings from the command line](#settings-from-the-command-line)
- [The data folder](#the-data-folder)

## Environment variables

| Variable | Default | What it does |
| --- | --- | --- |
| `PORT` | `3000` | Port to listen on (`--port N` on the command line wins) |
| `HOST` | `0.0.0.0` | Interface to bind |
| `DATA_DIR` | `./data` (`/data` in Docker) | Where everything is stored, see [The data folder](#the-data-folder) |
| `TRUST_PROXY` | unset (`1` in Docker) | Set it behind a reverse proxy, so the app sees real client addresses and HTTPS. `1` trusts a proxy on the same machine or a private network (Docker, a LAN box, Tailscale), which fits nearly every setup. A proxy at a public address: its address, such as `203.0.113.7` (a comma-separated list of addresses or subnets works too). A public proxy such as Cloudflare in front of your own: the number of proxies, such as `2`. Empty or `0` turns it off. Before 1.25.2, any value trusted every proxy, so a visitor could make up their address. |
| `SETUP_CODE` | random | The code needed to create the first (admin) account. Only used while no account exists; letter case doesn't matter. |
| `UPDATE_CHECK_URL` | GitHub | Where to read the newest version from, or `off` to never check (see [Upgrading and Backups](Upgrading-and-Backups.md#checking-the-version)) |
| `YTDLP_PATH` | `/opt/yt-dlp/yt-dlp` in Docker, else `yt-dlp` on your PATH | The yt-dlp used for [imports from YouTube](#importing-from-youtube) |
| `PEERTUBE_DIRECTORY_URL` | `https://instances.joinpeertube.org` | The directory of PeerTube servers that Admin → Network browses (see [Fediverse](Fediverse.md#following-out)) |
| `FFMPEG_PATH`, `FFPROBE_PATH` | bundled | Use another FFmpeg, for example one built with your GPU's encoder. Where nothing is bundled for your machine (ffprobe on Linux ARM), the one on your PATH is used. |
| `LOG_REQUESTS` | unset | `1` prints every request (same as `--log`) |
| `FEDERATION_ALLOW_PRIVATE` | unset | `1` lets the network contact LAN and localhost addresses (same as `--allow-private-federation`). Only for testing several servers on one machine. |
| `LIVE_SERVER` | unset | MediaMTX's host name on the Docker network (`cliptube-live`); turns on [live streaming](Live-Streaming.md#turning-it-on-admins) with `LIVE_SECRET` |
| `LIVE_SECRET` | unset | The secret OurTube and MediaMTX share |
| `LIVE_RTMP_URL` | `rtmp://<public host>/live` | The RTMP address shown to streamers |
| `LIVE_SRT_URL` | unset | An SRT address to show streamers, such as `srt://your.site:8890` |

Rarely needed, mostly for tests and unusual live streaming setups:

| Variable | Default | What it does |
| --- | --- | --- |
| `LIVE_API_URL` | `http://<LIVE_SERVER>:9997` | MediaMTX's control API |
| `LIVE_HLS_URL` | `http://<LIVE_SERVER>:8888` | Where OurTube reads MediaMTX's HLS from |
| `LIVE_RECORDINGS_DIR` | `<DATA_DIR>/live` | Where MediaMTX writes its recordings |
| `LIVE_POLL_MS` | `5000` | How often MediaMTX is asked about streams while any are live, in milliseconds |
| `LIVE_END_GRACE_MS` | `45000` | How long a stream may be gone before it counts as ended, in milliseconds |
| `UPLOAD_STALE_MS` | `86400000` (a day) | How long an unfinished upload in pieces is kept without a new piece |
| `UPLOAD_SWEEP_MS` | `3600000` (an hour) | How often unfinished uploads are checked |
| `STEAMGRIDDB_BASE_URL` | `https://www.steamgriddb.com/api/v2` | The SteamGridDB API (the tests point it at a stand-in) |

With Docker, put these under `environment:` in a `docker-compose.override.yml`. The compose file itself reads
`PUID`, `PGID` (the user the container runs as, default 1000), `PROXY_NETWORK` (default `proxy-net`) and
`OURTUBE_IMAGE` (default `ghcr.io/jawshthedark/ourtube:latest`; set `ghcr.io/jawshthedark/ourtube:1.23.0` to stay
on a version) from `.env`, and passes `LIVE_SERVER`, `LIVE_SECRET`, `LIVE_RTMP_URL` and `LIVE_SRT_URL` on from it.
In Dockge, Portainer or another stack manager, put them under the service's `environment:` in the stack's compose
file (see [Installation](Installation.md#dockge-portainer-and-other-stack-managers)).

## Admin → Overview

Admins only. All of these are in the **Site settings** box, the first one on the page, and **Save settings** at
its bottom saves them together.

| Setting | Key | Default | What it does |
| --- | --- | --- | --- |
| **Site name** | `site_name` | OurTube | Up to 40 characters, and can't be empty. Shown next to the logo in the top bar, in the browser tab, on the sign-in page, in link previews, feeds and emails, and to other servers. |
| **Public URL (optional)** | `public_url` | empty | The `https://` address people use (it must start with `http://` or `https://`). Used for link previews, feeds, embeds, links in emails, the RTMP address shown to streamers, the network and the fediverse. Empty: the address each visitor used. Set it before joining a network or being followed from the fediverse, and keep it: other servers know yours by it (see [Moving to a new machine](Upgrading-and-Backups.md#moving-to-a-new-machine)). |
| **Sign-up** | `registration_mode` | `open` | **Open** (`open`), **Needs approval** (`approval`), **Invite only** (`invite`) or **Closed** (`closed`). See [Sign-up](Moderation-and-Legal.md#sign-up). |
| **Max upload size (MB)** | `max_upload_mb` | 8192 | The largest file one upload may be, from 1 to 1,000,000 MB. The upload page sends files in 32 MB pieces, so a reverse proxy's request limit doesn't matter for it; tools that send a whole file at once need the proxy to allow this much (see [Uploading from ShareX and other tools](Uploading-and-Editing.md#uploading-from-sharex-and-other-tools)). |
| **Storage per person (MB)** | `default_quota_mb` | 0 (no limit) | Everyone's default quota. Override it per person by clicking their **Storage** in the **Users** table (see [Storage quotas](Admin-Guide.md#storage-quotas)). |
| **Storage for the whole server (GB)** | `storage_limit_gb` | 0 (no limit) | Everything in the data folder (videos, adaptive streaming, thumbnails, backups). Uploads and imports stop when they would go over it, and whenever the disk would be left with less than 1 GB free, since a full disk can damage the database. The stats at the top of Overview show how much is used. |
| **Max resolution** | `max_height` | 1080 | **480p**, **720p**, **1080p**, **1440p** or **2160p (4K)**. Taller videos are scaled down to this height. |
| **Video encoder** | `encoder` | `libx264` | **libx264 (CPU, works everywhere)**, **NVIDIA NVENC (GPU)** (`h264_nvenc`), **Intel Quick Sync (GPU)** (`h264_qsv`) or **AMD AMF (GPU)** (`h264_amf`). Used only when a video needs re-encoding; a GPU encoder that fails falls back to libx264. See [GPU encoding](Installation.md#gpu-encoding). |
| **Delete the original file after re-encoding** | `delete_originals` | off | Whether to delete the uploaded file after a transcode (see below) |
| **Adaptive streaming (HLS)** | `hls_ladder` | `off` | **Off: play the MP4 only** (`off`), **720p plus source quality** (`720`) or **1080p, 720p and 480p plus source quality** (`full`). Uses roughly 50 to 100% more disk. Changing it rebuilds every video in the background. See [Adaptive streaming](Watching-and-Discovery.md#adaptive-streaming). |
| **Keep a 720p copy of large videos for other platforms** | `federation_rendition` | on | A small MP4 for services like Mastodon that only cache small remote videos. Changing it rebuilds every video in the background. |
| **Show dislike counts** | `show_dislikes` | on | Uploaders always see their own |
| **Let people import their videos from YouTube** | `imports_youtube` | off | Lets people [import their videos from YouTube](Uploading-and-Editing.md#importing-from-youtube-and-immich); see [below](#importing-from-youtube). Imports from Immich need no setting. |

**When is an upload transcoded?** An upload is remuxed (copied into an MP4 without re-encoding, in seconds and
with no quality loss) when it is H.264 video in yuv420p with AAC or MP3 audio, no taller than the maximum
resolution. Anything else is transcoded to H.264 and AAC. A remuxed upload's file is deleted afterwards, since
the MP4 holds the same data; a transcoded upload's file is kept in `originals/` unless **Delete the original file
after re-encoding** is ticked.

The rest of the Overview tab, the **Users** table and **Invites**, is described in the
[Admin Guide](Admin-Guide.md#overview-tab).

### Importing from YouTube

Imports from YouTube use [yt-dlp](https://github.com/yt-dlp/yt-dlp), which comes in the Docker image (outside
Docker, install it yourself, or point `YTDLP_PATH` at it). They're off until you tick **Let people import their
videos from YouTube**, because YouTube changes often and sometimes refuses servers, so imports can break without
warning. To keep up, OurTube updates yt-dlp itself once a day, and fetches one video at a time.

When YouTube refuses with *Sign in to confirm you're not a bot*, which happens most to servers in data centers, give
the server a YouTube login's cookies: sign in to YouTube in a browser (a spare account is wise, since YouTube may
block an account used this way), export its cookies as `cookies.txt` with a browser extension, and save the file as
`youtube-cookies.txt` in the data folder. It's used from the next import on. Delete it to stop.

Imports from Immich need nothing from you; people bring their own shared link or API key. An Immich on your own
network can only be reached by admins.

### Email

Optional. With email, people can confirm an address, reset a forgotten password and get the notification
emails they choose. The settings are in **Admin → Overview → Email (optional)**, the last box on the page, with
its own **Save** button:

| Setting | Key | Default |
| --- | --- | --- |
| **SMTP server** | `smtp_host` | empty (email off) |
| **Port** | `smtp_port` | 587 |
| **Encryption** | `smtp_secure` | **STARTTLS (port 587)** (`starttls`); or **TLS (port 465)** (`tls`), or **None (local relay only)** (`none`) |
| **From** | `smtp_from` | empty (email off), for example `OurTube <clips@example.com>` |
| **Username** | `smtp_user` | empty: no sign-in to the SMTP server |
| **Password** | `smtp_password` | write-only, see [Passwords and API keys](#passwords-and-api-keys) |

Email is on once both **SMTP server** and **From** are filled in. After saving, a **Send a test to...** field and
**Send test** button appear in the box. Links in emails use the Public URL. If nothing arrives, see
[Troubleshooting](Troubleshooting.md#email-and-notifications).

Web push notifications need no setup: the server makes its own keys on first start.

Each person can set up their own [webhooks](Webhooks.md) in Settings → **Apps** → **Webhooks**, for their new
videos and live streams; an admin's can cover the whole server
([Whole-server webhooks](Webhooks.md#whole-server-webhooks)).

## Admin → Moderation

Moderators and admins. **Admin → Moderation → Spam settings**, the **Comment spam controls** box. Switches save
as soon as you flip them; number fields save when you click out of them. They apply to everyone, including people
commenting from other servers; uploaders and moderators are never held. How the checks work:
[Comments and spam](Moderation-and-Legal.md#comments-and-spam).

| Setting | Key | Default | What it does |
| --- | --- | --- | --- |
| **Hold a person's first comment** | `spam_hold_first_comments` | on | Their comments wait for the uploader or a moderator until one is published |
| **Hold links from new accounts** | `spam_hold_links_new_accounts` | on | Comments with a link from a new account wait for review |
| **Hold names that imitate the uploader** | `spam_check_impersonation` | on | Lookalike names such as *Jawsh_* or *J4wsh* next to *Jawsh* wait for review |
| **New account period (hours)** | `spam_new_account_hours` | 24 | How long an account counts as new; 0 means none do |
| **Comments per 10 minutes** | `spam_rate_per_10min` | 20 | More are refused |
| **…for new accounts** | `spam_rate_new_per_10min` | 5 | The same, for new accounts |

The rest of the tab (reports, held comments, appeals, the audit log) is in
[Moderation and Legal](Moderation-and-Legal.md#where-moderators-work).

## Admin → Games

The game catalog, and game artwork from SteamGridDB. Moderators keep the catalog; these two settings are only
shown to admins, in the **Artwork from SteamGridDB** box at the top of the tab:

| Setting | Key | Default | What it does |
| --- | --- | --- | --- |
| The API key field, with **Save key** and **Remove** | `steamgriddb_api_key` | empty; write-only | Lets OurTube fetch covers, title logos and banners |
| **Fill in artwork for new games** | `steamgriddb_auto` | on | Takes SteamGridDB's best-rated artwork when a game is added; saves as you flip it |

Get a key from a free SteamGridDB account (its Preferences, API). On a server in a network, the hub's catalog
brings its own artwork, so the key is only needed on the hub. More in
[Video Tools and Games](Video-Tools-and-Games.md#game-artwork-from-steamgriddb).

## Admin → Legal

Admins only. All of these are in the **Legal page** box, saved together with its **Save** button. Your rules, terms
and contacts appear on `/legal` (see [Writing rules and terms](Admin-Guide.md#writing-rules-and-terms)).

| Setting | Key | Default | What it does |
| --- | --- | --- | --- |
| **Contact email for abuse and copyright** | `legal_contact_email` | empty | Shown on `/legal` |
| **DMCA agent** | `legal_dmca_agent` | empty | Name, address, phone and email as registered with the US Copyright Office; shown on `/legal` |
| **Rules** | `legal_rules` | empty | What's allowed here; shown on `/legal` |
| **Terms people accept at sign-up** | `legal_terms` | empty | When set, sign-up has a required checkbox accepting the rules and terms |
| **Publish a transparency report** | `legal_transparency_public` | on | Counts of notices, removals and restored videos at `/transparency` |
| **Strike the uploader when a notice removes a video** | `strike_on_takedown` | on | Under **Repeat infringers** |
| **Strikes that suspend an account** | `strike_threshold` | 3 | 0 turns automatic suspension off (up to 100) |
| **Strikes expire after (days)** | `strike_expiry_days` | 365 | 0 means strikes never expire; applies to strikes given after the change |
| **Keep removed videos' files for (days)** | `removed_retention_days` | 30 | 1 to 3650; applies to videos removed after the change |

What strikes, takedowns and the transparency report do: [Moderation and Legal](Moderation-and-Legal.md).

## Admin → Network

Admins only. Joining or leaving a network, direct peers, who may peer with you, block lists, hub mode and the
fediverse. All of it is described in [Network](Network.md) and [Fediverse](Fediverse.md). The settings, in the
order of the boxes on the page:

| Setting | Box | Key | Default |
| --- | --- | --- | --- |
| **Hub or instance address** | **Join a network** | `network_hub_url` | `https://clips.irc.so` |
| **Comments**, **Likes**, **Subscriptions** (under *Accept from other instances*) | **Join a network** | `network_accept_comments`, `network_accept_likes`, `network_accept_subscriptions` | on |
| **This instance is the hub** | **Run the network (hub mode)** | `hub_enabled` | off |
| **Share what this server follows** | **Fediverse sharing** | `fediverse_share_out` | off |
| **Show what other servers share** | **Fediverse sharing** | `fediverse_share_in` | off |
| **Accept new instances** (off = lockdown) | **Who can peer with this instance** | `network_accept_new` | on |
| **Ask me first** | **Who can peer with this instance** | `network_require_approval` | off |
| **HTTPS only** | **Who can peer with this instance** | `network_require_https` | on |
| **Publish my block list** | **Who can peer with this instance** | `network_publish_blocklist` | on |
| **Most peers** | **Who can peer with this instance** | `network_max_peers` | 200 (1 to 5000) |
| **Speak ActivityPub** | **Fediverse (ActivityPub)** | `activitypub_enabled` | on |

The **Who can peer with this instance** box only shows once the server is in a network or is a hub. On a hub its
first three switches are replaced by the hub's own **Joining** switches, which decide both who may join and who
may peer.

On a hub, **Run the network (hub mode)** has these too, saved with **Save hub settings** (what they do:
[Running a hub](Network.md#running-a-hub)):

| Setting | Key | Default |
| --- | --- | --- |
| **Network name** | `hub_network_name` | OurTube Network |
| **Accept new instances** | `hub_accept_new` | on |
| **Require my approval** | `hub_require_approval` | off |
| **HTTPS only** | `hub_require_https` | on |
| **Comments between instances** | `hub_allow_comments` | on |
| **Likes between instances** | `hub_allow_likes` | on |
| **Subscriptions between instances** | `hub_allow_subscriptions` | on |
| **Include this instance's videos** | `hub_include_own_videos` | on |
| **Max videos per instance** | `hub_max_videos_per_instance` | 5000 (1 to 100,000) |
| **Sync every (minutes)** | `hub_sync_minutes` | 10 (1 to 1440) |
| **Announcement** | `hub_announcement` | empty (up to 1000 characters) |

Other keys that start with `network_` or `hub_` are the server's own record of its network state; join, leave and
switch hub mode with the Admin page or the [Admin CLI](Admin-CLI.md#network) instead of changing them by hand.

## Admin → Debugging

Admins only. One setting, in the **Version** box:

| Setting | Key | Default | What it does |
| --- | --- | --- | --- |
| **Check GitHub for new versions every 12 hours and tell admins** | `update_check` | on | Saves as you tick it. `UPDATE_CHECK_URL=off` turns the check off for the whole install. See [Checking the version](Upgrading-and-Backups.md#checking-the-version). |

## Passwords and API keys

The SMTP password and the SteamGridDB API key are **write-only**: the Admin pages can set or replace them but
never show them again (the SMTP **Password** field says *Saved (type to change)*). From the command line,
`settings set-secret` reads the value from standard input, so it stays out of the command line and your shell
history:

```bash
docker exec -i cliptube node server/cli.js settings set-secret steamgriddb_api_key < keyfile
docker exec -i cliptube node server/cli.js settings set-secret smtp_password < passwordfile
```

`settings get` refuses to print them, and `settings set` refuses to change them.

## Settings from the command line

Any setting can be read or changed by its key:

```bash
docker exec cliptube node server/cli.js settings get hls_ladder
docker exec cliptube node server/cli.js settings set hls_ladder full
```

The Admin pages check values before saving them, and some changes start background work (switching adaptive
streaming or the 720p copy rebuilds the videos, for example), so prefer the Admin pages for anything but a quick
fix. The command line doesn't check values, and a change of `hls_ladder` or `federation_rendition` made there
doesn't start the rebuild. An Admin page that's already open shows the old value until you reload it. Secret keys
and keys that start with `instance_` can't be changed with `settings set`.

All the commands: [Admin CLI](Admin-CLI.md).

## The data folder

Everything OurTube stores is in one folder (`./data`, or `/data` in the container):

```text
data/
├── cliptube.db      SQLite database: accounts, videos, comments, settings and the server's keys
├── videos/          the MP4s viewers watch (and the first version of edited videos)
├── originals/       uploaded files kept after a transcode
├── thumbs/          thumbnails and game artwork
├── avatars/         profile pictures and channel banners
├── captions/        caption files
├── hls/             adaptive streaming segments
├── renditions/      720p copies for other platforms
├── editor/          filmstrips and waveforms for the timeline editor
├── exports/         GIF and MP4 exports (kept for a day)
├── live/            live stream recordings, written by MediaMTX
├── backups/         database copies made before migrations and deploys
├── uploads/         uploads arriving in pieces (unfinished ones are deleted after a day)
├── tmp/             work files, imports and single-request uploads in progress (emptied at every start)
└── youtube-cookies.txt   only if you add it, for imports from YouTube
```

Admin → **Debugging** → **Storage** shows how big each folder is.

**Back up the whole folder and you have everything**, including the keys that identify your server to the
network and the fediverse. How to back up a running server: [Upgrading and Backups](Upgrading-and-Backups.md).
