# Video Tools and Games

Cut a moment out of a video, export a GIF or a short MP4, share a link that loops one play, line up two clips
side by side, and file videos under games.

- [Where to find each tool](#where-to-find-each-tool)
- [Clip a moment](#clip-a-moment)
- [GIF and MP4 export](#gif-and-mp4-export)
- [Looping links](#looping-links)
- [Compare](#compare)
- [Games](#games)
- [Managing the game list](#managing-the-game-list)
- [The network's game catalog](#the-networks-game-catalog)
- [Game artwork from SteamGridDB](#game-artwork-from-steamgriddb)

## Where to find each tool

| I want to… | Where |
| --- | --- |
| Cut part of a video into a new video | Watch page → **Clip** → **New video** |
| Cut part of my own upload before it was edited | Timeline editor → **Clip a moment** → **Make a clip** |
| Download a GIF or a short MP4 of a moment | Watch page → **Clip** → **GIF** or **MP4 download** |
| Share a link that plays one part over and over | Watch page → **Share** → **Loop a range** |
| Play two clips side by side | Watch page → the compare button (*Compare side by side with another clip*), or `/compare` |
| Let other people clip my video | Tick **Let others clip this video** on the upload form or in the video's details |
| Browse games | **Games** in the sidebar (`/games`) |
| Add, rename, merge or delete games | **Admin → Games** (moderators and admins), or **Manage games** on the Games page |
| Get covers and banners for games | **Admin → Games → Artwork from SteamGridDB** (an admin saves the API key) |

## Clip a moment

**Clip** on a watch page cuts a range of a video into a new video of your own that links back to where it came
from. The button is there for signed-in people on any video that is ready to play. Videos from other servers in
the network can't be clipped here.

**Who can clip what**

- You can always clip your own videos, and admins can clip any video on their server.
- Anyone signed in can clip someone else's video when its uploader ticked **Let others clip this video** (on the
  upload form or in the video's details) and the video is public.
- Otherwise **Clip** still opens, on the **GIF** tab: the **New video** tab is greyed out (*The uploader hasn't
  allowed clips of this video*), but GIF and MP4 exports work.

**The dialog**

The dialog is called **Clip a moment** and has three tabs: **New video**, **GIF** and **MP4 download**. The range
at the top is shared by all three, and it starts as the 30 seconds before the playhead.

| Control | What it does |
| --- | --- |
| **Start**, **End** | The range. Type a time (like `1:23.4`) and press Enter, or use **−** and **+** to move it a tenth of a second. **Now** takes the current playback position. |
| **Last 10s**, **Last 30s**, **Last 60s** | The 10, 30 or 60 seconds that end at the playhead (the first ones of the video when the playhead is near the start). |
| *0:30.0 long* | The length of the range. It turns red when the range is too short or too long for the tab, and a message says the limit. |
| **Preview** | Plays the range once in the player behind the dialog and stops at the end. |

On the **New video** tab:

| Field | What it does |
| --- | --- |
| **Title** | Starts as the video's title followed by *(clip)*. Up to 120 characters. |
| **Visibility** | **Public**, **Unlisted** or **Private**. Starts at **Private** when the video you clip is private, otherwise at **Public**. |
| **Cut** | **Exact (re-encodes if needed)** starts right where you chose; it is still copied without re-encoding when the start falls on a keyframe. **Fast (starts at the nearest keyframe)** copies the video without re-encoding, so it keeps full quality and is ready almost at once, but may start a few seconds early. |

**Make clip** starts it: *Your clip is being made. It shows up in your Studio and plays as soon as it's ready.*
**Open clip** goes to its watch page. **Close** (or Esc) closes the dialog.

- A clip is 1 second to 10 minutes long.
- It counts towards your storage quota; a clip that would go over it is refused before it starts.
- It isn't a draft: once processed it is published with the visibility you picked, like a saved upload.
- It takes the game and the tags of the video it came from.
- Its watch page says *Clipped from <title> by @<name>*; that link plays the original range on a loop.

**From the timeline editor**

The editor's **Clip a moment** section (**Make a clip**) opens the same dialog on your own upload, cut from the
unedited recording rather than the published video. It starts with the selected part when the timeline has more
than one part, otherwise with the 30 seconds before the playhead. Only the **New video** tab works there. The
editor itself is described in [Uploading and Editing](Uploading-and-Editing.md#the-timeline-editor).

## GIF and MP4 export

The **GIF** and **MP4 download** tabs of the same dialog export the range as a file to download. Anyone signed in
who can watch the video can export, whether or not clips are allowed.

| Tab | Options | Limit |
| --- | --- | --- |
| **GIF** | **Width**: **320 px (smallest)**, **480 px** (the default) or **640 px (largest)**. 15 frames a second with a palette built for that range. | 15 seconds |
| **MP4 download** | **Without sound**, to leave the audio out. The picture is at most 720p. | 60 seconds |

**Export GIF** or **Export MP4** starts it. The dialog shows *Exporting GIF… 40%*, then *Your GIF is ready (2.1 MB).
The link works for a day.* with a **Download** button. The file is named after the video and the range.

- A range has to be at least half a second long.
- You can have three exports in progress at once; a fourth waits until one finishes (*Wait for your other
  exports to finish first*).
- The download link only works for your account, and the file is deleted after a day.

## Looping links

**Share** on a watch page opens the share dialog:

- **Start at 0:12.0** adds the start time to the link (`?t=12`).
- **Loop a range** adds an end as well (`?t=12&end=20`), so the link plays just that part, over and over. Good for
  showing off one play.
- With either ticked, **Start** and **End** fields appear, with **−**, **+** and **Now** like in the clip dialog.
  *The end has to come after the start* until it does.
- **Copy** copies the link.

Someone who opens a looping link sees a **Looping 0:12.0–0:20.0** chip under the title. Clicking it stops the loop
(the chip then says **Loop …**), and clicking again starts it. An embed (**Embed on a website** in the same dialog)
takes the start time only.

## Compare

Compare plays two clips side by side on one transport bar, to put the same moment in two clips next to each
other: two players' views of one fight, an old run and a new one.

**Opening it.** The compare button on a watch page (the icon titled *Compare side by side with another clip*,
on this server's videos and on videos from the network) opens `/compare` with that clip as **A**. You can also
open `/compare` directly; no account is needed.

**Picking the clips.** An empty side shows **Search for a clip**: type to search this site and the network, and
click a result. **Change** under a side picks another one (**Cancel** keeps the current one). **Swap sides** swaps
A and B.

**Lining them up.** Each side has its own start point (*Starts at 0:03.2*), the moment that plays at the shared
time zero. Move it with **−1s**, **−0.1**, **−1f**, **+1f**, **+0.1** and **+1s** (a frame here is 1/60 second)
until both sides show the same moment.

**Playing.** The transport bar under both:

| Control | What it does |
| --- | --- |
| Back one frame, play/pause, forward one frame | Also `,`, Space (or `k`) and `.` on the keyboard. Clicking a video plays or pauses too. |
| Seek bar and time | The shared time, as long as the shorter of the two lined-up clips. |
| Speed | **0.1×**, **0.25×**, **0.5×** or **1×**. |
| Sound | **Sound from A**, **Sound from B** or **No sound**. |

While playing, B follows A's clock and corrects itself, so the two stay together.

**Copy link** copies a link to the comparison as it is lined up now (*Link copied, lined up as it is now*). The
link carries both clips and both start points (`?a=…&b=…&sa=…&sb=…`).

## Games

Videos can be filed under games, and every game has a page that collects its videos from this server and from
the rest of the network.

**Browsing games.** **Games** in the sidebar (`/games`) lists every game in this server's list as a tile: its
cover (or its title logo, or the first letters of its short name when it has no cover), its name and how many
videos it has here and from other servers. Moderators see **Manage games** there.

**A game's page** (`/g/<id>`) shows:

- the banner, cover and title logo when the game has them (otherwise its name);
- a feed button for the game's own Atom feed (`/feeds/game/<id>.atom`; see
  [Watching and Discovery](Watching-and-Discovery.md#feeds));
- how many videos it has, and how many of them are *from other servers*;
- *Artwork from SteamGridDB by …*, crediting the artists, when its pictures came from there;
- **Newest**, **Most viewed** and **Top rated**, to sort its videos.

A game that only other servers in the network use still gets a page, built from their videos: it says *This game
comes from other servers in the network.*

**How a video gets its game**

- **The Game field** on the upload form and in a video's details: start typing and pick the game from the
  suggestions. Its name, short name or any of its other names match. Everyone can pick a game from the list. A
  name that isn't in it shows *Not in this site's list. Pick one from the list, or ask a moderator to add it.*,
  and saving refuses it. Moderators can type a new name instead (*Not in the list yet: saving adds it.*).
- **A clip** takes the game of the video it was cut from.
- **A live stream** takes the **Game** set in Settings → Channel → **Live streaming**, and so does its recording.
  See [Live Streaming](Live-Streaming.md#going-live).
- **Videos from other servers** bring their game along. They land on a game here when its id or one of its **Also
  known as** names matches theirs, or when one of their tags does.

A video's game shows as a chip under its title, linking to the game's page, and search can be narrowed to one
game (the **Any game** filter).

## Managing the game list

Moderators and admins keep the list in **Admin → Games** (`/admin/games`): **Admin** in the sidebar (moderators
see **Moderation** there instead), then the **Games** tab. **Manage games** on the Games page goes there too.

**Adding a game.** **Add a game** has three fields, then **Add**:

| Field | Example | Used for |
| --- | --- | --- |
| **Name** | `Call of Duty: Modern Warfare III` | Shown everywhere |
| **Short name** | `MW3` | The game's id, matching in the Game field, and on game cards without a cover |
| **Also known as** | `cod, call of duty` | Other spellings, so a clip tagged with any of them on another server lands on the same game here |

The short name (or the name, when there is no short name) becomes the game's id: lowercase letters, digits and
dashes, up to 30 characters, as in `/g/mw3`. Other servers in the network group clips by that id, so keep it to
the common name (like `mw3` or `valorant`). A game can't be added twice: not with the same id, and not with the
same name written differently. With SteamGridDB set up and **Fill in artwork for new games** on, a new game gets
its artwork within a minute or two.

**Each game's row**

- **The picture on the left**: click it to upload a cover from your computer (portrait, like a box cover).
- **Name**, **Short name** and **Also known as**, saved with **Save**. Renaming keeps the game's id, so links and
  other servers' clips still find it.
- The game's address (`/g/<id>`) and its counts (*3 here · 12 from the network*).
- **Artwork**, to pick its pictures from SteamGridDB (only when a key is saved; see below).
- **Merge into…**, for the same game twice: pick the other game and confirm. Its clips move there, it goes, and
  its id and names become the remaining game's aliases, so old links and other servers' clips still find it. On
  the hub, members' copies merge too at their next sync.
- **Delete**: the game goes and its clips stay, without a game. On the hub, it also leaves the catalog of every
  server in the network.

Games that come from the network's hub can't be changed here; see the next section.

## The network's game catalog

In a network, the **hub keeps the catalog**:

- members get the hub's games automatically, with their artwork, so nobody has to build their own list;
- when the hub changes a game, members follow; when it deletes one, it disappears from every member's list
  (the clips stay, without a game);
- members can still add games of their own;
- a game a member made before the hub had it (the same name, or a name the hub's game is also known by) becomes
  the hub's at the member's next sync: its clips move to the hub's game and the member's copy goes;
- when the hub merges two games, members merge theirs too;
- the hub's games are locked on members: their row shows a **From clips.irc.so** badge (*The hub keeps this game
  up to date; it is changed or deleted there*), and Admin → Games says which games come from the hub;
- a member that leaves the hub keeps the games it has, as its own.

## Game artwork from SteamGridDB

[SteamGridDB](https://www.steamgriddb.com) is a community collection of game artwork. With an API key, OurTube
uses it for three kinds of images:

| Kind | Where it shows | What is kept here |
| --- | --- | --- |
| **Cover** | Game cards and the game page | 600×900 JPEG |
| **Title logo** | Across the game page's banner | Transparent PNG, up to 800 px wide |
| **Banner** | Behind the game page's header | JPEG, up to 1920 px wide |

**Setting it up**

1. Sign in at steamgriddb.com and copy your API key from its Preferences, under API.
2. An admin pastes it in **Admin → Games → Artwork from SteamGridDB** and clicks **Save key**. The key is
   write-only: the field then only says *A key is saved; paste a new one to replace it*. **Remove** deletes it.
   Moderators who aren't admins see *An admin needs to add a SteamGridDB API key first.* until one is saved.
   From the command line (the key comes from a file, so it never shows in your shell history):

   ```bash
   docker exec -i cliptube node server/cli.js settings set-secret steamgriddb_api_key < keyfile
   ```

3. Leave **Fill in artwork for new games** on, and click **Fill in missing artwork** once for the games you
   already have (*Finding artwork for 4 games; it shows up in a minute or two*).

**How it picks**

New games are looked up by name. A result with the same name wins, ignoring case, punctuation and accents
(so *Call of Duty Black Ops 7* finds *Call of Duty: Black Ops 7*); otherwise the first verified result is used.
Then SteamGridDB's best-rated cover, logo and banner are copied here. Images flagged as NSFW, humor or
epilepsy-unsafe are never offered.

**Choosing other images**

Each game's **Artwork** button opens a picker (*Artwork for <game> from SteamGridDB*): search SteamGridDB, choose the
right game (verified games have a check mark), switch between **Cover**, **Title logo** and **Banner**, and click
an image to use it. **Done** closes the picker.

**Credits**

Each image's artist is credited on the game's page (*Artwork from SteamGridDB by …*). The images are copies on
your server, so pages don't depend on SteamGridDB being up.

**In a network** only the hub needs a key: members show the hub's artwork for the hub's games. A member with
its own key can fetch artwork for the games it added itself.

If artwork doesn't show up, see [Troubleshooting](Troubleshooting.md#game-artwork). *SteamGridDB refused the API
key* means the key was mistyped or revoked: save it again.
