import { describe, it, expect } from 'vitest';
import { localeHref, switchLocaleHref, localeFromPath } from './paths';

describe('localeHref', () => {
  it('zh has no prefix', () => expect(localeHref('zh', '/writing/')).toBe('/writing/'));
  it('en prefix', () => expect(localeHref('en', '/writing/')).toBe('/en/writing/'));
  it('en root', () => expect(localeHref('en', '/')).toBe('/en/'));
});

describe('switchLocaleHref', () => {
  it('en → zh', () => expect(switchLocaleHref('/en/writing/a/', 'zh')).toBe('/writing/a/'));
  it('zh → en', () => expect(switchLocaleHref('/projects/', 'en')).toBe('/en/projects/'));
  it('en root → zh root', () => expect(switchLocaleHref('/en/', 'zh')).toBe('/'));
  it('same locale is identity', () => expect(switchLocaleHref('/writing/', 'zh')).toBe('/writing/'));
  it('handles missing trailing slash', () => expect(switchLocaleHref('/en', 'zh')).toBe('/'));
});

describe('localeFromPath', () => {
  it('detects en', () => expect(localeFromPath('/en/projects/')).toBe('en'));
  it('defaults to zh', () => expect(localeFromPath('/projects/')).toBe('zh'));
  it('does not match /english/', () => expect(localeFromPath('/english/')).toBe('zh'));
});
