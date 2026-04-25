import type { WeightEntry } from '@/types/domain';

export function computeStreak(entries: WeightEntry[]): number {
  if (entries.length === 0) return 0;
  const days = new Set(entries.map((e) => e.createdAt.slice(0, 10)));
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (days.has(d.toISOString().slice(0, 10))) streak++;
    else if (i > 0) break;
  }
  return streak;
}

export function adherence(entries: WeightEntry[], weeks = 12): number {
  const expected = weeks * 7;
  const days = new Set(entries.map((e) => e.createdAt.slice(0, 10)));
  return Math.min(100, Math.round((days.size / expected) * 100));
}
