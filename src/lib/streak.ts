import type { WeeklyEntry } from '@/types/domain';

export function computeStreak(entries: WeeklyEntry[]): number {
  if (entries.length === 0) return 0;
  const days = new Set(entries.map((e) => e.date ?? '').filter(Boolean));
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

export function adherence(entries: WeeklyEntry[], weeks = 12): number {
  const expected = weeks * 7;
  const days = new Set(entries.map((e) => e.date ?? '').filter(Boolean));
  return Math.min(100, Math.round((days.size / expected) * 100));
}
