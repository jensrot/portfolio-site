import { test, expect } from '@playwright/test';

import { getRandomBoundaryPoint } from '../src/utils/random-boundary-point';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('easter_egg_found'));
    await page.reload();
});

// Shared (desktop + mobile)
test('easter egg link is hidden on first load', async ({ page }) => {
    await expect(page.locator('.easter-egg-link')).not.toBeVisible();
});

test('easter egg zone does not have hint-hidden class when not revealed', async ({ page }) => {
    await expect(page.locator('.easter-egg-zone')).not.toHaveClass(/hint-hidden/);
});

test('sparkle-secondary element is visible when not revealed', async ({ page }) => {
    await expect(page.locator('.sparkle-secondary')).toBeVisible();
});

test('sparkle-secondary has sparkle animation when not revealed', async ({ page }) => {
    await expect(page.locator('.sparkle-secondary')).toHaveCSS('animation', /easter-egg-sparkle/);
});

test('easter egg link is not shown when localStorage is false', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('easter_egg_found', 'false'));
    await page.reload();
    await expect(page.locator('.easter-egg-link')).not.toBeVisible();
});

test('easter egg link is shown on / when localStorage is true', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('easter_egg_found', 'true'));
    await page.reload();
    await expect(page.locator('.easter-egg-link')).toBeVisible();
});

test('easter egg link is shown on /projects when localStorage is true', async ({ page }) => {
    await page.goto('/projects');
    await page.evaluate(() => localStorage.setItem('easter_egg_found', 'true'));
    await page.reload();
    await expect(page.locator('.easter-egg-link')).toBeVisible();
});

test('easter egg link navigates to /demos', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('easter_egg_found', 'true'));
    await page.reload();
    await page.locator('.easter-egg-link').click();
    await expect(page).toHaveURL('/demos');
});

// Desktop only
test.describe('desktop', () => {
    test.skip(({ isMobile }) => isMobile, 'desktop only');

    test('hovering 1.5s reveals the easter egg link', async ({ page }) => {
        const zone = page.locator('.easter-egg-zone');
        await zone.hover();
        await page.waitForTimeout(1500);
        await expect(page.locator('.easter-egg-link')).toBeVisible({ timeout: 5000 });
    });

    test('cursor changes to progress while waiting', async ({ page }) => {
        const zone = page.locator('.easter-egg-zone');
        await zone.hover();
        await expect(zone).toHaveCSS('cursor', 'progress');
    });

    test('cursor reverts to default when leaving early', async ({ page }) => {
        const zone = page.locator('.easter-egg-zone');
        await zone.hover();
        await page.waitForTimeout(300);
        await page.mouse.move(0, 400);
        await expect(zone).toHaveCSS('cursor', 'default');
    });

    test('progress ring appears while waiting', async ({ page }) => {
        const zone = page.locator('.easter-egg-zone');
        await zone.hover();
        await page.waitForTimeout(300);
        await expect(zone.locator('.easter-egg-progress')).toBeVisible();
    });

    test('progress ring disappears when leaving early', async ({ page }) => {
        const zone = page.locator('.easter-egg-zone');
        await zone.hover();
        await page.waitForTimeout(300);
        await page.mouse.move(0, 400);
        await expect(zone.locator('.easter-egg-progress')).not.toBeVisible();
    });

    test('leaving early does not reveal the easter egg', async ({ page }) => {
        const zone = page.locator('.easter-egg-zone');
        await zone.hover();
        await page.waitForTimeout(300);
        await page.mouse.move(0, 400);
        await page.waitForTimeout(1500);
        await expect(page.locator('.easter-egg-link')).not.toBeVisible();
    });

    test('easter egg is saved to localStorage after reveal', async ({ page }) => {
        const zone = page.locator('.easter-egg-zone');
        await zone.hover();
        await expect(page.locator('.easter-egg-link')).toBeVisible({ timeout: 5000 });
        const stored = await page.evaluate(() => localStorage.getItem('easter_egg_found'));
        expect(stored).toBe('true');
    });

    test('hovering near a random boundary position reveals the easter egg progress ring', async ({ page }) => {
        const box = await page.locator('.easter-egg-zone').boundingBox();
        const point = getRandomBoundaryPoint(box!);
        await page.mouse.move(point.x, point.y);
        await expect(page.locator('.easter-egg-progress')).toBeVisible();
    });
});

// Mobile only
test.describe('mobile', () => {
    test.skip(({ isMobile }) => !isMobile, 'mobile only');

    test('touch and hold 1.5s reveals the easter egg link', async ({ page }) => {
        const zone = page.locator('.easter-egg-zone');
        await zone.dispatchEvent('touchstart');
        await page.waitForTimeout(1500);
        await expect(page.locator('.easter-egg-link')).toBeVisible({ timeout: 5000 });
    });

    test('progress ring appears while holding', async ({ page }) => {
        const zone = page.locator('.easter-egg-zone');
        await zone.dispatchEvent('touchstart');
        await page.waitForTimeout(300);
        await expect(zone.locator('.easter-egg-progress')).toBeVisible();
    });

    test('releasing early removes progress ring and does not reveal easter egg', async ({ page }) => {
        const zone = page.locator('.easter-egg-zone');
        await zone.dispatchEvent('touchstart');
        await page.waitForTimeout(300);
        await zone.dispatchEvent('touchend');
        await page.waitForTimeout(1500);
        await expect(zone.locator('.easter-egg-progress')).not.toBeVisible();
        await expect(page.locator('.easter-egg-link')).not.toBeVisible();
    });

    test('touching near a random boundary position reveals the easter egg progress ring', async ({ page }) => {
        const box = await page.locator('.easter-egg-zone').boundingBox();
        const point = getRandomBoundaryPoint(box!);
        await page.locator('.easter-egg-zone').dispatchEvent('touchstart', { clientX: point.x, clientY: point.y });
        await expect(page.locator('.easter-egg-progress')).toBeVisible();
    });
});
