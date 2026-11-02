# Moderation and Legal

Moderation happens in **Admin → Moderation** (admins: sidebar → **Admin** → **Moderation**; moderators: sidebar →
**Moderation**), and on watch pages. Legal settings and copyright notices are in **Admin → Legal** (admins only).
How to get to the admin area: [Admin Guide](Admin-Guide.md#getting-to-the-admin-area).

- [Roles](#roles)
- [Where moderators work](#where-moderators-work)
- [Reports](#reports)
- [Hiding and removing videos](#hiding-and-removing-videos)
- [Comments and spam](#comments-and-spam)
- [Suspending and banning](#suspending-and-banning)
- [Strikes](#strikes)
- [Sign-up](#sign-up)
- [Storage quotas](#storage-quotas)
- [Copyright notices](#copyright-notices)
- [Appeals and counter-notices](#appeals-and-counter-notices)
- [Blocking other servers](#blocking-other-servers)
- [The audit log](#the-audit-log)
- [Public pages](#public-pages)
- [Privacy](#privacy)
- [Background, not legal advice](#background-not-legal-advice)

## Roles

| Role | Can |
| --- | --- |
| **Member** | Upload, comment, like, subscribe, report; review comments on their own videos (Studio → **Comments**) |
| **Moderator** | Everything a member can, plus: Admin → **Moderation** (reports, held comments, appeals, the audit log, spam settings) and Admin → **Games**; hide, remove and restore any video; delete or approve any comment; watch hidden and removed videos; moderate live chats; suspend, ban or strike members from a report |
| **Admin** | Everything: all the admin tabs, so also site settings, the users table, invites, approving sign-ups, roles, quotas, lifting suspensions, deleting accounts, legal settings and takedown notices, the network, the fediverse and debugging. Admins can open and edit anyone's video, private and group videos included. |

Moderators can't act on admin accounts, can't lift a suspension or ban, and don't see the users table.

Change a role in **Admin → Overview → Users → Role** (**Member**, **Moderator** or **Admin**), or from the command
line, where a member is `user`:

```bash
docker exec cliptube node server/cli.js user role alice moderator
```

More in [Making someone a moderator or admin](Admin-Guide.md#making-someone-a-moderator-or-admin).

## Where moderators work

- **Admin → Moderation** (`/admin/moderation`) has five sub-tabs: **Reports**, **Held comments**, **Appeals**,
  **Audit log** and **Spam settings**. The first three show how many items are waiting. OurTube doesn't notify
  moderators of new reports or held comments, so these counts are the place to look.
- **On a watch page**, the gavel button (**Moderator tools**) hides, removes or restores the video, and every
  comment has **Delete**.
- **In a live chat**, moderators can remove messages and people (see
  [Live Streaming](Live-Streaming.md#watching-and-chatting)).
- **Admin → Games** (sidebar → **Games** → **Manage games**) keeps the game list (see
  [Games](Video-Tools-and-Games.md#games)).

For admins, **Admin → Moderation** also says when new accounts are waiting for approval, with a link to
**Overview → Users**.

## Reports

**Reporting.** Signed-in people report with the flag button on a watch page (not on their own videos), **Report**
under a comment, the flag button on a channel page, and the flag button on a video from another server. The
**Report** dialog asks for a reason and **Details (optional)**:

| Reason | Hint shown |
| --- | --- |
| **Copyright** | It uses someone's work without permission |
| **Spam or scam** | Misleading, repetitive or a scam |
| **Harassment or hate** | Targets a person or group |
| **Illegal content** | Breaks the law |
| **Something else** | |

A person can send 20 reports an hour. Reporting the same thing again while their first report is still open
updates that report instead of adding another.

**Reports that cross servers.** A report about a video or comment on another server goes to the moderators here
*and* to that server: an OurTube server gets it in its own queue, a fediverse server as a `Flag` from this server,
without the reporter's name. Reports other servers send about videos, comments or channels here (including from
Mastodon) join this queue, marked *via* the server they came from. See also [Fediverse](Fediverse.md#moderation).

**The queue** is **Admin → Moderation → Reports**. The chips at the top filter it: **Open** (the default),
**Resolved**, **Dismissed** or **All**. Each report is a card with:

- the reason (red for **Copyright** and **Illegal content**), what kind of thing was reported, who reported it
  (and *via* which server), and when;
- the reported item: a video's thumbnail, title, uploader and whether it's already hidden or removed; a comment's
  text, author and video; a channel's name, status and active strikes; or a video from another server and its
  server. *The reported item no longer exists* when it has gone;
- what the reporter wrote;
- the action buttons (below), **Mark handled** and **Dismiss**;
- **Private moderator notes**, only for moderators, with **Save** once you've typed something.

| Report about | Buttons |
| --- | --- |
| A video here | **Hide video**, **Remove video**, **Strike uploader**, **Suspend uploader** |
| A comment here | **Delete comment**, **Suspend author**, **Block their instance** (when the author is on another server) |
| A channel here | **Add strike**, **Suspend**, **Ban** |
| A video on another server | **Hide here**, **Block instance** |
| A comment on another server | **Block instance** |

Every action button asks for a reason, filled in with the report's reason; it's shown to the person affected
where that applies (the uploader's notification, a suspended person's sign-in message). Cancel the box to do
nothing. **Mark handled** and **Dismiss** ask nothing.

After any button the report is closed: **Dismiss** marks it *dismissed*; everything else marks it *resolved*,
with what was done and by whom. Other open reports about the same thing are closed with it, and everyone here who
reported it gets a notification: that the moderators acted on it, or looked at it and left it up. Every action is
in the [audit log](#the-audit-log).

## Hiding and removing videos

From a report (**Hide video**, **Remove video**), or on the video's watch page with the gavel button (**Moderator
tools**): **Hide from everyone else**, **Remove (rule or copyright violation)**, and on a hidden or removed video
**Restore video**. Hiding and removing ask for a reason, which the uploader sees; restoring doesn't.

| | Hide | Remove |
| --- | --- | --- |
| Who can see it | The uploader and moderators | Only moderators can play it; the uploader sees its page and the reason, not the video |
| Listings, the network, the fediverse | Taken out of all of them | Taken out of all of them |
| Files | Kept | Kept for **Keep removed videos' files for (days)** (Admin → **Legal**, 30 days by default), then the video and its files are deleted |
| Undo | **Restore video** | **Restore video**, until the files are deleted |

The uploader gets a notification with the reason, and the video's page shows *Hidden by the moderators* or
*Removed by the moderators* with the reason and a button to [appeal](#appeals-and-counter-notices). The retention
period is fixed when a video is removed, so changing the setting only affects later removals. When the files go,
the audit log shows `video.purge` by `system`.

Recording a takedown notice with **Remove the video** removes the video the same way (see
[Copyright notices](#copyright-notices)).

**Videos from other servers** can't be removed here, only hidden on this site: **Hide here** on a report, or the
shield button (**Admin**) on the video's page → **Hide on this site** (admins). On a hub that hides it from the
whole network. Admin → **Network** → **Hidden videos** lists them with **Show again**.

## Comments and spam

New comments go through these checks in order. They apply to everyone, including people commenting from other
servers; the uploader (and their [linked accounts](Fediverse.md#linked-accounts)) and moderators are never held.

1. Comments turned off for the video: refused.
2. Too many comments: more than **Comments per 10 minutes** (20), or **…for new accounts** (5), is refused with
   *You're commenting too fast*.
3. The channel's blocked words: held or refused, as the uploader chose.
4. A channel that holds every comment: held.
5. **Hold names that imitate the uploader** (on): a name that looks like the uploader's, such as *Jawsh_* or
   *J4wsh* next to *Jawsh*, is held.
6. **Hold links from new accounts** (on): a link from an account younger than **New account period (hours)** (24)
   is held.
7. **Hold a person's first comment** (on): a person's comments are held until they have one that's published;
   after that they post freely.

The thresholds are under **Admin → Moderation → Spam settings**, which moderators can change too (see
[Configuration](Configuration.md#admin--moderation)). Uploaders set blocked words, holding every comment and
turning comments off for their own channel and videos (see [Accounts and Settings](Accounts-and-Settings.md)).

**Held comments** stay visible to their author, marked as held, and wait for review in two places: the uploader's
Studio → **Comments**, and **Admin → Moderation → Held comments** for every video. Each shows why it was held, the
author (*another instance* for someone from elsewhere), the video and when. **Approve** publishes it; **Delete**
removes it (for a comment from another OurTube server, that tells the server it wasn't approved).

Moderators can also **Delete** any comment under a video.

## Suspending and banning

| Who | Where |
| --- | --- |
| Moderators | A report's **Suspend uploader**, **Suspend author**, **Suspend** or **Ban** |
| Admins | **Admin → Overview → Users → Status**: **Suspended**, **Banned**, or **Active** to lift it |
| The server | `user status <username> suspended "reason"` (see [Admin CLI](Admin-CLI.md#accounts)) |
| Automatically | Enough active [strikes](#strikes) |

A suspended or banned person is signed out everywhere at once, can't sign in (the message gives your reason),
and their API keys stop working. Their videos and comments stay up; hide or remove them separately. Suspended and
banned work the same; the word is for your records and for them. Only an admin can lift either, in the users
table or with the CLI. Nobody can change their own status, and moderators can't act on admins.

People from other servers can't be suspended here; block their server instead (see
[Blocking other servers](#blocking-other-servers)). Step by step for admins:
[Suspending, banning and deleting accounts](Admin-Guide.md#suspending-banning-and-deleting-accounts).

## Strikes

Strikes put a repeat-infringer policy in place. A strike is given:

- when a takedown notice is recorded with **Remove the video**, while **Strike the uploader when a notice removes a
  video** is on (Admin → **Legal**, on by default);
- by a moderator with **Strike uploader** (a reported video) or **Add strike** (a reported channel).

The person gets a notification, *You received a copyright strike*, with the reason. When their active strikes
reach **Strikes that suspend an account** (3 by default) and the account is active, it's suspended
automatically (*Repeated copyright strikes*). 0 turns automatic suspension off.

A strike stays active for **Strikes expire after (days)** (365 by default; 0 means strikes never expire). Its
expiry is set when it's given, so changing the setting only affects new strikes.

Active strikes show in **Admin → Overview → Users → Strikes**, and on reports about a channel. Clicking the number
clears all of that person's strikes. Accepting a [counter-notice](#appeals-and-counter-notices) removes the strike
that came with its notice. Neither lifts a suspension; set **Status** back to **Active** for that.

## Sign-up

Set in **Admin → Overview → Site settings → Sign-up**, then **Save settings**:

| Mode | Key | What happens |
| --- | --- | --- |
| **Open** | `open` | Anyone can create an account. A new server starts like this. |
| **Needs approval** | `approval` | Anyone can sign up, but an admin approves each account before it can sign in. Invite links skip approval. |
| **Invite only** | `invite` | Only people with an invite link can sign up |
| **Closed** | `closed` | Nobody can sign up, not even with an invite link |

For a server for friends, **Invite only** is a good default. From the command line:
`settings set registration_mode invite`.

- **Invites**: only admins make them, in **Admin → Overview → Invites**, with a use limit and an expiry. See
  [Inviting people](Admin-Guide.md#inviting-people).
- **Approvals**: in the users table, see [Approving sign-ups](Admin-Guide.md#approving-sign-ups).
- **Terms**: if you write terms in **Admin → Legal**, people tick a box accepting them when they sign up.
- **The first account** is always made with the setup code, whatever the mode, and becomes the admin (see
  [First run](Installation.md#first-run)).
- Admins can't make accounts for other people; send an invite instead.

Sign-ups and sign-ins are slowed down against abuse: more than 20 new accounts from one address in an hour are
refused, and after too many wrong passwords within 15 minutes (10 for one account from one address, 50 from one
address, 30 for one account) sign-in says *Too many failed sign-ins. Try again in a few minutes.*

## Storage quotas

Set a default quota per person in **Admin → Overview → Site settings → Storage per person (MB)** (0 means no
limit), and override it per person by clicking their **Storage** in the users table. See
[Storage quotas](Admin-Guide.md#storage-quotas).

## Copyright notices

Record each notice you receive in **Admin → Legal → Record a takedown notice**:

| Field | What to put |
| --- | --- |
| **Video link or id** | The video's watch link (`https://.../watch/abc123`) or its id. Needed to remove a video. |
| **Claimant** | Who sent the notice (required) |
| **Claimant contact** | How to reach them |
| **Copyrighted work** | The work they say is infringed (required) |
| **Received** | The date the notice arrived (today if left empty) |
| **Action** | **Remove the video**, **Record only**, or **Reject (invalid notice)** |
| **Notes** | Anything for your records |

**Record notice** saves it. With **Remove the video** it first asks *Record this notice and remove the video
now?*, then removes the video (the reason the uploader sees is *Copyright notice from* and the claimant) and, if
**Strike the uploader when a notice removes a video** is on, gives the uploader a [strike](#strikes). The other two
actions only record the notice.

The **Takedown log** under the form lists every notice, newest received first: the video (linked), the action, a
*countered* badge while the uploader's counter-notice waits, or *restored* after one was accepted, and the
claimant, date and work. Notices also count towards the [transparency report](#public-pages).

## Appeals and counter-notices

**The uploader** of a hidden or removed video sees a banner on its page, with a button:

- removed: **This was a mistake: send a counter-notice**;
- hidden: **Ask the moderators to look again**.

The form asks **Why the removal was a mistake** (at least a sentence) and **How to reach you**, then **Send
counter-notice**. One can wait per video at a time; after a rejection the uploader can send another.

**Moderators** decide in **Admin → Moderation → Appeals**. Each card shows its status (*pending*, *accepted* or
*rejected*), the uploader and the video, the original notice's claimant and work if there was one, the
uploader's statement and contact. A pending one has:

- **Accept and restore** (*Restore the video?*): the video is restored. If it was removed by a takedown notice,
  the notice is marked *restored* and the strike that came with it is removed.
- **Reject** (*Keep the video removed?*): the video stays as it is.

The uploader is notified either way. For what the law expects after a counter-notice, see
[Background, not legal advice](#background-not-legal-advice).

## Blocking other servers

Blocking a server hides its videos here and refuses likes, comments and subscriptions from its people, over the
OurTube network and ActivityPub alike. Three ways:

- a report's **Block their instance** or **Block instance** (moderators and admins);
- **Admin → Network → Blocked instances**: type its address and click **Block**, or **Block** next to a server in
  the list; **Unblock** lifts it (admins);
- the shield button (**Admin**) on one of its videos → **Block** and the server's name (admins).

How blocks, block lists and the hub's bans work: [Network](Network.md#what-every-server-controls) and
[Block lists](Network.md#block-lists).

## The audit log

**Admin → Moderation → Audit log** lists the last 200 moderation actions: **When**, **Who**, **Action**,
**Target** and **Details** (usually the reason). **Who** is `system` for what OurTube did by itself, like an
automatic suspension or deleting a removed video's files. The actions include:

| Action | What happened |
| --- | --- |
| `report.resolve`, `report.dismiss` | A report was marked handled or dismissed |
| `video.hide`, `video.remove`, `video.restore`, `video.purge` | A video was hidden, removed, restored, or its files deleted after the retention period |
| `comment.approve`, `comment.delete` | A held comment was approved, or a comment deleted |
| `user.approve`, `user.activate`, `user.suspend`, `user.ban`, `user.strike`, `user.clear_strikes`, `user.delete` | Account actions |
| `instance.block`, `network_video.hide` | A server was blocked, or a video from one hidden, from a report |
| `takedown.record`, `counter_notice.submit`, `counter_notice.accept`, `counter_notice.reject` | Copyright notices and appeals |
| `invite.create` | An admin made an invite |
| `game.create`, `game.update`, `game.merge`, `game.delete` | Changes to the game list |
| `settings.spam`, `settings.legal` | The spam or legal settings were saved |

## Public pages

- **`/legal`** (*Rules and contact*) shows your **Rules**, **Terms**, and *Report abuse or copyright
  infringement* with the contact email and DMCA agent, all from **Admin → Legal**. It's linked from **Rules and
  contact** at the bottom of the sidebar, under expanded video descriptions, from the report dialog and from the
  sign-up form. See [Writing rules and terms](Admin-Guide.md#writing-rules-and-terms).
- **`/transparency`** (*Transparency report*), on while **Publish a transparency report** is on in **Admin →
  Legal**. It counts, since the server started: copyright notices received, videos removed after a notice, notices
  rejected as invalid, counter-notices received, videos restored after a counter-notice, reports received, reports
  acted on, and accounts suspended or banned. Below the counts, a table of the latest notices: when received,
  **From** (the claimant), **Work**, **Video** (its title) and **Outcome**. Contact details and notes are left out.
  While it's on, the sidebar links to it next to **Rules and contact**; turned off, the page says the site doesn't
  publish one.

## Privacy

People can pause their watch history, use anonymous mode in a browser, download all of their data, and delete
their account after a 7-day grace period. See [Watching and Discovery](Watching-and-Discovery.md#privacy) and
[Accounts and Settings](Accounts-and-Settings.md). An admin deleting an account from the users table deletes it at
once, with no grace period.

## Background, not legal advice

If strangers can upload to your server, you are hosting their content. Laws differ by country, so talk to a
lawyer before opening sign-ups. For the US, the short version:

- **DMCA safe harbor (17 U.S.C. § 512(c))** protects hosts from copyright claims over user uploads if they
  register a designated agent with the US Copyright Office (an online form with a small fee, renewed every three
  years), remove material quickly when they get a valid notice, and have and enforce a policy that ends repeat
  infringers' accounts. Put the agent's details in **Admin → Legal → DMCA agent** so they show on `/legal`.
- **Counter-notices.** After a valid counter-notice, the law expects the host to put the material back in 10 to
  14 business days unless the claimant says they have gone to court. OurTube records the counter-notice and
  leaves the decision to you.
- **Section 230** generally shields hosts from liability for what users post, but not for copyright or federal
  crimes. Child sexual abuse material must be reported to NCMEC; remove it and preserve what you're told to.
- **Elsewhere**, the EU's Digital Services Act has its own notice-and-action and transparency rules for hosts.

Running a members-only server for friends keeps most of this simple. Use invite-only sign-up until you're ready
for more.
