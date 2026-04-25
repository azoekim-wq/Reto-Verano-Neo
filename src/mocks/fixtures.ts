import type { Achievement, Participant, TeamActivity } from '@/types/domain';

export const mockParticipants: Participant[] = [
  {
    id: 'p1776366593474', name: 'Ramón', color: '#C6FF3D', gender: 'M', height: '169', age: 35,
    weeklyData: [
      { week: 1, weight: 89.1, waist: 105, neck: 40 },
      { week: 2, weight: 87.4, waist: 103, neck: 40 },
      { week: 3, weight: 86.0, waist: 101, neck: 39 },
      { week: 4, weight: 84.8, waist: 99,  neck: 39, armCm: 34, chestCm: 102 },
      { week: 5, weight: 84.0, waist: 97,  neck: 39 },
      { week: 6, weight: 83.2, waist: 95,  neck: 38 },
      { week: 7, weight: 82.0, waist: 92,  neck: 38 },
      { week: 8, weight: 80.5, waist: 90,  neck: 38, armCm: 33, chestCm: 100 },
    ],
  },
  {
    id: 'p1776405668702', name: 'Laura Gómez', color: '#38bdf8', gender: 'F', height: '165', age: 28,
    weeklyData: [
      { week: 1, weight: 68.0, waist: 82, neck: 33, hip: 98 },
      { week: 2, weight: 67.2, waist: 81, neck: 33, hip: 97 },
      { week: 3, weight: 66.5, waist: 80, neck: 33, hip: 96 },
      { week: 4, weight: 65.8, waist: 79, neck: 32, hip: 95, armCm: 29, chestCm: 90 },
      { week: 5, weight: 65.1, waist: 78, neck: 32, hip: 94 },
      { week: 6, weight: 64.5, waist: 77, neck: 32, hip: 93 },
      { week: 7, weight: 63.9, waist: 76, neck: 31, hip: 92 },
      { week: 8, weight: 63.4, waist: 75, neck: 31, hip: 91, armCm: 28, chestCm: 89 },
    ],
  },
  {
    id: 'p1776442500347', name: 'Carlos Ruiz', color: '#f59e0b', gender: 'M', height: '180', age: 42,
    weeklyData: [
      { week: 1, weight: 91.0, waist: 100, neck: 42 },
      { week: 3, weight: 89.5, waist: 98,  neck: 42 },
      { week: 5, weight: 88.2, waist: 96,  neck: 41 },
      { week: 7, weight: 87.0, waist: 94,  neck: 41 },
      { week: 8, weight: 86.5, waist: 93,  neck: 41, armCm: 36, chestCm: 106 },
    ],
  },
  {
    id: 'p1776669540964', name: 'María Fernández', color: '#a78bfa', gender: 'F', height: '170', age: 31,
    weeklyData: [
      { week: 1, weight: 71.3, waist: 80, neck: 32, hip: 100 },
      { week: 2, weight: 70.8, waist: 79, neck: 32, hip: 99  },
      { week: 3, weight: 70.2, waist: 78, neck: 32, hip: 98  },
      { week: 5, weight: 69.1, waist: 77, neck: 31, hip: 97  },
      { week: 7, weight: 68.5, waist: 76, neck: 31, hip: 96  },
      { week: 8, weight: 68.2, waist: 75, neck: 31, hip: 95, armCm: 28, chestCm: 88 },
    ],
  },
  {
    id: 'p1776670827249', name: 'Jorge Sánchez', color: '#f472b6', gender: 'M', height: '178', age: 38,
    weeklyData: [
      { week: 1, weight: 85.2, waist: 95, neck: 41 },
      { week: 2, weight: 84.5, waist: 94, neck: 41 },
      { week: 3, weight: 84.0, waist: 93, neck: 40 },
      { week: 4, weight: 83.3, waist: 92, neck: 40, armCm: 33, chestCm: 101 },
      { week: 5, weight: 82.8, waist: 91, neck: 40 },
      { week: 6, weight: 82.5, waist: 90, neck: 39 },
      { week: 7, weight: 82.3, waist: 89, neck: 39 },
      { week: 8, weight: 82.1, waist: 88, neck: 39, armCm: 33, chestCm: 100 },
    ],
  },
  {
    id: 'p1776671044509', name: 'Ana Torres', color: '#fb923c', gender: 'F', height: '162', age: 26,
    weeklyData: [
      { week: 1, weight: 73.3, waist: 84, neck: 33, hip: 102 },
      { week: 2, weight: 72.8, waist: 83, neck: 33, hip: 101 },
      { week: 3, weight: 72.4, waist: 82, neck: 32, hip: 100 },
      { week: 4, weight: 72.0, waist: 81, neck: 32, hip: 99,  armCm: 30, chestCm: 92 },
      { week: 5, weight: 71.7, waist: 80, neck: 32, hip: 98  },
      { week: 6, weight: 71.4, waist: 79, neck: 32, hip: 97  },
      { week: 7, weight: 71.1, waist: 78, neck: 31, hip: 96  },
      { week: 8, weight: 71.0, waist: 77, neck: 31, hip: 95, armCm: 29, chestCm: 91 },
    ],
  },
  {
    id: 'p1776671803958', name: 'Pablo Molina', color: '#34d399', gender: 'M', height: '185', age: 45,
    weeklyData: [
      { week: 1, weight: 91.9, waist: 102, neck: 43 },
      { week: 2, weight: 91.2, waist: 101, neck: 43 },
      { week: 4, weight: 90.5, waist: 99,  neck: 42, armCm: 37, chestCm: 108 },
      { week: 6, weight: 90.0, waist: 97,  neck: 42 },
      { week: 8, weight: 89.5, waist: 95,  neck: 42, armCm: 36, chestCm: 107 },
    ],
  },
  {
    id: 'p1776676087632', name: 'Elena Castro', color: '#4f6ef7', gender: 'F', height: '168', age: 33,
    weeklyData: [
      { week: 1, weight: 66.1, waist: 78, neck: 32, hip: 96 },
      { week: 2, weight: 65.8, waist: 77, neck: 32, hip: 95 },
      { week: 3, weight: 65.5, waist: 76, neck: 31, hip: 94 },
      { week: 4, weight: 65.3, waist: 75, neck: 31, hip: 93, armCm: 27, chestCm: 87 },
      { week: 5, weight: 65.1, waist: 74, neck: 31, hip: 92 },
      { week: 6, weight: 65.0, waist: 74, neck: 31, hip: 92 },
      { week: 7, weight: 64.9, waist: 73, neck: 30, hip: 91 },
      { week: 8, weight: 64.8, waist: 73, neck: 30, hip: 91, armCm: 27, chestCm: 86 },
    ],
  },
];

export const mockAchievements: Achievement[] = [
  { id: 'a1',  name: 'Primer paso',    description: 'Tu primera pesada',             icon: 'trophy',   unlockedAt: '2026-03-01' },
  { id: 'a2',  name: 'En racha',       description: '4 semanas consecutivas',        icon: 'flame',    unlockedAt: '2026-03-29' },
  { id: 'a3',  name: 'Francotirador', description: '3 objetivos cumplidos',          icon: 'target',   unlockedAt: '2026-03-20' },
  { id: 'a4',  name: 'Relámpago',     description: '−1 kg en una semana',           icon: 'zap',      unlockedAt: '2026-04-01' },
  { id: 'a5',  name: 'Top 3',         description: 'Entra en el podio',             icon: 'crown',    unlockedAt: '2026-04-18' },
  { id: 'a6',  name: 'Imparable',     description: '8 semanas sin faltar',          icon: 'medal',    progressPct: 76 },
  { id: 'a7',  name: 'Kilómetro cero',description: 'Llega al peso objetivo',        icon: 'map',      progressPct: 68 },
  { id: 'a8',  name: 'Cintura de avispa', description: '−10 cm de cintura',        icon: 'heart',    progressPct: 55 },
  { id: 'a9',  name: 'Cumbre',        description: '−10% peso inicial',            icon: 'mountain', progressPct: 56 },
  { id: 'a10', name: 'Leyenda',       description: 'Completa todos los retos',      icon: 'star',     progressPct: 10 },
];

function iso(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

export const mockActivities: TeamActivity[] = [
  { id: 'ac1', userId: 'p1776405668702', userName: 'Laura Gómez',    userInitials: 'LG', userColor: '#38bdf8', type: 'weigh-in',    title: 'registró pesada',   detail: '−0,5 kg esta semana',              createdAt: iso(0) },
  { id: 'ac2', userId: 'p1776442500347', userName: 'Carlos Ruiz',    userInitials: 'CR', userColor: '#f59e0b', type: 'achievement', title: 'desbloqueó logro',  detail: '"En racha": 4 semanas seguidas',   createdAt: iso(0) },
  { id: 'ac3', userId: 'p1776669540964', userName: 'María Fernández',userInitials: 'MF', userColor: '#a78bfa', type: 'rank-up',     title: 'subió al podio',    detail: 'Entró en el top 3 del ranking',   createdAt: iso(1) },
  { id: 'ac4', userId: 'p1776670827249', userName: 'Jorge Sánchez',  userInitials: 'JS', userColor: '#f472b6', type: 'streak',      title: 'completó racha',    detail: '8 semanas registrando sin faltar', createdAt: iso(1) },
  { id: 'ac5', userId: 'p1776671044509', userName: 'Ana Torres',     userInitials: 'AT', userColor: '#fb923c', type: 'weigh-in',    title: 'registró pesada',   detail: '−0,1 kg esta semana',              createdAt: iso(2) },
];
