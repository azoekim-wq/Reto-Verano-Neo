import type { LeaderboardRow, Participant } from '@/types/domain';
import { listParticipants, deltaPct, latestEntry, startEntry, streakWeeks, latestBodyFat } from './participants.service';

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function toRow(p: Participant): LeaderboardRow | null {
  const s = startEntry(p);
  const l = latestEntry(p);
  const sw = s?.weight ?? null;
  const lw = l?.weight ?? null;
  if (!sw || !lw) return null;
  return {
    userId: p.id,
    name: p.name,
    initials: initialsOf(p.name),
    avatarColor: p.color,
    startWeightKg: sw,
    currentWeightKg: lw,
    deltaKg: lw - sw,
    deltaPct: deltaPct(p),
    streakWeeks: streakWeeks(p),
    bodyFatPct: latestBodyFat(p) ?? undefined,
    rank: 0,
  };
}

export async function listLeaderboard(): Promise<LeaderboardRow[]> {
  const participants = await listParticipants();
  const rows = participants.map(toRow).filter((r): r is LeaderboardRow => r !== null);
  rows.sort((a, b) => a.deltaPct - b.deltaPct);
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}
