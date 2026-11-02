# Webhooks

A webhook tells a bot, a bridge or a chat channel when you post. Set yours up in **Settings → Apps → Webhooks**; each
person has their own, for their own videos and streams. An admin's webhook can cover the whole server instead
(see [Whole-server webhooks](#whole-server-webhooks)).

- [Setting one up](#setting-one-up)
- [Events](#events)
- [Whole-server webhooks](#whole-server-webhooks)
- [Formats](#formats)
- [What a JSON delivery looks like](#what-a-json-delivery-looks-like)
- [Checking the signature](#checking-the-signature)
- [Deliveries, retries and limits](#deliveries-retries-and-limits)
- [Managing webhooks from a script](#managing-webhooks-from-a-script)

## Setting one up

Account menu (your picture, top right) → **Settings** → **Apps** → **Webhooks**, or `/settings/apps#webhooks`.
Any member can make webhooks.

1. **Address**: the URL the server posts to, starting with `https://` (or `http://`), up to 500 characters. For
   Discord, that's the webhook URL Discord gives you (see [Formats](#formats)). A user name and password in the
   address are refused: put a password in the secret instead.
2. **Format**: **JSON**, **Discord** or **Slack** (see [Formats](#formats)).
3. **Secret (optional)**: up to 200 characters. With one, every delivery is signed (see
   [Checking the signature](#checking-the-signature)).
4. **Sends** (admins only): your own videos, or everything on the server (see
   [Whole-server webhooks](#whole-server-webhooks)).
5. The events: both boxes are ticked to start with, and at least one has to stay ticked.
6. **Add**. The address is looked up first: one that can't be found (*Could not find …*), or that's in a private
   network, is refused. Admins' addresses aren't limited this way (see
   [Deliveries, retries and limits](#deliveries-retries-and-limits)).

Each webhook in the list shows its address and badges: the format, **signed** when it has a secret, **off** when
it's turned off, and **whole server** or **whole server + network** for an admin's whole-server webhook. Under it
are its events and how the last delivery went: *nothing sent yet*, *delivered* with the date, or *failed* with the
date and the error.

- **Test** sends a test right away and says what the other end answered (*Test sent: the other end answered 204*,
  or *Test failed:* and why).
- **Turn off** / **Turn on** pauses it without losing it.
- The bin icon (**Delete webhook**) removes it, after you confirm.

The page can't change a webhook after it's added. To change its address, format, events or secret, delete it and
add it again, or change it [from a script](#managing-webhooks-from-a-script).

## Events

| Event | Box on the form | When it's sent |
| --- | --- | --- |
| `video.published` | *A video is published (public, and done processing)* | A public video of yours finishes processing. A draft is sent when you save its details as public, and an unlisted or private video when you first make it public. Once per video. |
| `live.started` | *A public live stream starts* | You start a public [live stream](Live-Streaming.md). Once per stream, so a connection that drops and comes back doesn't send it again. |
| `test` | (none) | Only from the **Test** button. |

Nothing is sent for unlisted, private or group-only videos, for unlisted live streams, for videos a moderator has
hidden, or for videos brought in by an
[import from YouTube or Immich](Uploading-and-Editing.md#importing-from-youtube-and-immich) or a
[channel import](Fediverse.md#moving-a-channel), since a whole back catalogue would flood the channel.
Unticking *Share with the network* on a video doesn't stop its webhook.

## Whole-server webhooks

An admin picks what a webhook **Sends**:

- **Your own videos and live streams**, like everyone else's webhooks.
- **Everything published on this server**: every person's public videos and live streams here, the admin's own
  included, for a bot that announces the whole site in a chat channel or bridges it somewhere.
  - **Also new videos from other servers in the network** (optional): videos that reach this server from the rest of
    the [network](Network.md), as they arrive. Their `url` opens them
    on this server, `original_url` on their own, and `video.server` says where they live (with
    `"from_network": true`). Only videos newer than the webhook and at most two days old count, so joining a
    network or turning the webhook on doesn't send a server's whole back catalogue. Live streams on other
    servers aren't sent.

A whole-server webhook stops when its owner is no longer an admin, and turns back on if they are made one again.
Members who aren't admins don't see the **Sends** choice.

## Formats

- **JSON** sends the whole event (below), for bots and bridges.
- **Discord** sends a message to a Discord webhook (*Channel settings → Integrations → Webhooks*): who posted
  what, and the link, which Discord then shows with its preview and player.
- **Slack** sends the same message to a Slack incoming webhook, or to Mattermost.

The Discord body is `{"username": "<site name>", "content": "<message>"}` and the Slack body
`{"username": "<site name>", "text": "<message>"}`. The message is one line and the link:

| Event | Message |
| --- | --- |
| `video.published` | `<display name> posted a new video: <title>` |
| `video.published` from the network | `<display name> on <their server> posted a new video: <title>` |
| `live.started` | `<display name> is live: <title>` |
| `test` | `Webhook test from <site name>: this webhook works.` |

**Test** sends a test right away and shows what the other end answered.

## What a JSON delivery looks like

```json
{
  "event": "video.published",
  "delivery": "kq3T0v9xW2c",
  "sent_at": "2026-10-25T23:15:45.011Z",
  "site": { "name": "Our Clips", "url": "https://clips.example.com" },
  "video": {
    "id": "nVei-xmEYFI",
    "title": "Clutch round",
    "description": "",
    "url": "https://clips.example.com/watch/nVei-xmEYFI",
    "thumbnail_url": "https://clips.example.com/media/thumbs/nVei-xmEYFI.jpg",
    "video_url": "https://clips.example.com/media/videos/nVei-xmEYFI.mp4",
    "duration": 21.5,
    "width": 1920,
    "height": 1080,
    "game": { "id": "rocket-league", "name": "Rocket League" },
    "tags": ["ranked"],
    "published_at": "2026-10-25T22:01:00.000Z",
    "channel": { "username": "alex", "display_name": "Alex", "url": "https://clips.example.com/c/alex", "avatar_url": null },
    "server": { "name": "Our Clips", "url": "https://clips.example.com" }
  }
}
```

`live.started` has a `stream` instead: `id`, `title`, `description`, `url` (the live page), `game`, `started_at`
and `channel`. A test delivery has `"event": "test"`, with your latest public video when you have one. Each
request carries the `X-OurTube-Event` and `X-OurTube-Delivery` headers and a `User-Agent` starting with
`OurTube/`. The links are complete when the site's admin has set its Public URL. Every `X-OurTube-` header is
also sent as `X-ClipTube-`, the name from before the rename, so receivers set up earlier keep working.

Every field:

| Field | What it is |
| --- | --- |
| `event` | `video.published`, `live.started` or `test` |
| `delivery` | This delivery's id, the same as the `X-OurTube-Delivery` header; it stays the same when a delivery is retried |
| `sent_at` | When this attempt was sent (ISO 8601) |
| `site.name`, `site.url` | This server's name and Public URL (`null` without one) |
| `video.id` | The video's id (for a network video, its id on its own server) |
| `video.title`, `video.description` | As on the watch page (`description` is `""` when empty) |
| `video.url` | The watch page on this server |
| `video.original_url` | Network videos only: the watch page on their own server |
| `video.thumbnail_url` | The thumbnail, or `null` |
| `video.video_url` | The MP4 (for a network video, on its own server, or `null` when it has none) |
| `video.duration` | Length in seconds, or `null` |
| `video.width`, `video.height` | Size in pixels, or `null` |
| `video.game` | `{ "id", "name" }` from the [game catalog](Video-Tools-and-Games.md#games), or `null` |
| `video.tags` | A list of tags, possibly empty |
| `video.published_at` | When it was published (ISO 8601) |
| `video.channel` | `username`, `display_name`, `url` (the channel page) and `avatar_url` (or `null`) |
| `video.server` | `name` and `url` of the server the video lives on |
| `video.from_network` | `true` for a video from another server in the network; left out otherwise |
| `stream.id`, `stream.title`, `stream.description` | The live stream, as set in Settings → Channel → **Live streaming** |
| `stream.url` | The live page, `/live/<username>` |
| `stream.game` | `{ "id", "name" }`, or `null` |
| `stream.started_at` | When the stream started (ISO 8601) |
| `stream.channel` | Like `video.channel` |

The headers:

| Header | Value |
| --- | --- |
| `Content-Type` | `application/json` (for every format) |
| `User-Agent` | `OurTube/<version> (webhook)` |
| `X-OurTube-Event` | The event |
| `X-OurTube-Delivery` | The delivery id |
| `X-OurTube-Signature` | `sha256=<hex>`, only with a secret |
| `X-ClipTube-Event`, `X-ClipTube-Delivery`, `X-ClipTube-Signature` | The same values under the old name |

## Checking the signature

With a **secret**, `X-OurTube-Signature` is `sha256=` followed by the HMAC-SHA256 of the raw body with the secret,
so the other end can check that the request came from this site:

```js
const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(req.headers['x-ourtube-signature'] || ''));
```

Check the body exactly as it arrived, before parsing it. The Discord and Slack formats are signed the same way.

The secret is never shown again after you save it; leave it out when editing to keep it. The list only says
**signed**. Editing happens [from a script](#managing-webhooks-from-a-script): leaving `secret` out keeps it, and
an empty `secret` removes it.

## Deliveries, retries and limits

- A delivery that doesn't get a `2xx` answer within 10 seconds is tried again, up to five tries in all, a little
  later each time (about 30 seconds, then 1, 2 and 4 minutes). After the fifth it's dropped. Every try of a
  delivery has the same `X-OurTube-Delivery`, so a receiver can ignore one it already handled. Your list shows how
  the last one went.
- Turning a webhook off also drops the deliveries still waiting to be retried.
- **Test** is sent once, without retries, and works even while the webhook is turned off.
- Up to 10 webhooks each, and 10 tests every 10 minutes.
- Webhooks can't reach the server's own network (localhost, the LAN, its other containers, cloud metadata
  addresses): the address is checked when you save it, and the address actually connected to on every delivery.
  An admin's webhooks may, for bots running next to the site.

## Managing webhooks from a script

The page uses this API, under `/api/me/webhooks`. It needs a signed-in session (the browser's cookie, or a bearer
session token like the Android app's); an [API key](Uploading-and-Editing.md#uploading-from-sharex-and-other-tools)
won't do, since keys can only upload.

| Request | What it does |
| --- | --- |
| `GET /api/me/webhooks` | Your webhooks, plus the `events`, `formats` and `scopes` you can use |
| `POST /api/me/webhooks` | Adds one |
| `PATCH /api/me/webhooks/<id>` | Changes one; only the fields you send change |
| `DELETE /api/me/webhooks/<id>` | Deletes one |
| `POST /api/me/webhooks/<id>/test` | Sends a test and answers `ok`, `status` and `error` |

The fields:

| Field | Value |
| --- | --- |
| `url` | The address |
| `format` | `json` (the default), `discord` or `slack` |
| `events` | A list, or a comma-separated string, of `video.published` and `live.started`; both when left out on `POST` |
| `secret` | Up to 200 characters; on `PATCH`, left out keeps it and `""` removes it |
| `scope` | `mine` (the default) or, for admins, `site` |
| `include_network` | `true` to add videos from the network; only with `"scope": "site"` |
| `enabled` | `PATCH` only: `false` turns it off, `true` back on |

```bash
curl -X POST https://clips.example.com/api/me/webhooks \
  -H "Authorization: Bearer <session token>" -H "Content-Type: application/json" \
  -d '{"url": "https://discord.com/api/webhooks/...", "format": "discord", "events": ["video.published"]}'
```

Each webhook comes back with `id`, `url`, `format`, `events`, `scope`, `include_network`, `enabled`, `has_secret`,
`created_at`, and how the last delivery went: `last_attempt_at`, `last_status`, `last_error` and `last_ok_at`.
