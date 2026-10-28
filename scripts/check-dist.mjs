// Post-build checks on dist/: required pages, internal links and assets,
// no Google Fonts, and no files under paths owned by other Pages repos.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = 'dist';
const RESERVED = ['/Aryous/', '/agent-badges/'];
const problems = [];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(DIST);
const rel = (p) => '/' + p.slice(DIST.length + 1).split('\\').join('/');

// 1. Required pages, plus both languages of every project and essay.
const required = ['/index.html', '/en/index.html', '/writing/index.html', '/en/writing/index.html', '/projects/index.html', '/en/projects/index.html', '/404.html', '/rss.xml', '/en/rss.xml', '/favicon.svg'];
for (const kind of ['projects', 'writing']) {
  const dir = join('src/content', kind);
  if (!existsSync(dir)) continue;
  for (const slug of readdirSync(dir)) {
    if (!statSync(join(dir, slug)).isDirectory()) continue;
    const drafts = readdirSync(join(dir, slug)).filter((f) => f.endsWith('.md')).every((f) => /^draft:\s*true\s*$/m.test(readFileSync(join(dir, slug, f), 'utf8')));
    if (drafts) continue;
    required.push(`/${kind}/${slug}/index.html`, `/en/${kind}/${slug}/index.html`);
  }
}
for (const r of required) if (!existsSync(join(DIST, r))) problems.push(`missing page: ${r}`);

// 2. Internal references must resolve to a file in dist/.
const exists = (url) => {
  const clean = decodeURI(url.split('#')[0].split('?')[0]);
  if (!clean || clean === '/') return existsSync(join(DIST, 'index.html'));
  const p = join(DIST, clean);
  if (existsSync(p) && statSync(p).isFile()) return true;
  return existsSync(join(p, 'index.html'));
};
const ATTR = /\s(?:href|src|data-peek|poster)="([^"]+)"/g;
const SRCSET = /\ssrcset="([^"]+)"/g;
const CSSURL = /url\((['"]?)([^)'"]+)\1\)/g;
let checked = 0;
for (const f of files) {
  const ext = extname(f);
  if (!['.html', '.css', '.xml'].includes(ext)) continue;
  const text = readFileSync(f, 'utf8');
  if (/fonts\.(googleapis|gstatic)\.com/.test(text)) problems.push(`${rel(f)}: references Google Fonts`);
  const urls = [];
  for (const m of text.matchAll(ATTR)) urls.push(m[1]);
  for (const m of text.matchAll(SRCSET)) for (const part of m[1].split(',')) urls.push(part.trim().split(/\s+/)[0]);
  for (const m of text.matchAll(CSSURL)) urls.push(m[2]);
  for (const raw of urls) {
    const u = raw.replace(/&amp;/g, '&');
    if (!u.startsWith('/') || u.startsWith('//')) continue;
    checked++;
    if (!exists(u)) problems.push(`${rel(f)}: broken internal reference ${u}`);
  }
}

// 3. Paths owned by other GitHub Pages repos must stay free.
for (const f of files) for (const r of RESERVED) if (rel(f).startsWith(r)) problems.push(`file under reserved path ${r}: ${rel(f)}`);

if (problems.length) {
  console.error(`check-dist: ${problems.length} problem(s)\n` + problems.map((p) => '  - ' + p).join('\n'));
  process.exit(1);
}
console.log(`check-dist: ok (${files.length} files, ${required.length} required pages, ${checked} internal references)`);
