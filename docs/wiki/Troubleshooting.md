# Troubleshooting

Each problem below is laid out as what you see, why it happens, and what to do. Find yours in the contents, or
search the page for the exact words of the error.

- [Where to look first](#where-to-look-first)
- [Installing and starting](#installing-and-starting)
- [Reaching the site](#reaching-the-site)
- [Uploads](#uploads)
- [Processing and encoding](#processing-and-encoding)
- [Imports](#imports)
- [Live streaming](#live-streaming)
- [The network](#the-network)
- [The fediverse](#the-fediverse)
- [Email and notifications](#email-and-notifications)
- [Game artwork](#game-artwork)
- [Updating](#updating)
- [Deploying](#deploying)

## Where to look first

Admins can start with **Admin → Debugging**: the version and whether a newer one is out, FFmpeg and the GPU
encoders in its build, disk use per folder and free space, the database, the job queue with recent failures,
the network and ActivityPub, whether the live streaming server answers, and the server's recent warnings and
errors. **Copy the whole report** puts all of it on the clipboard for whoever is helping; no passwords or keys
are in it.

Then the log. Lines are tagged by area (`[media]`, `[network]`, `[jobs]`, `[db]`, `[live]`, `[imports]` and so on):

| Install | The log |
| --- | --- |
| Docker | `docker logs cliptube --tail 200 -f` (Ctrl+C stops following) |
| Dockge | The stack's page |
| Portainer | **Containers** → `cliptube` → **Logs** |
| systemd | `journalctl -u cliptube -f` |

When the site itself says *Something went wrong on the server*, something unexpected broke: the log has the error
in full, from the moment it happened. Other messages on the site were written for people and say what's wrong.

## Installing and starting

### `network proxy-net declared as external, but could not be found`

**Cause:** the compose file joins your reverse proxy's Docker network, and no network by that name exists.

**Fix:** create it (`docker network create proxy-net`), or, if your proxy uses another network, set
`PROXY_NETWORK=<name>` in `.env` (in a stack: put that name under `networks:`). See
[Installation](Installation.md#docker-behind-a-reverse-proxy-recommended), step 3.

### The container keeps restarting, with `EACCES: permission denied` in the log

The log shows something like `EACCES: permission denied, mkdir '/data/originals'` or `unable to open database
file`, and `docker ps` shows the container *Restarting*.

**Cause:** the data folder on the host doesn't belong to the user the container runs as: 1000:1000, or `PUID:PGID`
from `.env`, or the stack's `user:` line. When the folder doesn't exist yet, Docker makes it itself, owned by
root, so this is what happens when a stack starts before its data folder was made.

**Fix:** give the folder to that user and restart:

```bash
sudo chown -R 1000:1000 data                        # next to docker-compose.yml
sudo chown -R 1000:1000 /opt/stacks/ourtube/data    # a Dockge stack called ourtube
docker restart cliptube
```

`ls -ldn data` shows the folder's owner as numbers. Or run the container as that owner instead (`PUID` and `PGID`
in `.env`, or the stack's `user:` line).

### `docker: 'compose' is not a docker command`

**Cause:** the Docker Compose plugin isn't installed (older setups have the separate `docker-compose` program).

**Fix:** install the Compose plugin; Docker's own packages call it `docker-compose-plugin`, and
[Docker's instructions](https://docs.docker.com/engine/install/) install it along with Docker.

### `permission denied while trying to connect to the Docker daemon socket`

**Cause:** your user may not use Docker.

**Fix:** put `sudo` in front, or add yourself to the `docker` group (`sudo usermod -aG docker $USER`) and log out
and back in.

### `no matching manifest for linux/arm/v7`

**Cause:** a 32-bit operating system. The image is built for 64-bit x86 and ARM only.

**Fix:** install a 64-bit OS (Raspberry Pi OS 64-bit on a Pi 4 or 5).

### `port is already allocated` or `address already in use`

**Cause:** another program already uses the port you published (or, without Docker, the port OurTube listens on).

**Fix:** publish another host port in `docker-compose.override.yml` or the stack (`"3100:3000"`) and point your
proxy at it, or set `PORT` when running with Node.js. Inside the container, keep port `3000`: the health check
asks that port.

### `The container name "/cliptube" is already in use`

**Cause:** an older OurTube container still exists, from another compose folder, another stack or a `docker run`.

**Fix:** remove the old one: `docker compose down` in its folder, or `docker rm -f cliptube`. Its data folder is
left alone; make sure the new install uses that folder (see
[Moving to a new machine](Upgrading-and-Backups.md#moving-to-a-new-machine)).

### The container stays *unhealthy*

**Cause:** the server doesn't answer on port 3000 inside the container: it crashed (the log says why), or `PORT`
was changed in its environment, which the health check doesn't follow.

**Fix:** `docker logs cliptube --tail 100`. Remove `PORT` from the environment and publish a different host port
instead.

### Lost the setup code, or *Wrong setup code*

**Cause:** the code is only printed in the log, at every start while no account exists, and it is a new random
code each time the server starts. A code from an earlier start no longer works.

**Fix:** take the newest one:

```bash
docker logs cliptube 2>&1 | grep -i "setup code" | tail -1
```

In Dockge or Portainer, it's in the log (see [Where to look first](#where-to-look-first)). To choose your own, set
`SETUP_CODE` in the environment (in a stack: `- SETUP_CODE=...` under `environment:`) and restart. Capitals and
spaces around the code don't matter.

### The sign-up form doesn't ask for a setup code

**Cause:** an account exists already, so the next one isn't the first (admin) account.

**Fix:** see who it is: `docker exec cliptube node server/cli.js user list`. If it's yours, sign in (forgot the
password? see [Admin CLI](Admin-CLI.md#locked-out-of-the-admin-account)). A brand-new server that has nothing to
lose can simply start over: stop it, empty its data folder, and start it again.

### *The frontend has not been built yet*

**Cause:** running from source without building the web app.

**Fix:** `npm run build`, then restart. (For development, `npm run dev`: see [Development](Development.md).)

### `No such built-in module: node:sqlite`

**Cause:** Node.js older than 22.13.

**Fix:** install Node.js 22.13 or newer (24 recommended).

## Reaching the site

### 502 Bad Gateway from the proxy

**Cause:** the proxy can't reach OurTube. Either OurTube isn't running, or the proxy looks in the wrong place.

**Fix:**

1. Check that OurTube runs and is *healthy*: `docker ps --filter name=cliptube`. If not, read its log.
2. Check that the proxy forwards to scheme `http`, host `cliptube`, port `3000`. Not `https`, not `127.0.0.1`
   (inside the proxy's container that is the proxy itself), and not the container's `172.x.x.x` address (it
   changes whenever the container is recreated).
3. Check that the proxy and OurTube share a Docker network. This asks OurTube from that network:

   ```bash
   docker run --rm --network proxy-net curlimages/curl -sS http://cliptube:3000/api/site
   ```

   JSON with your site name means the network is right and the proxy's settings are not. *Could not resolve
   host* means OurTube isn't on that network (or the proxy isn't: see
   [Installation](Installation.md#docker-behind-a-reverse-proxy-recommended), step 3).

If the proxy isn't in Docker or not on a shared network, publish a port and forward to the host's **LAN address**
(for example `192.168.1.10:3100`).

### The proxy can't reach OurTube after an update

Everything worked until an update (or a restart from Dockge, Portainer or another tool), and now the proxy says
*502 Bad Gateway*.

**Cause:** OurTube's container was joined to the proxy's network by hand, with
`docker network connect proxy-net cliptube`. An update replaces the container with a new one, and a network joined
by hand goes with the old one. The same happens when the proxy forwards to the container's IP address, which
changes with every new container.

**Fix:** put the network in the compose file, as in
[The compose file for a stack](Installation.md#the-compose-file-for-a-stack), and update once more; from then on it
survives every update. Forward to `cliptube`, never an IP address. Until then, `docker network connect proxy-net
cliptube` gets you back. To see which networks the container is on:

```bash
docker inspect -f '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}' cliptube
```

### Nothing answers from outside

The site times out or refuses the connection from the internet.

**Cause and fix**, in order:

- **DNS:** the name must point at your server's public IP (`nslookup clips.example.com`).
- **Ports:** 80 and 443 must reach the reverse proxy: open them in the server's firewall, and forward them on your
  router at home.
- **At home:** a shared provider address (CGNAT) stops forwarded ports from working at all; see
  [Hosting at home](Installation.md#hosting-at-home).

### The site works for everyone except me at home

**Cause:** your router doesn't support NAT loopback (hairpin NAT).

**Fix:** turn it on if the router has it, add a hosts-file entry pointing the name at the server's LAN address, or
use the LAN address. See [Hosting at home](Installation.md#hosting-at-home).

### Everyone seems to come from the same address

People who did nothing wrong get *Too many failed sign-ins. Try again in a few minutes.* or *Too many new accounts
from your address. Try again later.*, all at the same time. Without a Public URL, links say `http://` although the
site is HTTPS.

**Cause:** OurTube doesn't take the visitor's address and the scheme from the proxy's `X-Forwarded-For` and
`X-Forwarded-Proto` headers, so every visitor looks like the proxy. Either `TRUST_PROXY` isn't set (the Docker image
sets it; outside Docker you must), the proxy doesn't send those headers, or the proxy reaches OurTube from a public
address, which `TRUST_PROXY=1` doesn't trust.

**Fix:** set `TRUST_PROXY=1` and restart, and make sure the proxy sends both headers (Nginx Proxy Manager and Caddy
do; for nginx, see [the example](Installation.md#nginx-with-lets-encrypt)). If the proxy is on another machine with a
public address, set `TRUST_PROXY` to that address instead; behind Cloudflare and your own proxy, set it to `2` (see
[`TRUST_PROXY`](Configuration.md#environment-variables)). Set the **Public URL** in Admin → Overview too.

### Link previews in Discord show the wrong address, or none

**Fix:** set the **Public URL** in Admin → Overview to the site's `https://` address.

## Uploads

### Uploads fail with *413*, or crawl

There are two different limits:

- ***File is larger than the 8192 MB upload limit***: OurTube's own limit per file. Raise **Max upload size (MB)**
  in Admin → Overview.
- ***413 Request Entity Too Large*** or *Upload failed (413)*: the **reverse proxy** limits request size (nginx
  allows 1 MB by default). Add `client_max_body_size 0;` (in Nginx Proxy Manager: the proxy host's **Advanced**
  tab; see [Installation](Installation.md#nginx-proxy-manager)). The upload page sends smaller pieces when a proxy
  refuses big ones, so a low limit can also look like uploads that are very slow.

### Large uploads stop partway

The card says *Connection lost at 40%, trying again…*, and in the end *Network error during upload* or a status
code.

**Cause:** the connection dropped, or the proxy gave up on a slow piece.

**Fix:** the upload page sends files in 32 MB pieces and carries on by itself after a dropped connection; when it
gives up, **Try again** resumes it (unfinished uploads are kept for a day, after which *Upload not found* means
starting over). If pieces keep failing, raise the proxy's timeouts:
`proxy_read_timeout 3600s; proxy_send_timeout 3600s;`. Pieces get through Cloudflare's 100 MB limit; a
single-request upload over the API doesn't.

### ShareX or another tool fails with big files

**Cause:** the tool sends the whole file in one request, which the proxy's limit applies to (Cloudflare's 100 MB,
or the proxy's body limit above).

**Fix:** raise the proxy's limit, or, through Cloudflare, upload big files on the site or send them in pieces over
the API (see [Uploading and Editing](Uploading-and-Editing.md#big-files-and-shaky-connections)).

### Storage messages

| Message | Cause | Fix |
| --- | --- | --- |
| *This upload would go over your storage quota* | The person's quota | Raise **Storage per person (MB)** in Admin → Overview, or that person's own quota |
| *This server has reached its storage limit* | **Storage for the whole server (GB)** in Admin → Overview | Raise it, or make room |
| *This server's disk is nearly full* | Less than 1 GB would be left free on the disk | Make room on the disk |

To make room: **Admin → Debugging → Storage** shows what takes the space, including the database copies in
`backups/` (copies you made by hand are never deleted for you).

### *Too many unfinished uploads: finish or cancel some first*

**Cause:** each person can have 10 unfinished uploads.

**Fix:** finish the ones you want (drop the same file in again to resume it), and cancel the rest, or wait:
unfinished uploads are deleted after a day.

### *unsupported file type*

**Cause:** the file's extension isn't one of the accepted formats (see
[Uploading and Editing](Uploading-and-Editing.md#uploading)).

**Fix:** convert it, or rename it if the extension is simply wrong.

### Every upload fails with *ffprobe was not found on this server*

**Cause:** the server runs on Linux on ARM, where the bundled ffprobe has no build, and there is no FFmpeg on the
PATH. (Versions before 1.9.1 said `spawn /app/node_modules/ffprobe-static/bin/linux/arm64/ffprobe ENOENT`.)

**Fix:** with Docker, update: the image adds Debian's FFmpeg on ARM. Without Docker, install FFmpeg
(`sudo apt install ffmpeg`), or set `FFPROBE_PATH` to it. The startup log shows the same message when FFmpeg
can't run.

## Processing and encoding

### A video stays *Queued* or at *Processing* for a long time

**Cause:** processing waits its turn. FFmpeg work runs one job at a time: uploads, edits, clips, GIF and MP4
exports, saved live streams, and adaptive-streaming copies all share that one lane. Changing **Adaptive
streaming** in Admin → Overview rebuilds every video, which keeps the lane busy for a long time on a server with
many videos. A long or high-resolution video on a small CPU also takes a while; Studio shows *Processing 40%* as it
goes.

**Fix:** **Admin → Debugging → Job queue** shows how many `media` jobs are waiting and which one runs now. Let them
finish. To go faster: a [GPU encoder](Installation.md#gpu-encoding), a lower **Max resolution**, or adaptive
streaming off. After a restart, the log says `[jobs] re-queued 1 job(s) interrupted by the last shutdown`, and that
video starts over.

### A video *Failed*

Studio shows *Failed* (hover over it for the reason), and the video's page says *Processing failed*.

**Cause:** the log has `[media] processing <id> failed: <reason>`. Common reasons:

| Reason | Means |
| --- | --- |
| *No video stream found in this file* | It isn't a video (or only has sound) |
| *ffmpeg exited with code …* followed by FFmpeg's last words | FFmpeg couldn't read or write it; *No space left on device* means the disk is full |
| *ffmpeg was not found on this server* or *ffprobe was not found…* | FFmpeg is missing (see [above](#every-upload-fails-with-ffprobe-was-not-found-on-this-server)) |
| *Original file is missing* | The uploaded file is gone from `originals/` |

**Fix:** deal with the reason, then click **Retry processing** (the round arrow) next to the video in Studio.
Nothing retries a failed video by itself. *Edit failed* is the same for an edit made in the timeline editor, with
the same button.

### The GPU isn't used

The log says `[media] encoder h264_nvenc failed, falling back to libx264: <reason>` (or `h264_qsv`, `h264_amf`).

**Cause and fix:**

- **The encoder isn't in your FFmpeg.** **Admin → Debugging → FFmpeg** lists the *GPU encoders in this build*. If
  yours is missing, point `FFMPEG_PATH` and `FFPROBE_PATH` at an FFmpeg that has it.
- **It's listed but fails:** the container can't reach the GPU. NVIDIA needs the NVIDIA Container Toolkit on the
  host and the `deploy:` lines; Intel needs `/dev/dri` and the render group. See
  [GPU encoding](Installation.md#gpu-encoding). The reason after the colon is FFmpeg's own.
- **It never shows up for some uploads:** H.264 uploads are remuxed rather than encoded, so they never touch the
  GPU.

`encoder libx264 failed, giving up` means the CPU encode failed too: the video fails, as above.

## Imports

### *Importing from YouTube is turned off on this server*

**Cause:** imports from YouTube are off until an admin turns them on.

**Fix:** Admin → Overview, tick **Let people import their videos from YouTube**, **Save settings**.

### *YouTube wants this server to sign in before it shares videos*

**Cause:** YouTube refuses some servers, most often ones in data centers.

**Fix:** give the server a YouTube login's cookies in `data/youtube-cookies.txt`; how, step by step:
[Configuration](Configuration.md#importing-from-youtube).

### *YouTube: …* with another message

**Cause:** yt-dlp couldn't fetch the video, often because YouTube changed something. The yt-dlp in the Docker
image updates itself at most once a day; `[imports] could not update yt-dlp: …` in the log means that failed. In
the image yt-dlp belongs to user 1000, so a container running as another user (`PUID`) can't update it.

**Fix:** try again later (or the next day, after yt-dlp's update). Updating OurTube's image also brings the yt-dlp
that was newest when it was built.

### *yt-dlp is not installed on this server*

**Cause:** running without Docker, with no yt-dlp on the PATH.

**Fix:** install [yt-dlp](https://github.com/yt-dlp/yt-dlp), or set `YTDLP_PATH` to it, and restart.

### Immich: *… is in a private network, which only admins can reach from here*

**Cause:** addresses in the server's own network (`localhost`, `192.168.…`, Docker networks) can only be reached
for admins, so that members can't use the server to look around its network.

**Fix:** members use Immich's public address. Admins may use the LAN address; from inside the container,
`localhost` is the container itself, so use the host's LAN address, or Immich's container name when both share a
Docker network.

### Other Immich messages

| Message | Fix |
| --- | --- |
| *This shared link doesn't allow downloads…* | In Immich, edit the link and turn on **Allow download** |
| *That is not an Immich shared link (it should have /share/ in it)* | Copy the link Immich made under **Share** |
| *Could not reach <address>: …* | The server can't connect to that address; check it from the server |
| *<address> said: …* | Immich refused, for example a wrong or deleted API key; connect again with a new key |

## Live streaming

Start with **Admin → Debugging → Network and fediverse → Live streaming**:

| It says | Cause | Fix |
| --- | --- | --- |
| *off* | OurTube doesn't have both `LIVE_SERVER` and `LIVE_SECRET` | Set both: in `.env` with the repository's compose file, or under `cliptube`'s `environment:` in a stack. Then `docker compose up -d` (or deploy). |
| *on, but MediaMTX doesn't answer* | The `cliptube-live` container isn't running, isn't on a network shared with `cliptube`, or `LIVE_SERVER` isn't its name | `docker ps` and `docker logs cliptube-live`; compare with [Live streaming in a stack](Installation.md#live-streaming-in-a-stack) |
| *on, MediaMTX answers* | The server side is fine | Look at the streamer's side, below |

`[live] poll failed: …` in OurTube's log means it can't reach MediaMTX's API. If MediaMTX doesn't start and
`live/mediamtx.yml` on the host is a folder, Docker made it because the file was missing: delete the folder, put the
file there, and start again.

OBS that can't connect, a stream that doesn't show and recordings that aren't saved are covered in
[Live Streaming](Live-Streaming.md#troubleshooting).

## The network

### Joining fails

| Message | Cause and fix |
| --- | --- |
| *Other instances need to reach this site over HTTPS, but its address is http://…* | Set the **Public URL** in Admin → Overview to the site's `https://` address |
| *Could not reach https://…* | This server can't connect to the hub: check the address, and that the server can reach the internet |
| *… is not running an OurTube network hub* | Wrong address: give the hub's, or any server already in the network |
| *Could not confirm the request came from https://your.site* | The hub couldn't reach your server at its Public URL. It must answer from the internet, not only from your home. |
| *This network is not accepting new instances right now* | The hub is locked down; ask its admin |
| *This network only accepts instances served over HTTPS* | Your Public URL must be `https://` |
| You wait as *pending* | The hub approves each new server; its admin has to accept yours |

To test from outside, use a phone's connection or another network, not your own Wi-Fi (see
[the hairpin problem](#the-site-works-for-everyone-except-me-at-home)):

```bash
curl -sS https://your.site/api/site
```

`docker exec cliptube node server/cli.js network status` shows each peer's state and its last error, and Admin →
Network shows *Last sync failed: …* when the last sync did.

### *Request expired (check the server clock)*

**Cause:** the two servers' clocks differ by more than 10 minutes. (ActivityPub refuses signed requests more than
an hour off.)

**Fix:** turn on time sync: `timedatectl` should say *System clock synchronized: yes*; `sudo timedatectl set-ntp
true` turns it on.

### Other servers' clips don't show up

**Cause:** not synced yet, the peer is failing, or the clip isn't shared. A clip only travels if it is public,
ready and has *Share with the network* ticked on its server, and a blocked server's clips are hidden.

**Fix:** run `network sync` and look at the peers' states in Admin → Network. Failing peers are retried with a
growing delay, up to six hours apart.

### Testing two servers on one machine

**Cause:** the network refuses private addresses.

**Fix:** start both with `--allow-private-federation`. See
[Network](Network.md#testing-several-servers-on-one-machine).

## The fediverse

### Mastodon can't find a channel

**Fix:** search for the full handle, `@name_channel@your.site`. ActivityPub must be on (Admin → Network →
*Fediverse*) and the Public URL set to `https://`. Check that
`https://your.site/.well-known/webfinger?resource=acct:name_channel@your.site` answers from outside your network.

### Followers on Mastodon don't see a video

**Cause:** only public videos go out, after their details are saved (drafts never do). Mastodon may also only show
videos up to a certain size.

**Fix:** publish it as public; keep **Keep a 720p copy of large videos for other platforms** on (Admin →
Overview), which is meant for that.

### *signature could not be checked* or *Unable to fetch key*

Failed `ap.deliver` jobs in **Admin → Debugging → Job queue** (or the log) carry one of these from the other
server: PeerTube says the first, Mastodon the second.

**Cause:** the other server couldn't load your server's public key when your delivery arrived. Either your server
was restarting, or it can't be reached at its Public URL from the internet.

**Fix:** OurTube tries these again by itself, after 1 minute, 5 minutes, 30 minutes, 2, 6, 12, 24 and 48 hours,
so a restart sorts itself out. If they keep failing, check from outside your network that your server's key is
there:

```bash
curl -sS -H 'Accept: application/activity+json' https://your.site/ap/actor
```

It should answer with JSON that has a `publicKey`. The Public URL must be the `https://` address people use, and
shouldn't change once others follow you: your server's addresses on the fediverse are made from it.

### *ActivityPub is turned off on this site* or *Set this site's Public URL first*

**Fix:** turn ActivityPub on (Admin → Network → *Fediverse*), and set the Public URL in Admin → Overview.

## Email and notifications

### No emails arrive

**Fix:** use **Send test** in Admin → Overview → *Email (optional)* (it appears once an SMTP server is saved). Email
only counts as set up with both an **SMTP server** and a **From** address. What the test's error means:

| Error | Cause and fix |
| --- | --- |
| *SMTP server timed out*, or `connect ECONNREFUSED …` | The server can't connect: check the host and port. Many hosting providers block outgoing mail ports; ask yours, or try the other port. |
| *The SMTP server does not offer STARTTLS* | Port 465 needs **Encryption: TLS (port 465)**; port 587 usually needs **STARTTLS** |
| *SMTP AUTH: …* | The username or password was refused |
| *SMTP MAIL: …* | The **From** address isn't one this account may send from |
| *SMTP RCPT: …* | The SMTP server refused the recipient |

The test arrives but other emails don't? Check the spam folder, and that the **From** address belongs to a domain
the SMTP server may send for.

### Web push doesn't work

**Cause:** push needs HTTPS (or `localhost`), and the browser has to allow notifications for the site.

**Fix:** use the site over `https://`; each device turns push on separately in Settings → *Notifications*.

## Game artwork

### *Add a SteamGridDB API key first*

**Fix:** save a key in Admin → Games (or with `settings set-secret steamgriddb_api_key`). On a member of a network
you usually don't need one: the hub's games bring their artwork.

### *SteamGridDB refused the API key*

**Cause:** the key is wrong or was revoked.

**Fix:** copy it again from SteamGridDB (Preferences, API) and save it.

### The wrong game's artwork

**Fix:** open the game's **Artwork** picker in Admin → Games, search for the right game, and pick its images.

### *The hub keeps this game up to date*

**Cause:** games from the hub's catalog are changed on the hub, not on members.

## Updating

### `git pull` says *Your local changes would be overwritten by merge*

**Cause:** you edited `docker-compose.yml` (or another file that the update changes).

**Fix:** move your changes to `docker-compose.override.yml`, then `git checkout docker-compose.yml` and pull again.
See [Keeping your changes out of docker-compose.yml](Upgrading-and-Backups.md#keeping-your-changes-out-of-docker-composeyml).

### After an update the container keeps restarting with `Migration … failed`

**Cause:** a database change in the new version failed on your database.

**Fix:** go back to the previous version together with the database copy made just before
([Rolling back](Upgrading-and-Backups.md#rolling-back)), and report the error with the log.

### `docker compose pull` fails with *manifest unknown*

**Cause:** the image tag you pinned doesn't exist. Tags are plain version numbers (`1.25.1`, not `v1.25.1`), and
published images start at 1.23.0.

**Fix:** correct `OURTUBE_IMAGE` (or the stack's `image:` line), or go back to `latest`.

### The update didn't bring the new version

**Cause:** the image is pinned to a version ([Staying on a version](Upgrading-and-Backups.md#staying-on-a-version)),
Portainer redeployed without pulling, or the new image is still being built: admins are told about a new version as
soon as it is out, and GitHub takes a while longer to finish its image.

**Fix:** check the `image:` line or `OURTUBE_IMAGE`, update again (in Portainer with **Re-pull image and
redeploy**), or wait a little. **Admin → Debugging → Version** shows what runs.

## Deploying

### `Permission denied (publickey)`

**Cause:** `scripts/deploy.sh` uses SSH in batch mode, so the server must accept your SSH key without a password
prompt.

**Fix:** set up key-based SSH to the server (`ssh-copy-id user@your-server`), and check that `ssh user@your-server`
gets in without asking.

### `kex_exchange_identification: ... Connection reset` or `connection abort`

**Cause:** many SSH connections in a short time can trip the server's connection limits (sshd's `MaxStartups`,
fail2ban).

**Fix:** wait a minute and run the deploy again, one server at a time.

### The health check never turns healthy

**Fix:** `docker logs cliptube --tail 100` shows why. To go back to the previous version, see
[Rolling back](Upgrading-and-Backups.md#rolling-back).
