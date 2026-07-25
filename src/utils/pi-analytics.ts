// Minimal, privacy-light journey tracking.
// Sends one beacon per client-side route change to the self-hosted collector.
// No cookies, no persistent visitor id, no PII. Disabled unless VITE_ANALYTICS_URL is set.

const ENDPOINT = import.meta.env.VITE_ANALYTICS_URL as string | undefined;
const SESSION_KEY = "an_sid";

type Payload = {
  sid: string;
  path: string;
  ts: number;
  ref?: string; // external referrer, first event of the session only
  w?: number; // screen width, first event of the session only
};

/**
 * Returns false when tracking must not run: no endpoint configured, dev build,
 * Do Not Track enabled, or no browser storage/sendBeacon available.
 */
function isEnabled(): boolean {
  if (!ENDPOINT) return false;
  if (import.meta.env.DEV) return false;
  if (typeof navigator === "undefined") return false;
  // Honor Do Not Track across browser variants.
  const dnt =
    navigator.doNotTrack ||
    (window as any).doNotTrack ||
    (navigator as any).msDoNotTrack;
  if (dnt === "1" || dnt === "yes") return false;
  return true;
}

/**
 * Stable per-tab session id. Stored in sessionStorage so it resets when the
 * tab/session ends — no cross-visit tracking, no consent banner needed.
 * Returns a tuple of [sessionId, isFirstEvent].
 */
function getSession(): [string, boolean] {
  let sid = sessionStorage.getItem(SESSION_KEY);
  const isFirst = !sid;
  if (!sid) {
    sid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return [sid, isFirst];
}

function send(payload: Payload): void {
  const body = JSON.stringify(payload);
  // text/plain keeps this a CORS "simple request" (no preflight) and lets
  // sendBeacon deliver reliably without blocking navigation.
  const blob = new Blob([body], { type: "text/plain" });
  if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT as string, blob)) {
    return;
  }
  // Fallback for browsers without sendBeacon.
  fetch(ENDPOINT as string, {
    method: "POST",
    body,
    headers: { "Content-Type": "text/plain" },
    keepalive: true,
    mode: "cors",
  }).catch(() => {
    /* analytics must never break the app */
  });
}

/** Record a single page view (one client-side route change). */
export function track(path: string): void {
  if (!isEnabled()) return;
  try {
    const [sid, isFirst] = getSession();
    const payload: Payload = { sid, path, ts: Date.now() };
    if (isFirst) {
      payload.ref = document.referrer || "";
      payload.w = window.screen?.width;
      console.log(payload);

    }
    send(payload);
  } catch {
    /* never throw from tracking */
  }
}
