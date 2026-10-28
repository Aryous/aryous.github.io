// Screenshot matrix: pages × themes × viewports (+ a reduced-motion pass).
// Usage: node scripts/screenshots.mjs [--base http://127.0.0.1:4329] [--only /,/en/] [--themes light,dark] [--sizes desktop,mobile]
import puppeteer from 'puppeteer-core';
import { mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const base = arg('base', 'http://127.0.0.1:4329');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SIZES = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } };

function discoverPages() {
  const pages = ['/', '/en/', '/writing/', '/en/writing/', '/projects/', '/en/projects/', '/404.html'];
  const dir = 'dist/projects';
  if (existsSync(dir)) for (const slug of readdirSync(dir)) if (!slug.includes('.')) pages.push(`/projects/${slug}/`, `/en/projects/${slug}/`);
  const wdir = 'dist/writing';
  if (existsSync(wdir)) for (const slug of readdirSync(wdir)) if (!slug.includes('.')) pages.push(`/writing/${slug}/`, `/en/writing/${slug}/`);
  return pages;
}

const only = arg('only', null);
const pages = only ? only.split(',') : discoverPages();
const themes = arg('themes', 'light,dark').split(',');
const sizes = arg('sizes', 'desktop,mobile').split(',');
const out = arg('out', 'screenshots');
mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars'] });
const problems = [];
try {
  for (const path of pages) {
    for (const size of sizes) {
      for (const theme of themes) {
        const page = await browser.newPage();
        await page.setViewport(SIZES[size]);
        await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
        await page.evaluateOnNewDocument(() => {
          try { localStorage.removeItem('theme'); } catch {}
        });
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`));
        const res = await page.goto(base + path, { waitUntil: 'networkidle0' });
        await page.evaluate(() => document.fonts.ready);
        await new Promise((r) => setTimeout(r, 1800));
        const info = await page.evaluate(() => ({
          theme: document.documentElement.dataset.theme,
          overflow: document.documentElement.scrollWidth - window.innerWidth,
        }));
        if (info.theme !== theme) problems.push(`${path} ${size} ${theme}: data-theme is ${info.theme}`);
        if (info.overflow > 1) problems.push(`${path} ${size} ${theme}: horizontal overflow ${info.overflow}px`);
        if (res && res.status() >= 400 && !path.includes('404')) problems.push(`${path}: HTTP ${res.status()}`);
        for (const e of errors) problems.push(`${path} ${size} ${theme}: ${e}`);
        const name = `${path.replace(/\//g, '_').replace(/^_|_$/g, '') || 'home'}--${size}--${theme}.png`;
        await page.screenshot({ path: join(out, name), fullPage: true });
        await page.close();
      }
    }
  }
  if (!arg('skip-motion', null)) {
    const page = await browser.newPage();
    await page.setViewport(SIZES.desktop);
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(base + '/', { waitUntil: 'networkidle0' });
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
    if (running > 0) problems.push(`reduced motion: ${running} animations still running on /`);
    await page.close();
  }
} finally {
  await browser.close();
}
if (problems.length) {
  console.error('Problems:\n' + problems.map((p) => '  - ' + p).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`screenshots: ${pages.length} pages × ${sizes.length} sizes × ${themes.length} themes → ${out}/ (no problems)`);
}
