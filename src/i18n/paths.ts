import type { Locale } from './ui';

/** Build a site path for a locale. `path` starts with '/'. Chinese has no prefix. */
export function localeHref(locale: Locale, path: string): string {
  return locale === 'zh' ? path : `/en${path}`;
}

export function localeFromPath(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'zh';
}

/** The same page in the other language. */
export function switchLocaleHref(pathname: string, target: Locale): string {
  const current = localeFromPath(pathname);
  let base = current === 'en' ? pathname.slice(3) || '/' : pathname;
  if (!base.endsWith('/')) base += '/';
  return localeHref(target, base);
}
