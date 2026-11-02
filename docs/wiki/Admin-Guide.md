# Admin Guide

Running an OurTube server happens in the **Admin** area of the site, plus a few commands on the server itself
([Admin CLI](Admin-CLI.md)). This page says where everything is, walks through the jobs a new admin does first,
and then tours every admin tab, box by box. What each setting does in detail is in
[Configuration](Configuration.md); how reports, strikes and takedowns work is in
[Moderation and Legal](Moderation-and-Legal.md).

- [Getting to the admin area](#getting-to-the-admin-area)
- [First day on a new server](#first-day-on-a-new-server)
- [Inviting people](#inviting-people)
- [Approving sign-ups](#approving-sign-ups)
- [Making someone a moderator or admin](#making-someone-a-moderator-or-admin)
- [Suspending, banning and deleting accounts](#suspending-banning-and-deleting-accounts)
- [Storage quotas](#storage-quotas)
- [Strikes](#strikes)
- [When someone forgets their password](#when-someone-forgets-their-password)
- [Writing rules and terms](#writing-rules-and-terms)
- [Admin tools outside the admin area](#admin-tools-outside-the-admin-area)
- [Tour of the admin tabs](#tour-of-the-admin-tabs)
  - [Overview tab](#overview-tab)
  - [Moderation tab](#moderation-tab)
  - [Games tab](#games-tab)
  - [Legal tab](#legal-tab)
  - [Network tab](#network-tab)
  - [Debugging tab](#debugging-tab)

## Getting to the admin area

The first account made on a server is its admin (it needs the setup code, see
[First run](Installation.md#first-run)). Signed in as an admin, there are two ways in:

- **Sidebar → Admin** (the shield icon), in the **You** section under **Studio**. The sidebar only shows it
  when it's fully open: on a narrower window the sidebar shrinks to icons and leaves **Admin** out. On a phone,
  the ☰ menu button opens the full sidebar, **Admin** included.
- **The avatar menu**: click your picture at the top right, then **Admin**. This works at any window size.

Both open the **Overview** tab (`/admin`). The row of tabs at the top of every admin page leads to the rest:

| Tab | Address | Who can open it | What's on it |
| --- | --- | --- | --- |
| **Overview** | `/admin` | Admins | Server stats, site settings, the users table, invites, email |
| **Moderation** | `/admin/moderation` | Moderators and admins | Reports, held comments, appeals, the audit log, spam settings |
| **Games** | `/admin/games` | Moderators and admins | The game catalog and game artwork |
| **Legal** | `/admin/legal` | Admins | Rules, terms, contacts, strike settings, takedown notices |
| **Network** | `/admin/network` | Admins | Joining a network, peers, hub mode, the fediverse, blocked servers |
| **Debugging** | `/admin/debug` | Admins | Version, server, disk, database, job queue, recent errors |

**Moderators** see **Moderation** (the gavel icon) in the sidebar and in the avatar menu instead of **Admin**. It
opens `/admin/moderation` directly, without the row of tabs. They reach the game list from sidebar → **Games** →
**Manage games**. Anyone else who opens an admin address gets *Admins only* or *Moderators only*. What each role
can do: [Roles](Moderation-and-Legal.md#roles).

## First day on a new server

A checklist, roughly in order. On a small server for friends or family the first three steps are enough to
start with; the rest is optional or can wait, except backups, which you should set up soon.

1. **Name the server and give it its address.** Admin → **Overview** → **Site settings**: fill in **Site name**
   and **Public URL (optional)** (the `https://` address people use), then **Save settings**. The site name is
   the only site-wide look setting: it's shown next to the logo in the top bar, in the browser tab, on the
   sign-in page, in link previews and emails. There's no custom logo or color scheme; each person picks their own
   layout density under Settings → **Watching** (see [Accounts and Settings](Accounts-and-Settings.md)).
2. **Choose who can sign up.** Same box, **Sign-up**. A new server starts as **Open**: anyone who finds it can
   make an account. For friends and family pick **Invite only**. The four modes are explained in
   [Sign-up](Moderation-and-Legal.md#sign-up).
3. **Invite people.** Admin → **Overview** → **Invites**, see [Inviting people](#inviting-people).
4. **Rules, terms and contacts: optional.** A server for people you know needs none of it. With Admin →
   **Legal** left empty, sign-up has no terms checkbox and `/legal` just says that no rules have been published.
   Write them when strangers can join; see [Writing rules and terms](#writing-rules-and-terms).
5. **Email: optional.** Admin → **Overview** → **Email (optional)**. Without it everything works except
   confirming email addresses, password resets by email and notification emails. See
   [Email](Configuration.md#email).
6. **Uploads and storage.** In **Site settings**: **Max upload size (MB)** (8 GB by default), **Storage per
   person (MB)** and **Storage for the whole server (GB)** (both 0, no limit, by default), **Max resolution**
   (1080p) and **Video encoder** (a GPU encoder needs [GPU encoding](Installation.md#gpu-encoding)). If big uploads
   fail, the reverse proxy is the usual cause: [Troubleshooting](Troubleshooting.md#uploads). Per-person limits:
   [Storage quotas](#storage-quotas).
7. **Roles.** Make someone you trust a moderator, so reports don't wait for you:
   [Making someone a moderator or admin](#making-someone-a-moderator-or-admin).
8. **Backups.** Everything is in one data folder; copy it regularly. How:
   [Backing up](Upgrading-and-Backups.md#backing-up).

When those are done, the optional extras:

- **Imports from YouTube**: tick **Let people import their videos from YouTube** in **Site settings** (see
  [Importing from YouTube](Configuration.md#importing-from-youtube)).
- **Adaptive streaming** for viewers on slow connections: **Adaptive streaming (HLS)** in **Site settings**.
- **The network** of OurTube servers: Admin → **Network** (see [Joining](Network.md#joining)).
- **The fediverse** (Mastodon, PeerTube) is on by default: Admin → **Network** → **Fediverse (ActivityPub)** (see
  [Fediverse](Fediverse.md)).
- **Live streaming** needs a second container: [Turning it on](Live-Streaming.md#turning-it-on-admins).
- **Games and artwork**: Admin → **Games** (see [Games](Video-Tools-and-Games.md#games)).
- **A webhook for the whole server**, announcing every new video in a chat channel: Settings → **Apps** →
  **Webhooks** (see [Whole-server webhooks](Webhooks.md#whole-server-webhooks)).

## Inviting people

Only admins make invites. They're in **sidebar → Admin → Overview → Invites**: on a wide screen it's the lower
left box, under **Site settings** and next to **Email (optional)**; on a narrow screen, scroll down past the
users table.

Invite links work when **Sign-up** is **Open**, **Needs approval** or **Invite only**. They don't work while it's
**Closed**. With **Needs approval**, an invited person skips approval and can sign in straight away.

**To make an invite:**

1. **Note**: who it's for, so you recognize it in the list later (optional, up to 200 characters; only admins
   see it).
2. **Uses**: how many accounts the link can make. 1 by default; 0 means no limit (at most 1000).
3. **Days**: how many days it works. 14 by default; 0 means it never expires (at most 365).
4. Click **Create**. The link is copied to your clipboard (*Invite created and its link copied*). Paste it into a
   message to the person.

The link looks like `https://clips.example.com/register?invite=Ab3dE5fG7hJ9`. It's built from the address in
your browser's address bar, not the Public URL, so if you're using the server through a home-network address,
open Admin through its public address before you create or copy an invite for someone outside your home.

**What the invited person sees:** the **Create your account** page (*Join* and your site name) with **Invite code**
already filled in. They choose a **Username** (3 to 20 letters, numbers or underscores; it's also their channel's
address), a **Display name**, a **Password** (at least 6 characters) and **Confirm password**, tick *I have read
and accept the rules and terms* if you've written terms, and click **Create account**. They're signed in right
away. If the link can't be used any more they see *That invite has expired*, *That invite has already been used*
or *That invite code is not valid*.

Someone who opens `/register` without a link on an invite-only server sees the same page with an empty, required
**Invite code** and *This site is invite-only. Ask someone here for an invite link.*

**The list of invites**, under the form, newest first. Each row shows the code, the note, and a line such as
*Used 1 of 1 · expires Nov 16, 2026 · by @you* (or *Used 3 · never expires* for one with no limits). A badge says
when an invite can't be used any more:

- **used up**: every use is taken;
- **expired**: its days are over.

Used-up and expired invites stay in the list until you delete them. On each row:

- the link icon (**Copy link**) copies the invite's link again;
- the bin icon (**Delete invite**) deletes it at once, without asking. Accounts already made with it stay.

Making an invite is recorded in the [audit log](Moderation-and-Legal.md#the-audit-log).

## Approving sign-ups

With **Sign-up** set to **Needs approval**, anyone can fill in the sign-up form, but then sees *Thanks! An admin
needs to approve your account before you can sign in.* Trying to sign in before that says *This account is
waiting for an admin to approve it.*

Waiting accounts are in **Admin → Overview → Users**, with **Approve** and **Reject** buttons in the **Status**
column. The table lists the oldest accounts first, so new sign-ups are at the bottom. Admin → **Moderation** also
says *N new accounts are waiting for approval under Overview → Users*, with a link. Admins aren't notified of new
sign-ups, so look there now and then.

- **Approve** makes the account active. Nothing is sent to the person, so let them know they can sign in.
- **Reject** asks *Reject @name's sign-up? Their account is deleted.* and deletes it.

People who sign up with an invite link skip this.

## Making someone a moderator or admin

**Admin → Overview → Users → Role**: pick **Member**, **Moderator** or **Admin** in the person's row. It takes
effect at once (*@name is now moderator*); they see the **Moderation** or **Admin** item after their page reloads.
You can't change your own role (your dropdown is greyed out), so a server always keeps at least one admin.

From the server: `docker exec cliptube node server/cli.js user role alice moderator` (see
[Admin CLI](Admin-CLI.md#accounts)).

Moderators handle reports, held comments, appeals and the game list. Admins can do everything, including deleting
accounts and changing every setting, so only make someone an admin if you'd trust them with the server. The full
list: [Roles](Moderation-and-Legal.md#roles).

## Suspending, banning and deleting accounts

**To suspend or ban:** **Admin → Overview → Users → Status**, choose **Suspended** or **Banned**. A box asks for a
reason, which is shown to them. They're signed out everywhere at once, their API keys stop working, and signing in
tells them *This account is suspended* (or *banned*) followed by your reason. Their videos and comments stay up;
hide or remove those separately if needed. Suspended and banned work the same way: the word is for your records
and for them. **To undo it**, set **Status** back to **Active**.

Moderators can suspend or ban from a report (Admin → **Moderation** → **Reports**), but only admins can lift a
suspension or ban, here or with the CLI. Nobody can change their own status, and moderators can't act on admins.

**To delete an account:** the bin icon at the end of the person's row (*Delete user and their videos*). It asks
*Delete @name and ALL of their videos (N)? This cannot be undone.* and then deletes the account, its videos and
their files at once. There's no grace period and no undo.

A **deleting** badge in the same column means the person asked to delete their own account (Settings →
**Account** → **Delete account**); it goes by itself when their 7-day grace period ends.

People from other servers aren't in the users table: block their server instead (Admin → **Network** →
**Blocked instances**, see [Network](Network.md#what-every-server-controls)).

From the server: `user status <username> suspended "reason"` and `user status <username> active` (see
[Admin CLI](Admin-CLI.md#accounts)). There's no command to delete an account.

## Storage quotas

A quota caps how much one person's videos may take.

- **For everyone:** **Admin → Overview → Site settings → Storage per person (MB)**, then **Save settings**. 0
  means no limit, the default.
- **For one person:** **Admin → Overview → Users → Storage**. The column shows what they use and their quota
  (*site default*, *unlimited* or a size). Click it; the box asks for the quota in MB: leave it empty for the site
  default, or 0 for unlimited.

The quota is checked when someone uploads, imports from YouTube or Immich, or saves a clip. Anything that would
go over it is refused with a message saying so; lowering a quota deletes nothing, it only stops new uploads.
Each person sees their own use under Settings → **Account** → **Storage**.

**Storage for the whole server (GB)** in the same box caps everything OurTube keeps; see
[Configuration](Configuration.md#admin--overview).

## Strikes

A strike is a mark against an account for a copyright problem, the basis of a repeat-infringer policy. Strikes
come from:

- **recording a takedown notice** with **Remove the video** in Admin → **Legal**, while **Strike the uploader when
  a notice removes a video** is on (it is by default);
- **a moderator's action on a report**: **Strike uploader** on a reported video, **Add strike** on a reported
  channel.

Each strike notifies the person. When their active strikes reach **Strikes that suspend an account** (3 by
default), the account is suspended automatically. Strikes run out after **Strikes expire after (days)** (365 by
default). Both are in Admin → **Legal** → **Repeat infringers**; how they work in detail is in
[Strikes](Moderation-and-Legal.md#strikes).

**Admin → Overview → Users → Strikes** shows each person's active strikes. Click a number to clear all of that
person's strikes (it asks first). Clearing strikes doesn't lift a suspension: set **Status** back to **Active**
too.

## When someone forgets their password

**Reset by email** is the only way to set a forgotten password, and it needs two things: email set up on the
server (Admin → **Overview** → **Email (optional)**), and a confirmed address on the account (the person adds it
under Settings → **Notifications** → **Email** and opens the link sent to it). Then:

1. On the sign-in page, **Forgot your password?** (it only shows when email is set up).
2. Enter the **Username or email** and click **Send reset link**.
3. Open the emailed link within two hours and choose a new password. That signs the account out everywhere.

There's no way for an admin to set or reset someone else's password: no button in Admin and no CLI command. A
member without a confirmed address who can't get back in can make a new account (send them an invite if needed);
their videos stay on the old account, which you can delete from the users table once they've moved on.

If it's your own admin account, see [Locked out of the admin account?](Admin-CLI.md#locked-out-of-the-admin-account)

Signed-in people change their password under Settings → **Account** → **Change password** (see
[Accounts and Settings](Accounts-and-Settings.md)). When email is set up, ask members to add a confirmed address.

## Writing rules and terms

All optional. **Admin → Legal → Legal page** has four fields:

- **Contact email for abuse and copyright**: where people write about abuse or copyright.
- **DMCA agent**: the designated agent's name, address, phone and email, as registered with the US Copyright
  Office. Only matters for a US server open to strangers (see
  [Background, not legal advice](Moderation-and-Legal.md#background-not-legal-advice)).
- **Rules**: what's allowed on your server.
- **Terms people accept at sign-up**: leave it empty to skip the checkbox at sign-up.

Write plain text; line breaks are kept. Click **Save** under the box (it lights up once something has changed).

**Where they show:**

- **`/legal`**, the *Rules and contact* page: **Rules**, **Terms**, and *Report abuse or copyright infringement*
  with the contact email and the DMCA agent. With nothing filled in it says the admins haven't published rules or
  contact details yet.
- Links to it: **Rules and contact** at the bottom of the sidebar; *Rules, copyright and contact* under a video's
  description when it's expanded; the report dialog; and the sign-up page's terms checkbox.
- **Terms at sign-up**: when **Terms people accept at sign-up** has text, the sign-up form gets a required
  checkbox, *I have read and accept the rules and terms*, linking to `/legal`. People who already have an
  account aren't asked again. Rules on their own add no checkbox.

## Admin tools outside the admin area

Some tools sit where the thing they act on is:

- **On a watch page**, moderators and admins get a gavel button (**Moderator tools**) with **Hide from everyone
  else**, **Remove (rule or copyright violation)** and, on a hidden or removed video, **Restore video** (see
  [Hiding and removing videos](Moderation-and-Legal.md#hiding-and-removing-videos)).
- **On someone else's video**, admins also get **Edit**, which opens its details in Studio. Admins can open any
  video, including private ones and videos only for a group.
- **On a video from another server**, admins get a shield button (**Admin**) with **Hide on this site** (**Hide
  from the network** on a hub) and **Block** followed by the server's name.
- **Comments**: moderators can **Delete** any comment, and approve held ones under the video or in Admin →
  **Moderation** → **Held comments**.
- **Live chat**: moderators can remove messages and people (see
  [Watching and chatting](Live-Streaming.md#watching-and-chatting)).
- **Games page** (sidebar → **Games**): **Manage games** opens Admin → **Games**.
- **The `/network` page**: while the server isn't in a network, admins get a **Network settings** button.
- **Import page**: when YouTube imports are off, admins get a link to the setting.
- **Settings → Apps → Webhooks**: an admin's webhook can cover the whole server
  ([Whole-server webhooks](Webhooks.md#whole-server-webhooks)).

## Tour of the admin tabs

Every box and control on each tab, top to bottom. On a wide screen the boxes sit in two columns, left then right;
below 1000 pixels wide they're in one column in the same order.

### Overview tab

`/admin`, admins only. The page title is **Admin**.

**Update banner.** When a newer OurTube is out: *OurTube 1.26.0 is out. This server runs 1.25.1.* with **What
changed** and **How to update** links (see [Checking the version](Upgrading-and-Backups.md#checking-the-version)).

**Stats.** A row of tiles, refreshed every five seconds:

| Tile | Shows |
| --- | --- |
| **Users** | Accounts on this server, waiting ones included |
| **Videos ready** | Videos ready to watch, and *N failed* when some failed to process |
| **Total views** | Views of every video here |
| **Comments** | Comments on videos here |
| **Video storage** | The size of the MP4s people watch |
| **Kept originals** | Uploaded files kept after re-encoding |
| **Used in all** | Everything in the data folder, with what's free on the disk; with a server limit set, *Used of N allowed* |
| **Processing queue** | Videos waiting to be processed (*Processing now* while one is), and edits being rendered |

**Site settings.** One box, saved together with **Save settings** at the bottom. What each setting does, its key
and its default are in [Admin → Overview](Configuration.md#admin--overview):

| Control | In short |
| --- | --- |
| **Site name** | The server's name, up to 40 characters |
| **Public URL (optional)** | The address people use, for links in previews, emails, feeds and to other servers |
| **Sign-up** | **Open**, **Needs approval**, **Invite only** or **Closed**; the line under it explains the choice |
| **Max upload size (MB)** | The largest file one upload may be |
| **Storage per person (MB)** | Everyone's default quota; 0 = unlimited |
| **Storage for the whole server (GB)** | A cap on the whole data folder; 0 = no limit |
| **Max resolution** | Taller videos are scaled down to this |
| **Video encoder** | CPU (libx264) or a GPU encoder, for videos that need re-encoding |
| **Delete the original file after re-encoding** | Saves disk; loses the uploaded file |
| **Adaptive streaming (HLS)** | Lower qualities for slow connections; changing it rebuilds every video |
| **Keep a 720p copy of large videos for other platforms** | For Mastodon and others that only cache small videos |
| **Show dislike counts** | Uploaders always see their own |
| **Let people import their videos from YouTube** | Turns on the YouTube tab of the import page |

**Users.** Every account on this server, oldest first:

| Column | Shows, and what you can do |
| --- | --- |
| **User** | Picture, display name and @username; click to open their channel |
| **Joined** | The date the account was made |
| **Videos** | How many videos they have |
| **Storage** | Used / quota; click to change their quota ([Storage quotas](#storage-quotas)) |
| **Strikes** | Active strikes; click a number above 0 to clear them ([Strikes](#strikes)) |
| **Role** | **Member**, **Moderator** or **Admin** ([Making someone a moderator or admin](#making-someone-a-moderator-or-admin)) |
| **Status** | **Active**, **Suspended** or **Banned**; **Approve** and **Reject** for a waiting account ([Approving sign-ups](#approving-sign-ups)) |
| (last) | A **deleting** badge if they asked to delete their account; the bin icon deletes the account ([Suspending, banning and deleting accounts](#suspending-banning-and-deleting-accounts)) |

Your own row has no bin, a greyed-out role and a plain **Active** badge.

**Invites.** **Note**, **Uses**, **Days** and **Create**, then the list of invites with **Copy link** and **Delete
invite** on each. See [Inviting people](#inviting-people).

**Email (optional).** **SMTP server**, **Port**, **Encryption**, **From**, **Username** and **Password**, then
**Save** (it lights up once something has changed). After an SMTP server is saved, a **Send a test to...** field and
**Send test** appear under it; the result shows as a message at the bottom of the screen. The fields are
explained in [Email](Configuration.md#email); if no email arrives, see
[Troubleshooting](Troubleshooting.md#email-and-notifications).

### Moderation tab

`/admin/moderation`, moderators and admins. The page title is **Moderation**.

For admins, a notice at the top says when new accounts are waiting for approval, with a link to
**Overview → Users**. Then five sub-tabs; the first three show how many items are waiting:

- **Reports**: filter with **Open**, **Resolved**, **Dismissed** or **All**. Each report is a card with the reason,
  what was reported, who reported it and what they wrote, buttons for what to do about it, **Mark handled**,
  **Dismiss**, and a **Private moderator notes** field with **Save**.
- **Held comments**: comments waiting for review, each with **Approve** and **Delete**.
- **Appeals**: counter-notices and appeals from uploaders, each pending one with **Accept and restore** and
  **Reject**.
- **Audit log**: the last 200 moderation actions, with **When**, **Who**, **Action**, **Target** and **Details**.
- **Spam settings**: the **Comment spam controls** box. Switches save as you flip them; number fields save when you
  click out of them. The settings are listed in [Admin → Moderation](Configuration.md#admin--moderation).

How each of these works: [Moderation and Legal](Moderation-and-Legal.md#where-moderators-work).

### Games tab

`/admin/games`, moderators and admins. The page title is **Games**. A short text explains short names; on a hub
or a member of a network, a line says where the catalog comes from.

- **Artwork from SteamGridDB**: for admins, the API key field with **Save key** (and **Remove** once a key is
  saved) and the **Fill in artwork for new games** switch; for everyone, **Fill in missing artwork** once a key is
  saved.
- **Add a game**: **Name**, **Short name**, **Also known as** and **Add**.
- **The games**, one row each: the cover (click it to upload artwork of your own), **Name**, **Short name**, **Also
  known as**, a link to the game's page with its clip counts, and **Artwork** (with a SteamGridDB key), **Save**,
  **Merge into…** and **Delete**. Games from the network hub's catalog carry a *From* badge and can't be changed
  here.

The catalog itself, merging and artwork: [Games](Video-Tools-and-Games.md#games). The two artwork settings:
[Admin → Games](Configuration.md#admin--games).

### Legal tab

`/admin/legal`, admins only. The page title is **Legal**, with a short note that this is background, not legal
advice.

- **Legal page** (left): **Contact email for abuse and copyright**, **DMCA agent**, **Rules**, **Terms people
  accept at sign-up** and the **Publish a transparency report** switch; then **Repeat infringers**: **Strike the
  uploader when a notice removes a video**, **Strikes that suspend an account**, **Strikes expire after (days)**;
  and **Keep removed videos' files for (days)**. **Save** saves the whole box. Settings:
  [Admin → Legal](Configuration.md#admin--legal); writing them: [Writing rules and terms](#writing-rules-and-terms).
- **Record a takedown notice** (right): **Video link or id**, **Claimant**, **Claimant contact**, **Copyrighted
  work**, **Received**, **Action** (**Remove the video**, **Record only** or **Reject (invalid notice)**),
  **Notes**, and **Record notice**. Below it, the **Takedown log** with every notice recorded. How it works:
  [Copyright notices](Moderation-and-Legal.md#copyright-notices).

### Network tab

`/admin/network`, admins only. The page title is **Network**, with a badge for the server's place in a network.
Everything here is explained in [Network](Network.md) and [Fediverse](Fediverse.md); the settings and their keys
are in [Admin → Network](Configuration.md#admin--network). From the top:

- *This instance's address*, and a warning when the Public URL isn't an `https://` address.
- **Join a network** (when this server isn't the hub): **Hub or instance address** and **Join network**; once
  joined, the network's state with **Sync now**, **Leave hub only** and **Leave network**. Under it, **Accept from
  other instances**: **Comments**, **Likes** and **Subscriptions** switches.
- **Run the network (hub mode)**: the **This instance is the hub** switch, and on a hub its settings and **Save
  hub settings** ([Running a hub](Network.md#running-a-hub)).
- **Fediverse sharing**: **Share what this server follows** and **Show what other servers share**
  ([Sharing what you follow](Network.md#sharing-what-you-follow)).
- **Instances in the network** (on a hub): every member, with **Approve**, **Suspend**, **Ban** and a **More**
  menu, and **Sync all**.
- **Direct peers**, **Who can peer with this instance** and **Block lists you follow** (once the server is in a
  network or is a hub): **Peer with it**, the admission switches, **Publish my block list**, **Most peers**, and
  following other servers' block lists ([Block lists](Network.md#block-lists)).
- **Fediverse (ActivityPub)**: the **Speak ActivityPub** switch, follower counts, **Follow a whole server** and
  **Browse the PeerTube directory** ([Following out](Fediverse.md#following-out)).
- **Blocked instances**: a field and **Block**, then the list with **Block** or **Unblock** on each server.
- **Hidden videos** (only when there are any): videos from other servers you've hidden, with **Show again**.

### Debugging tab

`/admin/debug`, admins only. The page title is **Debugging**. The line at the top has **Copy the whole report**
(everything on the page, for whoever is helping you; no passwords or keys are in it) and **Refresh**.

| Box | Shows |
| --- | --- |
| **Version** | **OurTube** (this server's version), **Newest on GitHub**, **Last checked**; the **Check GitHub for new versions every 12 hours and tell admins** checkbox, **Check now**, **What changed**, **How to update** |
| **Server** | **Running for**, **Node.js**, **System**, **CPU cores**, **Memory used by OurTube**, **Memory free on the machine**, **Public URL**, **Address this page used** |
| **FFmpeg** | **ffmpeg** and **ffprobe** versions and paths, **Encoder in use**, **GPU encoders in this build** |
| **Storage** | **Free on the data disk**, **Database**, **Database backups**, the size of each folder that isn't empty, and the data folder's path |
| **Database** | **Schema version**, **Journal mode**, **Accounts here**, **Videos here**, **Videos from other servers** |
| **Network and fediverse** | **Role**, **Servers with videos here**, **ActivityPub**, **Following**, **Followers**, **Live streaming**, **Email** |
| **Job queue** | Per lane: **Waiting**, **Running**, **Failed**, **Done**; what's running now and recent failures |
| **Recent warnings and errors** | The server's last warnings and errors since it started |

The version check setting: [Admin → Debugging](Configuration.md#admin--debugging). What to do with what you find:
[Troubleshooting](Troubleshooting.md).
