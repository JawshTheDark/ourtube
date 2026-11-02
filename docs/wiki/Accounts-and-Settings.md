# Accounts and Settings

Everything about your own account is in **Settings**: account menu (your picture, top right) → **Settings**, or
`/settings`. On your channel page, **Customize channel** opens it too. Making an account and signing in are on
[Getting Started](Getting-Started.md).

Settings has five tabs. Each has its own address, so you can bookmark one or send someone a link to it:

| Tab | Address | What's on it, top to bottom |
| --- | --- | --- |
| **Channel** | `/settings` | **Channel** (picture, display name, description), **Support links**, **Live streaming**, **Comments on your videos**, **Linked accounts** |
| **Notifications** | `/settings/notifications` | What reaches you by push and email, **Push on this device**, **Email** |
| **Watching** | `/settings/watching` | **Watching** (layout, skippable parts, captions, Shorts), **Privacy** |
| **Account** | `/settings/account` | **Change password**, **Storage**, **Your data**, **Moving to another site**, **Delete account** |
| **Apps** | `/settings/apps` | **API keys**, **Webhooks** |

A few sections can be linked directly: `/settings#live`, `/settings#linked-accounts`, `/settings/account#move`,
`/settings/apps#api-keys` and `/settings/apps#webhooks`. Older links like `/settings#move` or `/settings#webhooks`
still land on the right tab.

- [Channel tab](#channel-tab)
- [Notifications tab](#notifications-tab)
- [Watching tab](#watching-tab)
- [Account tab](#account-tab)
- [Apps tab](#apps-tab)
- [The bell and the notifications page](#the-bell-and-the-notifications-page)
- [Signing in and security](#signing-in-and-security)
- [What isn't there](#what-isnt-there)

## Channel tab

Settings → **Channel** (`/settings`): how your channel looks, and how it takes comments.

### Picture, name and description

The **Channel** card:

- **Change picture**: pick a JPG, PNG, WebP, GIF or BMP image of up to 15 MB. It's saved straight away, cut to a
  square from the middle at 256 × 256 pixels. **Remove** (when you have a picture) goes back to a coloured circle
  with your initial.
- **Display name**: required, up to 50 characters. It's how your name shows on your channel, videos and comments.
- **Username**: greyed out, because it can't be changed. The hint links to your channel at `/c/<username>`.
- **Channel description**: up to 1000 characters (*What do you post?*). It shows under your name on your channel
  and on its **About** tab.
- **Save** saves the display name and description (*Profile saved*).

When the fediverse is on for this server, a new name, picture or description is sent to the servers that follow
you and to the other servers in the network, so it changes there too.

### Support links

Tip jars, memberships or merch, shown on your channel (the **Support** button and the **About** tab) and under
your videos. Up to five links:

- each row has a label (*Label, like Ko-fi*, up to 40 characters) and the link, which must start with `https://`;
- a link without a label is shown with its website's name;
- **Add another** adds a row (up to five), and emptying a row's link removes it;
- **Save** stores them (*Support links saved*).

They also appear as profile fields on Mastodon; see [Support links](Watching-and-Discovery.md#support-links).

### Live streaming

The **Live streaming** card (`/settings#live`) holds your **Server** address and **Stream key** for OBS (with
**Show**, **Copy** and **New key**), an **SRT (optional)** address when the server has one, and the stream's
**Title**, **Description**, **Game**, **Who can watch** and *Keep each stream as a draft video when it ends*. When
the server has no live streaming, the card says so. Everything about it is in
[Live Streaming](Live-Streaming.md#going-live).

### Comments on your videos

- **New comments**: *Publish right away (spam checks still apply)* or *Hold every comment for my review*. Each
  video can override this when you edit it. Held comments wait in **Studio → Comments** (`/studio/comments`).
- **Blocked words**: type a word or phrase (up to 60 characters), choose *Hold for review* or *Reject*, and click
  **Add**. A comment containing it anywhere, in any capitals, is held or turned away. Each word shows as a chip
  (red for *Reject*); its **×** removes it. Your own comments, your linked accounts' and moderators' aren't
  checked.

More on comments and spam in [Moderation and Legal](Moderation-and-Legal.md#comments-and-spam).

### Linked accounts

The **Linked accounts** card (`/settings#linked-accounts`) ties this account to your accounts on other OurTube
servers or on Mastodon, so every server shows them as one person:

- type the other account (*@you@other-site.example*) and click **Link**; then, on the other site, link this
  account (its handle is shown, with **Copy**);
- *These accounts say they're you* lists accounts that linked to you first, each with **Link back**;
- each link shows *Linked both ways* or *Waiting for it to link back*; **Check again** asks the other side again,
  and **×** unlinks.

Up to five links. Linking needs the fediverse and the server's Public URL; without them the card says to ask an
admin. How it works, and the Mastodon steps: [Linked accounts](Fediverse.md#linked-accounts).

## Notifications tab

Settings → **Notifications** (`/settings/notifications`). Everything always shows up under the bell; this tab
picks what *also* reaches you as a push notification or an email.

### What reaches you

One row per kind of notification, with a **Push** and an **Email** checkbox:

| Row | What it's about | Push | Email |
| --- | --- | --- | --- |
| **New uploads from channels you subscribe to** | A channel here or on another server in the network published a public video | on | off |
| **Replies to your comments** | Someone answered your comment | on | off |
| **Mentions of you in comments** | Someone wrote `@yourname` in a comment | on | off |
| **Comments on your videos** | A new comment on one of your videos | on | off |
| **Decisions about your videos, reports and account** | Moderation outcomes; also where **Send a test** lands | on | on |
| **Channels you subscribe to moving to another site** | A channel moved; also your own channel export or import finishing | on | off |
| **Channels you subscribe to going live** | A channel started a public live stream | on | off |
| **Your groups: videos shared with them, and people joining** | A video for one of your groups, being added to a group, someone joining yours | on | off |

The last two columns are the defaults. Each click saves at once. Push only reaches devices where you've turned it
on (below), and email only goes to a confirmed address; the **Email** boxes are greyed out when the server has no
email set up. Admins also get a notice in the bell when a new OurTube version is out; it has no row here and never
goes out by push or email.

### Push on this device

Push is turned on per browser or device:

- **Turn on push notifications** asks your browser for permission and signs this device up. If you've blocked
  notifications for the site, it says *Notifications are blocked for this site in your browser*; allow them in the
  browser's site settings and try again.
- Once on: an **On** badge, **Turn off** (signs this device out of push) and **Send a test** (sends *Test
  notification* to all your devices; it uses the *Decisions about your videos, reports and account* row, so it
  also lands in the bell, and in your inbox if that row's email box is ticked).
- *This browser can't receive push notifications here* means the site isn't on HTTPS or the browser doesn't
  support push.

On Android, the [app](Android-App.md) has its own notifications.

### Email address

The **Email** part holds your address. It's optional, and it's the only place to set it:

- type it and click **Save**. The server sends a confirmation link (valid for 48 hours) and says *Check your inbox
  for a confirmation link*. The hint then reads *Not confirmed yet: open the link we emailed you.*
- the link opens `/verify-email`: *Your email address is confirmed.*, with a link back to these settings. The
  hint becomes *Confirmed. Also used for password resets.* An expired or used link says *That link has expired or
  was already used*; save the address again for a new one.
- changing the address unconfirms it until you open the new link. Emptying the field turns the button into
  **Remove**.

A confirmed address is used for the emails you tick above and for
[password resets](Getting-Started.md#forgotten-password). When the server has no email set up, this part says
*This site has no email set up, so notifications stay in the app and push.*

## Watching tab

Settings → **Watching** (`/settings/watching`).

### Watching preferences

The **Watching** card is *saved in this browser*: set it again on each browser or device.

| Setting | Choices | Default |
| --- | --- | --- |
| **Layout density** | *Comfortable*; *Compact: smaller cards, more on screen*; *Dense: as many as fit*. Sizes the video cards on Home, channels, search and the rest. | Comfortable |
| **Sponsor reads, intros and other marked parts** | *Skip them automatically*, *Show a Skip button* or *Don't skip*. One choice for every kind of [skippable part](Uploading-and-Editing.md#skippable-parts). | Show a Skip button |
| **Community titles and thumbnails** | Show the plainer titles and honest thumbnails viewers voted for, instead of the uploader's ([more](Watching-and-Discovery.md#community-titles-and-thumbnails)) | Off |
| **Turn captions on when a video has them** | Switch | Off |
| **Keep Shorts off the home page** | No Shorts shelf on Home; they stay under **Shorts** | Off |

The video quality you pick in the player is remembered per browser too.

### Privacy

- **Pause watch history** (for your account, on every device): videos you watch aren't added to your history or
  used for resume points. The History page (sidebar → **History**) has the same switch as **Pause history** /
  **Resume history**, and **Clear all** to empty it.
- **Anonymous mode in this browser**: watching from this browser doesn't touch your history, and views count as a
  signed-out viewer. It's the same switch as **Anonymous mode** in the account menu; while it's on, your picture
  shows an incognito badge.
- **Manage your history** opens the History page.

How views and analytics are counted: [Analytics](Watching-and-Discovery.md#analytics).

## Account tab

Settings → **Account** (`/settings/account`).

### Change password

**Current password**, **New password** (at least 6 characters) and **Confirm new password**, then **Change
password**. Errors show above the form: *New passwords do not match* or *Current password is wrong*. Changing it
here keeps your other devices signed in; resetting it by email
([Forgotten password](Getting-Started.md#forgotten-password)) signs you out everywhere.

### Storage

How much space your videos take, *of* your quota when the admin set one (with a bar that turns to a warning colour
at 90%), or *no limit*. Quotas are set by admins; see [Storage quotas](Moderation-and-Legal.md#storage-quotas).

### Your data

**Export my data** makes one `.tar` archive with everything you have here: your videos and their originals,
thumbnails, your picture, and an `export.json` with your account details, video details, the comments you wrote
and those on your videos, likes, subscriptions, playlists, linked accounts and watch history.

The button says **Preparing…** while it's being made, and the page checks every few seconds. Each archive is then
listed with its size, when it was made and when it expires; click its name to download it. Archives are deleted
after 7 days.

This is a copy for you. To take your channel to another OurTube server, use the next section instead.

### Moving to another site

The **Moving to another site** card (`/settings/account#move`) has three steps:

1. **Export this channel**: **Export channel** makes an archive of your videos, thumbnails, captions, comments and
   subscriber list, kept 7 days. When it's *ready*, download it or use **Copy link** for its private link.
2. **Import a channel here** (on the new server): paste the old server's private link and click **Import**, or
   **Upload archive (.tar)**. *Also bring over the name, description, picture and links* is ticked by default.
3. **Move**: on the new server, add the old account under **Moving here**; then on the old server, enter the new
   account and your password under **Moving away** and click **Move channel**. **Undo the move** stops the old
   channel pointing to the new one; people who already moved stay with the new channel.

**How moving works** links to `/help/fediverse`. Moving needs the fediverse and the server's Public URL. The full
story: [Moving a channel](Fediverse.md#moving-a-channel).

### Delete account

Type your **Password** and click **Delete my account**, then confirm. Your account isn't deleted straight away:

- there's a **7-day grace period**. The card shows the date it will happen, and **Keep my account** cancels it;
- you can keep signing in and using the account until then;
- on that date your channel, videos, comments, likes and history are deleted, along with your picture and any data
  exports. Other servers in the network are told to remove your comments and likes, and fediverse servers that
  follow you are told the account is gone.

The only admin of a server can't delete their account (*You are the only admin. Make someone else an admin
first.*). Download [your data](#your-data) first if you want a copy.

## Apps tab

Settings → **Apps** (`/settings/apps`): for tools that work with your account.

### API keys

A key lets ShareX, a script or any tool that can send a file with a header upload videos as you. It can only
upload.

- **Name** (*ShareX* when left empty), **Uploads are** (*Unlisted*, *Public* or *Private*: what an upload is when
  it doesn't say), and *Publish right away (off: they wait as drafts until you save their details)*. Then **Make a
  key**.
- The new key is shown **once**, with **Copy**, **ShareX config** (a `.sxcu` file for ShareX) and a `curl`
  example. Copy it before you leave the page.
- The list shows each key's name, its first characters, its visibility, a *drafts* badge when it doesn't publish,
  when it was made and when it was last used. The bin icon (**Delete key**) stops it at once.

Up to 10 keys. Setting up ShareX and the upload API:
[Uploading from ShareX and other tools](Uploading-and-Editing.md#uploading-from-sharex-and-other-tools).

### Webhooks

Tell a bot, a bridge or a Discord or Slack channel when you publish a video or go live: **Address**, **Format**
(*JSON*, *Discord* or *Slack*), **Secret (optional)**, the events to send, then **Add**. Admins can also send
everything published on the server. Every option, the payloads and the limits: [Webhooks](Webhooks.md).

## The bell and the notifications page

The bell at the top right counts what you haven't read (up to *99+*), and checks every minute and when you come back
to the tab. Clicking it shows the latest 12, with **Mark all read**, a gear for **Settings → Notifications**, and
**See all**.

**See all** opens `/notifications`: the latest 100, unread ones highlighted, each with how long ago it came and a
thumbnail when there is one. Click one to open what it's about; that marks it read. **Mark all read** and
**Settings** are at the top. Notifications are deleted after 120 days.

Which kinds exist, and how to get them by push or email, is under [What reaches you](#what-reaches-you).

## Signing in and security

- A sign-in lasts **30 days** in a browser, then you sign in again. **Sign out** (account menu) ends it in that
  browser.
- Changing your password in Settings doesn't sign out your other devices. Resetting it through **Forgot your
  password?** does.
- Several wrong passwords in a row make sign-in wait a few minutes (*Too many failed sign-ins*).
- When an account is suspended or banned, it's signed out everywhere at once.
- The Android app keeps its own sign-in per server; signing out in the app ends that session on the server too
  (see [Android App](Android-App.md#servers-and-signing-in)).

There's no list of signed-in devices, no "sign out everywhere" button and no two-step sign-in.

## What isn't there

So you don't keep looking:

- **Changing your username**: not possible. Your display name can change any time.
- **A channel banner**: there's no banner upload; every channel has the same strip at the top.
- **A light theme**: OurTube has one dark look.
- **Email at sign-up**: there's none; add an address under [Email address](#email-address).
- **Inviting people to the server**: only admins make invite links (Admin → Overview → **Invites**). You can add
  people to your own [groups](Uploading-and-Editing.md#groups-videos-for-family-and-friends).
- **Language**: the site is in English only.
