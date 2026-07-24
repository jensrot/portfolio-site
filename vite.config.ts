import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
        server: {
            open: true,
        },
        // Pre-bundle these at server start rather than on first request. Without
        // this, Vite discovers them mid-navigation, optimizes, then forces a full
        // page reload — which aborts an in-flight Playwright page.goto() and shows
        // up as a flaky "net::ERR_ABORTED; maybe frame was detached?" on a cold
        // node_modules/.vite cache (fresh clone or CI).
        optimizeDeps: {
            include: ['react', 'react-dom', 'react-router-dom', 'posthog-js', '@chenglou/pretext'],
        },
        build: {
            outDir: 'build',
            rollupOptions: {
                output: {
                    manualChunks: {
                        react: ['react', 'react-dom', 'react-router-dom'],
                        pretext: ['@chenglou/pretext'],
                        posthog: ['posthog-js'],
                    },
                },
            },
        },
        plugins: [react({
            jsxRuntime: 'automatic',
        })],
    };
});