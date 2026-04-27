import type { Participant } from '@/types/domain';
import { startEntry, latestEntry, streakWeeks, calcBodyFat } from './participants.service';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface ParticipantAchievement {
  achievementId: string;
  unlockedAt?: string; // ISO date if unlocked
  progressPct: number; // 0-100
}

export interface AchievementWithHolders extends AchievementDef {
  holders: { userId: string; name: string; color: string }[];
}

function toNum(v: number | string | undefined | null): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : v;
  return isFinite(n) ? n : null;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: 'first_step',    name: 'Maracas',                 description: 'Te has apuntado al reto — ya estamos haciendo ruido',              icon: 'trophy'   },
  { id: 'streak_4',     name: 'Roti',                    description: '4 semanas dando vueltas sin parar — como el asador',               icon: 'flame'    },
  { id: 'streak_8',     name: 'Butifarra',               description: '8 semanas con el punto perfecto — esto ya es calidad',             icon: 'medal'    },
  { id: 'lose_1kg',     name: 'El Torrezno',             description: 'Perdiste tu primer kilo — ya empieza a crujir',                    icon: 'zap'      },
  { id: 'lose_5kg',     name: 'Lasaña',                  description: '5 kg menos — capa a capa, como una buena lasaña',                  icon: 'mountain' },
  { id: 'lose_10kg',    name: 'Zeppelin',                description: '10 kg menos — llevas un Zeppelin entero de ventaja',              icon: 'star'     },
  { id: 'lose_5pct',    name: 'Pollo 99%',               description: 'Un 5% menos — puro músculo, sin nada que sobre',                   icon: 'target'   },
  { id: 'lose_10pct',   name: 'Burrito',                 description: 'Un 10% menos — más liado con el reto que un burrito bien enrollado', icon: 'rocket'  },
  { id: 'fat_5pct',     name: 'Picada de pollo',         description: '5% menos de grasa — como la picada, sin excesos',                  icon: 'heart'    },
  { id: 'waist_5cm',    name: 'Chistorra',               description: '5 cm menos de cintura — más fino que una chistorra',               icon: 'ruler'    },
  { id: 'top3',         name: 'No tan bien como tú',     description: 'Top 3 del ranking — nadie en el grupo lo está haciendo tan bien',  icon: 'crown'    },
  { id: 'all_metrics',  name: 'Yanda',                   description: 'Todas las medidas registradas — plato listo para servir',          icon: 'check'    },
];

export function calcAchievements(p: Participant, allScores?: { userId: string; rank: number }[]): ParticipantAchievement[] {
  const s = startEntry(p);
  const l = latestEntry(p);
  const sw = toNum(s?.weight);
  const lw = toNum(l?.weight);
  const kgLost = sw && lw ? Math.max(0, sw - lw) : 0;
  const pctLost = sw && lw && sw > 0 ? ((sw - lw) / sw) * 100 : 0;
  const streak = streakWeeks(p);
  const h = toNum(p.height);

  // Fat lost
  let firstFat: number | null = null;
  let lastFat: number | null = null;
  if (h) {
    const sorted = [...(p.weeklyData ?? [])].sort((a, b) => a.week - b.week);
    for (const e of sorted) {
      const fat = calcBodyFat(p.gender, h, toNum(e.waist), toNum(e.neck), toNum(e.hip)) ?? (e.bodyFat ?? null);
      if (fat !== null) { if (firstFat === null) firstFat = fat; lastFat = fat; }
    }
  }
  const fatLost = firstFat !== null && lastFat !== null ? firstFat - lastFat : null;

  // Waist lost
  const firstWaist = toNum((p.weeklyData ?? []).sort((a, b) => a.week - b.week)[0]?.waist);
  const lastWaist = toNum(l?.waist);
  const waistLost = firstWaist && lastWaist ? firstWaist - lastWaist : null;

  // All metrics in latest entry
  const hasAllMetrics = l
    ? (l.weight != null && l.waist != null && l.neck != null && (p.gender === 'M' || l.hip != null))
    : false;

  const rank = allScores?.find((x) => x.userId === p.id)?.rank ?? 999;

  return [
    { achievementId: 'first_step',   progressPct: (p.weeklyData?.length ?? 0) > 0 ? 100 : 0,                     unlockedAt: (p.weeklyData?.length ?? 0) > 0 ? 'unlocked' : undefined },
    { achievementId: 'streak_4',     progressPct: Math.min(100, (streak / 4) * 100),                               unlockedAt: streak >= 4 ? 'unlocked' : undefined },
    { achievementId: 'streak_8',     progressPct: Math.min(100, (streak / 8) * 100),                               unlockedAt: streak >= 8 ? 'unlocked' : undefined },
    { achievementId: 'lose_1kg',     progressPct: Math.min(100, kgLost * 100),                                     unlockedAt: kgLost >= 1 ? 'unlocked' : undefined },
    { achievementId: 'lose_5kg',     progressPct: Math.min(100, (kgLost / 5) * 100),                               unlockedAt: kgLost >= 5 ? 'unlocked' : undefined },
    { achievementId: 'lose_10kg',    progressPct: Math.min(100, (kgLost / 10) * 100),                              unlockedAt: kgLost >= 10 ? 'unlocked' : undefined },
    { achievementId: 'lose_5pct',    progressPct: Math.min(100, (pctLost / 5) * 100),                              unlockedAt: pctLost >= 5 ? 'unlocked' : undefined },
    { achievementId: 'lose_10pct',   progressPct: Math.min(100, (pctLost / 10) * 100),                             unlockedAt: pctLost >= 10 ? 'unlocked' : undefined },
    { achievementId: 'fat_5pct',     progressPct: fatLost !== null ? Math.min(100, (fatLost / 5) * 100) : 0,       unlockedAt: fatLost !== null && fatLost >= 5 ? 'unlocked' : undefined },
    { achievementId: 'waist_5cm',    progressPct: waistLost !== null ? Math.min(100, (waistLost / 5) * 100) : 0,   unlockedAt: waistLost !== null && waistLost >= 5 ? 'unlocked' : undefined },
    { achievementId: 'top3',         progressPct: rank <= 3 ? 100 : Math.max(0, 100 - (rank - 3) * 20),            unlockedAt: rank <= 3 ? 'unlocked' : undefined },
    { achievementId: 'all_metrics',  progressPct: hasAllMetrics ? 100 : 0,                                         unlockedAt: hasAllMetrics ? 'unlocked' : undefined },
  ];
}

export function getAchievementsWithHolders(participants: Participant[]): AchievementWithHolders[] {
  return ACHIEVEMENT_DEFS.map((def) => {
    const holders = participants
      .filter((p) => {
        const achs = calcAchievements(p);
        return achs.find((a) => a.achievementId === def.id)?.unlockedAt !== undefined;
      })
      .map((p) => ({ userId: p.id, name: p.name, color: p.color }));
    return { ...def, holders };
  });
}
