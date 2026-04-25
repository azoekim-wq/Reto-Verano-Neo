// Schema real de Firestore: retos/{retoId}/participantes/{participantId}

export type Gender = 'M' | 'F';
export type Mood = 'strong' | 'motivated' | 'tired' | 'normal' | 'low';

export interface WeeklyEntry {
  week: number;
  weight?: number;        // kg — opcional: puede faltar sin romper
  waist?: number | string; // cm
  neck?: number | string;  // cm
  hip?: number | string;   // cm (solo mujeres, cada semana)
  armCm?: number | string; // cm (cada 4 semanas)
  chestCm?: number | string; // cm (cada 4 semanas)
  bodyFat?: number;        // % calculado o manual
  mood?: Mood;
  note?: string;
  date?: string;
}

export interface Participant {
  id: string;
  name: string;
  color: string;          // hex ej. "#4f6ef7"
  gender: Gender;
  height: string | number; // cm
  age?: number;
  weeklyData: WeeklyEntry[];
}

// ---- View models ----

export interface LeaderboardRow {
  userId: string;
  name: string;
  initials: string;
  avatarColor: string;
  startWeightKg: number;
  currentWeightKg: number;
  deltaKg: number;
  deltaPct: number;       // negativo = perdió peso
  streakWeeks: number;
  rank: number;
  bodyFatPct?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progressPct?: number;
}

export interface TeamActivity {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  userColor: string;
  type: 'weigh-in' | 'achievement' | 'rank-up' | 'streak';
  title: string;
  detail: string;
  createdAt: string;
}

export type MetricKey = 'weight' | 'bodyFat' | 'waist' | 'neck' | 'hip' | 'armCm' | 'chestCm';

export interface MetricOption {
  key: MetricKey;
  label: string;
  unit: string;
  genderFilter?: Gender; // si se define, solo se muestra para ese género
}

export const METRICS: MetricOption[] = [
  { key: 'weight',   label: 'Peso',      unit: 'kg' },
  { key: 'bodyFat',  label: '% Grasa',   unit: '%' },
  { key: 'waist',    label: 'Cintura',   unit: 'cm' },
  { key: 'neck',     label: 'Cuello',    unit: 'cm' },
  { key: 'hip',      label: 'Cadera',    unit: 'cm', genderFilter: 'F' },
  { key: 'armCm',    label: 'Brazo',     unit: 'cm' },
  { key: 'chestCm',  label: 'Pecho',     unit: 'cm' },
];
