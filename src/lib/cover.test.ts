import { describe, it, expect } from 'vitest';
import { buildItems } from './entries';
import { pickCover, featuredProjects } from './cover';

const p = (slug: string, data: Record<string, unknown>) => ({ id: `${slug}/zh`, data: { title: slug, summary: '', ...data } });
const w = (slug: string, date: string) => ({ id: `${slug}/zh`, data: { title: slug, date: new Date(date) } });

const projects = () =>
  buildItems(
    [
      p('old-hero', { date: new Date('2026-01-01'), onCover: true, object: 'o1', cover: 'c', featured: true, order: 3 }),
      p('new-hero', { date: new Date('2026-10-01'), onCover: true, object: 'o2', cover: 'c', featured: true, order: 1 }),
      p('b', { date: new Date('2026-09-01'), cover: 'c', featured: true, order: 2 }),
      p('no-cover', { date: new Date('2026-09-15'), featured: true, order: 4 }),
      p('hidden', { date: new Date('2026-10-20'), cover: 'c' }),
    ],
    'projects',
  );

describe('pickCover', () => {
  it('picks the newest onCover project as hero', () => {
    expect(pickCover(projects(), []).hero.slug).toBe('new-hero');
  });
  it('throws without any onCover project', () => {
    const items = buildItems([p('a', { date: new Date(), featured: true })], 'projects');
    expect(() => pickCover(items, [])).toThrow(/onCover/);
  });
  it('throws when hero has no object image', () => {
    const items = buildItems([p('a', { date: new Date(), onCover: true })], 'projects');
    expect(() => pickCover(items, [])).toThrow(/object/);
  });
  it('backdrops: other featured projects with a cover, max 2, in featured order', () => {
    expect(pickCover(projects(), []).backdrops.map((i) => i.slug)).toEqual(['b', 'old-hero']);
  });
  it('lines mix featured projects and writing by date, top 3', () => {
    const writing = buildItems([w('essay', '2026-10-10'), w('older', '2025-01-01')], 'writing');
    const lines = pickCover(projects(), writing).lines.map((l) => `${l.kind}:${l.item.slug}`);
    expect(lines).toEqual(['writing:essay', 'project:new-hero', 'project:no-cover']);
  });
});

describe('featuredProjects', () => {
  it('orders by order then date and drops non-featured', () => {
    expect(featuredProjects(projects()).map((i) => i.slug)).toEqual(['new-hero', 'b', 'old-hero', 'no-cover']);
  });
});
