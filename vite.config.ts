import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
        server: {
            open: true,
        },
        build: {
            outDir: 'build',
            rollupOptions: {
                output: {
                    manualChunks: {
                        react: ['react', 'react-dom', 'react-router-dom'],
                        pretext: ['@chenglou/pretext'],
                    },
                },
            },
        },
        plugins: [react({
            jsxRuntime: 'automatic',
        })],
    };
});