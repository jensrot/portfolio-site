-- Journey analysis recipes. Paste into Datasette's SQL box, or run:
--   sqlite3 analytics.db < queries.sql
-- (Datasette also lets you save these as named "canned queries" via metadata.json.)

-- 1) FULL ROUTE PER SESSION  (the headline view: the path each visitor followed)
SELECT
  sid,
  MIN(datetime(ts / 1000, 'unixepoch')) AS started,
  COUNT(*)                              AS steps,
  group_concat(path, ' -> ')            AS journey
FROM (SELECT * FROM events ORDER BY ts)
GROUP BY sid
ORDER BY started DESC;

-- 2) JOURNEYS OF SESSIONS THAT TOUCHED /demos
SELECT
  e.sid,
  group_concat(e.path, ' -> ') AS journey
FROM (SELECT * FROM events ORDER BY ts) e
WHERE e.sid IN (SELECT sid FROM events WHERE path = '/demos')
GROUP BY e.sid
ORDER BY MIN(e.ts) DESC;

-- 3) MOST COMMON NEXT STEP AFTER /demos
SELECT next_path, COUNT(*) AS times
FROM (
  SELECT
    path,
    LEAD(path) OVER (PARTITION BY sid ORDER BY ts) AS next_path
  FROM events
)
WHERE path = '/demos' AND next_path IS NOT NULL
GROUP BY next_path
ORDER BY times DESC;

-- 4) ENTRY PAGES (first page of each session)
SELECT path AS entry_page, COUNT(*) AS sessions
FROM (
  SELECT sid, path, ROW_NUMBER() OVER (PARTITION BY sid ORDER BY ts) AS rn
  FROM events
)
WHERE rn = 1
GROUP BY entry_page
ORDER BY sessions DESC;

-- 5) EXIT PAGES (last page of each session)
SELECT path AS exit_page, COUNT(*) AS sessions
FROM (
  SELECT sid, path, ROW_NUMBER() OVER (PARTITION BY sid ORDER BY ts DESC) AS rn
  FROM events
)
WHERE rn = 1
GROUP BY exit_page
ORDER BY sessions DESC;

-- 6) TOP REFERRERS
SELECT COALESCE(NULLIF(ref, ''), '(direct)') AS referrer, COUNT(*) AS sessions
FROM events
WHERE ref IS NOT NULL
GROUP BY referrer
ORDER BY sessions DESC;

-- 7) SESSIONS AND PAGE VIEWS PER DAY
SELECT
  date(ts / 1000, 'unixepoch') AS day,
  COUNT(DISTINCT sid)          AS sessions,
  COUNT(*)                     AS pageviews
FROM events
GROUP BY day
ORDER BY day DESC;
