import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { resolve } from './entries';
import { getWritingItems, itemHref } from './site';
import { HTML_LANG, t, type Locale } from '../i18n/ui';

/** Essays only, newest first, links in the feed's own language. */
export async function writingFeed(context: APIContext, locale: Locale) {
  const items = await getWritingItems();
  return rss({
    title: locale === 'zh' ? 'Aryous · 文字' : 'Aryous · Writing',
    description: t(locale).siteDescription,
    site: context.site ?? 'https://aryous.github.io',
    trailingSlash: true,
    customData: `<language>${HTML_LANG[locale].toLowerCase()}</language>`,
    items: items.map((item) => {
      const data = resolve(item, locale).variant.entry.data;
      return {
        title: data.title,
        description: data.description,
        pubDate: new Date(item.shared.date as Date),
        link: itemHref('writing', item.slug, locale),
        categories: item.shared.tags,
      };
    }),
  });
}
