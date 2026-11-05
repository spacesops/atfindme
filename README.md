# atfindme

Look up [Spaces protocol](https://spacesprotocol.org) handles. Live records come from a mesh of [certrelay](https://github.com/spacesprotocol/certrelay) servers via `@spacesprotocol/fabric-web`. Num alias, public key, and on-chain fallback come from a **spaced** JSON-RPC when one is reachable.

The site is meant to be run as many independent instances. They all fetch the same kind of data; compare a handle across instances listed in the header if you want to confirm that no particular host has been compromised.

Fabric resolve runs in a Node child process (`scripts/resolve-handle.mjs`) so WASM libveritas is not bundled by Next.js. If spaced is down, fabric records still render and alias/fallback are omitted.

## Requirements

- Node.js 20 or newer (22 LTS recommended)
- npm 10+
- git
- For production: a Linux host with a public IPv4 (and IPv6 if you have it), a DNS name, and ports 80/443 reachable

Optional, same machine or another host you control:

- a [spaced](https://github.com/spacesprotocol/spaces) node for on-chain num / fallback
- your own certrelay (otherwise the public seeds are used)

## Environment

Copy `.env.example` and fill in values. Next.js loads `.env`, `.env.local`, `.env.production`, and `.env.production.local` depending on the command. **Never commit secrets.** `.env` and `.env.local` are gitignored.

| Env | When it is read | Meaning |
|---|---|---|
| `HOST` | runtime | Bind IP for `npm run dev` / `npm start` (default `127.0.0.1`). `HOST_IP` and `HOSTNAME` are aliases. |
| `PORT` | runtime | Bind port (default `3000`). `HOST_PORT` is an alias. Keep the reverse proxy in sync if you change this. |
| `NEXT_PUBLIC_SITE_NAME` | **build time** | Brand in the UI (default `@FindMe`). Change this, then rebuild. |
| `FABRIC_SEEDS` | runtime | Comma-separated certrelay URLs. Unset uses public seeds (`relay-cosmos`, `relay-atlas`, `relay-orion`, `relay-pulsar` on `spacesprotocol.org`). |
| `FABRIC_DEV_MODE` | runtime | `true` skips work-depth checks (local relay that is not finalized). Leave unset in production. |
| `SPACED_RPC_URL` | runtime | Default `http://127.0.0.1:7225`. Use `127.0.0.1`, not `0.0.0.0`. |
| `SPACED_RPC_USER` / `SPACED_RPC_PASSWORD` | runtime | HTTP Basic auth for spaced. |
| `SPACED_CHAIN` | runtime | `mainnet` (documented for operators; spaced itself is configured on the node). |

## Local development

```bash
git clone git@spacesops-github:spacesops/atfindme.git   # or your fork
cd atfindme
cp .env.example .env.local
# set SPACED_RPC_USER / SPACED_RPC_PASSWORD if you have a local spaced node
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) or [http://localhost:3000/andrew@lunde](http://localhost:3000/andrew@lunde).

Do not use `npm run dev` on a public server.

## Remote server (production)

These steps assume Ubuntu 22.04 or 24.04, a dedicated unprivileged user, systemd, and [Caddy](https://caddyserver.com) for TLS. Nginx is noted at the end as an alternative.

Replace `atfindme.example.com`, the clone URL, and secret values with yours.

### 1. DNS

Create an `A` record (and `AAAA` if you have IPv6) for `atfindme.example.com` pointing at the server **before** you request certificates. Propagation can take a few minutes.

### 2. System packages and Node.js

```bash
sudo apt-get update
sudo apt-get install -y git ca-certificates curl build-essential
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # v22.x
npm -v
```

### 3. App user and source

```bash
sudo useradd --system --create-home --home-dir /opt/atfindme --shell /usr/sbin/nologin atfindme
sudo mkdir -p /opt/atfindme
sudo chown atfindme:atfindme /opt/atfindme
sudo -u atfindme -H git clone git@spacesops-github:spacesops/atfindme.git /opt/atfindme/app
```

The origin `spacesops-github` is an SSH host alias. Copy a working `~/.ssh/config` entry and `known_hosts` into `/opt/atfindme/.ssh/` (mode `700` on `.ssh`, `600` on keys) so the `atfindme` user can clone. For a private repo, install a deploy key:

```bash
sudo -u atfindme -H mkdir -p /opt/atfindme/.ssh
sudo -u atfindme -H ssh-keygen -t ed25519 -f /opt/atfindme/.ssh/id_ed25519 -N ""
# add /opt/atfindme/.ssh/id_ed25519.pub on the git host
```

HTTPS clone with a token also works; do not store that token in the repo.

### 4. Production environment file

```bash
sudo -u atfindme cp /opt/atfindme/app/.env.example /opt/atfindme/app/.env.production
sudo -u atfindme chmod 600 /opt/atfindme/app/.env.production
sudo -u atfindme ${EDITOR:-nano} /opt/atfindme/app/.env.production
```

A typical public instance:

```
NEXT_PUBLIC_SITE_NAME=@FindMe
HOST=127.0.0.1
PORT=3000
SPACED_RPC_URL=http://127.0.0.1:7225
SPACED_RPC_USER=your-spaced-user
SPACED_RPC_PASSWORD=a-long-random-password
SPACED_CHAIN=mainnet
```

Leave `FABRIC_SEEDS` unset to use the public certrelay mesh. To prefer relays you operate:

```
FABRIC_SEEDS=https://relay-atlas.spacesprotocol.org,https://relay.example.com
```

`NEXT_PUBLIC_SITE_NAME` is inlined at `npm run build`. After changing it, rebuild and restart.

If this host has no spaced node, you can still run the site: omit or ignore the `SPACED_RPC_*` values. Lookups then come from certrelay only.

### 5. Install dependencies and build

```bash
cd /opt/atfindme/app
sudo -u atfindme npm ci
sudo -u atfindme -H env NODE_ENV=production npm run build
```

Confirm `.next` was created and the build finished without errors. The first fabric lookup after start talks to certrelay and can take tens of seconds.

### 6. systemd unit

Listen on `HOST`/`PORT` from `.env.production` (defaults `127.0.0.1:3000`). Caddy (or nginx) terminates TLS and proxies to that address.

```bash
sudo tee /etc/systemd/system/atfindme.service >/dev/null <<'EOF'
[Unit]
Description=atfindme Spaces handle lookup
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=atfindme
Group=atfindme
WorkingDirectory=/opt/atfindme/app
Environment=NODE_ENV=production
EnvironmentFile=-/opt/atfindme/app/.env.production
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/atfindme/app

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now atfindme
sudo systemctl status atfindme --no-pager
```

Check it locally on the server:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/
journalctl -u atfindme -f
```

You should see `200`. Point Caddy/nginx at the same `HOST` and `PORT` as `.env.production`. If the service cannot find `npm`/`next`, set `ExecStart=/usr/bin/node /opt/atfindme/app/scripts/listen.mjs start`.

### 7. Reverse proxy and TLS (Caddy)

```bash
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update
sudo apt-get install -y caddy
```

```bash
sudo tee /etc/caddy/Caddyfile >/dev/null <<'EOF'
atfindme.example.com {
	encode gzip
	reverse_proxy 127.0.0.1:3000
}
EOF

sudo systemctl enable --now caddy
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy obtains and renews Let’s Encrypt certificates as long as port 80 is open and the DNS name points here.

### 8. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status
```

Do **not** expose spaced RPC (7225), certrelay’s bind if it is loopback-only, or Next’s 3000 to the public internet.

### 9. Verify from outside

```bash
curl -sSI https://atfindme.example.com/
curl -sS "https://atfindme.example.com/api/resolve?q=andrew@lunde" | head
```

In a browser: open the homepage (rationale, search, directory links), then a handle such as `/andrew@lunde`.

### 10. Register the instance in the directory

After the site is live on HTTPS, publish a directory record for the Spaces handle that owns this instance. Other atfindme hosts query certrelay `GET /addrs?name=service-type&addr=directory` and link to handles that have a `txt website=https://…` record.

Replace the secret key, IPv4 address, DNS hostname, and Spaces handle. Do not commit or paste the key into the repo.

```bash
fabric publish --seeds https://relay-cosmos.spacesprotocol.org \
  --secret-key <tweaked private key> \
  --addr service-type=directory \
  --addr ipv4=<ipv4 addr> \
  --txt type=spaces-webproxy \
  --txt website=https://<dns hostname> \
  <spaces handle> | jq .
```

Propagation across relays can take a little time. Confirm with:

```bash
curl -sS "https://relay-cosmos.spacesprotocol.org/addrs?name=service-type&addr=directory" | jq .
```

### Optional: spaced on the same host

Point `SPACED_RPC_URL` at `http://127.0.0.1:7225` and set the same Basic-auth user/password the node uses. Bind spaced’s RPC to localhost (or to `0.0.0.0` only on a private network, and still use `127.0.0.1` in atfindme — the app rewrites `0.0.0.0` to `127.0.0.1`). Restart atfindme after changing `.env.production` (no rebuild needed for `SPACED_*`).

### Optional: nginx instead of Caddy

Terminate TLS yourself (certbot) and proxy:

```nginx
server {
    listen 443 ssl http2;
    server_name atfindme.example.com;
    ssl_certificate     /etc/letsencrypt/live/atfindme.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/atfindme.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Redirect 80 to 443. Reload nginx after obtaining certificates.

### Updating an instance

```bash
cd /opt/atfindme/app
sudo -u atfindme git pull --ff-only
sudo -u atfindme npm ci
sudo -u atfindme -H env NODE_ENV=production npm run build
sudo systemctl restart atfindme
sudo systemctl status atfindme --no-pager
```

Rebuild whenever `NEXT_PUBLIC_SITE_NAME` or application code changes. Runtime-only env (`FABRIC_*`, `SPACED_*`) needs a restart after editing `.env.production`.
