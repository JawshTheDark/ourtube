# OurTube Wiki

<img src="../images/web-game.jpg" alt="An OurTube game page with SteamGridDB artwork" width="100%">

**OurTube** is a self-hosted, YouTube-style video site for clips and home videos. Each friend runs their own
server and hosts their own videos; the servers link up into one network with [clips.irc.so](https://clips.irc.so)
as its hub, and Mastodon and PeerTube can follow along.

**Looking for a button?** The [FAQ](FAQ.md) answers the questions people ask most, each with where to click:
inviting people, the rules page, your stream key, Watch later, and many more.

## Start here

| I want to… | Read |
| --- | --- |
| Find my way around as a new member | [Getting Started](Getting-Started.md) |
| Find where something is | [FAQ: where is it?](FAQ.md) |
| Set up a server | [Installation](Installation.md), then the [Admin Guide](Admin-Guide.md) |
| Invite people, approve sign-ups, make someone a moderator | [Admin Guide](Admin-Guide.md) |
| Change how my server works | [Configuration](Configuration.md) |
| Update, back up or move a server | [Upgrading and Backups](Upgrading-and-Backups.md) |
| Link my server with my friends' | [Network](Network.md) |
| Use OurTube on my phone | [Android App](Android-App.md) |
| Fix something | [Troubleshooting](Troubleshooting.md) |

## Using OurTube

- [Getting Started](Getting-Started.md): making an account, a tour of the screen, your channel, first steps
- [Accounts and Settings](Accounts-and-Settings.md): every tab and option in Settings, notifications, email,
  passwords, privacy, your data, deleting your account
- [Watching and Discovery](Watching-and-Discovery.md): Home, search, Shorts, the watch page and player, keyboard
  shortcuts, chapters, captions, comments, sharing and embeds, what counts as a view
- [Channels and Playlists](Channels-and-Playlists.md): channel pages, subscriptions, history, liked videos,
  Watch later, playlists, feeds
- [Uploading and Editing](Uploading-and-Editing.md): uploads, who can see a video, imports from YouTube and
  Immich, groups, drafts, processing, video details, captions, the timeline editor
- [Studio and Analytics](Studio-and-Analytics.md): managing your videos, comments to review, views and watch
  time
- [Video Tools and Games](Video-Tools-and-Games.md): clipping, GIF and MP4 exports, looping links, compare, the
  game catalog and SteamGridDB artwork
- [Watch Parties](Watch-Parties.md): watching with friends in sync, the queue, chat and reactions
- [Live Streaming](Live-Streaming.md): going live from OBS, the live chat, recordings, and turning it on
- [Webhooks](Webhooks.md): telling a bot, Discord, Slack or a chat channel when you post or go live
- [Android App](Android-App.md): installing the app, servers and sign-in, uploading from your phone

## Running a server

- [Installation](Installation.md): Docker, Dockge and Portainer, reverse proxies, Node.js, hosting at home, GPU
  encoding, first run
- [Admin Guide](Admin-Guide.md): your first day as an admin, inviting people, roles, and a tour of every admin
  tab
- [Configuration](Configuration.md): environment variables, every admin setting, the data folder
- [Moderation and Legal](Moderation-and-Legal.md): reports, sign-up, strikes, spam, copyright, legal background
- [Upgrading and Backups](Upgrading-and-Backups.md): updates, rollbacks, backups, moving machines
- [Admin CLI](Admin-CLI.md): every command-line command
- [Troubleshooting](Troubleshooting.md): common problems and their fixes

## Linking up

- [Network](Network.md): how servers link, joining, what each server controls, running a hub
- [Fediverse](Fediverse.md): Mastodon, PeerTube, following out, linked accounts, moving a channel

## Contributing

- [Development](Development.md): the code layout, tests, migrations, the job queue and releases
- The federation design: [docs/federation.md](https://github.com/JawshTheDark/ourtube/blob/main/docs/federation.md)

---

<sub>Written for OurTube 1.25. The pages live in the repository under `docs/wiki/` and change with the code; the
Wiki tab is updated from them automatically, so edits made on github.com are replaced.</sub>
