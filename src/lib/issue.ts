export interface Season {
  zh: string;
  en: string;
}
const WINTER = { zh: '冬', en: 'Winter' };
const SPRING = { zh: '春', en: 'Spring' };
const SUMMER = { zh: '夏', en: 'Summer' };
const AUTUMN = { zh: '秋', en: 'Autumn' };
// Index = month (0–11). 3–5 spring, 6–8 summer, 9–11 autumn, 12–2 winter.
const SEASONS: Season[] = [WINTER, WINTER, SPRING, SPRING, SPRING, SUMMER, SUMMER, SUMMER, AUTUMN, AUTUMN, AUTUMN, WINTER];

/** Issue 01 = 2026 Q4 (the launch quarter); +1 every quarter after. */
export function issueFor(d: Date): { number: number; season: Season; year: number } {
  const year = d.getFullYear();
  const month = d.getMonth();
  const quarter = Math.floor(month / 3);
  const n = (year - 2026) * 4 + (quarter - 3) + 1;
  return { number: Math.max(1, n), season: SEASONS[month], year };
}
