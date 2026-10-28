import { dateOf, type Item, type RawEntry } from './entries';

export interface CoverFields {
  featured?: boolean;
  onCover?: boolean;
  object?: unknown;
  cover?: unknown;
  order?: number;
}
type ProjectLike = RawEntry & { data: CoverFields };

export function featuredProjects<P extends ProjectLike>(projects: Item<P>[]): Item<P>[] {
  return projects
    .filter((p) => p.shared.featured)
    .sort((a, b) => (a.shared.order ?? 99) - (b.shared.order ?? 99) || dateOf(b) - dateOf(a));
}

export type CoverLine<P extends RawEntry, W extends RawEntry> =
  | { kind: 'project'; item: Item<P> }
  | { kind: 'writing'; item: Item<W> };

export function pickCover<P extends ProjectLike, W extends RawEntry>(projects: Item<P>[], writing: Item<W>[]) {
  const hero = projects.filter((p) => p.shared.onCover).sort((a, b) => dateOf(b) - dateOf(a))[0];
  if (!hero) throw new Error('[cover] 至少要有一个项目设置 onCover: true');
  if (!hero.shared.object) throw new Error(`[projects/${hero.slug}] 上封面的项目必须有 object（透明底物件图）`);
  const featured = featuredProjects(projects);
  const backdrops = featured.filter((p) => p !== hero && p.shared.cover).slice(0, 2);
  const pool: Array<{ line: CoverLine<P, W>; t: number }> = [
    ...featured.map((item) => ({ line: { kind: 'project' as const, item }, t: dateOf(item) })),
    ...writing.map((item) => ({ line: { kind: 'writing' as const, item }, t: dateOf(item) })),
  ];
  const lines = pool.sort((a, b) => b.t - a.t).slice(0, 3).map((p) => p.line);
  return { hero, backdrops, lines };
}
