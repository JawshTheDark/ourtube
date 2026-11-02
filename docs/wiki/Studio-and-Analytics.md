# Studio and Analytics

Studio is where you manage the videos you've posted, review held comments and see how your videos do. Uploading,
the details page and the timeline editor are in [Uploading and Editing](Uploading-and-Editing.md).

- [Studio](#studio)
- [Status badges](#status-badges)
- [A video's buttons](#a-videos-buttons)
- [Comments to review](#comments-to-review)
- [Analytics](#analytics)
- [The numbers and charts](#the-numbers-and-charts)
- [Where views came from](#where-views-came-from)
- [How the numbers are counted](#how-the-numbers-are-counted)

## Studio

Open it from sidebar → **Studio**, your picture → **Your videos**, or **Manage videos** on your channel (`/studio`).
The page is called *Your videos*. At the top are **Analytics**, **Comments to review** (with the number waiting, if
any) and **Upload**.

Below is a table of every video you've posted, newest first, drafts and failed uploads included:

| Column | What it shows |
| --- | --- |
| **Video** | The thumbnail with the length (click it: the watch page once processed, the details page before), the title (opens the [details page](Uploading-and-Editing.md#video-details)) and the start of the description, or *Add a description* |
| **Visibility** | **Draft** for a video that isn't published yet (click it to open its details and publish; see [Drafts](Uploading-and-Editing.md#drafts-nothing-goes-out-until-you-save)), otherwise **Public**, **Unlisted**, **Private** or **Group** |
| **Status** | Where processing stands; see [Status badges](#status-badges) |
| **Date** | The day it was posted (for imports with *Keep their original dates*, the original date) |
| **Views** | Counted views, all time (see [What counts as a view](Watching-and-Discovery.md#what-counts-as-a-view)) |
| **Likes** | Likes (dislikes aren't shown here) |
| **Comments** | All comments, including ones held for review |
| (buttons) | See [A video's buttons](#a-videos-buttons) |

The table refreshes itself every few seconds while a video is being processed or an edit is rendering.

There are no filters, no search, no sorting and no bulk actions in Studio: everything is done one video at a time.
To find one video among many, search your channel's name or the title in the [search](Watching-and-Discovery.md#search)
(public videos only), or use your channel's **Videos** tab, which also shows your unlisted, private and group
videos.

## Status badges

| Badge | Meaning |
| --- | --- |
| **Queued** | Waiting for its turn to be processed |
| **Processing** *N%* | Being processed (see [How uploads are processed](Uploading-and-Editing.md#how-uploads-are-processed)) |
| **Ready** | Playable |
| **Failed** | Processing failed; rest the pointer on it for the error, and use the retry button |
| **Rendering edit** *N%* | A saved [edit](Uploading-and-Editing.md#the-timeline-editor) is being rendered; the old version plays until it's done |
| **Edit failed** | Rendering the edit failed; the pointer shows the error. The unedited version keeps playing. |
| **Hidden by moderators** / **Removed by moderators** | The moderators acted on it; the pointer shows their reason. See [Moderation and Legal](Moderation-and-Legal.md#hiding-and-removing-videos). |

## A video's buttons

The icons at the end of each row (rest the pointer on one for its name):

| Icon | Name | What it does |
| --- | --- | --- |
| Pencil | *Edit details* | Opens the [details page](Uploading-and-Editing.md#video-details) |
| Chart | *Analytics* | Opens the video's own [analytics](#analytics) (`/studio/analytics/<id>`) |
| Scissors | *Open the timeline editor* | Opens the [timeline editor](Uploading-and-Editing.md#the-timeline-editor); only once the video is ready |
| Circular arrow | *Retry processing* | Shown when processing or an edit failed. Starts it again (*Processing restarted*). Processing can only be retried while the uploaded file is still kept; otherwise it says *The original file is gone, please upload again*. |
| Bin | *Delete* | Deletes the video, after a confirmation. See [Deleting a video](Uploading-and-Editing.md#deleting-a-video). |

## Comments to review

Studio → **Comments to review** (`/studio/comments`) lists the comments held back on your videos, newest first.
Each shows why it was held (or *Held*), who wrote it (*(another instance)* for people from other servers), the video
it's on (a link), when, and the text, with two buttons:

- **Approve** publishes it, with the notifications a new comment sends (to you, to the person it replies to and to
  anyone it mentions).
- **Delete** removes it. For a comment from another OurTube server, that is the answer it gets back.

*No comments are waiting for review* when the list is empty. You can also approve or delete a held comment right
under the video (see [Comments](Watching-and-Discovery.md#comments)).

What gets held: comments caught by the spam checks (see
[Moderation and Legal](Moderation-and-Legal.md#comments-and-spam)), comments with one of your blocked words set to
*Hold for review*, and every comment on a video set to hold all comments. Your default and your blocked words are in
Settings → **Channel** → [**Comments on your videos**](Accounts-and-Settings.md#comments-on-your-videos); each video
can override the default on its [details page](Uploading-and-Editing.md#video-details).

## Analytics

Studio → **Analytics** (`/studio/analytics`) is *Channel analytics*, for all your videos together. A row's chart
icon opens one video's analytics (`/studio/analytics/<id>`), titled with the video's name, and its **Top videos**
list links to each video's page too.

At the top:

- the time range: **Last 7 days**, **Last 28 days** (the default), **Last 90 days** or **Last year**;
- **Show as table** swaps the daily charts for a table (**Show charts** swaps back);
- **Studio** (or **Video**, on one video's page) goes back.

Analytics only store counts: nothing in them says who watched. Viewers who aren't signed in are counted too.

## The numbers and charts

| Item | What it is |
| --- | --- |
| **Views** | Views counted in the range (a view counts once three quarters of the video were played) |
| **Watch time** | The time spent playing your videos in the range, in seconds, minutes or hours |
| **Average view** | Watch time divided by views |
| **Views per day** | A bar per day; hover a bar for its number and date |
| **Watch time per day** | The same for watch time |
| **Audience retention** | One video only: the share of plays still watching at each point of the video, from 0% to 100% of its length. Hover for *N% still watching at m:ss*. *Not enough plays yet* until there are some. |
| **Where views came from** | The pages and sites views came from, most first (up to 12; see below) |
| **Top videos** | Channel only: your 10 most viewed videos in the range, with their views and watch time; each links to its own analytics |

**Show as table** lists **Day**, **Views** and **Watch time** for every day of the range, newest first.

Reading retention: each point is measured against the plays that saw the start of the video, so the curve starts at
100% and falls where people stop watching or skip ahead. Retention covers every play since the video was posted,
whatever range is picked above.

## Where views came from

| Label | The viewer came from |
| --- | --- |
| **Home on this site** | Home |
| **Trending** | Trending |
| **Search** | Search results |
| **Your channel** | Your channel page |
| **Other videos (related)** | Another watch page (the related videos, a link in a description or comment) |
| **Subscriptions feed** | The Subscriptions page |
| **Network page** | The Network page |
| **Game pages** | A game's page |
| **Watch history** | Their History page |
| **Liked videos** | Their Liked page |
| **Notifications** | The notifications page |
| **Studio** | Studio (usually you) |
| **Compare** | The Compare page |
| **Elsewhere on this site** | A link from this site that isn't one of the pages above, such as one opened in a new tab |
| A site's name, like `example.com` | A link on that site |
| **Direct or app** | Nothing to name: a link opened from a chat app, email or bookmark, typed in, the app, an embed, or another server in the network |

## How the numbers are counted

- **Views** follow [What counts as a view](Watching-and-Discovery.md#what-counts-as-a-view): three quarters played,
  once per viewer every 6 hours, on the site, in the Shorts viewer, in the app, in embeds and from other servers. The
  **Views** column in Studio and the count under the video are all-time totals; analytics count by day.
- **Watch time and retention** come from the player on the website's watch page: the seconds actually played, and
  which parts of the video were reached, sent when the video ends or you leave the page. Plays in the Shorts viewer,
  in embeds, in the Android app, on other servers, and in anonymous mode count as views but add no watch time or
  retention. That's why **Average view** can be lower than you'd expect for Shorts.
- **Days** run from midnight to midnight UTC.
- Admins can open any video's analytics at `/studio/analytics/<id>`.
