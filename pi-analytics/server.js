"use strict";

// Tiny journey collector: receives one beacon per route change and stores it in SQLite.
// No IP is stored. CORS is locked to the configured site origin.

const fs = require("fs");
const path = require("path");
const express = require("express");
const Database = require("better-sqlite3");

// --- Config (override via environment) ---------------------------------------
const PORT = parseInt(process.env.PORT || "8787", 10);
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "analytics.db");
// Comma-separated list of allowed site origins (your Netlify URL + custom domain).
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  "https://yourdomain.com")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const MAX_BODY = 2 * 1024; // bytes; payloads are tiny
const MAX_PATH_LEN = 512;
const MAX_REF_LEN = 1024;
const BOT_RE = /bot|crawl|spider|slurp|bing|headless|preview|monitor|curl|wget|python-requests/i;

// --- Database ----------------------------------------------------------------
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));

const insert = db.prepare(
  `INSERT INTO events (sid, path, ref, w, country, ua, ts, received)
   VALUES (@sid, @path, @ref, @w, @country, @ua, @ts, @received)`
);

// --- App ---------------------------------------------------------------------
const app = express();
app.disable("x-powered-by");
app.set("trust proxy", true);

// Read the raw text/plain body (sendBeacon sends a text/plain blob).
app.use(
  express.text({ type: ["text/plain", "application/json"], limit: MAX_BODY })
);

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
    return true;
  }
  return false;
}

app.options("/c", (req, res) => {
  applyCors(req, res);
  res.status(204).end();
});

app.post("/c", (req, res) => {
  applyCors(req, res); // ok even if origin not allowed; we just won't echo it
  res.status(204).end(); // always 204 fast; never block the browser

  try {
    const ua = req.headers["user-agent"] || "";
    if (BOT_RE.test(ua)) return;

    const raw = typeof req.body === "string" ? req.body : "";
    if (!raw) return;
    const p = JSON.parse(raw);

    const sid = typeof p.sid === "string" ? p.sid.slice(0, 64) : null;
    let pth = typeof p.path === "string" ? p.path.slice(0, MAX_PATH_LEN) : null;
    if (!sid || !pth) return;

    insert.run({
      sid,
      path: pth,
      ref: typeof p.ref === "string" ? p.ref.slice(0, MAX_REF_LEN) : null,
      w: Number.isFinite(p.w) ? Math.trunc(p.w) : null,
      country: (req.headers["cf-ipcountry"] || "").toString().slice(0, 2) || null,
      ua: ua.slice(0, 256),
      ts: Number.isFinite(p.ts) ? Math.trunc(p.ts) : Date.now(),
      received: Date.now(),
    });
  } catch {
    // Malformed payloads are ignored on purpose.
  }
});

// Lightweight health check (handy behind the tunnel).
app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, "127.0.0.1", () => {
  console.log(`pi-analytics collector listening on http://127.0.0.1:${PORT}`);
  console.log(`db: ${DB_PATH}`);
  console.log(`allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
});
