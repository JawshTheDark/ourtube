# Upgrading and Backups

An update replaces the program and nothing else: everything your server has is in its data folder, which updates
never touch. Keep a copy of that folder and you can always get back.

- [Updating a server](#updating-a-server)
  - [With Docker Compose](#with-docker-compose)
  - [With Dockge or Portainer](#with-dockge-or-portainer)
  - [Building from a checkout](#building-from-a-checkout)
  - [Without Docker](#without-docker)
  - [What happens when the new version starts](#what-happens-when-the-new-version-starts)
  - [Keeping your changes out of docker-compose.yml](#keeping-your-changes-out-of-docker-composeyml)
- [Staying on a version](#staying-on-a-version)
- [Deploying from another machine](#deploying-from-another-machine)
- [Rolling back](#rolling-back)
- [Backing up](#backing-up)
  - [What to back up](#what-to-back-up)
  - [A copy with the server stopped](#a-copy-with-the-server-stopped)
  - [A copy while it runs](#a-copy-while-it-runs)
  - [Every night](#every-night)
- [Restoring](#restoring)
- [Moving to a new machine](#moving-to-a-new-machine)
- [Checking the version](#checking-the-version)

## Updating a server

GitHub builds an image for every release (`ghcr.io/jawshthedark/ourtube`, x86 and ARM, tagged `latest` and with
the version). When a newer version is out, **Admin** shows a banner saying so (see
[Checking the version](#checking-the-version)), with a **What changed** link.

An update restarts the server, so the site is gone for a few seconds. Uploads in progress carry on by themselves
once it's back (the upload page keeps retrying), and a video that was being processed starts over. You don't need
to back up first: the server copies its database itself before changing it. A recent
[backup](#backing-up) of the whole folder never hurts, though.

### With Docker Compose

From the folder with `docker-compose.yml` (`~/ourtube` if you followed [Installation](Installation.md)):

```bash
cd ~/ourtube
git pull                  # the newest compose file, if you cloned the repository
docker compose pull       # the newest image
docker compose up -d      # recreate the container with it
```

Old images stay on disk until you remove them; `docker image prune` deletes the ones nothing uses (keep the
previous one for a while if you might want to [roll back](#rolling-back)).

### With Dockge or Portainer

Dockge, Portainer and other stack managers do the same with their **update** button:

- **Dockge:** **Update** on the stack's page.
- **Portainer:** **Stacks** → your stack → **Editor** → **Update the stack**, with **Re-pull image and redeploy**
  turned on.

The stack's compose file is yours, and an update doesn't change it. Look at the repository's
[docker-compose.yml](https://github.com/JawshTheDark/ourtube/blob/main/docker-compose.yml) now and then for changes
you may want, such as a newer MediaMTX for live streaming. A network your proxy reaches OurTube on must be in the
stack's compose file: one joined by hand with `docker network connect` is lost at every update (see
[Troubleshooting](Troubleshooting.md#the-proxy-cant-reach-ourtube-after-an-update)).

### Building from a checkout

To run the code you have checked out rather than the published image:

```bash
cd ~/ourtube
git pull
docker compose up -d --build
```

The image you build gets the same name as the published one, so a later `docker compose pull` replaces it with
GitHub's.

### Without Docker

From the app's folder, as the user that owns it:

```bash
cd /opt/cliptube
git pull
npm install
npm run build
sudo systemctl restart cliptube
```

### What happens when the new version starts

Database changes (migrations) are applied automatically when the new version starts. They are numbered steps, each
run once, in order, inside a transaction. Before the first one runs, the server copies the database to
`data/backups/pre-migration-v<N>-<time>.db`, where `<N>` is the version the database is being brought to (the 10
most recent of these copies are kept). The log then shows:

```text
[db] backed up the database to /data/backups/pre-migration-v24-2026-11-01T18-00-00-000Z.db before migrating
[db] schema is at version 24 (applied 24)
```

No such lines means the update didn't change the database. **Admin → Debugging → Database** shows the schema
version. Migrations only go forward: an older version doesn't undo them, which is why [rolling back](#rolling-back)
across one also means putting back that copy.

If a migration fails, the server stops with `Migration <N> (<name>) failed: ...` and Docker keeps restarting it.
The step that failed changed nothing, but steps before it in the same update stay applied, so go back to the
previous version together with the `pre-migration` copy ([Rolling back](#rolling-back)), and report the error.

Jobs that were running when the old version stopped, such as a video being processed, go back in the queue:
`[jobs] re-queued 1 job(s) interrupted by the last shutdown`.

Your `.env`, `docker-compose.override.yml` and `data/` are never touched by an update.

### Keeping your changes out of docker-compose.yml

A published port, another network, a GPU, extra environment variables: put them in `docker-compose.override.yml`
next to `docker-compose.yml`, which Compose merges in on its own (see
[Docker on its own](Installation.md#docker-on-its-own) for an example). Both `.env` and the override file are
ignored by git, so `git pull` never trips over them.

`git pull` doesn't overwrite a file you changed, but when that file also changed in the new version it stops with
*Your local changes would be overwritten by merge*. Already edited `docker-compose.yml`? Move your changes to the
override file, then `git checkout docker-compose.yml` and pull.

## Staying on a version

Every published version has its own image tag, such as `ghcr.io/jawshthedark/ourtube:1.25.1` (published images
start at 1.23.0). To stay on one:

- **Repository compose file:** put `OURTUBE_IMAGE=ghcr.io/jawshthedark/ourtube:1.25.1` in `.env`, then
  `docker compose up -d`.
- **Dockge or Portainer:** change the stack's `image:` line to `ghcr.io/jawshthedark/ourtube:1.25.1` and deploy.
- **`docker run`:** use that tag in the command.

The update button and `docker compose pull` then keep you on that version. Admins are still told about newer ones.
To follow releases again, go back to `latest` (or remove `OURTUBE_IMAGE` from `.env`) and update.

## Deploying from another machine

`scripts/deploy.sh` updates one or more servers over SSH from a checkout on your own machine:

```bash
scripts/deploy.sh user@your-server
scripts/deploy.sh user@server-one user@server-two    # one after the other
```

For each server it:

1. copies the database to `data/backups/pre-deploy-<time>.db` (the 10 most recent are kept),
2. tags the running image as `cliptube:rollback`,
3. copies the committed code (`git archive HEAD`) to `~/cliptube`, leaving `data/`, `.env` and
   `docker-compose.override.yml` alone,
4. builds the image on the server and restarts the container, and
5. waits up to two minutes for the health check, then prints the site name, its network role and any errors
   from the log.

It deploys what is committed, not your working tree, and warns when you have uncommitted changes. The server
needs Docker, SSH access with a key, and a first install in `~/cliptube` with the repository's
`docker-compose.yml` (see [Installation](Installation.md)). Since it builds the image under the name in
`OURTUBE_IMAGE`, leave that unset on servers you deploy to.

When several servers in a network are updated, do them one at a time and check each before the next:

```bash
ssh user@your-server 'docker exec cliptube node server/cli.js network sync'
```

## Rolling back

Going back means the previous image, plus, if the newer version changed the database, the copy made before it did.
Look in the log of the newer version's first start: a `[db] backed up the database to ...` line names that copy. No
such line, and only the image needs to change.

**1. Stop OurTube** (**Stop** in Dockge or Portainer, or `docker compose stop` in its folder).

**2. If the database changed, put back the copy.** Anything written since it was made (new uploads, comments) is
lost from the database, so do this only if you need to:

```bash
cd ~/ourtube               # the folder that holds data/ (~/cliptube after scripts/deploy.sh)
ls -t data/backups/        # the newest pre-migration-… (or pre-deploy-…) file is the one
sudo cp data/backups/pre-migration-v24-<time>.db data/cliptube.db
sudo rm -f data/cliptube.db-wal data/cliptube.db-shm
sudo chown 1000:1000 data/cliptube.db
```

Delete the `-wal` and `-shm` files: they belong to the database you replaced.

**3. Start the previous version:**

- **Published image:** [stay on](#staying-on-a-version) the previous version's tag, for example
  `OURTUBE_IMAGE=ghcr.io/jawshthedark/ourtube:1.25.0` in `.env`, then `docker compose up -d`. In a stack, change
  the `image:` tag and deploy.
- **After `scripts/deploy.sh`:** it tagged the image that ran before as `cliptube:rollback`:

  ```bash
  cd ~/cliptube
  docker tag cliptube:rollback ghcr.io/jawshthedark/ourtube:latest    # or the image OURTUBE_IMAGE names
  docker compose up -d --no-build
  ```

## Backing up

Everything is in the data folder (see [The data folder](Configuration.md#the-data-folder)), so backing up means
copying it. One file needs care: the database, `cliptube.db`, is SQLite in WAL mode, and a copy taken while the
server writes to it can be broken. Either stop the server for the copy, or have SQLite make a copy first, as below.

### What to back up

| In the data folder | What it is | Back up? |
| --- | --- | --- |
| `cliptube.db` (with `cliptube.db-wal` and `cliptube.db-shm` while it runs) | Accounts, videos' details, comments, settings, and the keys that identify your server to the network and the fediverse | **Always.** Small, and nothing else replaces it. |
| `videos/` | The videos people watch | Yes |
| `originals/` | Uploaded files kept after a transcode, the full-quality source | Yes |
| `thumbs/`, `avatars/`, `captions/` | Thumbnails, game artwork, profile pictures, captions | Yes (small) |
| `hls/`, `renditions/` | Adaptive streaming and the 720p copies, made from the videos | Yes, if you have the room; they are only rebuilt when the setting changes |
| `backups/` | The server's own database copies | Yes (small) |
| `youtube-cookies.txt` | Only if you added it | Yes |
| `editor/` | Filmstrips and waveforms for the timeline editor | No need: rebuilt when the editor needs them |
| `exports/`, `uploads/`, `live/` | GIF and MP4 exports (kept a day), unfinished uploads, recordings of streams still running | Optional |
| `tmp/` | Work files | No: emptied at every start |

**Admin → Debugging → Storage** shows how big each part is. Simplest, and what the commands below do: everything
except `tmp/`.

### A copy with the server stopped

The simplest, with a minute or so of downtime for a small server:

```bash
cd ~/ourtube
docker compose stop
sudo tar -cf ~/ourtube-backup-$(date +%F).tar --exclude data/tmp data
docker compose start
```

A stopped copy includes `cliptube.db-wal` and `cliptube.db-shm` if they are there; keep them with the database.

### A copy while it runs

Take a consistent copy of the database first, then copy everything else:

```bash
cd ~/ourtube
docker exec cliptube node -e "new (require('node:sqlite').DatabaseSync)('/data/cliptube.db').exec(\"VACUUM INTO '/data/backups/manual-$(date +%F-%H%M).db'\")"
rsync -a --exclude 'cliptube.db*' --exclude 'tmp/' data/ backup-host:/backups/ourtube/
```

The first command has SQLite write a complete copy of the database to `data/backups/` while OurTube keeps running;
`rsync` then sends it along with the videos, leaving out the live database files. Other files are safe to copy
while the server runs; one still being written is picked up by the next run. The destination can be another
machine over SSH, as here, or a local disk (`/mnt/backup/ourtube/`).

The server doesn't delete `manual-…` copies, so remove old ones yourself. **To restore from such a backup, use
that copy as the database** (see [Restoring](#restoring)): the backup has no `cliptube.db` of its own.

### Every night

The same as a script, for cron. It reuses one file name for the database copy, so they don't pile up:

```bash
#!/bin/sh
# /usr/local/bin/ourtube-backup: a consistent copy of the database, then the whole data folder.
set -e
DATA=/home/you/ourtube/data            # your data folder
DEST=backup-host:/backups/ourtube/     # where the backup goes
docker exec cliptube rm -f /data/backups/nightly.db
docker exec cliptube node -e "new (require('node:sqlite').DatabaseSync)('/data/cliptube.db').exec(\"VACUUM INTO '/data/backups/nightly.db'\")"
rsync -a --delete --exclude 'cliptube.db*' --exclude 'tmp/' "$DATA/" "$DEST"
```

Make it executable (`sudo chmod +x /usr/local/bin/ourtube-backup`), run it once by hand, then add it with
`crontab -e` for a user that can run `docker` and read the data folder, for example at 04:30 every day:

```text
30 4 * * * /usr/local/bin/ourtube-backup
```

`--delete` makes the backup follow deletions too; leave it out to keep deleted videos in the backup. One copy is
not much of a history: back the destination up in turn, or keep several.

## Restoring

1. **Stop the server:** `docker compose stop` (or **Stop** in Dockge or Portainer).
2. **Put the data folder back.** Move the current one aside first (`sudo mv data data.old`), then, in the folder
   that held it, `sudo tar -xf ourtube-backup-<date>.tar` or `rsync -a backup-host:/backups/ourtube/ data/`.
   Delete `data.old` once the restored server works.
3. **Put the database in place.** From a stopped copy, `cliptube.db` is already there. From a copy taken while it
   ran, use that copy, and delete any `-wal` and `-shm` files next to it:

   ```bash
   sudo cp data/backups/nightly.db data/cliptube.db      # or manual-<date>.db
   sudo rm -f data/cliptube.db-wal data/cliptube.db-shm
   ```

4. **Give it to the container's user:** `sudo chown -R 1000:1000 data`.
5. **Start it:** `docker compose start` (or **Start**), and check **Admin → Debugging**.

If the server asks for a setup code after a restore, it found no accounts: the database wasn't put back (step 3).

## Moving to a new machine

1. Install OurTube on the new machine ([Installation](Installation.md)), but don't start it yet (or stop it before
   step 3, and don't create an account).
2. Stop the old server, so nothing changes while you copy.
3. Copy its data folder across, for example from the new machine:
   `rsync -a old-host:ourtube/data/ ~/ourtube/data/` (use the real paths: a Dockge stack's is
   `/opt/stacks/<stack>/data`). Replace whatever is in the new folder.
4. Fix the ownership (`sudo chown -R 1000:1000 data`), start the new server, and point your DNS or reverse proxy
   at it. Keep the old one stopped.

Keep the same Public URL. Other servers and the fediverse know your server by its address and its keys
(which are in the database), so the move is invisible to them. A server under a new address is a new server to
everyone else; to take a channel to another server, use a channel move instead (see
[Fediverse](Fediverse.md#moving-a-channel)).

**From a checkout to Dockge on the same machine:** the container name `cliptube` can only be used once, so stop and
remove the old one first (`docker compose down` in the old folder; it leaves the data alone), move the data folder
into the stack's folder (`sudo mv ~/ourtube/data /opt/stacks/ourtube/data`), check its owner, and start the stack.
If you used `.env` or `docker-compose.override.yml`, carry those settings into the stack's compose file.

## Checking the version

OurTube checks GitHub every 12 hours for a newer version. When there is one, each admin gets a notification
once, and **Admin** shows a banner (*OurTube 1.26.0 is out. This server runs 1.25.1.*) with **What changed** and
**How to update** (this page). **Admin → Debugging → Version** shows the result of the last check, has
**Check now**, and turns the check off; `UPDATE_CHECK_URL=off` in the environment turns it off for the whole
install.

```bash
docker exec cliptube node -p "require('./package.json').version"
curl -s https://clips.example.com/nodeinfo/2.0     # "version" under "software" (while ActivityPub is on)
```

Releases are tagged `vX.Y.Z` in the repository, and the milestones are listed in
[PLAN.md](https://github.com/JawshTheDark/ourtube/blob/main/PLAN.md). The Android app has versions of its own (see
[Android App](Android-App.md)).
