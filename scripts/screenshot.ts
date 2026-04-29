import { chromium, type Page } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

type Shot = {
  readonly name: string;
  readonly path: string;
  readonly viewport: { width: number; height: number };
  readonly waitFor?: (page: Page) => Promise<void>;
};

const baseUrl = process.env.BASE_URL ?? 'http://localhost:5173';
const outDir = resolve(import.meta.dir, '..', 'docs/screenshots');

await mkdir(outDir, { recursive: true });

const shots: readonly Shot[] = [
  { name: '01-landing-desktop', path: '/', viewport: { width: 1440, height: 900 } },
  { name: '02-landing-mobile', path: '/', viewport: { width: 390, height: 844 } },
  {
    name: '03-landing-auth-failed',
    path: '/?auth=failed',
    viewport: { width: 1440, height: 900 },
  },
  {
    name: '04-dashboard-loading',
    path: '/dashboard?demo=loading',
    viewport: { width: 1440, height: 900 },
  },
  {
    name: '05-dashboard-empty',
    path: '/dashboard?demo=empty',
    viewport: { width: 1440, height: 900 },
  },
  {
    name: '06-dashboard-error',
    path: '/dashboard?demo=error',
    viewport: { width: 1440, height: 900 },
  },
  {
    name: '07-dashboard-results',
    path: '/dashboard?demo=ready',
    viewport: { width: 1440, height: 1700 },
    waitFor: async (page) => {
      await page.waitForSelector('h1', { timeout: 5000 });
      await page.waitForTimeout(800);
    },
  },
  {
    name: '08-dashboard-results-mobile',
    path: '/dashboard?demo=ready',
    viewport: { width: 390, height: 844 },
    waitFor: async (page) => {
      await page.waitForSelector('h1', { timeout: 5000 });
      await page.waitForTimeout(800);
    },
  },
  { name: '09-not-found', path: '/missing', viewport: { width: 1440, height: 900 } },
];

const browser = await chromium.launch();
const issues: Array<{ where: string; message: string }> = [];

try {
  for (const shot of shots) {
    const context = await browser.newContext({
      viewport: shot.viewport,
      deviceScaleFactor: 2,
      colorScheme: 'dark',
    });
    const page = await context.newPage();
    page.on('pageerror', (err) => issues.push({ where: shot.name, message: err.message }));
    page.on('console', (message) => {
      if (message.type() !== 'error') return;
      const text = message.text();
      // Expected during demo screenshots: no Appwrite session yet, returns 401.
      if (text.includes('401')) return;
      issues.push({ where: shot.name, message: text });
    });

    await page.goto(`${baseUrl}${shot.path}`, { waitUntil: 'networkidle' });
    if (shot.waitFor) await shot.waitFor(page);
    else await page.waitForTimeout(400);

    const filePath = resolve(outDir, `${shot.name}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`  ${shot.name.padEnd(34)} → ${filePath}`);
    await context.close();
  }
} finally {
  await browser.close();
}

if (issues.length > 0) {
  console.error('\nUnexpected console errors:');
  for (const issue of issues) console.error(`  [${issue.where}] ${issue.message}`);
  process.exit(1);
}
console.log(`\n✓ wrote ${shots.length} screenshots to ${outDir}`);
