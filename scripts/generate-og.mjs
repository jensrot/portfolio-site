// Renders scripts/og-image.html to public/og-image.png at 1200x630.
//
// Run with `npm run og` after editing the template. Reuses the Playwright
// Chromium already installed for the e2e tests, so there is nothing extra to
// install; if the browser is missing, run `npx playwright install chromium`.
//
// The output path is what index.html's og:image / twitter:image tags point at,
// and public/ is copied verbatim into build/ by Vite, so a rebuild ships it.

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const template = resolve(here, 'og-image.html');
const output = resolve(here, '..', 'public', 'og-image.png');

const browser = await chromium.launch();

try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    // Force 1x so the PNG comes out at exactly 1200x630 regardless of the
    // host machine's display scaling — the dimensions are declared in the
    // og:image:width / og:image:height meta tags and must match.
    deviceScaleFactor: 1,
  });

  await page.goto(`file://${template}`);
  await page.screenshot({ path: output });

  console.log(`Wrote ${output} (1200x630)`);
} finally {
  await browser.close();
}
