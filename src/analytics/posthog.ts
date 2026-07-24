import type { PostHog } from 'posthog-js';

const token = import.meta.env.VITE_POSTHOG_KEY;

// Only ever runs in a production build with a key present, so `npm run dev` and
// the Playwright suite (both on the dev server) never show up as real traffic.
export const analyticsEnabled = Boolean(import.meta.env.PROD && token);

let client: PostHog | undefined;

export const getClient = (): PostHog | undefined => client;

/**
 * @description Initializes the PostHog analytics client. This function is designed to be safe to call even when analytics is disabled or still loading, so call sites don't have to guard themselves.
 * @returns {Promise<void>} - A promise that resolves when the analytics client has been initialized.
 */
export const initAnalytics = async (): Promise<void> => {
    if (!analyticsEnabled) { return; }

    const { default: posthog } = await import('posthog-js');

    posthog.init(token as string, {
        // The /rt proxy only exists on Netlify's edge, so a local production build
        // needs VITE_POSTHOG_HOST=https://eu.i.posthog.com to reach PostHog directly.
        api_host: import.meta.env.VITE_POSTHOG_HOST ?? `${window.location.origin}/rt`,
        ui_host: 'https://eu.posthog.com',
        // Gives us capture_pageview: 'history_change', so react-router navigations
        // are tracked automatically. Deliberately not '2026-06-25': that one turns on
        // streamNetworkBody, which records request bodies into session replays.
        defaults: '2026-05-30',
        persistence: 'memory', // cookieless: no cookie and no localStorage entry
        person_profiles: 'identified_only', // nobody logs in here, so everything stays anonymous
        capture_performance: { web_vitals: true },
        capture_exceptions: true, // pretext/canvas blowups on mobile are invisible otherwise
        session_recording: { maskAllInputs: true },
    });

    posthog.register({ deploy: import.meta.env.VITE_DEPLOY_CONTEXT ?? 'unknown' });

    client = posthog;
};
