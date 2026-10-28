import type { Locale } from '../i18n/ui';

const pad = (n: number) => String(n).padStart(2, '0');
const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(d: Date, locale: Locale, style: 'dot' | 'long' | 'month'): string {
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();
  if (style === 'dot') return `${y}.${pad(m + 1)}.${pad(day)}`;
  if (style === 'month') return `${y}.${pad(m + 1)}`;
  return locale === 'zh' ? `${y}年${m + 1}月${day}日` : `${EN_MONTHS[m]} ${day}, ${y}`;
}

/** Minutes to read: 400 CJK characters or 220 words per minute, never below 1. */
export function readingMinutes(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ');
  const cjk = (text.match(/[㐀-鿿豈-﫿]/g) ?? []).length;
  const words = (text.replace(/[㐀-鿿豈-﫿]/g, ' ').match(/[A-Za-z0-9]+/g) ?? []).length;
  return Math.max(1, Math.round(cjk / 400 + words / 220));
}
