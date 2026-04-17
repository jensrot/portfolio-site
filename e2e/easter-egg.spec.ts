import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('easter_egg_found'));
    await page.reload();
});

test('easter egg link is hidden on first load', async ({ page }) => {
    await expect(page.locator('.easter-egg-link')).not.toBeVisible();
});

test('hovering for 2 seconds reveals easter egg link on desktop', async ({ page }) => {
    const zone = page.locator('.easter-egg-zone');
    await zone.hover();
    await page.waitForTimeout(2000);
    await expect(page.locator('.easter-egg-link')).toBeVisible({ timeout: 5000 });
});

test('cursor changes to progress while waiting on desktop', async ({ page }) => {
    const zone = page.locator('.easter-egg-zone');
    await zone.hover();
    await expect(zone).toHaveCSS('cursor', 'progress');
});

test('cursor reverts to default if user leaves early on desktop', async ({ page }) => {
    const zone = page.locator('.easter-egg-zone');
    await zone.hover();
    await page.waitForTimeout(300);
    await page.mouse.move(0, 400);
    await expect(zone).toHaveCSS('cursor', 'default');
});

test('easter egg is saved to localStorage after reveal', async ({ page }) => {
    const zone = page.locator('.easter-egg-zone');
    await zone.hover();
    await expect(page.locator('.easter-egg-link')).toBeVisible({ timeout: 5000 });
    const stored = await page.evaluate(() => localStorage.getItem('easter_egg_found'));
    expect(stored).toBe('true');
});

test('easter egg is not shown if value is false in localStorage', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('easter_egg_found', 'false'));
    await page.reload();
    await expect(page.locator('.easter-egg-link')).not.toBeVisible();
});

test('leaving early does not reveal the easter egg', async ({ page }) => {
    const zone = page.locator('.easter-egg-zone');
    await zone.hover();
    await page.waitForTimeout(500);
    await page.mouse.move(0, 400);
    await page.waitForTimeout(1800);
    await expect(page.locator('.easter-egg-link')).not.toBeVisible();
});

test('touching and holding on mobile for 2 seconds reveals the easter egg', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const zone = page.locator('.easter-egg-zone');
    await zone.dispatchEvent('touchstart');
    await page.waitForTimeout(2000);
    await expect(page.locator('.easter-egg-link')).toBeVisible({ timeout: 5000 });
});

test('easter egg link is shown on / page when value is true in localStorage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await page.evaluate(() => localStorage.setItem('easter_egg_found', 'true'));
    await page.reload();
    await expect(page.locator('.easter-egg-link')).toBeVisible();
});

test('easter egg link is shown on /projects page when value is true in localStorage', async ({ page }) => {
    await page.goto('/projects');
    await expect(page).toHaveURL('/projects');
    await page.evaluate(() => localStorage.setItem('easter_egg_found', 'true'));
    await page.reload();
    await expect(page.locator('.easter-egg-link')).toBeVisible();
});

test('easter egg link navigates to /demos page', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('easter_egg_found', 'true'));
    await page.reload();
    await page.locator('.easter-egg-link').click();
    await expect(page).toHaveURL('/demos');
});
