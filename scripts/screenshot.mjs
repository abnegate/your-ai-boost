import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:5173';
const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.screenshots');

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const errors = [];

async function shoot(name, path, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  page.on('pageerror', (err) => errors.push({ where: name, err: err.message }));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push({ where: name, err: msg.text() });
  });
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const file = `${outDir}/${name}.png`;
  await page.screenshot({ path: file, fullPage: true });
  console.log(`saved ${file}`);
  await context.close();
}

try {
  await shoot('landing-desktop', '/', { width: 1440, height: 900 });
  await shoot('landing-mobile', '/', { width: 390, height: 844 });
  await shoot('landing-auth-failed', '/?auth=failed', { width: 1440, height: 900 });
  await shoot('not-found', '/missing', { width: 1440, height: 900 });
} finally {
  await browser.close();
}

if (errors.length) {
  console.error('console errors:', errors);
  process.exit(1);
}
console.log('done, no console errors');
