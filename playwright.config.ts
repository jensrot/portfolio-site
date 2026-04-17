import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    retries: 1,
    reporter: [['list'], ['html', { open: 'on-failure' }]],
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
        { name: 'mobile-safari', use: { ...devices['iPhone 15'] } },
    ],
    webServer: {
        command: 'npm run start',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
    },
});
