export function esc(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str);
}

export const DAY_LABELS = [
  'Day 1 · 27 Jul',
  'Day 2 · 28 Jul',
  'Day 3 · 29 Jul'
];

export function detectDay(): number {
  return 1; // Default to Day 1
}
