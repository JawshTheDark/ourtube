# Fediverse

OurTube speaks **ActivityPub**, the protocol of Mastodon, PeerTube and the rest of the fediverse. People there
can follow channels here without an account, and people here can follow channels there. It is on by default
(Admin → Network → **Fediverse (ActivityPub)**) and needs the Public URL set to the site's `https://` address.

- [Where to find it](#where-to-find-it)
- [Turning it on](#turning-it-on)
- [Being followed](#being-followed)
- [What followers get](#what-followers-get)
- [Interactions coming back](#interactions-coming-back)
- [Following out](#following-out)
- [Following a whole server](#following-a-whole-server)
- [Comments across servers](#comments-across-servers)
- [Mastodon](#mastodon)
- [PeerTube](#peertube)
- [Moderation](#moderation)
- [When a delivery fails](#when-a-delivery-fails)
- [Linked accounts](#linked-accounts)
- [Moving a channel](#moving-a-channel)
- [The help page](#the-help-page)
- [Checked against real servers](#checked-against-real-servers)
- [Under the hood](#under-the-hood)

## Where to find it

| I want to… | Where |
| --- | --- |
| Give someone my fediverse handle | Your channel → **About** → **On the fediverse** |
| Follow a PeerTube channel from here | **Subscriptions** in the sidebar → **Follow from the fediverse** (at the bottom) |
| Show that my accounts on several servers are one person | Settings → **Channel** → **Linked accounts** |
| Move my channel to another server | Settings → **Account** → **Moving to another site** |
| Turn ActivityPub on or off (admins) | Admin → Network → **Fediverse (ActivityPub)** → **Speak ActivityPub** |
| Follow a whole PeerTube server (admins) | Admin → Network → **Fediverse (ActivityPub)** → **Follow a whole server** or **Browse the PeerTube directory** |
| Block a Mastodon or PeerTube server (admins) | Admin → Network → **Blocked instances** |
| Explain it to viewers | `/help/fediverse` |

Settings is in the account menu (your picture, top right); its tabs are described in
[Accounts and Settings](Accounts-and-Settings.md).

## Turning it on

**Admin → Network → Fediverse (ActivityPub) → Speak ActivityPub** is on by default. With it on, the panel says
*This server is @clips.example.com@clips.example.com.* (the server's own fediverse account) and shows:

- **Fediverse followers**: how many fediverse accounts follow channels here, and how many follow this server;
- **Videos from the fediverse**: how many fediverse videos are listed here.

It needs the Public URL (Admin → Overview) set to the site's `https://` address, so other servers reach it at a
stable address; the panel warns when it isn't set. The server must be reachable from the internet.

Turned off (*Off: this site is invisible to the fediverse.*), nothing goes out or comes in over ActivityPub:
handles stop resolving, followers stop getting videos, following out, linked accounts and moving a channel stop
working, and the help page says so. Servers in an OurTube network peer over ActivityPub too, so keep it on in a
network.

## Being followed

Every account is a fediverse account and has a channel, in PeerTube's style:

| Handle | What it is |
| --- | --- |
| `@name_channel@clips.example.com` | The channel: follow this to get the videos |
| `@name@clips.example.com` | The account |

Search for either from Mastodon or PeerTube. Each channel's **About** tab lists both under **On the fediverse**,
each with a copy button, and fediverse followers count as subscribers. Pasting a `/watch/...` or `/c/...` link into
Mastodon or PeerTube search finds the video or the channel.

Under the handles, **Follow from there** takes a viewer to their own server: they type it (*Your server, like
mastodon.social*), and their server's follow page opens in a new tab. The server they typed is remembered in
that browser.

A whole PeerTube server can follow this one too (its admin follows `@clips.example.com@clips.example.com`). That
goes through the same switches as OurTube servers that want to peer: see [Lockdown](Network.md#lockdown).

When **Subscriptions** under **Accept from other instances** (Admin → Network) is off, follows from the
fediverse are refused.

## What followers get

- **New videos** go out to followers when they're published (a `Create`, plus an `Announce` from the channel).
  Edits and removals follow (`Update`, `Delete`). Drafts and private videos never go out.
- The video object uses **PeerTube's vocabulary**, so PeerTube plays the MP4s directly.
- **Mastodon** gets a post with the title, a link and a playable video with its poster frame (the small 720p
  copy when there is one).

Exactly what is sent:

- **Which videos:** public, finished processing, with **Share with the network** ticked, and not hidden or
  removed by a moderator. Unlisted, private and group videos, drafts, and videos with **Share with the network**
  unticked never go out. A video that stops qualifying (made private, say) is deleted on followers' servers.
- **With each video:** the title, description, tags, game (also as a hashtag), thumbnail, the MP4 files, published
  captions, the duration, the counts, the uploader's support links and whether comments are open.
- **Comments** people here write on a video go to the video's followers too.
- **The profile:** the name, picture, description and support links (as profile fields).
- **Live streams:** a post with the title and the link when a public stream starts
  ([Live Streaming](Live-Streaming.md#live-on-other-servers)).
- **Old videos from a channel import** are available but not announced as new.
- **A deleted account** is announced to every fediverse server this site knows, so its comments and likes go away
  there too.

## Interactions coming back

- **Replies** from the fediverse land in the comment thread, through the same spam checks as everyone else's,
  and replies here go back to the person you answered.
- **Likes and dislikes** count, and **shares** are counted. Mastodon favourites count as likes and boosts as
  shares.
- The uploader's comment settings (held for review, off, blocked words) apply to fediverse replies as well.
- **Accept from other instances** (Admin → Network → **Join a network**) turns comments, likes and subscriptions
  from other servers off, the fediverse included.

## Following out

**Subscriptions → Follow from the fediverse** takes a handle (`@channel@peertube.example`) or a link. Once the
channel accepts, its recent videos are imported, new ones arrive as they're posted, and they show up under
Network, in search and in your subscriptions, with notifications. You can like and comment on them here; your
comments go to their server. The whole comment thread shows, including comments made before anyone here
followed: for PeerTube videos it is read from the video's server (up to 200 threads, refreshed every minute).

Step by step:

1. Open **Subscriptions** in the sidebar and scroll to **Follow from the fediverse** at the bottom.
2. Paste a handle or a link (*@channel@peertube.example or a link*) and click **Look up**.
3. Check the preview (its name, handle, and whether it is a **Channel** or an **Account**) and click **Follow**
   (*Follow request sent*).
4. The list under it shows each follow: **Waiting for them to accept**, **Following** or **They declined**. The ×
   (*Unfollow*) stops following, after a confirmation.

- Up to 50 of the channel's latest videos come in when it accepts.
- Its videos are tagged with their server and listed under the **Fediverse** label on the Network page.
- Only videos come in. A Mastodon account can be followed, but its ordinary posts (even ones with a video
  attached) don't show up here; only video posts in PeerTube's format do.
- Videos marked sensitive (NSFW) on their server stay out.
- A **Follow** button on another server that points here (`/authorize_interaction`) lands on this box with the
  handle filled in.
- It needs an account here; the follow is yours, and the videos join your subscriptions.

Servers in an OurTube network can pass what they follow on to each other, if both sides opt in: see
[Sharing what you follow](Network.md#sharing-what-you-follow).

## Following a whole server

Admins can also follow a **whole PeerTube server**, the way PeerTube servers mirror each other, which brings in
every public video of that server. Under **Admin → Network → Fediverse (ActivityPub)**:

- **Follow a whole server**: type its address (`peertube.example`) and click **Follow** (*Follow request sent*).
- **Browse the PeerTube directory**: [joinpeertube.org](https://joinpeertube.org/instances)'s list of servers,
  with:
  - a search box (*Search servers by name or description*) and **Search**;
  - a language (**Any language**, **English** (the default), **Spanish**, **French**, **German**, **Italian**,
    **Portuguese**, **Dutch**, **Japanese**);
  - a sort: **Most videos**, **Most followed**, **Most people** or **Newest**;
  - **Include servers that show NSFW** (off by default);
  - topic chips (**Gaming**, **How to**, **Science & tech**, **Comedy**, **Films**, **Travel**, **Music** and more),
    any number at once.

  Each server shows its name, address, description, number of videos, languages, topics and *shows NSFW* when it
  does, with **Follow**, or its state: **Waiting**, **Following**, **Declined** or **Blocked**. **Show more** loads
  the next page; **Close the PeerTube directory** hides it.

Videos marked sensitive stay out either way. A server accepts the follow by itself or after its admin approves
it; until then it shows as waiting. The servers you follow are listed under the panel with their state, each
with a × (*Unfollow*). Set `PEERTUBE_DIRECTORY_URL` to use another directory with the same API.

## Comments across servers

On a video from the fediverse (or from another OurTube server), the comment box sends your comment to the
server that hosts the video.

- **From an OurTube server** you get an answer: the comment shows *Waiting for <server>* (*Sent. It shows up once
  <server> accepts it.*), then appears, or shows *Not accepted* with the reason (a held comment waits until the
  uploader there approves it).
- **PeerTube** doesn't answer: your comment shows until the video's thread on PeerTube has it.
- *Comments are off on this video* when the video's own server turned comments off.
- You can delete your own comments; moderators here can delete comments sent from this server.
- A comment refused outright by the other server (because it blocks this one, say) shows *Not accepted: <server>
  refused it (HTTP 403)*.

## Mastodon

- Channel pages have **Follow from there** (under **On the fediverse** on the **About** tab), which opens the
  follow page on the viewer's own server.
- Follow buttons on other servers can point back here (`/authorize_interaction`).
- **Support links** show as profile fields.
- `/help/fediverse` explains all of this for viewers.

## PeerTube

PeerTube channels can be followed from OurTube and the other way round, and each side plays the other's videos.
PeerTube comments and likes work in both directions. PeerTube admins can follow this whole site
(`@clips.example.com@clips.example.com`) from their server's follows page, and OurTube admins can follow whole
PeerTube servers ([Following a whole server](#following-a-whole-server)).

## Moderation

- **Blocked servers are blocked for ActivityPub too.** Block a Mastodon or PeerTube server the same way as an
  OurTube one: Admin → Network → **Blocked instances**, type its address, **Block**. Its videos leave, its
  activities are refused (*This server is blocked here*), and nothing more is sent to it. See
  [Blocking and unlinking servers](Network.md#blocking-and-unlinking-servers).
- **Reports** about fediverse videos go to their server as a `Flag` from this server, not from the person who
  reported, and incoming reports join the moderation queue (marked with the reporting server, as *network* or
  *fediverse*). See [Moderation and Legal](Moderation-and-Legal.md#reports).
- Videos marked sensitive (NSFW) on their server never come in.
- Any one fediverse video can be hidden from its page (the shield menu, admins), like a network video.

## When a delivery fails

Everything sent to the fediverse (new videos, comments, likes, follows) goes through the job queue, one delivery
per receiving server, and a failed one is tried again: after 1 minute, 5 minutes, 30 minutes, then 2, 6, 12, 24
and 48 hours. That is nine tries over about four days before it is given up. Most failures fix themselves.

**Errors that are retried:**

- the other server is down, slow or busy (timeouts, 5xx, 408, 425, 429);
- **"ActivityPub signature could not be checked"** from PeerTube, and **"Unable to fetch key"** from Mastodon. They
  mean the other server couldn't fetch this server's public key at that moment (this server was restarting, or
  couldn't be reached), not that something is wrong with the key. The next try usually goes through.

**Errors that stop at once:** any other 4xx answer (bad request, gone, forbidden), which usually means the other
server blocks this one or refuses what was sent. A comment refused that way says so under it.

**Where to look:** **Admin → Debugging**:

- **Job queue**: the **network** lane's **Waiting** and **Failed** counts. **Recent failures** lists given-up
  deliveries as `ap.deliver #1234` with the last error.
- **Recent warnings and errors**: `ap.deliver #1234 failed after 9 attempt(s): …` once one is given up.
- **Network and fediverse**: whether **ActivityPub** is on, and the following and follower counts.

**If deliveries keep failing for every server:**

1. Check that the Public URL (Admin → Overview) is the `https://` address the site is really reached at.
2. From outside your network, open these two; both should answer. Other servers fetch them to check signatures.

   ```
   https://your.site/ap/actor
   https://your.site/.well-known/webfinger?resource=acct:name@your.site
   ```
3. Make sure nothing in front of the site (a firewall, a tunnel, bot protection) blocks requests from other
   servers to `/ap/` and `/.well-known/`.
4. Check that the server's clock is right: signatures carry the time, and this server refuses ones more than an
   hour off.

More fixes in [Troubleshooting](Troubleshooting.md#the-fediverse).

**On the receiving side**, this server answers activities it refuses with a reason other servers' admins can see
in their logs: *Bad HTTP signature*, *Signature date too far off*, *Digest does not match the body*, *This server
is blocked here*, or *Slow down* (more than 300 activities a minute from one server).

## Linked accounts

If you have accounts on several OurTube servers (or an OurTube account and a Mastodon one), link them, and
every server shows them as one person. Unlike a move, nothing goes away: each account keeps its own videos,
subscribers and login.

**Linking.** In Settings → **Channel** → **Linked accounts**, enter your other account (`@you@other-site.example`)
and click **Link**, then do the same on the other site for this account (its handle is shown under the box, with
**Copy**). A link counts once **both accounts list each other**, so nobody can claim an account that isn't
theirs. When you link on one site first, the other one shows the new account under *These accounts say they're
you*, with a **Link back** button. Up to five accounts can be linked.

Each link shows **Linked both ways** or **Waiting for it to link back** (and *has a channel* when it has one).
**Check again** asks the other side again, and the × (*Unlink*) removes a link. Linking needs ActivityPub and the
Public URL; without them the section says to ask an admin.

**Mastodon** accounts take part through an account alias: on Mastodon, open Preferences → Account → *Moving
from a different account* and add your OurTube account there (it moves nothing). Then click **Check again** on
OurTube.

**What people see** once a link counts:

- **Also on** on your channel page, with a check mark, linking to each of your other accounts;
- **Subscribe to all**, which subscribes to your channel here and follows your channels elsewhere in one click
  (a Mastodon account has no videos to follow, so it is left out);
- an **All accounts** filter on your channel's videos, which brings in your videos from the other servers;
- your comments from any of your accounts with the **uploader's mark** on your own videos. They also skip the
  spam check that holds names imitating the uploader.

**Under the hood.** Linked accounts are published in your account's `alsoKnownAs`, next to old accounts from
*Moving here*, and your channel page carries `rel="me"` links to them, so Mastodon can verify a profile link to
your channel. Each server checks the other side whenever an account changes and twice a day, and drops the link
as soon as either side removes it.

## Moving a channel

To move to another server, use Settings → **Account** → **Moving to another site** (`/settings/account#move`) on
both servers:

1. **Export** the channel on the old server: one archive with the videos, thumbnails, captions, comments and the
   subscriber list.
2. **Import** it on the new server, from the export's private link or by uploading the archive.
3. On the new server, add the old account as an alias (Settings → Account → *Moving here*).
4. On the old server, **move**.

Fediverse followers get an ActivityPub `Move` and follow the new channel; subscribers on the old server and on
other OurTube servers are moved too, and the old channel points to the new one. When a fediverse account that
people here follow moves, OurTube follows the move.

**Moving out, step by step**

1. **On the old server:** **1. Export this channel** → **Export channel**. It is *Preparing…*, then *ready*, and is
   kept for 7 days. **Channel archive** downloads it; **Copy link** copies a private link for the new server
   (anyone with that link can download the archive until it expires, so only paste it there).
2. **On the new server:** **2. Import a channel here**: paste the link and click **Import**, or **Upload archive
   (.tar)**. Leave *Also bring over the name, description, picture and links* ticked to copy the profile too. When
   it is done it says how many videos and comments came over, how many were already there, and how many
   subscribers the old channel has (they come along at the move). The videos are processed again on the new server.
3. **On the new server:** **3. Move** → **Moving here**: type the old account (`@you@old-site.example`) and click
   **Add**. This proves both accounts are yours; the old server checks it before it moves anyone. An account can
   list up to 10 old accounts.
4. **On the old server:** **3. Move** → **Moving away**: type the new account in **New account**, your
   **Password**, and click **Move channel**. It confirms how many subscribers and followers go (*Moved. Subscribers
   are on their way.*).

After the move:

- the old channel's page says *This channel moved to …. New videos are posted there.*, and people who aren't
  subscribed get **Go to the new channel** instead of **Subscribe**;
- subscribers here, on other OurTube servers and on the fediverse are moved to the new channel;
- the videos on the old server stay until you delete them;
- **Undo the move** on the old server stops it pointing at the new channel. People who already moved stay with the
  new one.

**Moving in from elsewhere.** **Moving here** takes any fediverse account or channel, so an account on a server
that supports moving its followers (Mastodon: Preferences → Account → *Moving to a different account*) can send
its followers to your OurTube account once you've added it here. The channel import only reads OurTube exports.

If the move is refused with *… doesn't list … as an old account yet*, step 3 hasn't been done (or the new server
hasn't sent its profile yet): add the alias on the new server and try again. Moving needs ActivityPub and the
Public URL on both servers.

## The help page

`/help/fediverse` (*Following from the fediverse*) explains following and moving to viewers, with this server's
own handles filled in: following from Mastodon (and GoToSocial, Misskey, Pleroma), following from PeerTube
(channels and the whole server), following fediverse channels from here, moving a channel, and what stays
here (private and unlisted videos, and videos with *share with the network* turned off). It is linked from
**On the fediverse** on every channel's **About** tab (*Following from Mastodon and PeerTube*) and from **Moving to
another site** in Settings (*How moving works*). When ActivityPub is off it says so at the top.

## Checked against real servers

`scripts/fediverse-sandbox.sh <ssh-host>` starts **PeerTube 7.3**, **GoToSocial 0.22** and an OurTube built
from your working tree in a private Docker sandbox on that host (an internal network with its own certificate
authority; nothing is exposed), runs the interop checks and cleans up. Add `--keep` to leave it running for a
look around.

```bash
scripts/fediverse-sandbox.sh user@docker-host
```

## Under the hood

- **Discovery:** WebFinger, NodeInfo (`/nodeinfo/2.0`) and host-meta.
- **Actors:** accounts at `/ap/users/<name>`, channels at `/ap/channels/<name>`, the server itself at `/ap/actor`,
  with a shared inbox at `/ap/inbox`.
- **Security:** RSA HTTP Signatures (draft-cavage, `rsa-sha256`) on every delivery and fetch, checked on every
  incoming activity.
- **Delivery:** through the job queue, retried for about four days (see
  [When a delivery fails](#when-a-delivery-fails)).
- **Extensions:** a few OurTube fields (the game, counts, a report reason) under the `cliptube:` context; other
  software ignores them. Details in
  [docs/federation.md](https://github.com/JawshTheDark/ourtube/blob/main/docs/federation.md).
