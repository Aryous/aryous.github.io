import { describe, it, expect } from 'vitest';
import { issueFor } from './issue';

describe('issueFor', () => {
  it('2026 Q4 is issue 1 (autumn)', () => {
    expect(issueFor(new Date(2026, 9, 29))).toEqual({ number: 1, season: { zh: '秋', en: 'Autumn' }, year: 2026 });
  });
  it('December is winter, still Q4', () => {
    expect(issueFor(new Date(2026, 11, 5)).number).toBe(1);
    expect(issueFor(new Date(2026, 11, 5)).season.en).toBe('Winter');
  });
  it('counts quarters forward', () => {
    expect(issueFor(new Date(2027, 0, 15)).number).toBe(2);
    expect(issueFor(new Date(2027, 3, 2))).toMatchObject({ number: 3, season: { zh: '春' } });
    expect(issueFor(new Date(2027, 6, 1))).toMatchObject({ number: 4, season: { zh: '夏' } });
  });
  it('never goes below 1', () => {
    expect(issueFor(new Date(2025, 5, 1)).number).toBe(1);
  });
});
