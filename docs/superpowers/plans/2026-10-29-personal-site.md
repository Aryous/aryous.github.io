# 个人网站 aryous.github.io Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **本项目约定（Lucas 指定）**：开发全程在主会话内联执行，不派子代理；全部完成并上线后，统一派**一个**子代理（Opus）按 spec 做验收。

**Goal:** 用 Astro 7 构建并上线 `https://aryous.github.io`：杂志「封面故事」风格的中英双语个人网站（项目展示 + 博客）。

**Architecture:** 纯静态站。内容放在 `src/content/{writing,projects}/<slug>/{zh,en}.md`，由 `src/lib/` 里的纯函数完成原文/译文合并、校验、封面选取和期号计算（Vitest 覆盖）。页面按语言各有一个薄包装文件，共用 `src/views/` 里的视图组件。GitHub Actions 构建并部署到 Pages。

**Tech Stack:** Astro 7.4 · TypeScript 6（`@astrojs/check` 要求 ≤6）· Vitest 5 · `@fontsource/*` 自托管字体 · `@astrojs/rss` · sharp（astro:assets）· puppeteer-core（本机 Chrome 截图）

## Global Constraints

- Node ≥ 22.23.4（本机 v25.9.0；CI 用 withastro/action 默认 Node 24）。
- 中文默认语言无前缀；英文 `/en` 前缀；同一内容两种语言同 slug。
- 不占用 `/Aryous/`、`/agent-badges/` 路径（这两个仓库已有 Pages）。
- 颜色：封面石墨 `#13110f`；浅色纸 `#f3eee6`、墨 `#1d1a17`；深色字 `#e9e3d9`；朱红 `#ff5b3a`（浅色主题链接 `#d9411f`）。
- 字体：Instrument Serif / Noto Serif SC 400·500·700 / Inter / JetBrains Mono，全部 `@fontsource` 自托管，禁止引用 Google Fonts。
- `compressHTML: true`（Astro 7 默认 `'jsx'` 会吞掉行内元素间空格）。
- Astro 7 Rust 编译器：所有非 void 标签必须闭合，禁止 `<p>` 里放块级元素。
- `prefers-reduced-motion: reduce` 时关闭全部动效。
- 文章由 Lucas 自己写；Claude 只写项目短记初稿和界面文案。
- 视觉的真实来源是 `docs/mockups/visual-style-v3.html`（第 2 版 `.c2-*`）和 `docs/mockups/article-page.html`（`.pa` 浅色 / `.pb` 深色）；实现时从中移植 CSS。

## File Structure

```
astro.config.mjs            站点配置（site、compressHTML、fetchFile:null）
package.json                脚本：dev / build / test / check / verify / shots
tsconfig.json
vitest.config.ts
.github/workflows/deploy.yml
scripts/
  check-dist.mjs            构建后检查：内部链接与资源存在、必需页面存在、无 Google Fonts 引用
  screenshots.mjs           截图矩阵（puppeteer-core + 本机 Chrome）
src/
  content.config.ts         两个集合 + zod schema（含 image()）
  content/
    writing/                （初始为空，仅 .gitkeep）
    projects/<slug>/        zh.md · en.md · cover.jpg · object.png
  i18n/
    ui.ts                   Locale 类型、界面文案字典、t()
    paths.ts                localeHref()、switchLocaleHref()
  lib/
    entries.ts              parseId()、buildItems()：分组、合并原文/译文、校验
    issue.ts                issueFor(date)
    cover.ts                pickCover()
    format.ts               formatDate()、readingMinutes()
    site.ts                 getWriting(locale)、getProjects(locale)：组合 astro:content 与 lib
  lib/*.test.ts             Vitest
  styles/
    tokens.css              主题变量（:root[data-theme]）
    base.css                重置、排版、工具类
    prose.css               正文排版（首字下沉、引用、序号标题）
  layouts/
    Base.astro              <html>、字体、主题脚本、SEO meta、hreflang
  components/
    TopBar.astro            页眉：刊头小字、期号、导航、主题切换、语言切换
    ThemeToggle.astro
    Cover.astro             首页封面（永远深色）+ 视差脚本
    Contents.astro          目录 Works/Essays + 悬停浮图脚本
    PageHead.astro          文章/项目页头（题图或纯文字）+ 左栏元信息
    FallbackNotice.astro
    ReadingProgress.astro
    Footer.astro
  views/
    HomeView.astro · WritingListView.astro · ArticleView.astro · ProjectListView.astro · ProjectView.astro
  pages/
    index.astro · en/index.astro
    writing/index.astro · writing/[slug].astro · en/writing/index.astro · en/writing/[slug].astro
    projects/index.astro · projects/[slug].astro · en/projects/index.astro · en/projects/[slug].astro
    rss.xml.ts · en/rss.xml.ts · 404.astro
```

## 核心数据类型（各任务共用）

```ts
// src/i18n/ui.ts
export type Locale = 'zh' | 'en';

// src/lib/entries.ts
export interface RawEntry<D> { id: string; data: D; body?: string; }
export interface Variant<D> { lang: Locale; entry: RawEntry<D>; }
export interface Item<D> {
  slug: string;
  original: Variant<D>;            // 写了 date 的那个版本
  translations: Partial<Record<Locale, Variant<D>>>; // 含原文
  shared: D;                       // 原文 data（共享字段来源）
}
// 取某语言的展示版本：有则用之，否则回退原文并标记 fallback
export interface Resolved<D> { item: Item<D>; variant: Variant<D>; fallback: boolean; }
```

---

### Task 1: 脚手架与构建通路

**Files:** Create `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `src/pages/index.astro`（临时）

- [ ] **Step 1:** 写 `package.json`

```json
{
  "name": "aryous-site",
  "type": "module",
  "private": true,
  "engines": { "node": ">=22.23.4" },
  "scripts": {
    "dev": "astro dev",
    "test": "vitest run",
    "check": "astro check",
    "build": "vitest run && astro check && astro build && node scripts/check-dist.mjs",
    "preview": "astro preview",
    "shots": "node scripts/screenshots.mjs"
  }
}
```

- [ ] **Step 2:** 安装依赖

Run: `npm i astro@^7.4.3 @astrojs/rss @astrojs/check typescript@^6 @fontsource/instrument-serif @fontsource-variable/inter @fontsource/jetbrains-mono @fontsource/noto-serif-sc sharp && npm i -D vitest@^5 puppeteer-core`

- [ ] **Step 3:** `astro.config.mjs`

```js
import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://aryous.github.io',
  compressHTML: true,
  fetchFile: null,
  trailingSlash: 'always',
  build: { format: 'directory' },
});
```

- [ ] **Step 4:** `tsconfig.json` 继承 `astro/tsconfigs/strict`；`vitest.config.ts` 用 `include: ['src/**/*.test.ts']`。
- [ ] **Step 5:** 临时首页 `src/pages/index.astro` 输出 `<h1>Aryous</h1>`；`scripts/check-dist.mjs` 先写最小版（见 Task 7 完整版，这里只检查 `dist/index.html` 存在）。
- [ ] **Step 6:** Run `npx astro build` → Expected: `dist/index.html` 生成，无报错。
- [ ] **Step 7:** Commit `chore: scaffold Astro 7 project`.

### Task 2: 纯逻辑库（TDD）

**Files:** Create `src/i18n/ui.ts`, `src/i18n/paths.ts`, `src/lib/{entries,issue,cover,format}.ts` + 对应 `.test.ts`

**Interfaces — Produces:**
- `parseId(id: string): { slug: string; lang: Locale }` — `"hello-world/zh"` → `{slug:'hello-world', lang:'zh'}`；非法语言抛错。
- `buildItems<D extends { date?: unknown }>(entries: RawEntry<D>[], kind: string): Item<D>[]` — 每 slug 恰好一个版本有 `date`，否则抛 `Error("[kind/slug] ...")`；按原文日期倒序。
- `resolve<D>(item: Item<D>, locale: Locale): Resolved<D>`
- `issueFor(d: Date): { number: number; season: { zh: string; en: string }; year: number }` — 2026Q4 = 1。
- `pickCover<P, W>(projects: Item<P>[], writing: Item<W>[]): { hero: Item<P>; backdrops: Item<P>[]; lines: Array<{ kind: 'project'|'writing'; item: Item<P>|Item<W> }> }` — hero = `onCover` 中日期最新；没有则抛错；backdrops = 其余精选项目中有 `cover` 的前 2 个（按 order、日期）；lines = 精选项目 + 文章按日期取 3。
- `formatDate(d: Date, locale: Locale, style: 'dot'|'long'|'month'): string`；`readingMinutes(text: string): number`（中文 400 字/分 + 英文 220 词/分，至少 1）。
- `localeHref(locale: Locale, path: string): string`（path 以 `/` 开头）；`switchLocaleHref(pathname: string, target: Locale): string`。

- [ ] **Step 1:** 写测试 `src/lib/entries.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { parseId, buildItems, resolve } from './entries';
const e = (id: string, data: any) => ({ id, data });
describe('parseId', () => {
  it('splits slug and lang', () => expect(parseId('hello-world/zh')).toEqual({ slug: 'hello-world', lang: 'zh' }));
  it('rejects unknown lang', () => expect(() => parseId('x/fr')).toThrow(/zh\.md 或 en\.md/));
  it('rejects flat files', () => expect(() => parseId('x')).toThrow());
});
describe('buildItems', () => {
  it('merges translation onto original', () => {
    const items = buildItems([e('a/zh', { title: '甲', date: new Date('2026-10-01') }), e('a/en', { title: 'A' })], 'writing');
    expect(items).toHaveLength(1);
    expect(items[0].original.lang).toBe('zh');
    expect(items[0].shared.title).toBe('甲');
    expect(Object.keys(items[0].translations).sort()).toEqual(['en', 'zh']);
  });
  it('throws when no version has date', () => {
    expect(() => buildItems([e('a/zh', { title: '甲' })], 'writing')).toThrow(/writing\/a/);
  });
  it('throws when both versions have date', () => {
    expect(() => buildItems([e('a/zh', { title: '甲', date: new Date() }), e('a/en', { title: 'A', date: new Date() })], 'writing')).toThrow(/只能有一个/);
  });
  it('sorts by date desc', () => {
    const items = buildItems([e('old/zh', { title: 'o', date: new Date('2026-01-01') }), e('new/zh', { title: 'n', date: new Date('2026-09-01') })], 'writing');
    expect(items.map(i => i.slug)).toEqual(['new', 'old']);
  });
});
describe('resolve', () => {
  it('falls back to original', () => {
    const [item] = buildItems([e('a/zh', { title: '甲', date: new Date() })], 'writing');
    const r = resolve(item, 'en');
    expect(r.fallback).toBe(true);
    expect(r.variant.lang).toBe('zh');
  });
});
```

- [ ] **Step 2:** Run `npx vitest run src/lib/entries.test.ts` → FAIL（模块不存在）。
- [ ] **Step 3:** 实现 `src/lib/entries.ts`

```ts
import type { Locale } from '../i18n/ui';
export const LOCALES: Locale[] = ['zh', 'en'];
export interface RawEntry<D> { id: string; data: D; body?: string; filePath?: string }
export interface Variant<D> { lang: Locale; entry: RawEntry<D> }
export interface Item<D> { slug: string; original: Variant<D>; translations: Partial<Record<Locale, Variant<D>>>; shared: D }
export interface Resolved<D> { item: Item<D>; variant: Variant<D>; fallback: boolean }

export function parseId(id: string): { slug: string; lang: Locale } {
  const parts = id.split('/');
  if (parts.length !== 2) throw new Error(`[${id}] 内容必须放在 <slug>/zh.md 或 <slug>/en.md`);
  const [slug, lang] = parts;
  if (lang !== 'zh' && lang !== 'en') throw new Error(`[${id}] 文件名只能是 zh.md 或 en.md`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`[${id}] 文件夹名只能用小写字母、数字和连字符`);
  return { slug, lang };
}

const hasDate = (d: unknown) => !!(d && typeof d === 'object' && (d as any).date != null);

export function buildItems<D>(entries: RawEntry<D>[], kind: string): Item<D>[] {
  const groups = new Map<string, Variant<D>[]>();
  for (const entry of entries) {
    const { slug, lang } = parseId(entry.id);
    const list = groups.get(slug) ?? [];
    list.push({ lang, entry });
    groups.set(slug, list);
  }
  const items: Item<D>[] = [];
  for (const [slug, variants] of groups) {
    const dated = variants.filter(v => hasDate(v.entry.data));
    if (dated.length === 0) throw new Error(`[${kind}/${slug}] 需要有一个版本写 date（它就是原文）`);
    if (dated.length > 1) throw new Error(`[${kind}/${slug}] 只能有一个版本写 date，译文请删掉 date`);
    const original = dated[0];
    const translations: Partial<Record<Locale, Variant<D>>> = {};
    for (const v of variants) translations[v.lang] = v;
    items.push({ slug, original, translations, shared: original.entry.data });
  }
  return items.sort((a, b) => dateOf(b) - dateOf(a));
}

export function dateOf<D>(item: Item<D>): number {
  return new Date((item.shared as any).date).getTime();
}

export function resolve<D>(item: Item<D>, locale: Locale): Resolved<D> {
  const own = item.translations[locale];
  return own ? { item, variant: own, fallback: false } : { item, variant: item.original, fallback: true };
}
```

- [ ] **Step 4:** Run tests → PASS.
- [ ] **Step 5:** 同样 TDD 写 `issue.ts`

测试要点：`issueFor(new Date('2026-10-29'))` → `{number:1, season:{zh:'秋',en:'Autumn'}, year:2026}`；`2027-01-15` → `number:2, season 冬/Winter`；`2027-04-02` → `number:3, 春`；`2027-07-01` → `number:4, 夏`；早于 2026-10 的日期 → `number:1`（不出现 0 或负数）。

```ts
const SEASONS = [
  { zh: '冬', en: 'Winter' }, { zh: '冬', en: 'Winter' }, { zh: '春', en: 'Spring' }, { zh: '春', en: 'Spring' }, { zh: '春', en: 'Spring' },
  { zh: '夏', en: 'Summer' }, { zh: '夏', en: 'Summer' }, { zh: '夏', en: 'Summer' }, { zh: '秋', en: 'Autumn' }, { zh: '秋', en: 'Autumn' },
  { zh: '秋', en: 'Autumn' }, { zh: '冬', en: 'Winter' },
];
export function issueFor(d: Date) {
  const y = d.getFullYear(), m = d.getMonth();
  const q = Math.floor(m / 3);               // 0..3
  const n = (y - 2026) * 4 + (q - 3) + 1;    // 2026Q4 = 1
  return { number: Math.max(1, n), season: SEASONS[m], year: y };
}
```

- [ ] **Step 6:** TDD 写 `cover.ts`

测试要点：两个 onCover 项目取日期新的为 hero；没有 onCover 抛错 `/onCover/`；hero 必须有 `object` 否则抛错；backdrops 排除 hero、只取有 cover 的、最多 2 个；lines 混排项目和文章按日期取 3。

```ts
import { dateOf, type Item } from './entries';
type P = { featured?: boolean; onCover?: boolean; object?: unknown; cover?: unknown; order?: number; date?: unknown };
export function featuredProjects<D extends P>(projects: Item<D>[]) {
  return projects.filter(p => p.shared.featured)
    .sort((a, b) => (a.shared.order ?? 99) - (b.shared.order ?? 99) || dateOf(b) - dateOf(a));
}
export function pickCover<D extends P, W>(projects: Item<D>[], writing: Item<W>[]) {
  const candidates = projects.filter(p => p.shared.onCover).sort((a, b) => dateOf(b) - dateOf(a));
  const hero = candidates[0];
  if (!hero) throw new Error('[cover] 至少要有一个项目设置 onCover: true');
  if (!hero.shared.object) throw new Error(`[projects/${hero.slug}] 上封面的项目必须有 object（透明底物件图）`);
  const backdrops = featuredProjects(projects).filter(p => p !== hero && p.shared.cover).slice(0, 2);
  const pool = [
    ...featuredProjects(projects).map(item => ({ kind: 'project' as const, item, t: dateOf(item) })),
    ...writing.map(item => ({ kind: 'writing' as const, item, t: dateOf(item) })),
  ].sort((a, b) => b.t - a.t).slice(0, 3);
  return { hero, backdrops, lines: pool.map(({ kind, item }) => ({ kind, item })) };
}
```

- [ ] **Step 7:** TDD 写 `format.ts` 与 `paths.ts`

测试要点：`formatDate(new Date('2026-10-12'),'zh','dot')`→`2026.10.12`；`'en','long'`→`Oct 12, 2026`；`'zh','long'`→`2026年10月12日`；`'month'`→`2026.10`；`readingMinutes('字'.repeat(800))`→2；`readingMinutes('')`→1。`localeHref('zh','/writing/')`→`/writing/`；`localeHref('en','/writing/')`→`/en/writing/`；`localeHref('en','/')`→`/en/`；`switchLocaleHref('/en/writing/a/','zh')`→`/writing/a/`；`switchLocaleHref('/projects/','en')`→`/en/projects/`；`switchLocaleHref('/en/','zh')`→`/`。

- [ ] **Step 8:** Run `npx vitest run` → 全部 PASS。Commit `feat: content model, cover and issue logic with tests`.

### Task 3: 内容集合与第一版内容

**Files:** Create `src/content.config.ts`, `src/lib/site.ts`, `src/content/projects/{agent-badges,vox,maposter,canvapie}/*`, `src/content/writing/.gitkeep`

- [ ] **Step 1:** `src/content.config.ts`

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
const id = ({ entry }: { entry: string }) => entry.replace(/\.md$/, '');
const writing = defineCollection({
  loader: glob({ base: './src/content/writing', pattern: '**/*.md', generateId: id }),
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
    cover: image().optional(),
    coverAlt: z.string().optional(),
  }),
});
const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md', generateId: id }),
  schema: ({ image }) => z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date().optional(),
    status: z.enum(['active', 'done', 'archived']).optional(),
    links: z.object({ repo: z.string().url().optional(), demo: z.string().url().optional() }).optional(),
    cover: image().optional(),
    object: image().optional(),
    featured: z.boolean().optional(),
    onCover: z.boolean().optional(),
    order: z.number().optional(),
  }),
});
export const collections = { writing, projects };
```

（`date: 2026-10` 这种年月写法在 YAML 里是字符串，`z.coerce.date()` 能解析；内容里统一写成 `2026-10-01` 这类完整日期，展示时用 `month` 格式。）

- [ ] **Step 2:** `src/lib/site.ts`：`getWritingItems()`（过滤 `draft` 于生产构建）、`getProjectItems()`，都调用 `buildItems`；再加 `hrefFor(kind, slug, locale)`。
- [ ] **Step 3:** 第一版内容（中英各一份，基于各仓库 README 的事实，不编造）：
  - `agent-badges`：onCover、featured、order 1、status active、date 2026-10-19、links repo + demo `https://aryous.github.io/agent-badges/`；cover = banner 徽章裁切；object = 徽章 logo 抠图。
  - `vox`：featured、order 2、status active、date 2026-09-26、repo；cover = `docs/images/compare.png`。
  - `maposter`：featured、order 3、status done、date 2025-12-04、repo PostcardMapAI + demo `https://postcard-map-ai.vercel.app`；cover = 巴塞罗那明信片。
  - `canvapie`：featured、order 4、status done、date 2026-05-27、repo；cover = 用 Chrome 截图生成的终端风格图（`scripts/make-canvapie-cover.html` 渲染）。
  - 正文结构：为什么做 / 怎么做的 / 有意思在哪，各 1–2 段。
- [ ] **Step 4:** 临时页面里 `await getProjectItems()` 并打印数量；Run `npx astro build` → 成功；临时把某个 en.md 加上 date 再构建 → 期望失败并显示 `只能有一个版本写 date`；改回。
- [ ] **Step 5:** Commit `feat: content collections and first projects`.

### Task 4: 基础布局、主题与页眉

**Files:** Create `src/styles/{tokens,base,prose}.css`, `src/layouts/Base.astro`, `src/components/{TopBar,ThemeToggle,Footer}.astro`, `src/i18n/ui.ts`（补全文案）, `src/pages/404.astro`

- [ ] **Step 1:** `tokens.css`：`:root[data-theme="light"]` 与 `:root[data-theme="dark"]` 两套变量（`--bg --ink --ink-2 --ink-3 --rule --accent --accent-ink --bar-bg --bar-ink`），无 JS 时用 `@media (prefers-color-scheme)` 兜底。
- [ ] **Step 2:** `Base.astro`：导入 fontsource CSS（`@fontsource/instrument-serif/400.css`、`400-italic.css`、`@fontsource-variable/inter`、`@fontsource/jetbrains-mono/400.css`、`500.css`、`@fontsource/noto-serif-sc/400.css`、`500.css`、`700.css`）；`<head>` 首个脚本（`is:inline`）读取 `localStorage.theme` 或系统偏好写入 `data-theme`；输出 `<link rel="alternate" hreflang>`、canonical、RSS、`og:` 基础 meta；`<html lang>` 跟 locale。
- [ ] **Step 3:** `TopBar.astro`（props：`locale`、`pathname`、`variant: 'cover'|'inner'`、`issue`）：刊头小字 "Aryous" + 期号季节、导航（文字/作品）、ThemeToggle、语言切换（用 `switchLocaleHref`）。inner 变体为深色细条页眉（mockup `.run`）。
- [ ] **Step 4:** `ThemeToggle.astro`：按钮循环 浅/深，写 `localStorage.theme`，`aria-label` 双语。
- [ ] **Step 5:** `404.astro`：双语 "这一页不在本期 / Not in this issue"，链接回首页。
- [ ] **Step 6:** Run `npx astro build` → 成功；手动打开 `dist/404.html` 检查。Commit `feat: base layout, themes, top bar`.

### Task 5: 首页（封面 + 目录）

**Files:** Create `src/components/Cover.astro`, `src/components/Contents.astro`, `src/views/HomeView.astro`, `src/pages/index.astro`, `src/pages/en/index.astro`

- [ ] **Step 1:** `Cover.astro`（props：`locale`、`cover` = `pickCover()` 结果、`issue`）：移植 mockup `.c2-*`：刊头、两张 backdrop（`<Image>` WebP，宽 540）、hero 物件（`<Image>` WebP 带透明，宽 700）+ 高光遮罩（`getImage()` 得到 URL 写入 `--obj` CSS 变量）、导读三条（标题 + 斜体副行 `Project · 2026.10`）、右下自我介绍、旋转圆标（SVG textPath + 静止期号）、颗粒、暗角、视差脚本（`[data-stage]`，触屏与减少动效时不绑定）。
- [ ] **Step 2:** `Contents.astro`（props：`locale`、`projects`（精选）、`writing`（最新 5））：Works 带序号、Essays 带日期/阅读时长/语言标签；悬停浮图（`data-peek` = cover 的 `getImage` URL）；手机端显示左侧缩略图；无文章时显示占位文案。浅/深主题跟随。
- [ ] **Step 3:** `HomeView.astro` 组合 Base + Cover + Contents + Footer；两个页面文件只传 `locale`。
- [ ] **Step 4:** Run build；用 Chrome headless 截图 `/` 和 `/en/`（1440 宽）对照 mockup 检查层次与重叠。Commit `feat: home cover and contents`.

### Task 6: 文章与项目页

**Files:** Create `src/components/{PageHead,FallbackNotice,ReadingProgress}.astro`, `src/views/{WritingListView,ArticleView,ProjectListView,ProjectView}.astro`, 8 个页面包装文件

- [ ] **Step 1:** `[slug].astro`（中/英各一）：`getStaticPaths` 返回全部 item（两种语言都生成），props 里给 `resolve(item, locale)`；`render(variant.entry)` 渲染正文。
- [ ] **Step 2:** `PageHead.astro`：有 `cover` → 电影感题图（暗化、Ken Burns、标题压图）；否则纯文字页头。左栏：日期、阅读时长、语言版本点（当前/暂无）。
- [ ] **Step 3:** `FallbackNotice.astro`：`fallback` 为真时显示 "This post is only available in Chinese." / "本文暂无中文版。"，正文容器 `lang` 设为原文语言。
- [ ] **Step 4:** `prose.css`：首段首字下沉、`h2` 前朱红斜体序号（CSS counter）、引用块朱红竖线、图片 figure/figcaption、代码块；深色主题正文字重 500。
- [ ] **Step 5:** `WritingListView`：按年分组的时间线；缺当前语言版本的条目加语言标签；空状态文案。`ProjectListView`：目录式列表 + 悬停浮图（复用 Contents 的 Works 部分）。`ProjectView`：左栏年份、状态、链接。文末上一篇/下一篇。
- [ ] **Step 6:** 构建时用一篇临时测试文章（含题图、引用、标题、只中文）验证 `/writing/x/` 与 `/en/writing/x/` 的回退提示，确认后删除测试文章（不提交）。
- [ ] **Step 7:** Commit `feat: article and project pages with fallback`.

### Task 7: RSS 与构建后检查

**Files:** Create `src/pages/rss.xml.ts`, `src/pages/en/rss.xml.ts`, `scripts/check-dist.mjs`

- [ ] **Step 1:** RSS：文章（非草稿）按日期倒序，链接用对应语言网址；没有文章时输出合法空 channel。
- [ ] **Step 2:** `scripts/check-dist.mjs`：
  - 必需文件：`index.html`、`en/index.html`、`writing/index.html`、`en/writing/index.html`、`projects/index.html`、`en/projects/index.html`、`404.html`、`rss.xml`、`en/rss.xml`，以及每个项目两种语言的页面。
  - 扫描所有 `.html` 的 `href`/`src`/`srcset`/`data-peek` 与 CSS `url()` 中以 `/` 开头的站内地址，确认 `dist/` 中存在对应文件（目录则找 `index.html`）。
  - 禁止出现 `fonts.googleapis.com`、`fonts.gstatic.com`。
  - 禁止出现以 `/Aryous/` 或 `/agent-badges/` 开头的站内文件（外链到 `https://aryous.github.io/agent-badges/` 允许）。
  - 任何失败 `process.exit(1)` 并列出问题。
- [ ] **Step 3:** Run `npm run build` → 全部通过。Commit `feat: rss and dist checks`.

### Task 8: 截图矩阵与视觉打磨

**Files:** Create `scripts/screenshots.mjs`

- [ ] **Step 1:** 脚本：启动 `astro preview`（或读取已运行的端口），puppeteer-core 连接 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`；对页面列表 × `{light,dark}`（`page.emulateMediaFeatures([{name:'prefers-color-scheme',value}])` 并清空 localStorage）× `{1440x900, 390x844}` 截全页图到 `screenshots/`；另截一张 `prefers-reduced-motion: reduce`；检测 `document.documentElement.scrollWidth > innerWidth`（横向滚动）并报错。
- [ ] **Step 2:** 逐张查看截图，修复重叠、截断、对比度、手机版式问题。
- [ ] **Step 3:** Commit `chore: screenshot matrix and visual fixes`.

### Task 9: 部署上线

**Files:** Create `.github/workflows/deploy.yml`, `README.md`

- [ ] **Step 1:** workflow（官方文档原文）：`on: push: branches: [main]` + `workflow_dispatch`；permissions `contents: read, pages: write, id-token: write`；build job：`actions/checkout@v7` → `withastro/action@v6`；deploy job：`environment: github-pages`，`actions/deploy-pages@v5`。
- [ ] **Step 2:** README：如何写文章（3 步）、字段说明、本地命令。
- [ ] **Step 3:** 创建公开仓库：`gh repo create Aryous/aryous.github.io --public --source . --remote origin --description "..."`；启用 Pages（Actions 来源）：`gh api -X POST repos/Aryous/aryous.github.io/pages -f build_type=workflow`。
- [ ] **Step 4:** `git push -u origin main`；`gh run watch` 直到成功。
- [ ] **Step 5:** 验证：`curl -sI https://aryous.github.io/` 200、`/en/` 200、`/Aryous/` 与 `/agent-badges/` 仍 200；抓取首页 HTML 确认包含封面刊头。

### Task 10: 子代理验收

- [ ] **Step 1:** 派一个 Opus 子代理，给它 spec 路径、线上网址、仓库路径，要求逐条核对 spec（页面/网址、回退、主题、字体自托管、动效与减少动效、手机版式、RSS、构建校验）并给出问题清单（带证据）。
- [ ] **Step 2:** 修复确认的问题，重新部署并复核。
