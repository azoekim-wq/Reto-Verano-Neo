import { collection, getDocs, doc, getDoc, updateDoc, addDoc } from 'firebase/firestore';
import type { Participant, WeeklyEntry } from '@/types/domain';
import { getFirebase, IS_MOCK } from './firebase';
import { mockParticipants } from '@/mocks/fixtures';

const RETO_ID = import.meta.env.VITE_RETO_ID ?? 'reto-verano-2024';

// ── Helpers numéricos seguros ─────────────────────────────────────────────────

/** Convierte un valor que puede ser string, number o undefined a number | null */
function toNum(v: number | string | undefined | null): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : v;
  return isFinite(n) ? n : null;
}

// ── Cálculo % grasa (método Navy) ─────────────────────────────────────────────

/**
 * Devuelve el % de grasa corporal usando la fórmula de la Marina americana.
 * Requiere cuello + cintura (hombres) o cuello + cintura + cadera (mujeres).
 * Si falta algún dato necesario devuelve null sin lanzar error.
 */
export function calcBodyFat(
  gender: 'M' | 'F',
  heightCm: number,
  waistCm: number | null,
  neckCm: number | null,
  hipCm: number | null,
): number | null {
  if (!heightCm || !waistCm || !neckCm) return null;
  const h = heightCm;
  const w = waistCm;
  const n = neckCm;

  if (gender === 'M') {
    const val = 86.01 * Math.log10(w - n) - 70.041 * Math.log10(h) + 36.76;
    return isFinite(val) && val > 0 ? Math.round(val * 10) / 10 : null;
  } else {
    if (!hipCm) return null;
    const val = 163.205 * Math.log10(w + hipCm - n) - 97.684 * Math.log10(h) - 78.387;
    return isFinite(val) && val > 0 ? Math.round(val * 10) / 10 : null;
  }
}

// ── Helpers de participante ───────────────────────────────────────────────────

/** Semana más antigua con datos. */
export function startEntry(p: Participant): WeeklyEntry | null {
  if (!p.weeklyData?.length) return null;
  return p.weeklyData.reduce((a, b) => (a.week <= b.week ? a : b));
}

/** Semana más reciente con datos. */
export function latestEntry(p: Participant): WeeklyEntry | null {
  if (!p.weeklyData?.length) return null;
  return p.weeklyData.reduce((a, b) => (a.week >= b.week ? a : b));
}

/** Variación % de peso respecto al inicio. Negativo = perdió peso. */
export function deltaPct(p: Participant): number {
  const s = startEntry(p);
  const l = latestEntry(p);
  const sw = toNum(s?.weight);
  const lw = toNum(l?.weight);
  if (!sw || !lw || sw === 0) return 0;
  return ((lw - sw) / sw) * 100;
}

/** Semanas consecutivas con registro hasta la más reciente. */
export function streakWeeks(p: Participant): number {
  if (!p.weeklyData?.length) return 0;
  const weeks = [...new Set(p.weeklyData.map((e) => e.week))].sort((a, b) => b - a);
  if (weeks.length === 0) return 0;
  let streak = 1;
  for (let i = 1; i < weeks.length; i++) {
    if (weeks[i - 1] - weeks[i] === 1) streak++;
    else break;
  }
  return streak;
}

/** % grasa de la última semana que tenga los datos necesarios. */
export function latestBodyFat(p: Participant): number | null {
  if (!p.weeklyData?.length) return null;
  const h = toNum(p.height);
  if (!h) return null;

  // Busca desde la semana más reciente hacia atrás
  const sorted = [...p.weeklyData].sort((a, b) => b.week - a.week);
  for (const e of sorted) {
    // Si tiene bodyFat ya calculado, úsalo directamente
    if (e.bodyFat != null && isFinite(e.bodyFat)) return e.bodyFat;
    // Si no, intenta calcular
    const bf = calcBodyFat(
      p.gender,
      h,
      toNum(e.waist),
      toNum(e.neck),
      toNum(e.hip),
    );
    if (bf !== null) return bf;
  }
  return null;
}

/**
 * Devuelve los datos de una métrica por semana para un participante.
 * Si la semana no tiene el dato, devuelve null (no lanza error).
 */
export function metricSeries(
  p: Participant,
  key: keyof WeeklyEntry,
): { week: number; value: number | null }[] {
  if (!p.weeklyData?.length) return [];
  const h = toNum(p.height);

  return [...p.weeklyData]
    .sort((a, b) => a.week - b.week)
    .map((e) => {
      if (key === 'bodyFat') {
        // Prioridad: valor guardado → calculado
        if (e.bodyFat != null && isFinite(e.bodyFat)) return { week: e.week, value: e.bodyFat };
        if (!h) return { week: e.week, value: null };
        return {
          week: e.week,
          value: calcBodyFat(p.gender, h, toNum(e.waist), toNum(e.neck), toNum(e.hip)),
        };
      }
      const raw = e[key];
      return { week: e.week, value: toNum(raw as number | string | undefined) };
    });
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function listParticipants(): Promise<Participant[]> {
  if (IS_MOCK) return mockParticipants;
  try {
    const { db } = getFirebase();
    const snap = await getDocs(collection(db, 'retos', RETO_ID, 'participantes'));
    return snap.docs.map((d) => ({
      weeklyData: [],
      gender: 'M' as const,
      height: 170,
      color: '#C6FF3D',
      ...d.data(),
      id: d.id,
    } as Participant));
  } catch (err) {
    console.error('listParticipants error:', err);
    return [];
  }
}

export async function getParticipant(id: string): Promise<Participant | null> {
  if (IS_MOCK) return mockParticipants.find((p) => p.id === id) ?? null;
  try {
    const { db } = getFirebase();
    const snap = await getDoc(doc(db, 'retos', RETO_ID, 'participantes', id));
    if (!snap.exists()) return null;
    return {
      weeklyData: [],
      gender: 'M' as const,
      height: 170,
      color: '#C6FF3D',
      ...snap.data(),
      id: snap.id,
    } as Participant;
  } catch (err) {
    console.error('getParticipant error:', err);
    return null;
  }
}

export async function addWeeklyEntry(participantId: string, entry: WeeklyEntry): Promise<void> {
  if (IS_MOCK) {
    const p = mockParticipants.find((x) => x.id === participantId);
    if (p) {
      p.weeklyData = [...p.weeklyData.filter((e) => e.week !== entry.week), entry];
    }
    return;
  }
  try {
    const participant = await getParticipant(participantId);
    if (!participant) throw new Error(`Participante ${participantId} no encontrado`);
    const updated = [...participant.weeklyData.filter((e) => e.week !== entry.week), entry];
    const { db } = getFirebase();
    await updateDoc(doc(db, 'retos', RETO_ID, 'participantes', participantId), {
      weeklyData: updated,
    });
  } catch (err) {
    console.error('addWeeklyEntry error:', err);
    throw err;
  }
}

export async function addParticipant(
  data: Omit<Participant, 'id' | 'weeklyData'>,
): Promise<Participant> {
  if (IS_MOCK) {
    const newP: Participant = { ...data, id: 'p' + Date.now(), weeklyData: [] };
    mockParticipants.push(newP);
    return newP;
  }
  try {
    const { db } = getFirebase();
    const ref = await addDoc(collection(db, 'retos', RETO_ID, 'participantes'), {
      ...data,
      weeklyData: [],
    });
    return { ...data, id: ref.id, weeklyData: [] };
  } catch (err) {
    console.error('addParticipant error:', err);
    throw err;
  }
}

export async function replaceWeeklyData(participantId: string, data: WeeklyEntry[]): Promise<void> {
  if (IS_MOCK) {
    const p = mockParticipants.find((x) => x.id === participantId);
    if (p) p.weeklyData = data;
    return;
  }
  try {
    const { db } = getFirebase();
    await updateDoc(doc(db, 'retos', RETO_ID, 'participantes', participantId), {
      weeklyData: data,
    });
  } catch (err) {
    console.error('replaceWeeklyData error:', err);
    throw err;
  }
}
