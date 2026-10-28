export type Locale = 'zh' | 'en';
export const LOCALES: Locale[] = ['zh', 'en'];
export const HTML_LANG: Record<Locale, string> = { zh: 'zh-CN', en: 'en' };

const pad = (n: number) => String(n).padStart(2, '0');

export const ui = {
  zh: {
    siteDescription: '王立奇（Lucas）的个人网站：做过的小东西，和想明白的事。',
    nav: { writing: '文字', works: '作品' },
    langName: { zh: '中文', en: 'English' },
    switchTo: 'EN',
    switchToLabel: 'Read in English',
    theme: { toLight: '切换到浅色', toDark: '切换到深色' },
    issue: (n: number, season: { zh: string; en: string }, year: number) => `Issue ${pad(n)} · ${year} ${season.zh}`,
    intro: { lines: ['我是 Lucas。', '这里放我做的东西，'], lead: '和', accent: '想明白的事', tail: '。' },
    inThisIssue: '本期 · In this issue',
    sticker: '做东西 · 写下来 · MAKE · WRITE · ',
    kind: { project: 'Project', writing: 'Essay' },
    works: { title: 'Works', sub: '作品', all: '全部作品' },
    essays: { title: 'Essays', sub: '文字', all: '全部文章' },
    writingEmpty: '第一篇还在写。',
    minutes: (n: number) => `约 ${n} 分钟`,
    notYet: '暂无',
    fallback: { zh: '', en: '本文暂无中文版，以下是英文原文。' },
    project: { year: '年份', status: '状态', links: '链接', repo: '源代码', demo: '在线体验' },
    status: { active: '在做', done: '完成', archived: '归档' },
    prev: '上一篇',
    next: '下一篇',
    backToContents: '回到目录',
    notFound: { title: '这一页不在本期', body: '链接可能写错了，或者这一页已经搬走。', home: '回到封面' },
    footer: { built: '用 Astro 搭建', rss: '订阅 RSS' },
    toc: '目录',
  },
  en: {
    siteDescription: 'The personal site of Lucas Wang: things I make, and what I figure out along the way.',
    nav: { writing: 'Writing', works: 'Works' },
    langName: { zh: 'Chinese', en: 'English' },
    switchTo: '中',
    switchToLabel: '阅读中文版',
    theme: { toLight: 'Switch to light', toDark: 'Switch to dark' },
    issue: (n: number, season: { zh: string; en: string }, year: number) => `Issue ${pad(n)} · ${season.en} ${year}`,
    intro: { lines: ["I'm Lucas.", 'Things I make,'], lead: 'and', accent: 'what I figure out', tail: '.' },
    inThisIssue: 'In this issue',
    sticker: 'MAKE · WRITE · 做东西 · 写下来 · ',
    kind: { project: 'Project', writing: 'Essay' },
    works: { title: 'Works', sub: '作品', all: 'All works' },
    essays: { title: 'Essays', sub: '文字', all: 'All writing' },
    writingEmpty: 'The first essay is on its way.',
    minutes: (n: number) => `${n} min read`,
    notYet: 'not yet',
    fallback: { zh: 'This post is only available in Chinese.', en: '' },
    project: { year: 'Year', status: 'Status', links: 'Links', repo: 'Source', demo: 'Live demo' },
    status: { active: 'Active', done: 'Done', archived: 'Archived' },
    prev: 'Previous',
    next: 'Next',
    backToContents: 'Back to contents',
    notFound: { title: 'Not in this issue', body: 'The link may be wrong, or the page has moved.', home: 'Back to the cover' },
    footer: { built: 'Built with Astro', rss: 'RSS' },
    toc: 'Contents',
  },
} as const;

export const t = (locale: Locale) => ui[locale];
