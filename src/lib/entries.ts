import type { Locale } from '../i18n/ui';

export interface RawEntry<D> {
  id: string;
  data: D;
  body?: string;
}
export interface Variant<D> {
  lang: Locale;
  entry: RawEntry<D>;
}
export interface Item<D> {
  slug: string;
  /** The version that carries `date`: the original. */
  original: Variant<D>;
  /** Every language version, original included. */
  translations: Partial<Record<Locale, Variant<D>>>;
  /** Shared fields (date, links, cover…) always come from the original. */
  shared: D;
}
export interface Resolved<D> {
  item: Item<D>;
  variant: Variant<D>;
  /** True when the requested language has no version and we show the original. */
  fallback: boolean;
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseId(id: string): { slug: string; lang: Locale } {
  const parts = id.split('/');
  if (parts.length !== 2) throw new Error(`[${id}] 内容必须放在 <slug>/zh.md 或 <slug>/en.md`);
  const [slug, lang] = parts;
  if (lang !== 'zh' && lang !== 'en') throw new Error(`[${id}] 文件名只能是 zh.md 或 en.md`);
  if (!SLUG.test(slug)) throw new Error(`[${id}] 文件夹名只能用小写字母、数字和连字符`);
  return { slug, lang };
}

const hasDate = (data: unknown) =>
  !!data && typeof data === 'object' && (data as { date?: unknown }).date != null;

export function dateOf<D>(item: Item<D>): number {
  return new Date((item.shared as { date?: string | number | Date }).date as Date).getTime();
}

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
    const dated = variants.filter((v) => hasDate(v.entry.data));
    if (dated.length === 0) throw new Error(`[${kind}/${slug}] 需要有一个版本写 date（它就是原文）`);
    if (dated.length > 1) throw new Error(`[${kind}/${slug}] 只能有一个版本写 date，译文请删掉 date`);
    const original = dated[0];
    const translations: Partial<Record<Locale, Variant<D>>> = {};
    for (const v of variants) translations[v.lang] = v;
    items.push({ slug, original, translations, shared: original.entry.data });
  }
  return items.sort((a, b) => dateOf(b) - dateOf(a));
}

export function resolve<D>(item: Item<D>, locale: Locale): Resolved<D> {
  const own = item.translations[locale];
  return own ? { item, variant: own, fallback: false } : { item, variant: item.original, fallback: true };
}
