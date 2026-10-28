import { describe, it, expect } from 'vitest';
import { formatDate, readingMinutes } from './format';

describe('formatDate', () => {
  const d = new Date(2026, 9, 12);
  it('dot', () => expect(formatDate(d, 'zh', 'dot')).toBe('2026.10.12'));
  it('long zh', () => expect(formatDate(d, 'zh', 'long')).toBe('2026年10月12日'));
  it('long en', () => expect(formatDate(d, 'en', 'long')).toBe('Oct 12, 2026'));
  it('month', () => expect(formatDate(d, 'en', 'month')).toBe('2026.10'));
});

describe('readingMinutes', () => {
  it('chinese at 400 chars/min', () => expect(readingMinutes('字'.repeat(800))).toBe(2));
  it('english at 220 words/min', () => expect(readingMinutes('word '.repeat(660))).toBe(3));
  it('at least one minute', () => expect(readingMinutes('')).toBe(1));
  it('ignores markdown syntax and code fences', () => {
    expect(readingMinutes('```\n' + 'x '.repeat(5000) + '\n```\n' + '字'.repeat(400))).toBe(1);
  });
});
