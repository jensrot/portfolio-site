/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_POSTHOG_KEY?: string;
    readonly VITE_POSTHOG_HOST?: string;
    readonly VITE_DEPLOY_CONTEXT?: string;
    readonly VITE_TEST?: string;
}
