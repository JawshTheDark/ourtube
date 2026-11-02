# Admin CLI

`server/cli.js` manages a server from its shell, without a web login: the network, accounts and settings. It
works on the server's own database, so run it where the data lives, while the server keeps running. Settings and
account changes apply to the running server straight away; anything a command sends to other servers is queued and
delivered by the running server's job queue.

- [Running it](#running-it)
- [Network](#network)
- [Accounts](#accounts)
- [Settings](#settings)
- [Examples](#examples)
- [Locked out of the admin account?](#locked-out-of-the-admin-account)

## Running it

**Docker** (the container is called `cliptube` in OurTube's compose files):

```bash
docker exec cliptube node server/cli.js <command>
```

If your compose file has no `container_name: cliptube`, use the name `docker ps` shows (Compose names it after
the stack and the service, such as `ourtube-cliptube-1`), or run it from the stack's folder by service name:
`docker compose exec cliptube node server/cli.js <command>`.

**Dockge, Portainer and other stack managers**: open a shell inside the `cliptube` container with the stack
manager's terminal or console button for that container. The shell starts in the app's folder, so leave out the
`docker exec cliptube` part:

```bash
node server/cli.js user list
```

`settings set-secret` reads the secret from what you type: type or paste it, press Enter, then Ctrl+D. It shows on
screen as you type, so make sure nobody is watching. Alternatively, from a shell on the Docker host, use the
`docker exec` lines on this page as they are.

**Without Docker**: from the app's folder, as the user the server runs as and with the same `DATA_DIR`, for
example with the systemd unit from [Installation](Installation.md#without-docker):

```bash
cd /opt/cliptube
sudo -u cliptube env DATA_DIR=/var/lib/cliptube node server/cli.js <command>
```

Run it with no arguments for a short usage line. An unknown command or a missing argument prints what's wrong
and exits with an error.

## Network

| Command | What it does |
| --- | --- |
| `network status` | This server's network role and state as JSON: its address, peers, blocked servers, block lists it follows, and its hub or membership |
| `network hub-enable <public-url>` | Make this server the hub of a network, at its public `https://` address |
| `network hub-disable` | Stop being a hub |
| `network join <url> [--self <url>]` | Join a network through its hub or any server in it. Uses the Public URL setting as this server's address unless `--self` gives one. |
| `network peer <url>` | Peer with a server directly |
| `network follow-blocklist <url> [--mode auto\|review]` | Follow another server's published block list, applied automatically (`auto`) or after your review (`review`, the default) |
| `network leave [--keep-peers]` | Leave the network, or with `--keep-peers` only the hub, keeping direct peers |
| `network sync` | Sync now (hub, block lists, peers) and print the status |

Every command except `hub-disable` and `leave` prints the status afterwards. What these do:
[Network](Network.md).

```bash
docker exec cliptube node server/cli.js network status
docker exec cliptube node server/cli.js network hub-enable https://clips.example.com
docker exec cliptube node server/cli.js network hub-disable
docker exec cliptube node server/cli.js network join https://clips.irc.so
docker exec cliptube node server/cli.js network join https://clips.irc.so --self https://clips.example.com
docker exec cliptube node server/cli.js network peer https://friend.example.net
docker exec cliptube node server/cli.js network follow-blocklist https://clips.irc.so --mode auto
docker exec cliptube node server/cli.js network leave --keep-peers
docker exec cliptube node server/cli.js network sync
```

## Accounts

| Command | What it does |
| --- | --- |
| `user list` | Every account on this server, oldest first: username, role, status, and the reason for a suspension or ban, separated by tabs |
| `user role <username> <user\|moderator\|admin>` | Change someone's role (`user` is **Member** on the website) |
| `user status <username> <active\|suspended\|banned> [reason]` | Suspend, ban or reinstate an account; `active` also approves a waiting sign-up. The reason is shown to them when they try to sign in. |

Suspending or banning signs the person out at once. These are the same as the **Role** and **Status** columns in
Admin → **Overview** → **Users** (see [Admin Guide](Admin-Guide.md#suspending-banning-and-deleting-accounts)).
There's no command to make, delete or rename an account, or to set a password.

```bash
docker exec cliptube node server/cli.js user list
docker exec cliptube node server/cli.js user role alice moderator
docker exec cliptube node server/cli.js user role alice user
docker exec cliptube node server/cli.js user status spammer banned "posting spam"
docker exec cliptube node server/cli.js user status bob active
```

## Settings

| Command | What it does |
| --- | --- |
| `settings get <key>` | Print a setting (empty when it's empty). Refuses secret ones. |
| `settings set <key> <value>` | Change a setting. Everything after the key is the value, so quotes are only needed for your shell. Refuses secret ones, and keys that start with `instance_`. |
| `settings set-secret <steamgriddb_api_key\|smtp_password>` | Set a secret from standard input, keeping it out of the command line and your shell history |

The keys, their values and their defaults are listed in [Configuration](Configuration.md). Unlike the Admin pages,
`settings set` doesn't check the value, and changing `hls_ladder` or `federation_rendition` here doesn't start
rebuilding the videos (see [Settings from the command line](Configuration.md#settings-from-the-command-line)).

```bash
docker exec cliptube node server/cli.js settings get registration_mode
docker exec cliptube node server/cli.js settings set registration_mode invite
docker exec cliptube node server/cli.js settings set site_name "Friday Clips"
docker exec -i cliptube node server/cli.js settings set-secret smtp_password < passwordfile
```

Note the `-i` for `set-secret`, so the file reaches the container.

## Examples

```bash
# Who's on this server, and who's an admin?
docker exec cliptube node server/cli.js user list

# Make sign-up invite-only
docker exec cliptube node server/cli.js settings set registration_mode invite

# Join the OurTube network
docker exec cliptube node server/cli.js network join https://clips.irc.so

# Make someone a moderator
docker exec cliptube node server/cli.js user role alice moderator

# Ban a spammer, with a reason
docker exec cliptube node server/cli.js user status spammer banned "posting spam"

# Turn on adaptive streaming (the Admin page also rebuilds existing videos; this only affects new ones)
docker exec cliptube node server/cli.js settings set hls_ladder full

# Save a SteamGridDB API key (note the -i, so the key file reaches the container)
docker exec -i cliptube node server/cli.js settings set-secret steamgriddb_api_key < keyfile

# Follow the hub's block list, reviewing each block before it applies
docker exec cliptube node server/cli.js network follow-blocklist https://clips.irc.so --mode review
```

## Locked out of the admin account?

With email set up and a confirmed address on your account, use **Forgot your password?** on the sign-in page (see
[When someone forgets their password](Admin-Guide.md#when-someone-forgets-their-password)). Otherwise there's no
password reset, from the website or the command line. Instead, make a new account and promote it. Setting sign-up
to **Needs approval** for a moment means nobody else can get in meanwhile:

```bash
docker exec cliptube node server/cli.js settings get registration_mode        # note it, to put it back later
docker exec cliptube node server/cli.js settings set registration_mode approval
# create the account at /register in the browser; it waits for approval, so:
docker exec cliptube node server/cli.js user status <new-account> active
docker exec cliptube node server/cli.js user role <new-account> admin
docker exec cliptube node server/cli.js settings set registration_mode invite  # or what it was before
```

Sign in with the new account. Anyone else who signed up meanwhile is waiting in Admin → **Overview** → **Users**,
where you can **Reject** them. Your old account stays as it was; nobody can sign in to it.
