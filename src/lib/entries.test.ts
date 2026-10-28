import { describe, it, expect } from 'vitest';
import { parseId, buildItems, resolve } from './entries';

const e = (id: string, data: Record<string, unknown>) => ({ id, data });

describe('parseId', () => {
  it('splits slug and lang', () => {
    expect(parseId('hello-world/zh')).toEqual({ slug: 'hello-world', lang: 'zh' });
  });
  it('rejects unknown lang', () => {
    expect(() => parseId('x/fr')).toThrow(/zh\.md 或 en\.md/);
  });
  it('rejects flat files', () => {
    expect(() => parseId('x')).toThrow();
  });
  it('rejects non-kebab slugs', () => {
    expect(() => parseId('Hello World/zh')).toThrow(/小写字母/);
  });
});

describe('buildItems', () => {
  it('merges translation onto original', () => {
    const items = buildItems(
      [e('a/zh', { title: '甲', date: new Date('2026-10-01') }), e('a/en', { title: 'A' })],
      'writing',
    );
    expect(items).toHaveLength(1);
    expect(items[0].original.lang).toBe('zh');
    expect(items[0].shared.title).toBe('甲');
    expect(Object.keys(items[0].translations).sort()).toEqual(['en', 'zh']);
  });
  it('allows English originals', () => {
    const [item] = buildItems([e('b/en', { title: 'B', date: new Date('2026-10-01') })], 'writing');
    expect(item.original.lang).toBe('en');
  });
  it('throws when no version has date', () => {
    expect(() => buildItems([e('a/zh', { title: '甲' })], 'writing')).toThrow(/writing\/a/);
  });
  it('throws when both versions have date', () => {
    expect(() =>
      buildItems(
        [e('a/zh', { title: '甲', date: new Date() }), e('a/en', { title: 'A', date: new Date() })],
        'writing',
      ),
    ).toThrow(/只能有一个/);
  });
  it('sorts by date desc', () => {
    const items = buildItems(
      [
        e('old/zh', { title: 'o', date: new Date('2026-01-01') }),
        e('new/zh', { title: 'n', date: new Date('2026-09-01') }),
      ],
      'writing',
    );
    expect(items.map((i) => i.slug)).toEqual(['new', 'old']);
  });
});

describe('resolve', () => {
  it('uses own translation when present', () => {
    const [item] = buildItems([e('a/zh', { title: '甲', date: new Date() }), e('a/en', { title: 'A' })], 'w');
    const r = resolve(item, 'en');
    expect(r.fallback).toBe(false);
    expect(r.variant.lang).toBe('en');
  });
  it('falls back to original', () => {
    const [item] = buildItems([e('a/zh', { title: '甲', date: new Date() })], 'w');
    const r = resolve(item, 'en');
    expect(r.fallback).toBe(true);
    expect(r.variant.lang).toBe('zh');
  });
});
