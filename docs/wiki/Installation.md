# Installation

OurTube runs wherever Docker or Node.js runs. This page takes you from nothing to a working site, one step at a
time. The settings you can change afterwards are in [Configuration](Configuration.md), and what to do once you're
the admin (inviting people, sign-up, moderation) is in the [Admin Guide](Admin-Guide.md).

- [What you need](#what-you-need)
- [What every install has in common](#what-every-install-has-in-common)
- [Which way to install](#which-way-to-install)
- [Docker behind a reverse proxy (recommended)](#docker-behind-a-reverse-proxy-recommended)
  - [Nginx Proxy Manager](#nginx-proxy-manager)
  - [Caddy](#caddy)
  - [nginx with Let's Encrypt](#nginx-with-lets-encrypt)
  - [Tunnels](#tunnels)
- [Docker on its own](#docker-on-its-own)
- [Dockge, Portainer and other stack managers](#dockge-portainer-and-other-stack-managers)
  - [The compose file for a stack](#the-compose-file-for-a-stack)
  - [Dockge step by step](#dockge-step-by-step)
  - [Portainer step by step](#portainer-step-by-step)
  - [Live streaming in a stack](#live-streaming-in-a-stack)
- [Without Docker](#without-docker)
- [First run](#first-run)
- [Joining the network](#joining-the-network)
- [Hosting at home](#hosting-at-home)
- [GPU encoding](#gpu-encoding)
- [Checking that it works](#checking-that-it-works)
- [Everyday commands](#everyday-commands)

## What you need

| | |
| --- | --- |
| **Machine** | A 64-bit server, VM or PC: x86-64, or ARM64 such as a Raspberry Pi 4 or 5 running a 64-bit OS. The Docker image is built for both (not for 32-bit ARM); Node.js runs anywhere Node does. |
| **Software** | Docker Engine with the Compose plugin (`docker compose`), or Node.js 22.13 or newer. FFmpeg comes bundled (on ARM the image adds Debian's, see [Without Docker](#without-docker) for ARM without it). |
| **Memory** | Little. clips.irc.so, the hub, uses about 60 MB of RAM when idle, plus about 20 MB with live streaming on; encoding a video takes a few hundred MB more while it runs. A 1 GB VPS is plenty for a small server. |
| **Disk** | Where most of the cost is. Plan on a little over the size of the uploads, and about three times that with adaptive streaming at `full` (the hub: 2.7 GB of videos, 8.8 GB in all). An edited video also keeps its first version as the editing source. |
| **CPU** | Only encoding is heavy: it uses every core for a while after an upload, then nothing. H.264 recordings skip it (they are remuxed in seconds), and a GPU encoder helps with the rest. On a busy VPS, leave adaptive streaming off and the maximum resolution at 1080p or lower. |
| **Network** | For anything beyond your LAN: a domain name and HTTPS. Linking with other servers and the fediverse needs a public `https://` address. Ports: 80 and 443 for the reverse proxy; 1935 (TCP) only for [live streaming](Live-Streaming.md). |

To install Docker, follow [Docker's own instructions](https://docs.docker.com/engine/install/) for your system;
they include the Compose plugin. To use `docker` without `sudo`, add yourself to the `docker` group, then log out
and back in:

```bash
sudo usermod -aG docker $USER
```

## What every install has in common

These names come up on every page of this wiki:

| | |
| --- | --- |
| **Container name** | `cliptube` (OurTube's old name). Commands like `docker logs cliptube` use it. |
| **Image** | `ghcr.io/jawshthedark/ourtube:latest`, built by GitHub for x86-64 and ARM64. Each version also has its own tag, such as `ghcr.io/jawshthedark/ourtube:1.25.1`. |
| **Port** | `3000` inside the container. Your reverse proxy forwards to it; you never need to change it. |
| **Data folder** | `/data` inside the container, mounted from a folder of yours on the host (`./data` next to the compose file). Everything OurTube stores is in it: see [The data folder](Configuration.md#the-data-folder). |
| **User** | The container runs as user `1000`, group `1000` (or `PUID:PGID`, see below). **The data folder must belong to that user**, or OurTube can't write to it and stops with *permission denied*. |
| **Health check** | Docker marks the container *healthy* once the site answers. `docker ps` shows it in the STATUS column. |
| **Behind a proxy** | The image sets `TRUST_PROXY=1`, so OurTube takes each visitor's address and HTTPS from the proxy's `X-Forwarded-For` and `X-Forwarded-Proto` headers. |

## Which way to install

| You have | Follow |
| --- | --- |
| A server with a reverse proxy in Docker (Nginx Proxy Manager, Caddy, Traefik) and a terminal | [Docker behind a reverse proxy](#docker-behind-a-reverse-proxy-recommended) |
| Dockge, Portainer or another web UI for compose stacks | [Dockge, Portainer and other stack managers](#dockge-portainer-and-other-stack-managers) |
| nginx or Caddy installed on the host itself | [Docker on its own](#docker-on-its-own), then [nginx](#nginx-with-lets-encrypt) or [Caddy](#caddy) |
| Just want to try it on your home network | [Docker on its own](#docker-on-its-own) |
| No Docker | [Without Docker](#without-docker) |

Every way ends with [First run](#first-run).

## Docker behind a reverse proxy (recommended)

This is how clips.irc.so runs: OurTube in a container with no published port, and a reverse proxy on the same
Docker network that handles HTTPS. You need the reverse proxy running already, and a domain name pointing at the
server.

**1. Get the compose file**

```bash
git clone https://github.com/JawshTheDark/ourtube.git ~/ourtube
cd ~/ourtube
```

Run every `docker compose` command on this page from this folder. (No git? `sudo apt install git`, or use a
[stack manager](#dockge-portainer-and-other-stack-managers), which needs no checkout.)

**2. Make the data folder**

```bash
mkdir -p data
id -u; id -g      # your user id and group id
```

The container runs as 1000:1000 and writes everything into `./data`, so that folder must belong to 1000:1000. On
most single-user Linux machines you are user 1000, and `mkdir` just made the folder yours. If `id -u` printed
something else, either give the folder to 1000 (`sudo chown -R 1000:1000 data`) or run the container as you by
setting `PUID` and `PGID` in step 3.

**3. Share a network with your proxy**

The compose file joins an external Docker network called `proxy-net`, and your reverse proxy has to be on it too:
that is how the proxy reaches OurTube by its name, `cliptube`. Create it and connect your proxy (`docker ps` shows
the proxy container's name):

```bash
docker network create proxy-net
docker network connect proxy-net <your-proxy-container>
```

`docker network connect` lasts only as long as that container. If your proxy runs from a compose file or a stack
manager, put the network in the proxy's compose file instead (the same `networks:` lines as in
[The compose file for a stack](#the-compose-file-for-a-stack)), or the connection is gone after the proxy's next
update.

If your proxy is already on a network you made, use that one instead. This lists the networks a container is on:

```bash
docker inspect -f '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}' <your-proxy-container>
```

(`bridge`, Docker's default network, won't do: containers only find each other by name on networks you create.)
Then write the network's name, and your ids if they aren't 1000, to `.env` next to `docker-compose.yml`:

```bash
printf 'PROXY_NETWORK=%s\nPUID=%s\nPGID=%s\n' my-proxy-net "$(id -u)" "$(id -g)" > .env
```

The compose file reads these from `.env`:

| Variable | Default | What it does |
| --- | --- | --- |
| `PROXY_NETWORK` | `proxy-net` | The external network OurTube (and MediaMTX) join |
| `PUID`, `PGID` | `1000` | The user and group the containers run as; must own `./data` |
| `OURTUBE_IMAGE` | `ghcr.io/jawshthedark/ourtube:latest` | The image; a version tag stays on that version (see [Staying on a version](Upgrading-and-Backups.md#staying-on-a-version)) |
| `COMPOSE_PROFILES`, `LIVE_SERVER`, `LIVE_SECRET`, `LIVE_RTMP_URL`, `LIVE_SRT_URL` | unset | Live streaming, see [Live Streaming](Live-Streaming.md#turning-it-on-admins) |

Anything else for OurTube itself (a published port, `SETUP_CODE`, a GPU) goes in a `docker-compose.override.yml`
next to the compose file, never in `docker-compose.yml`, which updates replace (see
[Updating a server](Upgrading-and-Backups.md#updating-a-server)).

**4. Start it**

```bash
docker compose up -d
docker compose ps         # after half a minute, STATUS should say (healthy)
```

This pulls the image GitHub builds for every release. To build the code you checked out instead, use
`docker compose up -d --build`.

**5. Note the setup code**

```bash
docker logs cliptube 2>&1 | grep -i "setup code"
```

A new code is made each time the server starts until the first account exists, so if there are several lines, use
the last one.

**6. Point your reverse proxy at `cliptube`, port `3000`** (below), then continue with [First run](#first-run).

Whatever proxy you use, it has to let large uploads through: no request body limit (or one larger than your
biggest clip), no request buffering, and timeouts long enough for a slow upload. It must also pass on
`X-Forwarded-For` and `X-Forwarded-Proto`, which all the proxies below do. Live chat and watch parties use
server-sent events over plain HTTP, so no WebSocket setup is needed.

### Nginx Proxy Manager

Before you start, point the domain at your server and make sure ports 80 and 443 reach Nginx Proxy Manager:
Let's Encrypt checks the domain over port 80 before it issues a certificate.

1. In Nginx Proxy Manager, open **Hosts → Proxy Hosts** and click **Add Proxy Host**.
2. On the **Details** tab:

   | Field | Value |
   | --- | --- |
   | Domain Names | `clips.example.com` (type it and press Enter) |
   | Scheme | `http` (OurTube speaks plain HTTP; the proxy adds HTTPS) |
   | Forward Hostname / IP | `cliptube` |
   | Forward Port | `3000` |
   | Cache Assets | off |
   | Block Common Exploits | on |
   | Websockets Support | not needed |
   | Access List | Publicly Accessible |

3. On the **SSL** tab: under **SSL Certificate** choose *Request a new SSL Certificate*, turn on **Force SSL**
   and **HTTP/2 Support**, enter your email address and agree to the Let's Encrypt terms.
4. On the **Advanced** tab, paste this into **Custom Nginx Configuration**, so multi-gigabyte uploads aren't cut
   off:

   ```nginx
   client_max_body_size 0;
   proxy_request_buffering off;
   proxy_read_timeout 3600s;
   proxy_send_timeout 3600s;
   ```

5. **Save**, wait for the certificate, and open `https://clips.example.com`.

`cliptube` only works as a host name when Nginx Proxy Manager and OurTube share a Docker network (step 3 above).
A *502 Bad Gateway* means they don't, or OurTube isn't running: see
[Troubleshooting](Troubleshooting.md#502-bad-gateway-from-the-proxy).

> [!NOTE]
> If Nginx Proxy Manager is **not** on the same Docker network as OurTube, publish a port
> ([Docker on its own](#docker-on-its-own)) and forward to the host's LAN address, for example
> `192.168.1.10:3100`. Don't use `127.0.0.1`: inside the proxy's container, that is the proxy itself. Don't use
> the container's IP address either (`172.x.x.x`): it changes whenever the container is recreated.

### Caddy

With Caddy in a container on `proxy-net`, add to your Caddyfile:

```caddyfile
clips.example.com {
	reverse_proxy cliptube:3000
}
```

and reload it (`docker exec <caddy-container> caddy reload --config /etc/caddy/Caddyfile`, with the path your
Caddyfile is mounted at). Caddy gets and renews the certificate itself, sends the forwarded headers, and doesn't
limit upload size by default.

If Caddy runs on the host instead, publish a port on the host's loopback address only (see
[Docker on its own](#docker-on-its-own)), use `reverse_proxy 127.0.0.1:3100`, and `sudo systemctl reload caddy`.

### nginx with Let's Encrypt

For nginx installed on the host (this is how clips.quitlyingto.us runs). First publish a port on the loopback
address only, so the site can't be reached around nginx: a `docker-compose.override.yml` next to
`docker-compose.yml` with

```yaml
services:
  cliptube:
    ports:
      - "127.0.0.1:3100:3000"
```

then `docker compose up -d`. Create `/etc/nginx/sites-available/clips.example.com`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name clips.example.com;

    client_max_body_size 0;
    proxy_request_buffering off;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

Enable it and let Certbot add HTTPS and the redirect from HTTP:

```bash
sudo ln -s /etc/nginx/sites-available/clips.example.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d clips.example.com
```

Without `client_max_body_size 0;` nginx refuses requests over 1 MB: uploads crawl or fail, and tools that send a
whole file at once (ShareX) fail.

### Tunnels

Cloudflare Tunnel and Tailscale Funnel work too, and need no open ports at home.

- **Cloudflare Tunnel:** Cloudflare's dashboard gives you a `docker run` command for `cloudflared`. Run it on
  `proxy-net` too (add `--network proxy-net`), and set the public hostname's service to `http://cliptube:3000`.
- **Tailscale Funnel:** publish a port ([Docker on its own](#docker-on-its-own)) and point the funnel at it.

Set the **Public URL** (see [First run](#first-run)) to the tunnel's `https://` address. Cloudflare's proxy limits
a request body to 100 MB on its free plan; the upload page sends files in 32 MB pieces, so that doesn't cap
uploads made on the site, but it does cap tools that send a whole file in one request (see
[big files](Uploading-and-Editing.md#big-files-and-shaky-connections)). A Cloudflare Tunnel's public hostnames
carry the website only, so live streaming's RTMP port needs its own way in.

## Docker on its own

For trying OurTube out on your LAN, or for a reverse proxy installed on the host, publish a port with a
`docker-compose.override.yml` next to `docker-compose.yml`:

```yaml
services:
  cliptube:
    ports:
      - "3000:3000"    # or "3100:3000" if 3000 is taken
```

The left number is the port on the host; the right one stays `3000`. Use `"127.0.0.1:3100:3000"` when only a proxy
on the same machine should reach it. The compose file still expects the `proxy-net` network, so create it once
(`docker network create proxy-net`), make the data folder (step 2 above), then start:

```bash
docker compose up -d
```

Open `http://<server-address>:3000`. Leave the Public URL empty on a LAN-only server: links then use whatever
address people connect with. Without HTTPS everything works on the LAN except linking with other servers, the
fediverse and web push, which need a public `https://` address.

**Without Compose**, one `docker run` does the same, with the data in `~/ourtube/data`:

```bash
mkdir -p ~/ourtube/data
sudo chown 1000:1000 ~/ourtube/data
docker run -d --name cliptube --restart unless-stopped -p 3000:3000 \
  -v ~/ourtube/data:/data ghcr.io/jawshthedark/ourtube:latest
```

To update it, `docker pull ghcr.io/jawshthedark/ourtube:latest`, then `docker rm -f cliptube` and the same
`docker run` again (the data stays in the folder).

> [!IMPORTANT]
> If the published port can be reached from the internet with no reverse proxy in front, add
> `-e TRUST_PROXY=` (or `- TRUST_PROXY=` under `environment:`). The image trusts `X-Forwarded-For` by default,
> which lets a visitor who talks to the container directly pick the address OurTube sees, and so get around its
> limits on sign-in attempts and sign-ups. Any value, even `0`, turns the setting on; only an empty one turns it
> off.

## Dockge, Portainer and other stack managers

No code and no checkout needed: a stack is a compose file that the stack manager keeps and runs for you. Make a
new stack with the compose file below, make its `data` folder (owned by `PUID:PGID`, 1000:1000 here), and start
it. The **update** button then pulls each new release, the way it does for your other stacks.

> [!NOTE]
> Button names below are from current versions of Dockge and Portainer and may differ slightly in yours. Whatever
> the UI, the same commands work from a terminal on the server (see [Everyday commands](#everyday-commands)).

### The compose file for a stack

**With a published port** (no reverse proxy in Docker, or one that forwards to the host's address):

```yaml
services:
  cliptube:
    image: ghcr.io/jawshthedark/ourtube:latest
    container_name: cliptube
    restart: unless-stopped
    user: "1000:1000"
    environment:
      - TRUST_PROXY=1
      - DATA_DIR=/data
    volumes:
      - ./data:/data
    ports:
      - "3000:3000"
```

**With Nginx Proxy Manager or another proxy in Docker**, join the proxy's network in the stack itself, not with
`docker network connect`: the stack manager makes a new container on every update, and a network joined by hand is
lost each time. Use this instead, with your proxy's network name in place of `proxy-net` (both places):

```yaml
services:
  cliptube:
    image: ghcr.io/jawshthedark/ourtube:latest
    container_name: cliptube
    restart: unless-stopped
    user: "1000:1000"
    environment:
      - TRUST_PROXY=1
      - DATA_DIR=/data
    volumes:
      - ./data:/data
    networks:
      - default
      - proxy-net

networks:
  proxy-net:
    external: true
```

Then point the proxy at `cliptube`, port `3000` (see [Nginx Proxy Manager](#nginx-proxy-manager)). Keep `default`
in the list: other services in the stack, like MediaMTX for live streaming, reach OurTube over it.

Which network is your proxy on? If Nginx Proxy Manager runs as its own stack, its network is usually named after
that stack, such as `npm_default`; the `docker inspect` command in
[step 3](#docker-behind-a-reverse-proxy-recommended) lists it. Either use that name here, or create `proxy-net`
(`docker network create proxy-net`) and add the same `networks:` lines to the proxy's stack too.

Optional lines under `environment:`:

- `- SETUP_CODE=<something you choose>`: a fixed [setup code](#first-run) instead of a random one.
- Any other variable from [Configuration](Configuration.md#environment-variables).

If your user isn't 1000, put your own ids in `user:` (`id -u` and `id -g` on the server print them) and give the
data folder to the same user.

### Dockge step by step

Dockge keeps each stack in a folder named after it, under `/opt/stacks` unless you set another stacks folder when
you installed Dockge. The stack below is called `ourtube`, so its compose file is
`/opt/stacks/ourtube/compose.yaml` and `./data` is `/opt/stacks/ourtube/data` on the server.

1. Click **+ Compose**. Enter `ourtube` as the **Stack Name** (lowercase), and replace the editor's contents with
   one of the compose files above.
2. Click **Save** (not **Deploy** yet). Dockge makes the stack's folder.
3. Make the data folder and give it to the container's user, in a terminal on the server (over SSH):

   ```bash
   sudo mkdir -p /opt/stacks/ourtube/data
   sudo chown -R 1000:1000 /opt/stacks/ourtube/data
   ```

   Skipping this is a common mistake: Docker then makes the folder itself, owned by root, and OurTube
   stops with *permission denied*. If you already deployed, run these two commands and click **Restart**.
4. Click **Start** (or **Deploy**). The stack page shows the containers' output while they start.
5. **Find the setup code** in that output: a line ending in *using setup code: 1a2b3c4d*. Or, on the server:
   `docker logs cliptube 2>&1 | grep -i "setup code"`.
6. Set up your proxy ([Nginx Proxy Manager](#nginx-proxy-manager)) and continue with [First run](#first-run).

Afterwards:

| To | In Dockge |
| --- | --- |
| Update to a new release | **Update** on the stack's page: pulls the new image and recreates the container. The data folder stays. |
| See the log | The stack's page shows it. |
| Change the compose file | **Edit**, change it, then **Deploy** (or **Save** to only store it). |
| Run an [admin command](Admin-CLI.md) | The **bash** button on the `cliptube` container opens a shell in it; there, run `node server/cli.js <command>`. |
| Restart or stop | **Restart**, **Stop** |

### Portainer step by step

Use an absolute path for the data folder in Portainer: a relative `./data` in a stack made in Portainer's web
editor doesn't end up in a folder you can easily find. This example uses `/srv/ourtube/data`.

1. On the server, make the folder and give it to the container's user:

   ```bash
   sudo mkdir -p /srv/ourtube/data
   sudo chown -R 1000:1000 /srv/ourtube/data
   ```

2. In Portainer, pick your environment, open **Stacks** and click **Add stack**.
3. **Name:** `ourtube`. Choose **Web editor** and paste one of the compose files above, with the volume line
   changed to the absolute path:

   ```yaml
       volumes:
         - /srv/ourtube/data:/data
   ```

4. Click **Deploy the stack**.
5. **Find the setup code:** **Containers** → `cliptube` → **Logs**, and look for *using setup code*.
6. Set up your proxy and continue with [First run](#first-run).

Afterwards:

| To | In Portainer |
| --- | --- |
| Update to a new release | **Stacks** → `ourtube` → **Editor** → **Update the stack**, with **Re-pull image and redeploy** turned on |
| See the log | **Containers** → `cliptube` → **Logs** |
| Run an [admin command](Admin-CLI.md) | **Containers** → `cliptube` → **Console**, command `/bin/bash`, **Connect**; then `node server/cli.js <command>` |

**Other stack managers** (and Docker setups on NAS systems) work the same way: the compose file above, a data
folder that belongs to the container's user, and, with a proxy in Docker, the proxy's network in the compose file.

If your stack is a checkout of the repository instead, keep your changes in `docker-compose.override.yml` (see
[Updating a server](Upgrading-and-Backups.md#updating-a-server)).

### Live streaming in a stack

Live streaming needs a second container, MediaMTX, and its settings file `live/mediamtx.yml` from the repository
(what it does: [Live Streaming](Live-Streaming.md)). In a Dockge stack called `ourtube`:

1. Put the settings file in the stack's folder, and make the folder recordings go to:

   ```bash
   cd /opt/stacks/ourtube
   sudo mkdir -p live data/live
   sudo curl -fsSL -o live/mediamtx.yml https://raw.githubusercontent.com/JawshTheDark/ourtube/main/live/mediamtx.yml
   sudo chown -R 1000:1000 data
   ```

   The file must be there before the stack starts: if it's missing, Docker makes an empty folder called
   `mediamtx.yml` in its place, and MediaMTX doesn't start. (Then delete that folder, get the file, and redeploy.)

2. Make a long random secret that the two containers share: `openssl rand -hex 32`.
3. Use this compose file, with your secret in **both** places and your proxy's network name:

   ```yaml
   services:
     cliptube:
       image: ghcr.io/jawshthedark/ourtube:latest
       container_name: cliptube
       restart: unless-stopped
       user: "1000:1000"
       environment:
         - TRUST_PROXY=1
         - DATA_DIR=/data
         - LIVE_SERVER=cliptube-live
         - LIVE_SECRET=<your secret>
       volumes:
         - ./data:/data
       networks:
         - default
         - proxy-net

     live:
       image: bluenviron/mediamtx:1.21.2
       container_name: cliptube-live
       restart: unless-stopped
       user: "1000:1000"
       environment:
         - MTX_AUTHHTTPADDRESS=http://cliptube:3000/api/live/auth?secret=<your secret>
       volumes:
         - ./live/mediamtx.yml:/mediamtx.yml:ro
         - ./data/live:/recordings
       ports:
         - "1935:1935"
         - "8890:8890/udp"
       networks:
         - default

   networks:
     proxy-net:
       external: true
   ```

   Use the MediaMTX version that the repository's `docker-compose.yml` names, and update it when that changes.
   `LIVE_RTMP_URL` and `LIVE_SRT_URL` go under `cliptube`'s `environment:` too, if you need them.

4. Deploy, and let streamers reach TCP port 1935 on the server (firewall, and your router at home).
5. **Admin → Debugging** should now say *Live streaming: on, MediaMTX answers*.

In Portainer, use absolute paths for both volumes of `live` and for the settings file.

## Without Docker

You need Node.js 22.13 or newer (24 recommended) and git. Linux, macOS and Windows all work.

```bash
git clone https://github.com/JawshTheDark/ourtube.git
cd ourtube
npm install        # also downloads FFmpeg for your platform
npm run build      # builds the web app into web/dist
npm start          # serves it on http://localhost:3000
```

Data goes to `./data` unless you set `DATA_DIR`. Behind a reverse proxy, set `TRUST_PROXY=1`; without it, OurTube
sees every visitor as the proxy. The server prints its LAN address at startup so friends on your network can
connect, and the setup code below it. If the page only says *The frontend has not been built yet*, run
`npm run build`.

On Linux on ARM (a Raspberry Pi, for example), also install FFmpeg from your package manager
(`sudo apt install ffmpeg`): the bundled ffprobe has no ARM build, so OurTube uses the one on your PATH. Imports
from YouTube need [yt-dlp](https://github.com/yt-dlp/yt-dlp) installed too, or `YTDLP_PATH` pointing at it (see
[Configuration](Configuration.md#importing-from-youtube)).

To keep it running on Linux, give it a user of its own and a systemd unit. With the code in `/opt/cliptube` and the
data in `/var/lib/cliptube`:

```bash
sudo useradd --system --home-dir /var/lib/cliptube cliptube
sudo mkdir -p /var/lib/cliptube
sudo chown cliptube:cliptube /var/lib/cliptube
```

`/etc/systemd/system/cliptube.service`:

```ini
[Unit]
Description=OurTube
After=network-online.target
Wants=network-online.target

[Service]
User=cliptube
WorkingDirectory=/opt/cliptube
Environment=NODE_ENV=production
Environment=DATA_DIR=/var/lib/cliptube
Environment=TRUST_PROXY=1
ExecStart=/usr/bin/node server/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

`ExecStart` needs the full path to Node.js: `which node` prints it (with nvm it is in your home folder, which the
`cliptube` user may not be able to read; a system-wide Node.js is simpler).

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now cliptube
journalctl -u cliptube -f      # the log; the setup code is printed here
```

To run [admin commands](Admin-CLI.md), use the same user and data folder:
`cd /opt/cliptube && sudo -u cliptube env DATA_DIR=/var/lib/cliptube node server/cli.js <command>`.

## First run

1. **Find the setup code.** While no account exists, the server prints this at every start:

   ```text
   No accounts exist yet. Create the first (admin) account at /register using setup code: 1a2b3c4d
   ```

   Where to look: `docker logs cliptube` (Docker), the stack's log (Dockge, Portainer), or the console
   (`journalctl -u cliptube` with systemd). The code is random and changes at every start until the first account
   exists, so use the newest line. To choose it yourself, set `SETUP_CODE` in the environment. The code stops a
   stranger from claiming the admin account of a freshly started public server.

2. **Create the first account.** Open the site: Home says *Create the first account to become the admin and start
   uploading*. Click **Get started** (or go to `/register`). The form says *You are creating the first account,
   so it becomes the admin account*. Fill in:
   - **Setup code**: the code from step 1.
   - **Username**: 3 to 20 letters, numbers or underscores. It's your channel's address.
   - **Display name** (optional), **Password** (at least 6 characters) and **Confirm password**.

   Click **Create account**. You're signed in as the admin, and **Admin** appears in the sidebar. *Wrong setup code*
   means the code is from an earlier start: look at the log again.

3. **Admin → Overview → Site settings**, then **Save settings**:
   - **Site name.**
   - **Public URL**: the `https://` address people use, such as `https://clips.example.com`. Links, Discord
     previews, feeds, emails and the network all use it. Leave it empty only on a LAN-only server.
   - **Sign-up**: **Open** (the default: anyone who finds the site can make an account), **Needs approval**,
     **Invite only** or **Closed**. For a friends' server, pick **Invite only** before you share the address, and
     make invite links under **Invites** further down the page.
   - **Max upload size (MB)** (8192 by default), **Max resolution** (1080p by default) and the **Video encoder**
     ([GPU encoding](#gpu-encoding)).

4. **Optional extras:**
   - **Email** (Admin → Overview → *Email (optional)*) for address confirmations, password resets and notification
     emails. Without it, nobody can reset a forgotten password (a locked-out admin has a way back, see
     [Admin CLI](Admin-CLI.md#locked-out-of-the-admin-account)).
   - **Adaptive streaming** (Admin → Overview) for viewers on slow connections.
   - **Imports from YouTube** (Admin → Overview, off by default; see
     [Configuration](Configuration.md#importing-from-youtube)).
   - **Game artwork**: a SteamGridDB API key under Admin → Games. On a server that joins a network, the hub's
     catalog brings its artwork, so this is only needed on the hub or a server on its own.
   - **The network** (below) and [live streaming](Live-Streaming.md#turning-it-on-admins).

Next: the [Admin Guide](Admin-Guide.md) covers inviting people, approving accounts, roles and the rest of the Admin
pages, and [Getting Started](Getting-Started.md) is the page to send your members.

## Joining the network

Set the Public URL to the server's `https://` address first, and make sure it can be reached from the
internet. Then either:

- **Admin → Network → Join a network**: enter `https://clips.irc.so` (or the address of any server already in
  the network) under **Hub or instance address** and click **Join network**, or
- from the command line:

  ```bash
  docker exec cliptube node server/cli.js network join https://clips.irc.so
  ```

Within a sync round the hub's games appear under Admin → Games, and other servers' clips appear under
**Network**, on Home and in search. How the network works and what you can control: [Network](Network.md). If
joining fails, see [Troubleshooting](Troubleshooting.md#the-network).

## Hosting at home

1. **Give the server a fixed LAN address** (a DHCP reservation in your router), so port forwards keep pointing at
   it.
2. **Forward ports** on your router to the machine running the reverse proxy:

   | Port | For |
   | --- | --- |
   | 80/TCP | Let's Encrypt certificates, and the redirect to HTTPS |
   | 443/TCP | The site |
   | 1935/TCP | Live streaming over RTMP (only with [live streaming](Live-Streaming.md) on) |
   | 8890/UDP | Live streaming over SRT (optional) |

   Don't forward port 3000: the proxy talks to OurTube inside the machine.
3. **Give it a name.** Point a domain or subdomain (an `A` record) at your home's public IP. If that IP changes,
   keep the record current with dynamic DNS, for example ddclient with your registrar's DDNS protocol.
4. **Get a certificate** with your reverse proxy (Nginx Proxy Manager, Caddy, or nginx with Certbot).
5. **Test from outside**, for example from a phone with Wi-Fi off: `https://clips.example.com` should load. If
   nothing answers although the forwards look right, compare the WAN address your router shows with your public
   IP. If they differ (a WAN address such as `100.64.x.x` to `100.127.x.x`, `10.x.x.x` or `192.168.x.x`),
   something in front of your router is in the way: your provider's shared address (CGNAT) or a second router.
   Forward the ports on that second router too, or, with CGNAT, use a [tunnel](#tunnels).
6. **Expect hairpin NAT trouble.** Many home routers don't support NAT loopback: from inside your own network
   the public name won't connect even though it works for everyone else. Turn on NAT loopback if your router
   has it, add a hosts-file entry pointing the name at the machine's LAN address, or use the LAN address
   directly (for example `http://192.168.1.10:3100`). For the same reason, your own clips can look broken to
   you when you view them through another server in the network.

## GPU encoding

Pick the encoder in **Admin → Overview → Video encoder**:

| Encoder | Hardware |
| --- | --- |
| `libx264` | CPU (default, works everywhere) |
| `h264_nvenc` | NVIDIA |
| `h264_qsv` | Intel Quick Sync |
| `h264_amf` | AMD (Windows) |

If a hardware encoder fails, OurTube encodes that video on the CPU instead and logs
`encoder h264_nvenc failed, falling back to libx264`. H.264 uploads are remuxed rather than encoded, so the
GPU matters for other formats, edits, clips and adaptive-streaming renditions.

In Docker, the container needs access to the GPU, and FFmpeg needs the encoder built in. **Admin → Debugging →
FFmpeg** lists the *GPU encoders in this build*; from the command line:

```bash
docker exec cliptube node_modules/ffmpeg-static/ffmpeg -hide_banner -encoders | grep h264
```

If your encoder isn't listed, mount an FFmpeg build that has it and point `FFMPEG_PATH` and `FFPROBE_PATH` at
it. Then give the container the GPU in `docker-compose.override.yml` (in a stack, add the same lines to the
`cliptube` service in the stack's compose file):

```yaml
# NVIDIA (needs the NVIDIA Container Toolkit on the host)
services:
  cliptube:
    environment:
      - NVIDIA_DRIVER_CAPABILITIES=compute,video,utility
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
```

```yaml
# Intel Quick Sync
services:
  cliptube:
    devices:
      - /dev/dri:/dev/dri
    group_add:
      - "993"    # the gid of the host's render group: getent group render
```

Then `docker compose up -d`, upload a clip that isn't H.264 (or make an edit), and look for the `falling back`
line in the log: no such line means the GPU did the work.

## Checking that it works

```bash
docker compose ps                                  # STATUS should say (healthy); or: docker ps --filter name=cliptube
curl -s https://clips.example.com/api/site         # basic site info as JSON, including the site name
curl -s https://clips.example.com/nodeinfo/2.0     # the version, for the fediverse (while ActivityPub is on)
```

If `curl` through your domain fails, ask OurTube directly from inside its container; when that answers, the
problem is between the proxy and OurTube:

```bash
docker exec cliptube node -e "fetch('http://127.0.0.1:3000/api/site').then(r=>r.text()).then(console.log)"
```

Then upload a short clip: an H.264 recording should be ready within seconds. **Admin → Debugging** shows the
version, FFmpeg, storage, the job queue and recent errors in one place. If something is off, see
[Troubleshooting](Troubleshooting.md).

## Everyday commands

Run these on the server. `docker compose` commands need the folder with the compose file (`~/ourtube`, or
`/opt/stacks/ourtube` for a Dockge stack); `docker` commands work anywhere.

| To | Command |
| --- | --- |
| Follow the log | `docker logs cliptube --tail 200 -f` (Ctrl+C stops following) |
| Find the setup code | `docker logs cliptube 2>&1 \| grep -i "setup code"` |
| Restart | `docker restart cliptube`, or `docker compose restart` |
| Stop and start | `docker compose stop`, `docker compose start` |
| Recreate after changing the compose file | `docker compose up -d` |
| Update | `docker compose pull && docker compose up -d` (see [Upgrading and Backups](Upgrading-and-Backups.md)) |
| Run an admin command | `docker exec cliptube node server/cli.js <command>` (all of them: [Admin CLI](Admin-CLI.md)) |
| Open a shell in the container | `docker exec -it cliptube bash` (`exit` leaves it) |
| See the version | `docker exec cliptube node -p "require('./package.json').version"` |
| See how much disk the data folder uses | `du -sh data` |

Stopping takes about ten seconds: Docker waits that long for the server and then stops it outright. That is safe
for the database; a video that was being processed starts over at the next start.
