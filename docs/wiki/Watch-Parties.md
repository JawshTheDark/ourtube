# Watch Parties

Watch videos with friends at the same moment, with chat and reactions. Friends don't need an account: anyone
with the link can join under a name, including people from other servers.

- [Starting one](#starting-one)
- [Inviting and joining](#inviting-and-joining)
- [Watching together](#watching-together)
- [The party page](#the-party-page)
- [The queue](#the-queue)
- [Chat and reactions](#chat-and-reactions)
- [The host's controls](#the-hosts-controls)
- [Guests from other servers](#guests-from-other-servers)
- [Limits](#limits)
- [Under the hood](#under-the-hood)

## Starting one

**Watch together** starts a party and opens it at `/party/<id>`. It is on:

- the watch page of any public or unlisted video on this server, next to **Share** and **Save**;
- the watch page of a video from another server in the network;
- a playlist's page, next to **Play all**, which starts the party with the whole playlist as its queue.

Hosting needs an account on this server; without one, **Watch together** takes you to sign in first. The party is
named after the video or the playlist, and the person who started it is its host.

There is no list of your parties on the website, so keep the link (or the tab) of a party you want to get back
to.

## Inviting and joining

**Invite** on the party page copies its link (*Invite link copied*). Send it however you like. Anyone with the link
can join:

- **People with an account here** join as themselves as soon as they open the link, signed in.
- **Everyone else** sees **Join the watch party**: *Pick a name the others will see. No account needed.* Type a
  name (2 to 32 characters) and click **Join**. Someone with an account here can click **Sign in** on that form to
  join as themselves instead.

A guest's place in the party is remembered in that browser, so reloading the page or coming back later keeps the
same name. A guest who clears the browser's data joins again as someone new.

## Watching together

- Everyone's player follows the party: play, pause, seeking, and which video is on.
- Players keep themselves in step with the server's clock. One that is more than a second off jumps back in;
  smaller drift is corrected by playing very slightly faster or slower, so everyone stays within a fraction of a
  second.
- If your browser blocks videos from starting on their own, click **Join the playback** once.
- By default only the host steers. Without control, pausing takes you out of step for yourself only, and **Back
  to the party** rejoins.
- When a video ends, the party moves on to the next one in the queue. After the last one, playback stops.

## The party page

| Where | What is there |
| --- | --- |
| The player | The current video, with the reactions floating up over it |
| Under the player | The party's name, *Hosted by …*, how many are watching, *you can steer* when you can, and *reconnecting…* while the connection is down |
| The buttons beside it | **Back to the party** (when you stepped out), **Previous video** and **Next video** (for whoever can steer), **Invite**, and the settings button, *Party settings* (host only) |
| The row of emoji | Reactions |
| **Queue** | The videos, in order, with the one playing marked |
| **Watching** (beside the player) | Everyone in the party right now. The host has a star, and guests have a *guest* badge |
| **Chat** | The party's chat |

An empty party says *Nothing in the queue* (and *Add a video below to start watching.* to whoever can steer).

## The queue

Whoever can steer (see [the host's controls](#the-hosts-controls)) manages the queue:

- **Add a video:** paste a link to a video on this server (a `/watch/…` link) or one from **Network** (a `/n/…`
  link) into *Paste a link to a video on this site*, and click **Add**. Links to other websites don't work; open
  the video from Network here first and copy that link.
- **Add a playlist:** **Add one of your playlists…** adds all of one of your playlists (signed-in people with
  playlists that have videos in them).
- **Reorder:** **Move up** and **Move down** on each video.
- **Remove:** **Remove from the queue**. Removing the video that's playing moves the party to the next one, paused.
- **Play one now:** click it.

A video that has since been deleted or made private stays in the list as *No longer available* and can't be
played. A queue holds up to 500 videos.

## Chat and reactions

The chat sits beside the player. Messages are up to 500 characters; people who join later see the last 100. The
emoji under the player float up over the video for everyone. Anyone can remove their own messages (**remove**), and
the host can remove anyone's.

Both are rate limited: about five messages and ten reactions every five seconds per person, after which the
server says *Slow down a little*.

## The host's controls

The settings button beside **Invite** (*Party settings*, host only) opens a menu:

- **Everyone can steer** lets anyone in the party control playback and the queue.
- **Lock: nobody new joins** keeps newcomers out, guests and people with an account alike; people who were already
  in can come back.
- **End the party** closes it for everyone, after a confirmation. Everyone sees *The host ended this watch party*,
  and its queue, chat and guests are deleted.

The × next to someone's name in **Watching** removes them from the party for good (*The host removed you from
this party*). While the host is away, anyone in the party can steer, so it never gets stuck. Parties nobody has
used for a day end on their own once everyone has left.

## Guests from other servers

Watch parties are open to anyone with the link, so a friend on another OurTube server (or with no account
anywhere) joins as a guest under a name of their choosing. Guests can watch, chat, react and steer when the host
lets everyone steer (or while the host is away). They can't add their own playlists, since those live on their
own server; they add videos by pasting links from this server.

To host a party, you need an account on the server you host it on. Videos from the network play from the server
that hosts them, as they do everywhere else.

## Limits

| Limit | Value |
| --- | --- |
| Parties one person can host at once | 5 (*You can host up to 5 watch parties at once. End one first.*) |
| Videos in a queue | 500 |
| Chat messages shown to someone joining | The last 100 |
| Length of a chat message | 500 characters |
| A guest's name | 2 to 32 characters |
| An idle party | Ends a day after its last activity, once nobody is in it |

## Under the hood

Players hear about changes through server-sent events, which pass through reverse proxies (Nginx Proxy Manager
included) without any WebSocket settings. The server keeps the playback state as the video, whether it's playing,
the position, and the server time when that was true. Each browser works out how far its clock is from the
server's from a few quick round trips, and positions the video from that.

For apps, the API is under `/api/parties`: `POST /api/parties` starts one, `GET /api/parties/mine` lists the ones
you host, `GET /api/parties/<id>/events` is the event stream (guests pass their token as `?member=`), and `POST
/api/parties/<id>/control`, `/chat`, `/react` and `/queue` act in it. Guests get their token from `POST
/api/parties/<id>/join` and send it in the `x-room-member` header.
