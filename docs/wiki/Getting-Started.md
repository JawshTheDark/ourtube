# Getting Started

OurTube is a video site that friends run for themselves. Each server is one person's own site, with its own
members and videos. Servers can link up into a network, so you also see, like and comment on videos from your
friends' servers, and people on Mastodon, PeerTube and the rest of the fediverse can follow channels here.

This page is for members: making an account, finding your way around, and the first things to do. Running a
server is covered in [Installation](Installation.md); every setting of your own is in
[Accounts and Settings](Accounts-and-Settings.md).

- [Creating an account](#creating-an-account)
- [Signing in](#signing-in)
- [Forgotten password](#forgotten-password)
- [A tour of the screen](#a-tour-of-the-screen)
- [Your channel](#your-channel)
- [First steps](#first-steps)
- [Getting help](#getting-help)
- [Where is it?](#where-is-it)

## Creating an account

Click **Sign in** at the top right, then **Create an account** under the form, or go straight to `/register`.
Every server has its own accounts: an account on one server doesn't sign you in on another, even in the same
network.

Without an account you can watch public videos, browse and search. You need one to upload, like, comment,
subscribe, save videos and keep a history.

### How sign-up works here

The admin picks one of four sign-up modes (see [Moderation and Legal](Moderation-and-Legal.md#sign-up)). This is
what each looks like to you:

| Mode | What you see | What happens |
| --- | --- | --- |
| **Open** | The form | The account is made and you're signed in straight away. |
| **Needs approval** | *An admin approves new accounts before they can sign in.* above the form | After **Create account**: *Thanks! An admin needs to approve your account before you can sign in.* Until then, signing in says *This account is waiting for an admin to approve it*. You aren't told when it's approved, so try again later or ask the admin. An invite link skips the wait. |
| **Invite only** | An **Invite code** field you must fill, with *This site is invite-only. Ask someone here for an invite link.* | Open the invite link you were sent: it fills in the code for you. |
| **Closed** | *This site isn't taking new accounts right now.* and no form | Nobody can sign up, with or without an invite. The sign-in page says the same, and an invite link adds that invite links don't work. |

Invite links look like `https://<server>/register?invite=<code>`. Only admins can make them (Admin → Overview →
**Invites**), so to bring a friend in, ask an admin for one. An invite can run out: *That invite code is not
valid*, *That invite has expired* or *That invite has already been used* means you need a new link.

### The form

- **Username**: 3 to 20 letters, numbers or underscores. It's your channel's address (`/c/<username>`) and your
  `@handle`, and it **can't be changed later**. If it's taken, the form says *That username is taken*.
- **Display name** (optional): how your name shows on videos and comments, up to 50 characters. Left empty, it's
  your username. You can change it any time in Settings.
- **Password** and **Confirm password**: at least 6 characters.
- **Invite code**: only on an invite-only server, or when you came from an invite link.
- **I have read and accept the rules and terms**: only when the admin has written terms. The link opens the rules
  (`/legal`) in a new tab, and the account can't be made until you tick it.

Then **Create account**.

Sign-up asks for no email address and sends no confirmation email. You can add an address afterwards in
**Settings → Notifications → Email**. Do it: a confirmed address is the only way to reset a forgotten password
(see [Email address](Accounts-and-Settings.md#email-address)).

The very first account on a brand-new server asks for a **Setup code** and becomes the admin. That's for whoever
set up the server; see [Installation](Installation.md#first-run).

## Signing in

**Sign in** at the top right (or `/login`) asks for your **Username** and **Password**. It's the username, not an
email address, and capitals don't matter. Afterwards you're back on the page you were on.

A sign-in lasts 30 days in that browser, then you sign in again. **Sign out** is the last item of the account
menu (your picture, top right).

| Message | What it means |
| --- | --- |
| *Wrong username or password* | One of them is wrong. |
| *Too many failed sign-ins. Try again in a few minutes.* | Several wrong passwords in a short time. Wait a little. |
| *This account is waiting for an admin to approve it* | The server needs approval and an admin hasn't approved you yet. |
| *This account is suspended* or *banned*, with a reason | A moderator or admin acted on the account. Talk to the admin. |

The Android app signs in on its own screen; see [Android App](Android-App.md#servers-and-signing-in).

## Forgotten password

**Forgot your password?** is under the sign-in form, but only when the server has email set up.

1. It opens `/forgot-password`. Enter your **Username or email** and click **Send reset link**.
2. The answer is always *If that account has a confirmed email address, a reset link is on its way.*, whether or
   not the account exists.
3. The email's link works once, for two hours. It opens **Choose a new password**: type the **New password**
   twice and click **Change password**.
4. You're signed out everywhere and land on the sign-in page with *Password changed. Sign in with the new one.*

If there's no **Forgot your password?** link, or you never confirmed an email address, you can't reset the
password yourself. Talk to the admin of your server.

## A tour of the screen

### The top bar

From left to right:

| Item | What it does |
| --- | --- |
| **☰** (Menu) | On a wide window, switches the sidebar between full and slim. On a narrow window, and on any watch page, opens the sidebar as a panel over the page. |
| Logo and server name | Back to Home. |
| **Search** | Type and press Enter (or click the magnifier). Results open at `/results`; see [Search](Watching-and-Discovery.md#search). |
| **Upload** | The upload page (`/upload`). Signed in only. |
| Bell | Your notifications (below). Signed in only. |
| Your picture | The account menu (below). Signed in only. |
| **Sign in** | Shown instead of the last three when you're signed out. |

### The account menu

Click your picture at the top right:

- your picture, display name and `@username`, with **View your channel**;
- **Your videos**: Studio (`/studio`), where you edit, publish and delete your uploads (see
  [Studio](Uploading-and-Editing.md#studio));
- **Settings** (`/settings`), see [Accounts and Settings](Accounts-and-Settings.md);
- **Anonymous mode: off** (or **on**): click to switch. While it's on, watching in this browser doesn't touch your
  history and counts as a signed-out view, and your picture gets a small incognito badge. It applies to this
  browser only;
- **Admin** (admins only) or **Moderation** (moderators only);
- **Sign out**, which ends the sign-in in this browser.

### The notification bell

The bell shows how many notifications you haven't read (up to *99+*). It checks every minute and whenever you come
back to the tab. Click it to see the latest 12:

- click one to open what it's about; that also marks it read;
- **Mark all read** (when something is unread);
- the gear opens **Settings → Notifications**, where you choose what also reaches you by push or email;
- **See all** opens the notifications page (`/notifications`).

What you get notified about, and every switch, is in
[Accounts and Settings](Accounts-and-Settings.md#the-bell-and-the-notifications-page).

### The sidebar

| Item | Address | What it opens |
| --- | --- | --- |
| **Home** | `/` | The newest videos, with chips to narrow them down ([Home](Watching-and-Discovery.md#home)) |
| **Shorts** | `/shorts` | The Shorts viewer, one vertical video at a time ([Shorts](Watching-and-Discovery.md#shorts)) |
| **Trending** | `/trending` | What's being watched now |
| **Games** | `/games` | Every game with its videos ([Games](Video-Tools-and-Games.md#games)) |
| **Network** | `/network` | Videos from the other servers in the network. Only there when your server is in one. |
| **Subscriptions** | `/subscriptions` | New videos from the channels you subscribe to, and **Follow from the fediverse** at the bottom |

Under **You** (signed in):

| Item | Address | What it opens |
| --- | --- | --- |
| **Your channel** | `/c/<username>` | Your channel page, as others see it |
| **History** | `/history` | Videos you've watched, newest first |
| **Liked** | `/liked` | Videos you liked, here and on other servers |
| **Watch later** | `/watch-later` | Your Watch later list |
| **Groups** | `/groups` | Your groups, for sharing videos with family or friends only |
| **Playlists** | `/playlists` | Your playlists |
| **Studio** | `/studio` | Your videos, to edit and publish them |
| **Admin** | `/admin` | Admins only |
| **Moderation** | `/admin/moderation` | Moderators only |

Below that, **Subscriptions** lists the channels you subscribe to, A to Z. A channel on another server has a globe
icon and opens on its own server in a new tab.

Signed out, the **You** part is replaced by *Sign in to upload videos, like them, comment and subscribe.* and a
**Sign in** button.

At the very bottom: the server's name, a link to OurTube's source code, **Rules and contact** (`/legal`),
**Transparency** (when the server publishes a report) and a reminder of the player's keyboard shortcuts.

**The slim sidebar** shows only icons with short labels: Home, Shorts, Trending, Games, Network, Subscriptions,
History, Liked, Watch later, Groups, Playlists, Studio, and **Admin** or **Moderation** for those who have them.
**Your channel**, your subscriptions list and the footer are only in the full sidebar; use the account menu for
those, or open the sidebar as a panel with **☰**.

### On a phone or a narrow window

How much sidebar you get depends on the width of the window:

- **Wide** (a desktop browser): the full sidebar. **☰** makes it slim and back again; the browser remembers which.
- **Medium** (a small laptop or a tablet, up to about 1300 pixels wide): always the slim sidebar.
- **Narrow** (a phone, up to about 790 pixels wide): no sidebar. **☰** opens it as a panel over the page; it closes
  when you pick something, tap outside it, or tap **☰** at its top. The search box becomes a magnifier button
  that opens a full-width search bar (with a back arrow), and **Upload** shrinks to its icon.
- **Watch pages** (and the timeline editor) never show the sidebar, at any width, so the video gets the room.
  **☰** opens it as a panel.

On Android, the [OurTube app](Android-App.md) is usually nicer than the browser.

## Your channel

Every account is a channel at `/c/<username>`. Open yours from sidebar → **Your channel** or account menu →
**View your channel**.

At the top: your picture, display name, `@username`, and how many subscribers, videos and views you have, then
your description. A **LIVE** banner shows while you're streaming, **Also on** lists your
[linked accounts](Fediverse.md#linked-accounts), and a **Support** button lists your support links.

On your own channel, **Customize channel** opens Settings and **Manage videos** opens Studio. Other people see
**Subscribe** (or **Subscribed**), **Report**, and a feed button for feed readers.

The tabs:

- **Videos**: your public videos, sorted by **Latest**, **Popular** or **Oldest**. With linked accounts,
  **All accounts** adds your videos from your other servers. You see your own unlisted and private videos here
  too; other members don't.
- **Playlists**: your public playlists.
- **About**: your description, support links, your fediverse handles (**On the fediverse**, when the server has it
  on), and stats: when you joined, total views and number of videos.

To change what's on it, go to **Settings → Channel**
([Picture, name and description](Accounts-and-Settings.md#picture-name-and-description)): **Change picture**,
**Display name**, **Channel description** and **Support links**. Without a picture, you get a coloured circle with
your initial. There's no banner to upload: the strip across the top looks the same on every channel. The
username can't be changed.

## First steps

### Upload your first video

Click **Upload** at the top, drop in a file (or several) and fill in the title and the rest while it uploads.
The video stays a **draft**, seen only by you, until you click **Save details**; that publishes it with the
visibility you picked, and your subscribers are told. Details in
[Uploading and Editing](Uploading-and-Editing.md#uploading) and
[Drafts](Uploading-and-Editing.md#drafts-nothing-goes-out-until-you-save). To bring in videos you already have on
YouTube or Immich, use **Upload → Import from YouTube or Immich**
([Importing](Uploading-and-Editing.md#importing-from-youtube-and-immich)).

### Subscribe to channels

**Subscribe** is on every channel page and under every video, for channels here and on other servers in the
network. Their new videos show up under **Subscriptions** in the sidebar and in your bell. To follow a channel on
PeerTube or Mastodon, use **Follow from the fediverse** at the bottom of the Subscriptions page (see
[Following out](Fediverse.md#following-out)).

### Like, comment and share

Under a video: the thumbs-up likes it (your likes are in sidebar → **Liked**), **Share** gives a link (with a
*start at* time if you like), and the comments are below. Times like `1:23` in comments become links into the
video. See [The player](Watching-and-Discovery.md#the-player).

### Watch later and playlists

**Save** under a video adds it to **Watch later** or to one of your playlists, or starts a new playlist. Find them
in the sidebar under **Watch later** and **Playlists**. See [Playlists](Watching-and-Discovery.md#playlists).

### History

Sidebar → **History** lists what you've watched, and videos resume where you left off. **Pause history** stops
recording, **Clear all** empties it. More in [Privacy](Accounts-and-Settings.md#privacy).

### Groups

A group shares videos with a few people only, like your family. Sidebar → **Groups**, name a group, then add people
by username or send them its join link. See
[Groups](Uploading-and-Editing.md#groups-videos-for-family-and-friends).

### Other servers in the network

When your server is in a network, sidebar → **Network** shows videos from the other servers, and they also turn up
on Home and in search, marked with the server they live on. You can watch, like, comment on and subscribe to them
with your account here. See [Network](Network.md).

### More to try

- [Watch Parties](Watch-Parties.md): **Watch together** under a video watches it with friends in sync, with chat.
- [Live Streaming](Live-Streaming.md): go live from OBS, when the server has it turned on.
- [Video Tools and Games](Video-Tools-and-Games.md): clips, GIFs, looping links and the game catalog.

### The Android app

OurTube for Android plays, uploads and does most of what the website does, with a sign-in for each server you
use. Install it from the project's releases page: see [Android App](Android-App.md#install).

## Getting help

- **The rules**: sidebar footer → **Rules and contact** (`/legal`) has the server's rules, terms and contact
  address, when the admin has written them.
- **Something wrong with a video, comment or channel**: the **Report** (flag) button on it sends it to the
  moderators.
- **Following from Mastodon or PeerTube**: `/help/fediverse` explains it step by step.
- **Everything else**: ask your server's admin. Admins have their own pages here, starting with
  [Troubleshooting](Troubleshooting.md).

## Where is it?

| I want to… | Go to |
| --- | --- |
| Change my picture, name or description | Account menu → **Settings** → **Channel** |
| Change my password | **Settings** → **Account** → **Change password** |
| Add or change my email address | **Settings** → **Notifications** → **Email** |
| Choose which notifications reach my phone or inbox | **Settings** → **Notifications** |
| See all my notifications | Bell → **See all** (`/notifications`) |
| Find my uploads | Account menu → **Your videos**, or sidebar → **Studio** |
| Upload a video | **Upload** at the top |
| Find the videos I liked | Sidebar → **Liked** |
| Find Watch later and my playlists | Sidebar → **Watch later** / **Playlists** |
| Pause or clear my history | Sidebar → **History** → **Pause history** / **Clear all** |
| Watch without it counting as me | Account menu → **Anonymous mode** |
| Share videos with family only | Sidebar → **Groups** |
| Invite someone to the server | Ask an admin: invites are in **Admin → Overview → Invites** |
| Get my stream key | **Settings** → **Channel** → **Live streaming** |
| Make an API key for ShareX | **Settings** → **Apps** → **API keys** |
| Set up a Discord webhook | **Settings** → **Apps** → **Webhooks** |
| Download all my data | **Settings** → **Account** → **Your data** |
| Move my channel to another server | **Settings** → **Account** → **Moving to another site** |
| Delete my account | **Settings** → **Account** → **Delete account** |
| Read the server's rules | Sidebar footer → **Rules and contact** |
| Sign out | Account menu → **Sign out** |
