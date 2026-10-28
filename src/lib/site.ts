import { getCollection, type CollectionEntry } from 'astro:content';
import { buildItems, type Item } from './entries';
import type { Locale } from '../i18n/ui';
import { localeHref } from '../i18n/paths';

export type WritingEntry = CollectionEntry<'writing'>;
export type ProjectEntry = CollectionEntry<'projects'>;
export type WritingItem = Item<WritingEntry>;
export type ProjectItem = Item<ProjectEntry>;

/** Drafts show up in `astro dev` but never in a production build. */
function dropDrafts<E extends WritingEntry | ProjectEntry>(items: Item<E>[]): Item<E>[] {
  if (!import.meta.env.PROD) return items;
  return items
    .filter((item) => !item.shared.draft)
    .map((item) => {
      for (const [lang, v] of Object.entries(item.translations)) {
        if (v && v.entry.data.draft) delete item.translations[lang as Locale];
      }
      return item;
    });
}

export async function getWritingItems(): Promise<WritingItem[]> {
  return dropDrafts(buildItems(await getCollection('writing'), 'writing'));
}

export async function getProjectItems(): Promise<ProjectItem[]> {
  return dropDrafts(buildItems(await getCollection('projects'), 'projects'));
}

export function itemHref(kind: 'writing' | 'projects', slug: string, locale: Locale): string {
  return localeHref(locale, `/${kind}/${slug}/`);
}
