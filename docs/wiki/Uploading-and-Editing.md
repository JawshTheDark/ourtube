# Uploading and Editing

Getting videos onto your channel and changing them afterwards. Managing all your videos at once is in
[Studio and Analytics](Studio-and-Analytics.md).

- [Uploading](#uploading)
  - [Who can see a video](#who-can-see-a-video)
  - [Big files and shaky connections](#big-files-and-shaky-connections)
- [Uploading from ShareX and other tools](#uploading-from-sharex-and-other-tools)
- [Importing from YouTube and Immich](#importing-from-youtube-and-immich)
- [Groups: videos for family and friends](#groups-videos-for-family-and-friends)
- [Drafts: nothing goes out until you save](#drafts-nothing-goes-out-until-you-save)
- [How uploads are processed](#how-uploads-are-processed)
- [Video details](#video-details)
- [Thumbnails](#thumbnails)
- [Captions](#captions)
- [Skippable parts](#skippable-parts)
- [Community suggestions](#community-suggestions)
- [The timeline editor](#the-timeline-editor)
  - [Editor shortcuts](#editor-shortcuts)
- [Deleting a video](#deleting-a-video)
- [Studio](#studio) (moved)

## Uploading

Open the upload page (`/upload`) with **Upload** in the top bar, **Upload** in Studio, or **Share a video** on a
group's page. Drop one or more files on *Drag and drop video files to upload*, or click it (or **Select files**) to
pick them. Files that aren't videos are skipped, and files over the size limit are refused with a message.

Each file gets its own card and starts uploading at once, one file at a time (the others say *Waiting to upload…*).
**Add more** at the top adds files to the list. Fill in the details while it uploads:

| Field | Notes |
| --- | --- |
| **Title (required)** | Starts as the file name, with underscores turned into spaces. Up to 120 characters. |
| **Description** | Times in it (`1:23`) become links, and times one per line become [chapters](Watching-and-Discovery.md#chapters). Web addresses become links. Up to 5,000 characters. |
| **Tags** | Separated by commas, like `valorant, ace, clutch`. Up to 15 tags of up to 30 characters each; they're lowercased and a leading `#` is dropped. The most-used tags become the chips on Home. |
| **Game** | Start typing and pick from the site's list. A name that isn't listed is added when a moderator saves it; anyone else is asked to pick one from the list or ask a moderator. See [Games](Video-Tools-and-Games.md#games). |
| **Visibility** | **Public** (the default), **Unlisted**, **Private**, or one of your groups under **Only for a group**. The hint under it says who can watch. See [Who can see a video](#who-can-see-a-video). |
| **Let others clip this video** | Signed-in viewers can cut their own clips from it, and the clips link back here (see [Clip a moment](Video-Tools-and-Games.md#clip-a-moment)). Off by default. |

The right side of the card shows the thumbnail once there is one, the status and the file's size, a progress bar,
any error, the video's **Link** with **Copy** (as soon as the file is up), and the file's name. The status goes
*Uploading N%* → *Queued for processing…* → *Processing N%* → *Ready, not published yet* (*Ready to watch* once
published), or *Failed*.

The buttons under the fields:

| Button | What it does |
| --- | --- |
| **Save details** | Saves the fields and **publishes** the video (see [Drafts](#drafts-nothing-goes-out-until-you-save)). It can be clicked once the file is up; afterwards it says **Saved** until you change something. |
| **View** | Opens the video's watch page |
| **Cancel** | Stops an upload in progress, or takes a waiting file off the list |
| **Try again** | After an upload failed: resumes it from where it stopped |
| **Remove from list** | Clears a finished or failed card from this page. It doesn't delete the video. |

The browser asks before you leave the page while a file is still uploading. When every card is done, the page says
*Click Save details on each clip to publish it*, or, once all are published, *All done. Open Studio to manage your
videos.*

Accepted formats: MP4, MKV, MOV, WebM, AVI, M4V, TS, WMV, FLV, MPG/MPEG, 3GP, MTS and M2TS. The size limit per file is
shown on the page and set by the admin (8 GB by default). Your account may also have a storage quota (Settings →
**Account** → [**Storage**](Accounts-and-Settings.md#storage)); an upload that would go over it is refused with how
much you've used.

### Who can see a video

| Visibility | Who can watch | Listed on Home, search, feeds, your channel | Shared with the network and fediverse |
| --- | --- | --- | --- |
| **Public** | Anyone | Yes | Yes, unless you untick **Share with the network** |
| **Unlisted** | Anyone with the link | No | No |
| **Private** | You and the site's admins | No | No |
| **Only for a group** | The group's members and the site's admins | No (it's on the group's page) | No |

You can change it any time on the [details page](#video-details). Unlisted and private videos show on your own
channel page and in Studio with a badge.

### Big files and shaky connections

Files go up in pieces of 32 MB. That gets them through proxies that cap the size of a request (Cloudflare's
proxy and Cloudflare Tunnel allow 100 MB on the free plan), and a dropped connection only costs the piece in
flight: the card says *Connection lost at N%, trying again…* and carries on where it stopped. If it gives up, **Try
again** resumes it. Closed the tab halfway? Drop the same file in again within a day and it continues from where
it was. Channel archives for a [channel import](Fediverse.md#moving-a-channel) go up the same way.

For scripts and apps, the same works over the API (signed in, with the session cookie or a bearer token):

1. `POST /api/uploads` with `{"name": "clip.mp4", "size": <bytes>}` (and `"kind": "archive"` for a channel
   archive) answers `{"upload": {"id", "offset": 0, "chunk_size", ...}}`.
2. `PUT /api/uploads/<id>` with the next bytes as the body (`Content-Type: application/octet-stream`) and an
   `Upload-Offset: <byte>` header saying where they start. It answers the new `offset`. A piece may overlap what
   already arrived (those bytes are skipped); one that would leave a gap gets `409` with the right `offset`.
   `GET /api/uploads/<id>` says where an upload stands, `DELETE` gives it up.
3. Once `offset` equals the size, `POST /api/videos` with `{"upload_id": "<id>", "title": ...}` (the same fields
   as a normal upload) makes the video; for an archive, `POST /api/me/channel-imports` with `{"upload_id"}`.

Sending the whole file as `multipart/form-data` to `POST /api/videos` still works too, where no proxy is in the way.
An upload with no new piece for a day is deleted.

## Uploading from ShareX and other tools

An **API key** lets ShareX, a script or anything else that can send a file with a header upload videos as you.
Make one in Settings → **Apps** → [**API keys**](Accounts-and-Settings.md#api-keys). Each key says what its uploads
are when the upload doesn't say: unlisted, public or private, and whether they're published right away or wait as
[drafts](#drafts-nothing-goes-out-until-you-save). The key is shown once, so copy it then; the list afterwards shows
only its first characters and when it was last used. A key can only upload: it can't read your videos, change
settings or do anything else, and deleting it stops it at once.

**ShareX:** after making a key, click **ShareX config** and open the downloaded `.sxcu` file, then pick it under
*Destinations → File uploader*. Screen recordings then go up as you finish them, and ShareX copies the link.

**Anything else** sends the file as `file` in a multipart `POST` to `/api/videos`, with the key as a bearer token.
`title`, `description`, `tags`, `visibility` (`public`, `unlisted`, `private`) and `draft` (`true` or
`false`) are optional; without a title, the file name is used:

```bash
curl -H "Authorization: Bearer ot_..." -F "file=@match.mp4" -F "title=Clutch round" https://your.site/api/videos
```

The answer is the video as JSON, with `url`, its watch page; it plays once it's processed. A tool that sends the
whole file in one request is limited by your reverse proxy (Cloudflare's 100 MB, for one); bigger files can go up in
pieces through `/api/uploads` with the same key, the way the upload page does.

## Importing from YouTube and Immich

**Import from YouTube or Immich** at the top of the upload page (`/import`) brings in videos you already have
somewhere else. The page has two tabs, **From YouTube** and **From Immich** (YouTube first when it's on). You pick
videos from a list, choose who sees them, and they're fetched in the background, one at a time.

**The list** says how many videos were found and how many are picked. Tick the ones you want, or **Pick all** /
**Pick none**. Each shows its thumbnail, title, length and date, *Short* for Shorts, and *already here* for videos
you've imported before (those can't be picked again). Up to 500 can be imported at once.

**The options** under the list:

- **Imported videos are**: the [visibility](#who-can-see-a-video) for all of them. **Private** by default, so you
  can look them over first.
- **Keep their original dates, so they sit in your channel where they were** (on by default): each video gets the
  date it was first posted or filmed, not today.
- **These are my videos, or I'm allowed to post them here** (YouTube only): needed before importing.

Then **Import** *N* **videos**. An imported video becomes yours like an upload: processed, with its thumbnail and
details, and editable afterwards. It is published with the visibility you chose (imports aren't drafts), but imports
don't notify your subscribers or fire your [webhooks](Webhooks.md), since a whole back catalogue would flood them.

**Your imports**, under it all, shows each one: **Waiting**, **Fetching** *N%*, **Done** (the title links to the
video) or **Failed** with the reason. **Retry** tries a failed one again; the **×** cancels a waiting one or clears
a finished one from the list.

**From YouTube** (only when the admin has turned it on; otherwise the tab says so): paste your channel's address
(like `https://www.youtube.com/@you`), a playlist, or a single video, and click **Find videos**. A channel lists its
videos, Shorts and past streams. Each video arrives with its title, description, tags, thumbnail and chapters, up to
the server's maximum resolution. YouTube changes often and sometimes refuses servers, so a big channel can take a
few tries; when it refuses, the error says so, and an admin can fix it (see
[Configuration](Configuration.md#importing-from-youtube)).

**From Immich**, two ways, picked with the chips at the top of the tab:

- **From a shared link**, no account needed: in Immich, select the videos or open an album, then **Share → Create
  link**, turn on **Allow download**, and paste the link. **Find videos** lists only the videos in it.
- **From your Immich library**: enter your **Immich address** and an **API key** (made in Immich under **Account
  settings → API keys → New API key**; it needs to read and download assets), then click **Connect Immich**. The key
  is checked, kept on this server and never shown again. The tab then says *Connected to* *address*, with
  **Disconnect** (forgets the key) and **Show my videos**, which lists all your Immich videos, newest first;
  **Show more** loads the next ones.

Photos are skipped, and so are the few seconds of movement that Live Photos and motion photos keep as hidden
videos in Immich. A video's title is its description in Immich, or else its file name. An Immich on your home
network (a `192.168.` or `localhost` address) can only be reached by admins, so that people can't use the server to
look around its network; everyone else uses Immich's public address. On Android, Immich's own **Share** button can
also send a video straight to the [OurTube app](Android-App.md).

## Groups: videos for family and friends

A **group** is a circle of people on this server who see videos meant only for them: the family, a team, a few
friends. Sidebar → **Groups** (`/groups`) lists the groups you're in, with how many people and videos each has and
who made it.

**Making one:** type a name (*Name a new group, like Family*, up to 60 characters) and click **Make a group**. Its
page opens. You can own up to 50 groups.

**A group's page** (`/groups/<id>`) shows its name, how many people are in it and who made it, **Share a video**
(opens the upload page), every video shared with it, and two panels:

| Panel | What's in it | Who |
| --- | --- | --- |
| **People** | Everyone in it, the owner marked **Owner**. The owner has a **×** next to each person to remove them, and a username field with **Add** to add someone who has an account here. | Everyone sees it; the owner changes it |
| **Join link** | **Make a join link**, then the link with **Copy**, **New link** (the old one stops working) and **Turn off** (no joining by link). Under **Settings**: **Rename** and **Delete group**. | The owner |
| **Leave** | **Leave this group** | Everyone but the owner |

**Join links:** anyone signed in who opens the link (or makes an account first) sees who invited them and how many
people are in the group, and joins with **Join** *group*. Someone who is already in gets **You're in: open the
group**. Send the link only to the people you mean.

**Sharing a video with a group:** pick the group's name under **Only for a group** in **Visibility** when you upload
or edit the video (the list only appears once you're in a group; until then the hint offers *make a group*). Then:

- the group's members (and the site's admins) can watch it; to anyone else, signed in or not, it doesn't exist;
- its watch page says **Only for** *group*, and the share dialog says only the group's members can open the link;
- it isn't on Home, in search or feeds, in link previews or embeds, and never goes to the network or the fediverse;
- members are notified (Settings → **Notifications** → *Your groups*), and it's listed on the group's page.

You can only share with groups you're in. If you leave a group or are removed, your videos for it become private.
The owner deletes the group instead of leaving it; deleting a group makes all of its videos private to whoever
shared them.

## Drafts: nothing goes out until you save

An upload from the upload page is a **draft** until you click **Save details**:

- only you can see it, even after it has finished processing;
- it isn't on Home, in search, in feeds, in the network or on the fediverse;
- subscribers aren't notified.

Details you type while the file uploads are kept, but the video stays a draft (*Nothing is published until you click
Save details*). **Save details** publishes it with the visibility you chose, and that is when subscribers (or the
group) get their notification. A draft shows a **Draft** badge in Studio's *Visibility* column; its details page
says *Not published yet* and has a **Save and publish** button.

Uploads through the API without the draft flag (scripts, for example) follow their API key's setting, and without
one are published as soon as they're processed. Imports are never drafts.

## How uploads are processed

When a file arrives, OurTube reads it with FFprobe and decides:

- **Remux** (seconds, no quality loss) when the video is H.264 in yuv420p with AAC or MP3 audio, and no taller
  than the site's maximum resolution. That covers the default recordings of tools like NVIDIA ShadowPlay and OBS. The
  upload is copied into a web-friendly MP4 and the uploaded file is deleted, since nothing was lost.
- **Transcode** everything else (HEVC, AV1, VP9, ProRes, 10-bit, other audio codecs, or too tall) to H.264
  and AAC, scaled down to the maximum resolution if needed. The configured encoder is used (CPU, NVENC, Quick
  Sync or AMF); if a GPU encoder fails, that video is encoded on the CPU instead. The uploaded file is kept
  unless the admin turned on *Delete originals*.

The thumbnail, duration, resolution and frame rate are filled in automatically. After that, in the
background, the server builds the 720p copy for other platforms and the adaptive-streaming renditions, if
those are on.

While it processes, the watch page shows how far it got and refreshes by itself; the link already works. If
processing fails, Studio shows **Failed** (rest the pointer on it for the error) and a *Retry processing* button
(see [Studio](Studio-and-Analytics.md#a-videos-buttons)).

## Video details

The details page (`/studio/edit/<id>`) changes everything about a video after upload. Open it from Studio (the
title, or the pencil icon), from **Details** under your own video on its watch page, or from the editor's back
arrow. Admins reach it with **Edit** on anyone's video.

At the top: the back arrow (to Studio), **View** (the watch page), **Open editor** (once processed) and **Save**,
which is greyed out until you change something. On a draft it says **Save and publish**, and a notice says *Not
published yet: only you can see it until you save its details.*

The fields:

| Field | Notes |
| --- | --- |
| **Title (required)** | Up to 120 characters |
| **Description** | Times like `1:23` become clickable, and times one per line become [chapters](Watching-and-Discovery.md#chapters). Up to 5,000 characters. |
| **Tags** | Separated by commas (same rules as [on upload](#uploading)) |
| **Game** | From the site's list |
| **Visibility** | **Public**, **Unlisted**, **Private**, or a group under **Only for a group** (see [Who can see a video](#who-can-see-a-video)) |
| **Comments** | **Use my default (Settings)** (your [default](Accounts-and-Settings.md#comments-on-your-videos)), **Publish right away**, **Hold all for review** (you approve each one in [Comments to review](Studio-and-Analytics.md#comments-to-review)) or **Turn comments off** |
| **Let others clip this video** | Signed-in viewers can cut their own clips from it; every clip links back here |
| **Let viewers download the original** | Adds the original file to the watch page's **Download** menu for everyone. You can always download it yourself. |
| **Share with the network** | Only on servers that link with others, and only for public videos. Untick it to keep a public video on this server only. |

Notes under the fields say *Clipped from* *video* for clips, and *This video has been edited* (with a link to the
editor) for edited videos.

The side column:

- a preview player with the video's **Link** and **Copy**, the **Original file** name, **Size**, **Resolution** and
  **Duration**;
- **Thumbnail**, with **Upload custom thumbnail** (see [Thumbnails](#thumbnails));
- **Delete video** (see [Deleting a video](#deleting-a-video)).

Under it all, once the video is processed: **Skippable parts**, **Captions** and, when viewers have suggested any,
**Community suggestions** (each below).

## Thumbnails

Processing picks a thumbnail from the video by itself. To change it:

- **Upload custom thumbnail** on the details page: a JPEG, PNG, WebP, GIF or BMP image of up to 15 MB.
- In the [timeline editor](#the-timeline-editor), move the playhead to a frame and click **Use frame at** *time*.
- Pick a viewer's suggested frame with **Use this** under **Community suggestions**.

The new thumbnail shows everywhere at once, including link previews and other servers.

## Captions

The **Captions** panel on the details page lists every caption track with its name and language code:

- **View** opens the file.
- **Publish** appears on tracks viewers sent (marked *Suggested by @user*); they show in the player once published.
- The bin deletes a track, after a confirmation.

To add one: choose a **WebVTT or SRT file** (up to 2 MB; SRT is turned into WebVTT), enter the **Language** code (`en`,
`es`, `pt-BR`) and the **Name** shown in the player's menu (`English`), and click **Add**. Yours are published at
once. Viewers can send captions from the watch page's ⋯ menu (see
[Captions and skippable parts](Watching-and-Discovery.md#captions-and-skippable-parts)). Nothing is generated or
machine-translated.

## Skippable parts

The **Skippable parts** panel on the details page marks sponsor reads, intros, outros, recaps and self-promotion.
Each viewer chooses whether marked parts are skipped automatically, offered with a Skip button (the default) or left
alone; see [Watching preferences](Accounts-and-Settings.md#watching-preferences).

The panel lists each part with its kind and times:

- **Play** plays the preview from the part's start.
- **Accept** appears on parts viewers suggested (marked *Suggested*); they apply once accepted.
- The bin deletes a part.

To add one: pick the **Kind** (**Sponsor**, **Intro**, **Outro**, **Recap** or **Self-promotion**), set **Start** and
**End** (type a time, nudge it with **−** and **+** by a tenth of a second, or play the preview and click **Now**), and
click **Add part**. A part is at least a second long.

## Community suggestions

When viewers have suggested titles or thumbnails (see
[Community titles and thumbnails](Watching-and-Discovery.md#community-titles-and-thumbnails)), the details page shows a
**Community suggestions** panel with each title and frame and its votes. **Use this** makes it the real title or
thumbnail; the bin removes the suggestion. Viewers who turned on community titles see the most-voted one either way.

## The timeline editor

The timeline editor (`/studio/editor/<id>`) cuts, trims, fades and changes the volume of a processed video. Open it
from Studio (the scissors icon), from **Open editor** on the details page, or with **Editor** under your own video
on its watch page.

Edits are non-destructive: the editor always works on the unedited recording, so anything you cut can be brought
back, and **Revert to original** works at any time. Both files are kept, so an edited video takes more disk space.
The first time, the editor needs a moment for *Generating the filmstrip and waveform…*.

**The top bar:** the back arrow (to the details page; it asks first if you have unsaved changes), the title, and how
it stands: *Original upload*, **Edited version is live**, *Waiting to render*, *Rendering N%* or **Render failed**,
plus **Unsaved changes**. Then:

| Button | What it does |
| --- | --- |
| Undo / Redo | Steps back or forward through your changes (`Ctrl+Z`, `Ctrl+Shift+Z`) |
| **Revert to original** | Throws the edit away and puts the unedited video back, after a confirmation. Shown on edited videos. |
| **Discard** | Drops the changes since the last save |
| **Save** | Renders the edit in the background (*Saved. Rendering your edit now; the current version stays up until it finishes.*). The old version plays until the new one is ready (*Your edit is live*), and shared links keep working. Saving the whole video with nothing changed is the same as reverting. |

**The preview:** click the video to play or pause. Under it: go to the start of the edit, play/pause, go to the end of
the edit, the playhead's time and the length (`m:ss.ss`), *out* *m:ss.ss* (where that moment lands in the edited
video), and **Preview edit**: while ticked, playback skips the cut parts, so you see the result.

**The side panel:**

| Section | What's in it |
| --- | --- |
| **Result** | The edited video's **Length**, how much is **Cut out**, and the number of **Parts** |
| **Audio** | Mute (removes the audio track from the result), and a volume slider from 0% to 300% |
| **Fades** | **Fade in from black** and **Fade out to black**: three quarters of a second, on picture and sound |
| **Thumbnail** | The current thumbnail, and **Use frame at** *time* to use the frame under the playhead |
| **Clip a moment** | **Make a clip**: a separate video from the selected part, or from the 30 seconds before the playhead, cut from the unedited recording (see [Clip a moment](Video-Tools-and-Games.md#clip-a-moment)) |
| **Parts** | Every kept part with its start, end and length; click one to select it and jump there. **Reset to full video** starts over with the whole video as one part. |
| **Shortcuts** | A reminder of the keys |

**The toolbar** above the timeline: **Split** (at the playhead), **Delete part** *N* (the selected part), **Set start**
and **Set end** (move the selected part's start or end to the playhead), then zoom out, the zoom slider, zoom in, and
*Fit whole video*.

**The timeline** shows a ruler, a filmstrip and the audio waveform. Each kept part is a box; the selected one has
yellow edges. Cut-out stretches are hatched.

- Click or drag anywhere on it to move the playhead (clicking a part also selects it).
- Drag a part's left or right edge to trim it; it snaps to the playhead when close.
- Double-click a cut-out stretch to bring it back.
- The mouse wheel scrolls the timeline sideways; `Ctrl` + wheel zooms around the pointer.
- The playhead is followed while the video plays.

A part is at least a tenth of a second long, the only part left can't be deleted (*Trim it instead*), an edit has
up to 200 parts, and the result has to be at least half a second long.

### Editor shortcuts

| Key | Action |
| --- | --- |
| `Space` or `k` | Play or pause |
| `←` / `→` | One frame back or forward (pauses) |
| `Shift+←` / `Shift+→` | One second back or forward (pauses) |
| `j` / `l` | Five seconds back or forward |
| `↑` / `↓` | Jump to the previous or next cut (the edge of a part) |
| `Home` / `End` | The start or end of the video |
| `s` | Split the part under the playhead |
| `Delete`, `Backspace` or `x` | Delete the selected part |
| `i` / `o` | Set the selected part's start / end to the playhead |
| `+` or `=` / `-` | Zoom in / out |
| `0` | Fit the whole video |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` or `Ctrl+Y` | Redo |
| `Ctrl` + mouse wheel | Zoom around the pointer |

On a Mac, `Cmd` works in place of `Ctrl`. The keys do nothing while you're typing in a box.

## Deleting a video

Studio → the bin icon on the video's row, or **Delete video** on its details page. After a confirmation (*This
permanently removes the video and its comments.*), the video, its comments, its files (the upload, the edits, the
thumbnail, captions and streaming copies) are deleted, and the deletion is sent to the network and the fediverse.
It can't be undone, and the video drops out of every playlist it was in.

To take a video down without deleting it, make it **Private** on its details page instead.

## Studio

Moved to [Studio and Analytics](Studio-and-Analytics.md#studio): the list of your videos, comments to review, and
analytics.
