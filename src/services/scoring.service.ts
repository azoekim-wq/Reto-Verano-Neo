import type { Participant } from '@/types/domain';
import { startEntry, latestEntry, calcBodyFat } from './participants.service';

export interface ScoreBreakdown {
  userId: string;
  name: string;
  color: string;
  totalPoints: number;
  weightPoints: number;
  fatPoints: number;
  streakPoints: number;
  kgLost: number;
  fatLost: number | null;      // diferencia en puntos porcentuales de grasa
  fatKgLost: number | null;    // masa grasa perdida en kg
  streakWeeksImproving: number;
  rank: number;
  // Weekly
  weeklyWeightPoints: number;
  weeklyFatPoints: number;
  weeklyKgLost: number;
  weeklyFatLost: number | null;
}

function toNum(v: number | string | undefined | null): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : v;
  return isFinite(n) ? n : null;
}

function calcStreakImproving(p: Participant): number {
  if (!p.weeklyData?.length) return 0;
  const h = toNum(p.height);
  const sorted = [...p.weeklyData].sort((a, b) => a.week - b.week);
  let streak = 0;
  let prevWeight: number | null = null;
  let prevFat: number | null = null;
  for (const e of sorted) {
    const w = toNum(e.weight);
    const fat = (h ? calcBodyFat(p.gender, h, toNum(e.waist), toNum(e.neck), toNum(e.hip)) : null) ?? (e.bodyFat ?? null);
    if (w !== null || fat !== null) {
      const weightImproved = prevWeight !== null && w !== null && w < prevWeight;
      const fatImproved = prevFat !== null && fat !== null && fat < prevFat;
      if (weightImproved || fatImproved) streak++;
      else streak = 0;
    }
    if (w !== null) prevWeight = w;
    if (fat !== null) prevFat = fat;
  }
  return streak;
}

function calcFatLost(p: Participant): { pct: number | null; kg: number | null } {
  if (!p.weeklyData?.length) return { pct: null, kg: null };
  const h = toNum(p.height);
  if (!h) return { pct: null, kg: null };
  const sorted = [...p.weeklyData].sort((a, b) => a.week - b.week);
  let firstFat: number | null = null;
  let firstWeight: number | null = null;
  let lastFat: number | null = null;
  for (const e of sorted) {
    const fat = calcBodyFat(p.gender, h, toNum(e.waist), toNum(e.neck), toNum(e.hip)) ?? (e.bodyFat ?? null);
    const w = toNum(e.weight);
    if (fat !== null && w !== null) {
      if (firstFat === null) { firstFat = fat; firstWeight = w; }
      lastFat = fat;
    }
  }
  if (firstFat === null || lastFat === null || firstWeight === null) return { pct: null, kg: null };
  const pct = firstFat - lastFat;
  const kg = ((firstFat - lastFat) / 100) * firstWeight;
  return { pct, kg: Math.round(kg * 10) / 10 };
}

function calcWeeklyFatLost(p: Participant): number | null {
  if (!p.weeklyData?.length) return null;
  const h = toNum(p.height);
  if (!h) return null;
  const sorted = [...p.weeklyData].sort((a, b) => a.week - b.week);
  if (sorted.length < 2) return null;
  const prev = sorted[sorted.length - 2]!;
  const last = sorted[sorted.length - 1]!;
  const fatPrev = calcBodyFat(p.gender, h, toNum(prev.waist), toNum(prev.neck), toNum(prev.hip)) ?? (prev.bodyFat ?? null);
  const fatLast = calcBodyFat(p.gender, h, toNum(last.waist), toNum(last.neck), toNum(last.hip)) ?? (last.bodyFat ?? null);
  if (fatPrev === null || fatLast === null) return null;
  return fatPrev - fatLast;
}

export function calcScore(p: Participant): ScoreBreakdown {
  const s = startEntry(p);
  const l = latestEntry(p);
  const sw = toNum(s?.weight);
  const lw = toNum(l?.weight);
  const kgLost = sw && lw ? Math.max(0, sw - lw) : 0;
  const { pct: fatLost, kg: fatKgLostRaw } = calcFatLost(p);
  const fatKgLost = fatKgLostRaw != null ? Math.min(fatKgLostRaw, kgLost) : null;
  const streakWeeksImproving = calcStreakImproving(p);

  // Weekly
  const sorted = [...(p.weeklyData ?? [])].sort((a, b) => a.week - b.week);
  const prevEntry = sorted.length >= 2 ? sorted[sorted.length - 2] : null;
  const prevW = toNum(prevEntry?.weight);
  const weeklyKgLost = prevW && lw ? Math.max(0, prevW - lw) : 0;
  const weeklyFatLost = calcWeeklyFatLost(p);

  const weightPoints = Math.round(kgLost * 2 * 10) / 10;
  const fatPoints = fatLost !== null ? Math.round(Math.max(0, fatLost) * 3 * 10) / 10 : 0;
  const streakPoints = streakWeeksImproving * 2;
  const totalPoints = Math.round((weightPoints + fatPoints + streakPoints) * 10) / 10;

  const weeklyWeightPoints = Math.round(weeklyKgLost * 2 * 10) / 10;
  const weeklyFatPoints = weeklyFatLost !== null ? Math.round(Math.max(0, weeklyFatLost) * 3 * 10) / 10 : 0;

  return {
    userId: p.id, name: p.name, color: p.color,
    totalPoints, weightPoints, fatPoints, streakPoints,
    kgLost, fatLost, fatKgLost, streakWeeksImproving, rank: 0,
    weeklyWeightPoints, weeklyFatPoints, weeklyKgLost, weeklyFatLost,
  };
}

export function rankScores(participants: Participant[]): ScoreBreakdown[] {
  const scores = participants.map(calcScore);
  scores.sort((a, b) => b.totalPoints - a.totalPoints);
  return scores.map((s, i) => ({ ...s, rank: i + 1 }));
}

export function rankScoresWeekly(participants: Participant[]): ScoreBreakdown[] {
  const scores = participants.map(calcScore);
  scores.sort((a, b) => (b.weeklyWeightPoints + b.weeklyFatPoints) - (a.weeklyWeightPoints + a.weeklyFatPoints));
  return scores.map((s, i) => ({ ...s, rank: i + 1 }));
}
