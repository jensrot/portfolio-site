# pi-analytics

A tiny self-hosted collector that records the **route each visitor follows** through
the portfolio site, stores it in **SQLite**, and lets you explore journeys for free.

- **No cookies, no IP storage, no persistent visitor id** → minimal GDPR exposure.
- The frontend (in this repo) beacons one event per client-side route change.
- A visitor's journey is just the `events` rows for one `sid`, ordered by `ts`.

```
Browser (Netlify, HTTPS)
   └─ sendBeacon → Cloudflare Tunnel (HTTPS) → Pi: collector (Node + SQLite)
                                                   └─ Datasette (read-only dashboard)
```

## 1. Install on the Raspberry Pi

```bash
# Node 18+ recommended
sudo apt update && sudo apt install -y nodejs npm
git clone <this-folder-or-repo> ~/pi-analytics
cd ~/pi-analytics
npm install            # builds better-sqlite3 native binding
```

## 2. Run the collector

```bash
PORT=8787 \
ALLOWED_ORIGINS="https://yourdomain.com,https://your-site.netlify.app" \
node server.js
# POST /c  -> ingest  |  GET /health -> {ok:true}
```

Run it permanently with systemd (edit paths/user/origins in the unit first):

```bash
sudo cp analytics.service /etc/systemd/system/analytics.service
sudo systemctl daemon-reload
sudo systemctl enable --now analytics
sudo systemctl status analytics
```

## 3. Expose it over HTTPS with Cloudflare Tunnel (free)

```bash
# Install cloudflared (arm64 example):
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -o cloudflared
sudo install cloudflared /usr/local/bin/cloudflared

cloudflared tunnel login                 # authorize your Cloudflare domain
cloudflared tunnel create portfolio      # note the printed Tunnel ID
# Put config at ~/.cloudflared/config.yml (see cloudflared-config.example.yml)
cloudflared tunnel route dns portfolio collect.yourdomain.com
cloudflared tunnel route dns portfolio stats.yourdomain.com
sudo cloudflared service install         # run on boot
```

This gives the collector a stable HTTPS URL (`https://collect.yourdomain.com/c`) that
your HTTPS Netlify site can reach — no port-forwarding, home IP stays hidden.

## 4. Point the site at it

In the portfolio repo, set the env var (locally in `.env.local`, and in
**Netlify → Site settings → Environment variables**), then redeploy:

```
VITE_ANALYTICS_URL=https://collect.yourdomain.com/c
```

Tracking is automatically **off** in dev builds, when the var is unset, and when the
browser sends Do Not Track.

## 5. Analyze the journeys

Install [Datasette](https://datasette.io) and serve the DB read-only:

```bash
pip install datasette
datasette analytics.db --host 127.0.0.1 --port 8001
```

Open `https://stats.yourdomain.com` (the second tunnel hostname). **Protect it with
Cloudflare Access** (Zero Trust → Access → Applications, email-gated) so only you can
view it. Paste any recipe from [`queries.sql`](./queries.sql) into the SQL box — start
with **"Full route per session"** to see paths like `/ -> /demos -> /demos/word-cloud`.

Prefer the terminal? `sqlite3 analytics.db < queries.sql`.

## 6. Back up

```bash
# safe online backup (cron it weekly)
sqlite3 ~/pi-analytics/analytics.db ".backup '/home/pi/backups/analytics-$(date +%F).db'"
```

## Files

| File | Purpose |
|------|---------|
| `server.js` | The collector (Express + better-sqlite3). |
| `schema.sql` | The `events` table. |
| `queries.sql` | Journey-analysis SQL recipes. |
| `analytics.service` | systemd unit. |
| `cloudflared-config.example.yml` | Tunnel ingress config. |
