# Channels and Playlists

Channel pages, subscribing, notifications, and everything you keep: history, liked videos, Watch later and
playlists. Watching itself is in [Watching and Discovery](Watching-and-Discovery.md); changing your own channel's
name, picture and description is in [Accounts and Settings](Accounts-and-Settings.md#picture-name-and-description).

- [Channel pages](#channel-pages)
- [Subscribing](#subscribing)
- [Subscriptions and notifications](#subscriptions-and-notifications)
- [History](#history)
- [Liked videos](#liked-videos)
- [Watch later](#watch-later)
- [Playlists](#playlists)
- [Saving a video to a playlist](#saving-a-video-to-a-playlist)
- [A playlist's page](#a-playlists-page)
- [Editing a playlist](#editing-a-playlist)
- [Playing a playlist](#playing-a-playlist)
- [Feeds](#feeds)

## Channel pages

Every account has a channel at `/c/<username>`. Get there by clicking a channel's picture or name on any card or
watch page, from sidebar → **Your channel** (or your picture → **View your channel**) for your own, and from the
channels listed under **Subscriptions** in the sidebar. A channel on another server opens on that server.

**The header** shows the picture, the name, `@username`, the server (in a network), and the number of subscribers,
videos and views, then the channel's description. Below that, when they apply:

- a **LIVE** banner with the stream's title while the channel is live (see [Live Streaming](Live-Streaming.md));
- **Also on** with a chip for each [linked account](Fediverse.md#linked-accounts) on another site: the same person,
  verified both ways;
- *This channel moved to …* when the channel [moved to another site](Fediverse.md#moving-a-channel).

**The buttons:**

| Button | What it does | Shown |
| --- | --- | --- |
| **Subscribe** / **Subscribed** | Subscribe, or unsubscribe (see [Subscribing](#subscribing)) | Other people's channels |
| **Go to the new channel** | Opens the channel's new home | Instead of Subscribe, on a moved channel you don't subscribe to |
| **Subscribe to all** *N* | Subscribes here and follows the person's linked channels elsewhere too | Channels with linked accounts that have channels |
| Flag icon | [Report](Watching-and-Discovery.md#reporting) the channel | Other people's channels, signed in |
| **Customize channel** | Opens Settings → **Channel** (see [Channel tab](Accounts-and-Settings.md#channel-tab)) | Your own channel |
| **Manage videos** | Opens [Studio](Studio-and-Analytics.md#studio) | Your own channel |
| **Support** | The channel's [support links](Watching-and-Discovery.md#support-links) | When it has any |
| Feed icon | The channel's Atom feed (the tooltip gives the RSS address too); see [Feeds](#feeds) | Always |

**The tabs:**

| Tab | What's on it |
| --- | --- |
| **Videos** | The channel's public videos, with the chips **Latest** (the default), **Popular** (most viewed) and **Oldest**. **All accounts** (with linked accounts only) mixes in the videos of the person's linked channels on other servers, as far as this server knows them. On your own channel you also see your unlisted, private and group videos, each with a badge. |
| **Playlists** | The channel's public playlists |
| **About** | **Description**, **Support** (the links with their sites), **On the fediverse** (the handles to follow the channel from Mastodon or PeerTube, with copy buttons, when the server is on the fediverse), and **Stats**: when it joined, total views and number of videos |

## Subscribing

Click **Subscribe** on a channel page or under any of its videos (signing in first). The button turns into
**Subscribed**; click it again to unsubscribe (*Subscription removed*).

- There is no separate bell per channel: every channel you subscribe to tells you about its new uploads. Whether
  that also comes as a push notification or an email is one setting for all channels, in Settings →
  **Notifications** (see [What reaches you](Accounts-and-Settings.md#what-reaches-you)).
- Channels on other OurTube servers in the network: subscribe on their watch page here (the one at `/n/…`), when the
  network allows subscriptions between servers.
- Channels on the fediverse (PeerTube, Mastodon): see [Following out](Fediverse.md#following-out).
- **Subscribe to all** *N* on the channel page subscribes here and follows the person's linked channels on other
  servers in one go.

## Subscriptions and notifications

**Subscriptions** (sidebar → **Subscriptions**, `/subscriptions`) shows a row of the channels you subscribe to (other
servers' channels open on their server), then the newest public videos from all of them, here and in the network.
At the bottom is the form to follow a channel on the fediverse (see [Fediverse](Fediverse.md#following-out)). The
sidebar also lists your subscriptions under the **Subscriptions** heading.

**The bell** in the top bar counts what you haven't read and lists the latest notifications; **See all** opens
`/notifications`. It tells you about new uploads from your subscriptions, those channels going live or moving,
replies and mentions, comments on your videos, moderation decisions and your groups. How the bell and the
notifications page work, and which kinds also reach you by push or email, are in
[The bell and the notifications page](Accounts-and-Settings.md#the-bell-and-the-notifications-page) and
[What reaches you](Accounts-and-Settings.md#what-reaches-you).

## History

Sidebar → **History** (`/history`) is your *Watch history*: the last 200 videos from this server you opened, newest
first, each with a bar showing how far you got. Videos from other servers aren't kept in it.

- **Pause history** stops adding videos and saving your place; **Resume history** starts again. The same switch is
  in Settings → **Watching** → [*Privacy*](Accounts-and-Settings.md#privacy).
- **Clear all** empties it, after a confirmation. Single videos can't be taken out one by one.
- **Anonymous mode** keeps one browser out of your history without pausing it everywhere (see
  [Privacy](Watching-and-Discovery.md#privacy)).

## Liked videos

Sidebar → **Liked** (`/liked`) lists the last 200 videos you liked, here and on other servers, the most recently
liked first. Take a like back with the thumbs-up on the video.

## Watch later

Sidebar → **Watch later** (`/watch-later`) opens your Watch later list. It's a playlist like the others, made for you,
with three differences: it is always private, it can't be renamed or deleted (its **Edit** only changes the
description), and it comes first everywhere you pick a playlist. Add to it with **Save** under any video.

## Playlists

A playlist is your list of videos, from this server or from the rest of the network, in the order you choose.
Sidebar → **Playlists** (`/playlists`) shows yours, Watch later first.

- **Make one:** type a **New playlist name**, pick who can see it, and click **Create**; the new playlist opens. Or
  start one from the **Save** dialog under a video (below).
- **Who can see it:** **Public** playlists show on your channel's **Playlists** tab, **Unlisted** ones open for
  anyone with the link, **Private** ones only for you.
- **Only you change your playlists.** Others can play your public and unlisted ones, but not add or remove videos.
- **Limits:** up to 200 playlists, and 500 videos in each. A video is in a playlist once; saving it again changes
  nothing.

On the Playlists page and the channel's **Playlists** tab, each playlist is a card: the thumbnail shows how many
videos it holds and plays the list from its first video; the title and **View full playlist** open its page.

## Saving a video to a playlist

**Save** under a video (on the watch page, for this server's and other servers' videos) opens **Save to…**:

- Each of your playlists, Watch later first, with a box: tick it to add the video (*Saved to …*), untick it to take
  it out (*Removed from …*). The icon after each name shows who can see it.
- **New playlist** opens a name field (**Playlist name**), a **Public** / **Unlisted** / **Private** choice and
  **Create**, which makes the playlist with the video already in it.
- **Done** closes the dialog.

## A playlist's page

`/playlist/<id>` shows the playlist's name, owner (a link to their channel), who can see it, the number of videos,
the total length and its description, then the videos in order. A playlist that doesn't exist, or is private to
someone else, says so.

| Button | What it does | Shown |
| --- | --- | --- |
| **Play all** | Plays it from the top | When it has a video to play |
| **Shuffle** | Plays it in a random order, starting anywhere | With two or more videos |
| **Watch together** | Starts a [watch party](Watch-Parties.md) with the playlist as the queue | When it has a video to play |
| **Edit** | Change its name, description and who can see it ([below](#editing-a-playlist)) | Its owner |
| Delete icon | Deletes the playlist after a confirmation; the videos stay where they are | Its owner (not on Watch later) |
| Feed icon | The playlist's feed ([Feeds](#feeds)) | Public and unlisted playlists |

Click a video to play the playlist from there. A video deleted from this server drops out of the list. One you can
no longer watch (made private, hidden by the moderators, or gone from the network) stays under its title, marked *No
longer available*; it can't be played and playing the list skips it. The owner can still remove it.

## Editing a playlist

On your playlist's page:

- **Edit** opens the name (not for Watch later), the **Description**, and who can see it: **Public: on your
  channel**, **Unlisted: anyone with the link** or **Private: only you**. **Save** keeps the changes, **Cancel**
  drops them.
- **Reorder** by dragging a video by its handle, or with the **Move up** and **Move down** arrows on its row.
- **Remove** a video with the **×** (*Remove from the playlist*) on its row. The video itself isn't touched.

## Playing a playlist

Playing from a playlist adds `?list=<id>` to the watch page's address, and puts the playlist at the top of the
right-hand column: its name (a link to its page), the owner and where you are (*3 / 12*), then the videos with the
current one marked ▶. Click any of them to jump there. When a video ends, the next one starts.

The three buttons in its corner:

| Button | What it does | Remembered |
| --- | --- | --- |
| **Shuffle** | Plays the list in a random order. The order stays the same while that browser tab is open, so going back and forth works. | No (it's in the address as `&shuffle=1`) |
| **Loop the playlist** | After the last video, starts again from the first | Yes, in that browser |
| **Autoplay** (*Autoplay is on* / *off*) | Whether the next video starts by itself when one ends. On by default. | Yes, in that browser |

Playlists work the same way for videos from other servers in the list.

## Feeds

Atom and RSS feeds for feed readers and podcast apps, with each video's thumbnail and its MP4 as an attachment:

| Feed | Address | Holds |
| --- | --- | --- |
| The whole site | `/feeds/videos.atom` | The 50 newest public videos |
| A channel | `/feeds/channel/<username>.atom` | The channel's 50 newest public videos |
| A game | `/feeds/game/<id>.atom` | The game's 50 newest public videos here |
| A playlist | `/feeds/playlist/<id>.atom` | The public and unlisted videos from this server in a public or unlisted playlist, the newest additions first |

Swap `.atom` for `.rss` for RSS. The feed icon on channel, game and playlist pages opens the Atom feed (its tooltip
gives the RSS address), and Home, channel, game and playlist pages announce their feed for readers that find feeds
by themselves. Feeds use the site's *Public URL* in their links (see
[Configuration](Configuration.md#admin--overview)).
