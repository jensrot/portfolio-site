import { test, expect, Page } from '@playwright/test';

async function expectParticlesAlive(page: Page) {
    const canvas = page.locator('.particles-animation canvas');
    await expect(canvas).toBeVisible();

    // Canvas must have non-zero CSS dimensions — guards against the 47px bug
    // where -webkit-fill-available resolved to the URL bar height on Android Chrome
    const { width, height } = await canvas.evaluate(el => ({
        width: (el as HTMLElement).offsetWidth,
        height: (el as HTMLElement).offsetHeight,
    }));
    expect(width).toBeGreaterThan(200);
    expect(height).toBeGreaterThan(200);
}

test('particles visible on home page', async ({ page }) => {
    await page.goto('/');
    await expectParticlesAlive(page);
});

test('particles visible on projects page', async ({ page }) => {
    await page.goto('/projects');
    await expectParticlesAlive(page);
});

test('particles visible on demos index page', async ({ page }) => {
    await page.goto('/demos');
    await expectParticlesAlive(page);
});

test('particles survive navigation from home to demos', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('easter_egg_found', 'true'));
    await page.reload();
    await page.locator('.easter-egg-link').click();
    await expect(page).toHaveURL('/demos');
    await expectParticlesAlive(page);
});

test('particles survive navigating into a demo and back to demos index', async ({ page }) => {
    await page.goto('/demos');
    await page.locator('a[href="/demos/word-cloud"]').click();
    await expect(page).toHaveURL('/demos/word-cloud');
    await expectParticlesAlive(page);
    await page.locator('.demo-back-link').click();
    await expect(page).toHaveURL('/demos');
    await expectParticlesAlive(page);
});

test('particles survive navigating through multiple demo pages', async ({ page }) => {
    await page.goto('/demos');

    const demoPaths = [
        '/demos/word-cloud',
        '/demos/flowing-paragraph',
        '/demos/typewriter-stream',
        '/demos/multilang',
        '/demos/balanced-labels',
    ];

    for (const path of demoPaths) {
        await page.goto(path);
        await expectParticlesAlive(page);
        await page.locator('.demo-back-link').click();
        await expect(page).toHaveURL('/demos');
        await expectParticlesAlive(page);
    }
});
