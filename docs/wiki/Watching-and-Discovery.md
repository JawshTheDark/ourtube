# Watching and Discovery

Finding videos, and everything on the page where you watch one. The sidebar and top bar are toured in
[Getting Started](Getting-Started.md#a-tour-of-the-screen); channels, subscriptions, history and playlists are in
[Channels and Playlists](Channels-and-Playlists.md); your own viewing settings are in
[Accounts and Settings](Accounts-and-Settings.md#watching-tab).

- [Home](#home)
- [Trending, Games and Network](#trending-games-and-network)
- [Search](#search)
- [Video cards](#video-cards)
- [Shorts](#shorts)
- [The watch page](#the-watch-page)
- [The player](#the-player)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Chapters](#chapters)
- [Captions and skippable parts](#captions-and-skippable-parts)
- [Comments](#comments)
- [Sharing and embedding](#sharing-and-embedding)
- [Downloads and the 720p copy](#downloads-and-the-720p-copy)
- [Community titles and thumbnails](#community-titles-and-thumbnails)
- [Reporting](#reporting)
- [Support links](#support-links)
- [Adaptive streaming](#adaptive-streaming)
- [What counts as a view](#what-counts-as-a-view)
- [Playlists](#playlists), [Feeds](#feeds), [Subscriptions and notifications](#subscriptions-and-notifications) and
  [Analytics](#analytics) (moved)
- [Privacy](#privacy)

## Home

Home (`/`: the logo, or sidebar → **Home**) lists the newest videos and loads more as you scroll. Live streams on
now sit above everything in a **Live now** row (see [Live Streaming](Live-Streaming.md#watching-and-chatting)).

At the top, **Everything**, **Videos** and **Shorts** pick what kind of video to show. Shorts are videos taller
than they are wide.

- **Everything**: landscape videos, with a **Shorts** shelf of the 12 newest Shorts after the first 8 videos.
  **See all** on the shelf opens the Shorts grid. The shelf is only on the plain newest-first list, not under
  **For you**, **Top rated** or a tag.
- **Videos**: landscape videos only.
- **Shorts**: a grid of Shorts. Clicking one opens the [Shorts viewer](#shorts).

Next to it, the chips:

| Chip | What it shows |
| --- | --- |
| **All** | Newest first. When the server is in a network, videos from the other servers are mixed in. |
| **This site** | Only videos hosted here. Shown only when the server is in a network. |
| **For you** | Signed in only. Public videos of the last 90 days, here and in the network, picked from channels you subscribe to and games and tags you like or watch. Your own videos are left out. |
| **Top rated** | Most likes minus dislikes first, then most views |
| Tag chips | The 30 most-used tags; each shows the videos with that tag (`/?tag=<tag>`) |

**Videos** or **Shorts** stays picked while you switch chips. The `#tags` under a video on its watch page also open
Home filtered to that tag.

**For you** says why each video is there, under its card: *New from …, a channel you subscribe to*, *Because you
liked "…"*, *Because you watch …*, *Popular in #…*, *More …, as you asked*, or *Popular on …* / *New on …*. A
**Hide watched** box above the list leaves out what's in your history. Each card has a ⋯ menu (*Tune this feed*):

| Menu item | Effect |
| --- | --- |
| **Not interested** | This video never shows in For you again |
| **More** *game* / **Less** *game* | Weighs that game up or down (only when the video has a game) |
| **More from** *channel* / **Less from** *channel* | Weighs that channel up or down |

**Not interested** and the **Less** choices take the card away at once. The **All** chip stays newest-first whatever
you choose here.

Two [Watching settings](Accounts-and-Settings.md#watching-preferences) change Home: **Keep Shorts off the home
page** takes the Shorts shelf away and makes **Everything** and **Top rated** landscape-only (tag chips and the
**Shorts** button still show Shorts), and **Layout density** sizes the cards (**Dense** fits two a row even on a
phone).

## Trending, Games and Network

- **Trending** (sidebar → **Trending**, `/trending`): every public video by its view count, most viewed first, here
  and (in a network) on the other servers. It has no chips.
- **Games** (sidebar → **Games**, `/games`): every game with its videos. See
  [Video Tools and Games](Video-Tools-and-Games.md#games).
- **Network** (sidebar → **Network**, `/network`, only on servers that link with others): videos from the other
  OurTube servers and the fediverse channels followed here. The chips are **All instances** (newest), **Most
  viewed**, and one per server, with fediverse servers after a *Fediverse* label. See [Network](Network.md).

## Search

Type in the **Search** box in the top bar and press Enter (on a phone, tap the magnifier first). Results are at
`/results?q=<words>`.

What is searched: the title, description, tags, game (its name, short name and other spellings) and channel (name
and username) of every public video here and, in a network, on the other servers this one knows. A match in the
title counts most, then the game, the tags, the channel and the description. Each word also matches longer words
that start with it (`valo` finds *Valorant*). Put words in "quotes" for an exact phrase. Unlisted, private, group
and draft videos never show up in search. Results are videos only; to find a channel, search its name and open it
from one of its videos.

The filters above the results:

| Filter | Choices |
| --- | --- |
| Sort | **Relevance** (the default), **Upload date** (newest first), **View count** |
| Length | **Any length**, **Under a minute**, **1 to 20 minutes**, **Over 20 minutes** |
| Uploaded | **Any time**, **Today** (the last 24 hours), **This week** (7 days), **This month** (30 days), **This year** (365 days) |
| Shape | **Any shape**, **Landscape**, **Vertical** |
| Game | **Any game**, or one game from the site's list (shown once the site has games) |
| Where | In a network only: **Everywhere**, **This site**, **Other instances**, or one server, listed under *OurTube servers* and *Fediverse* |

The filters are part of the address, so a filtered search can be bookmarked or shared. Each result shows its views,
age, channel, game and the start of its description.

## Video cards

Every list of videos uses the same cards:

- the thumbnail, with the length in the corner (and, on your [History](Channels-and-Playlists.md#history) page, a
  bar showing how far you got);
- when the server is in a network, a coloured tag naming the server the video lives on (each server keeps its
  colour on every server);
- the title, the channel, the game (a link to its page), the views and how long ago it was posted;
- on your own unlisted, private or group videos, a small badge saying so.

Rest the pointer on a thumbnail for a moment and it plays a silent preview. The channel of a video from another
server opens on that server, in a new tab.

## Shorts

The Shorts viewer shows one Short at a time, full height, each in a frame of its own shape, looping. Open it from
sidebar → **Shorts** (`/shorts`), or click any Short on Home, the Shorts grid or the shelf. It starts with the Short
you clicked and goes on with the newest Shorts.

| To | Do |
| --- | --- |
| Go to the next or previous Short | Scroll (one turn of the wheel is one Short), swipe, press `↓` / `↑` or `Page Down` / `Page Up`, or use the arrow buttons beside it |
| Pause or play | Click or tap the video, or press `Space` or `k` |
| Mute or unmute | The speaker button on the Short, or `m`; it stays that way for the next ones |
| Jump within the Short | Click the progress line along its bottom |

Shorts start with sound. If the browser won't play sound before you've touched the page, the Short starts muted;
tap the speaker to turn the sound on.

The buttons beside the Short:

| Button | What it does |
| --- | --- |
| Thumbs up (with the count) | Like it; click again to take the like back |
| **Dislike** | Dislike it |
| **Comments** (with the count) | Opens the comments beside it, or from the bottom on a phone. Same comment box and actions as on the watch page; see [Comments](#comments). |
| **Share** | Copies the link to this Short |
| **Full page** | Opens the normal [watch page](#the-watch-page), with the rest of the buttons |

The channel's name and the title sit at the bottom of the Short; both are links. The address in the bar follows
along, so it is always the Short on screen. For a Short from another server, the like and comment buttons only work
when the network allows likes and comments between servers.

## The watch page

`/watch/<id>`. From top to bottom:

1. The [player](#the-player).
2. The title. With community titles turned on, a link after it says **community title · show original**.
3. Under the title, when they apply: **Only for** *group* (the video is shared with one of your
   [groups](Uploading-and-Editing.md#groups-videos-for-family-and-friends); click to open it), the game (opens its
   page), *Clipped from* *video* *by @user* for clips, and **Looping** *start*–*end* when the link loops a range
   (click it to stop looping, again to loop).
4. The channel row and the buttons (below).
5. The description box: views, the upload date, the tags (each opens Home with that tag), and the description,
   where web addresses and times like `1:23` are links. Click the box or **...more** to see all of it, **Show less**
   to fold it. Unfolded, it ends with a link to the site's **Rules, copyright and contact** page.
6. The [comments](#comments).

To the right (below, on a narrow screen): the playlist you're playing from, if any (see
[Playing a playlist](Channels-and-Playlists.md#playing-a-playlist)), then up to 20 related videos from this server:
the ones sharing the most tags first, then the same channel's, then the newest.

**The channel row:** the uploader's picture and name (both open the channel), the server and the subscriber count,
and **Subscribe** / **Subscribed** (click **Subscribed** to unsubscribe). On your own video you get **Details**
(the [video details page](Uploading-and-Editing.md#video-details)) and **Editor** (the
[timeline editor](Uploading-and-Editing.md#the-timeline-editor)) instead. **Support** appears when the uploader has
[support links](#support-links).

**The buttons:**

| Button | What it does | Shown |
| --- | --- | --- |
| Thumbs up / down | Like or dislike, with the counts. Click the same one again to take it back. | Always (signing in is needed to vote) |
| **Share** | The [share dialog](#sharing-and-embedding): link, start time, looping range, embed code | Always |
| **Save** | Adds the video to **Watch later** or a playlist (see [Playlists](Channels-and-Playlists.md#playlists)) | Once processed; signed out, it asks you to sign in |
| **Watch together** | Starts a [watch party](Watch-Parties.md) with this video | Public and unlisted videos, once processed |
| **Clip** | Make a clip, a GIF or a short MP4 (see [Video Tools and Games](Video-Tools-and-Games.md#clip-a-moment)) | Signed in, once processed |
| Compare icon | Opens [Compare](Video-Tools-and-Games.md#compare) with this video on one side | Once processed |
| **Download** | The MP4, or a menu with the original (see [Downloads](#downloads-and-the-720p-copy)) | Once processed |
| ⋯ (*More*) | **Add captions**, **Mark a skippable part**, **Suggest a title or thumbnail** | Signed in, once processed |
| Theater icon | Theater mode: a wider player with the rest below it (`t`) | Always |
| **Edit** | The video's details page | Admins, on other people's videos |
| Flag icon | [Report](#reporting) the video | Signed in, not on your own videos |
| Gavel icon | Moderator tools: **Hide from everyone else**, **Remove (rule or copyright violation)**, or **Restore video** | Moderators and admins |

The dislike count is left out when the admin turned off *Show dislike counts*; uploaders always see their own. What
hiding and removing do is in [Moderation and Legal](Moderation-and-Legal.md#hiding-and-removing-videos).

**While a video is processing**, the player's place says *Waiting in the processing queue* or *Processing N%* and
the page refreshes by itself. The link already works: it starts playing once processing is done. If processing
failed, the page says **Processing failed** and, for the uploader, offers **Open Studio to retry**.

**Hidden or removed videos** show their uploader a banner with the moderators' reason and a button: **Ask the
moderators to look again** for a hidden video, **This was a mistake: send a counter-notice** for a removed one. See
[Moderation and Legal](Moderation-and-Legal.md#copyright-notices).

**Picking up where you left off:** signed in, a video starts where you stopped (when that was more than 3 seconds
in and more than 5 seconds before the end). While your history is paused or anonymous mode is on, new places aren't
saved. A link with a time in it (`?t=`) starts exactly there.

**Videos from other servers** in the network open at `/n/<server>/<id>`, on a page laid out the same way. There,
**Share** copies the link to the original, an open icon (*Open on* *server*) opens it on its own server, and a note
says *Hosted on* *server*: your likes, comments and subscription go to that server. When the network doesn't allow
likes or comments between servers, the like count is shown without buttons and the comments say so. There is no
Download, Clip or ⋯ menu, and these videos don't go into your history.

## The player

The controls are OurTube's own. Along the bottom of the video:

- **The seek bar**: what has loaded, the chapters as separate pieces, and the skippable parts marked on it.
  Hovering shows the time there and the chapter (or the kind of skippable part). Click to jump, or drag; the picture
  follows while you drag.
- **Play / pause**.
- **The speaker**: mute and unmute. Hover it for the volume slider.
- **The time**, as current / total, and after it the current chapter's title.
- **The captions button** (*Captions on* / *Captions off*), only when the video has captions. It turns on the first
  language; the gear picks another.
- **The gear**: the settings menu (below).
- **Theater mode** (not shown in full screen).
- **Full screen** / **Exit full screen**.

Click the video to pause or play (on a touch screen, the first tap shows the controls); double-click it for full
screen. A big play button shows before the video starts, and a replay button when it ends. The controls hide after
2.5 seconds without moving the pointer while the video plays, and when the pointer leaves it.

The gear's menu:

| Entry | Choices | Remembered |
| --- | --- | --- |
| **Quality** | Every rendition, highest first, like **Source (1080p60)**, **720p**, **480p**, then **Auto**. While on Auto, the entry says which one is playing, like **Auto (720p)**. Only shown for videos with [adaptive streaming](#adaptive-streaming). | Yes |
| **Speed** | **0.25x**, **0.5x**, **0.75x**, **Normal**, **1.25x**, **1.5x**, **1.75x**, **2x** | No: each video starts at Normal |
| **Captions** | **Off**, or one of the languages | Whether captions are on |

Volume, mute, quality, captions on or off, and theater mode are remembered in that browser. Safari plays adaptive
streams itself and has no Quality entry.

There is no loop button and no picture-in-picture button in the player. To play a part over and over, make a looping
link: **Share** → **Loop a range** (see [Sharing and embedding](#sharing-and-embedding)).

Live streams show **LIVE** instead of the seek bar; clicking it jumps back to the live edge (see
[Live Streaming](Live-Streaming.md#watching-and-chatting)).

## Keyboard shortcuts

These work anywhere on a watch page (this server's videos, other servers' and live streams), except while you're
typing in a box, and not while Ctrl, Alt or Cmd is held.

| Key | Action |
| --- | --- |
| `Space` or `k` | Play or pause |
| `j` / `l` | Back or forward 10 seconds |
| `←` / `→` | Back or forward 5 seconds |
| `↑` / `↓` | Volume up or down (a tenth at a time) |
| `m` | Mute or unmute |
| `f` | Full screen on or off |
| `t` | Theater mode on or off (not on live streams) |
| `0` to `9` | Jump to 0% to 90% of the video |
| `,` / `.` | Back or forward one frame (1/30 of a second), while paused |

Elsewhere:

| Where | Key | Action |
| --- | --- | --- |
| Comment box | `Ctrl+Enter` (`Cmd+Enter` on a Mac) | Post the comment or reply |
| Dialogs (Share, Report, captions, …) | `Esc` | Close |
| Shorts viewer | see [Shorts](#shorts) | |
| Timeline editor | see [Editor shortcuts](Uploading-and-Editing.md#editor-shortcuts) | |

The sidebar's footer reminds you of the main ones.

## Chapters

Put the chapters in the description, one per line, the way YouTube and PeerTube read them:

```
0:00 Intro
1:23 The cave
12:05 Boss fight
```

Times can also go after the title (`Boss fight - 12:05`) or in brackets (`[1:23]`, `(1:23)`), and a `-`, `–`, `:`
or `|` between time and title is fine. It takes at least two chapters, in order (a line whose time isn't after the
one before is skipped); if the first starts after 0:00, an untitled one fills the start. Chapter titles are cut at
100 characters.

The seek bar splits at each chapter, hovering it names the chapter, and the current one shows after the time.
Videos from PeerTube bring the chapters set on their server. Every time in a description is a link that jumps the
video there, chapters or not.

## Captions and skippable parts

**Captions** the uploader published show up in the player: the captions button turns them on, the gear →
**Captions** picks the language. [**Turn captions on when a video has
them**](Accounts-and-Settings.md#watching-preferences) starts every video with them on.

To add captions to someone's video: ⋯ → **Add captions**. Choose a WebVTT (`.vtt`) or SubRip (`.srt`) **File**, a
**Language code** (`en`, `es`, `pt-BR`) and a **Name in the menu** (`English`), then **Upload**. They appear once the
uploader publishes them (yours appear at once on your own videos). You can have one set waiting per video. Captions
are written by people; nothing is generated or machine-translated.

**Skippable parts** are sponsor reads, intros, outros, recaps and self-promotion marked by the uploader. They're
marked on the seek bar. What happens when the video reaches one is one choice for all kinds, in Settings →
**Watching** → [**Sponsor reads, intros and other marked parts**](Accounts-and-Settings.md#watching-preferences):

| Choice | What happens |
| --- | --- |
| **Skip them automatically** | The player jumps past it and shows **Skipped** *kind* **· Undo** for a few seconds |
| **Show a Skip button** (the default) | A **Skip** *kind* button appears while it plays |
| **Don't skip** | Nothing |

To suggest one: ⋯ → **Mark a skippable part**. Pick **What is it?** (**Sponsor**, **Intro**, **Outro**, **Recap** or
**Self-promotion**), set **Start** and **End** (type a time, nudge it with **−** and **+** by a tenth of a second, or
click **Now** for where the video is), then **Suggest** (on your own video the button says **Add** and it applies at
once). A part is at least a second long; you can have up to five suggestions waiting on a video.

How uploaders publish captions and accept suggestions: [Captions](Uploading-and-Editing.md#captions) and
[Skippable parts](Uploading-and-Editing.md#skippable-parts).

## Comments

The comments are under the description. The heading counts them; on a video from another server it says which
server they live on, and the uploader also sees how many are **waiting for review**.

**Writing:** click **Add a comment...**. **Add time** puts in the moment the video is at, which becomes a link to
it. **Comment** (or `Ctrl+Enter`) posts it; **Cancel** clears it. A comment is up to 2,000 characters. Web addresses
and times like `1:23` or `1:02:03` in comments are links; a time jumps the video there. Signed out, you get *Sign in
to join the conversation*.

**Order:** the pinned comment first, then newest first. Replies sit under their comment behind **▼** *N* **replies**,
oldest first. Threads are one level deep: replying to a reply adds to the same thread.

What you can do with a comment:

| Button | What it does | Who |
| --- | --- | --- |
| **Reply** | Opens a reply box under it | Anyone signed in, while comments are open |
| **Delete** | Deletes it (and its replies), after a confirmation | Its author, the video's uploader, moderators |
| **Report** | [Reports](#reporting) it | Anyone signed in, on comments they can't delete |
| Heart | Marks it with the uploader's heart (*The uploader loved this*); click again to remove | The uploader |
| **Pin** / **Unpin** | Puts it first with *Pinned by the uploader*; pinning another unpins the old one | The uploader, on top-level comments |
| **Approve** | Publishes a held comment | The uploader and moderators |

Comments can't be edited (delete and write it again), liked or re-sorted.

**Held for review:** spam checks, the uploader's blocked words or the uploader's review setting can hold a comment
back. It is then visible only to you (marked **Held for review**, with the reason), the uploader and moderators,
until it's approved. On a video from another server, your comment shows **Waiting for** *server* until that server
accepts it, or **Not accepted** with its reason. Uploaders review held comments in place or in
[Studio → Comments to review](Studio-and-Analytics.md#comments-to-review); the spam rules are in
[Moderation and Legal](Moderation-and-Legal.md#comments-and-spam).

**Comments turned off:** the uploader can turn comments off for a video (*Comments are turned off for this video*),
or hold every comment for review. See [Video details](Uploading-and-Editing.md#video-details), and for the default
on all your videos, [Comments on your videos](Accounts-and-Settings.md#comments-on-your-videos).

Names link to the person's channel; people from other servers have a globe icon and link to their profile there. The
uploader's name is highlighted, and a link icon marks the uploader commenting from a
[linked account](Fediverse.md#linked-accounts) on another site.

## Sharing and embedding

**Share** under a video opens a dialog:

- The link, with **Copy** (it copies and closes the dialog).
- **Start at** *time*: the link starts the video at that moment (`?t=<seconds>`). It's the moment the video was at
  when you opened the dialog.
- **Loop a range**: the link plays one part over and over (`?t=<start>&end=<end>`). Set **Start** and **End** with
  the time fields (**−** / **+** by a tenth of a second, **Now** for the current moment). See
  [Looping links](Video-Tools-and-Games.md#looping-links).
- **Embed on a website** (public and unlisted videos only): the code for a player on another site, and **Copy embed
  code**.
- A line saying who can open the link: anyone (public), anyone with the link (unlisted), only you and admins
  (private), or only the group's members.

The Shorts viewer's **Share** copies the Short's link straight away.

**Embedding:** the embed code is an `<iframe>` sized to the video's shape, with the *start at* time if you set one.
The player is `/embed/<id>`, and takes `?start=<seconds>`, `?autoplay=1` (muted, as browsers require) and
`?loop=1`. It uses the browser's own video controls, with the title (a link to the watch page) and the site's name
across the top. Public and unlisted videos can be embedded; private, group and unfinished ones can't. Watching in an
embed counts as a view the same way as on the site.

**Link previews:** shared links show a preview with an inline player in Discord, Slack and anything else that reads
Open Graph tags, so the admin should set the *Public URL* for them to point at the right address (see
[Configuration](Configuration.md#admin--overview)). That includes videos from other servers in the network: their
card says who posted them and where, and the thumbnail and video come from the server that hosts them.

### WordPress

**Use a Custom HTML block.** Copy the code from **Share → Embed on a website → Copy embed code**, add a **Custom
HTML** block to the post (the **+** button, then search for *Custom HTML*) and paste the code into it. That player
has everything, full screen included.

**A link on its own** (pasted into a post, or into an **Embed** block) shows the player too, because the watch page
tells WordPress where it is (oEmbed). But WordPress only fully trusts a short list of big sites. It puts a player
from anywhere else in a locked box (an iframe `sandbox`) with no full screen, where the title link doesn't open
either. OurTube can't change that from its side. To swap such a player for the full one, delete its block and add a
Custom HTML block as above.

**To make plain links work fully**, tell WordPress to trust your OurTube server. Put this in a snippet plugin such
as *Code Snippets*, or in your child theme's `functions.php`, with your server's address in both places:

```php
add_action('init', function () {
    foreach (['watch', 'shorts', 'embed'] as $page) {
        wp_oembed_add_provider("https://clips.example.com/$page/*", 'https://clips.example.com/api/oembed');
    }
});
```

WordPress remembers the player it made for each post, so open the posts that already have one and save them again;
they fetch the full player then.

## Downloads and the 720p copy

**Download** under a video:

- For most viewers it is one button that downloads the MP4, which plays in any player.
- When you may have the original (it's your video, you're an admin, or the uploader ticked **Let viewers download the
  original**), it's a menu: **MP4 for any player**, and **Original upload** with its size (the file as it was
  uploaded) or **Full quality** with its size (when the upload itself wasn't kept, see
  [How uploads are processed](Uploading-and-Editing.md#how-uploads-are-processed)).

**720p copy for other platforms.** Large videos also get a small MP4, for services like Mastodon that only cache
small remote videos (on by default; Admin → Overview).

## Community titles and thumbnails

Viewers can suggest a plainer title or a better frame, and vote on suggestions: ⋯ → **Suggest a title or
thumbnail** opens *Better title or thumbnail*.

- Type **A plainer title** and click **Suggest** (at least 3 characters; up to 3 titles per person per video).
- Pause on a frame that shows what really happens and click **Suggest the current frame as the thumbnail** (up to 3
  per person per video).
- Vote with the thumbs-up next to any suggestion; click again to take the vote back.

People who turn on [**Community titles and thumbnails**](Accounts-and-Settings.md#watching-preferences) see the
most-voted title and thumbnail on cards and watch pages; the watch page then offers **community title · show
original**. The uploader sees **Use this** next to each suggestion to make it the real title or thumbnail, and
manages them on the video's details page (see [Community suggestions](Uploading-and-Editing.md#community-suggestions)).

## Reporting

Signed in, you can report:

- a video: the flag icon under it (not on your own videos);
- a comment: **Report** under it;
- a channel: the flag icon on its channel page.

The dialog asks for a reason (**Copyright**, **Spam or scam**, **Harassment or hate**, **Illegal content** or
**Something else**) and **Details (optional)**, then **Report**. For copyright, it points owners of the work to the
site's legal page, where a formal notice is handled fastest. Reports about another server's video or comment go to
the moderators here and to that server. What moderators do with reports: [Moderation and
Legal](Moderation-and-Legal.md#reports).

## Support links

A **Support** button next to **Subscribe** (on watch pages and channel pages) opens the uploader's tip, membership or
merch links, and the channel's **About** tab lists them. You set your own in Settings → **Channel** →
[**Support links**](Accounts-and-Settings.md#support-links). They also show as profile fields on Mastodon.

## Adaptive streaming

When the admin turns on *Adaptive streaming (HLS)* (Admin → Overview: off, 720p plus source, or 1080p, 720p and 480p
plus source), the player switches quality with the connection, and the gear's **Quality** picks one by hand. The
source rung is the published file cut into segments without re-encoding, so full quality is always offered. The MP4
stays for downloads, link previews and older browsers. If streaming fails, the player falls back to the MP4 on its
own. See [Configuration](Configuration.md#admin--overview).

## What counts as a view

A view counts once three quarters of a video were played: on the site, in the Shorts viewer, in the app, in an embed
or from another server. Only the parts actually played count, so skipping ahead doesn't, and watching a part again
doesn't add up. Each viewer counts once every 6 hours: signed-in viewers by their account, others (and anyone in
anonymous mode) by their network address and browser.

Opening a video still puts it in your history right away (unless your history is paused or anonymous mode is on).
The view count under the video goes up as soon as your view counts. What the uploader sees about views is in
[Analytics](Studio-and-Analytics.md#analytics).

## Playlists

Moved to [Channels and Playlists](Channels-and-Playlists.md#playlists).

## Feeds

Moved to [Channels and Playlists](Channels-and-Playlists.md#feeds).

## Subscriptions and notifications

Moved to [Channels and Playlists](Channels-and-Playlists.md#subscriptions-and-notifications).

## Analytics

Moved to [Studio and Analytics](Studio-and-Analytics.md#analytics).

## Privacy

Your history and anonymous mode are in Settings → **Watching** → [*Privacy*](Accounts-and-Settings.md#privacy);
downloading your data and deleting your account are in Settings → **Account** (see
[Your data](Accounts-and-Settings.md#your-data) and [Delete account](Accounts-and-Settings.md#delete-account)). What
they mean while you watch:

- With **history paused** (also on the [History](Channels-and-Playlists.md#history) page), the videos you open aren't
  added to your history and your place isn't saved.
- With **anonymous mode** on in a browser (your picture → **Anonymous mode**), nothing you watch there goes into your
  history or saves your place, your views count as a signed-out viewer's, and the player sends no watch time to the
  uploader's analytics.
- Analytics only ever store counts, never who watched (see [Analytics](Studio-and-Analytics.md#analytics)).
