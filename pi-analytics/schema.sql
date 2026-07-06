-- One row per page view (client-side route change).
-- A visitor's journey is just the rows for one `sid`, ordered by `ts`.
CREATE TABLE IF NOT EXISTS events (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  sid       TEXT NOT NULL,        -- per-tab session id (no cross-visit tracking)
  path      TEXT NOT NULL,        -- pathname (+ search) visited
  ref       TEXT,                 -- external referrer, first hit of the session only
  w         INTEGER,              -- screen width, first hit only
  country   TEXT,                 -- from Cloudflare CF-IPCountry header (no IP stored)
  ua        TEXT,                 -- user-agent (for bot filtering / debugging)
  ts        INTEGER NOT NULL,     -- client timestamp (ms)
  received  INTEGER NOT NULL      -- server receive time (ms)
);

CREATE INDEX IF NOT EXISTS idx_events_sid_ts ON events(sid, ts);
CREATE INDEX IF NOT EXISTS idx_events_received ON events(received);
