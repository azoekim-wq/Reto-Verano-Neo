import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingDown, Flame, Trophy, Activity } from 'lucide-react';
import { CardHeader } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { listParticipants, deltaPct, latestEntry, startEntry } from '@/services/participants.service';
import { rankScores, type ScoreBreakdown } from '@/services/scoring.service';
import { mockActivities } from '@/mocks/fixtures';
import { relativeTime, formatPct, formatKg } from '@/lib/utils';
import type { Participant } from '@/types/domain';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.35 } }),
};

interface Props { onOpenProfile: (id: string) => void; }

export function DashboardView({ onOpenProfile }: Props) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [scores, setScores] = useState<ScoreBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listParticipants().then((ps) => {
      setParticipants(ps);
      setScores(rankScores(ps));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const withData = participants.filter((p) => p.weeklyData?.length > 0);
  const totalKgLost = withData.reduce((acc, p) => {
    const s = startEntry(p); const l = latestEntry(p);
    if (!s?.weight || !l?.weight) return acc;
    return acc + Math.max(0, s.weight - l.weight);
  }, 0);
  const totalPoints = scores.reduce((acc, s) => acc + s.totalPoints, 0);
  const withFatData = scores.filter((s) => s.fatKgLost != null && s.fatKgLost > 0);
  const totalFatKgLost = withFatData.reduce((acc, s) => acc + s.fatKgLost!, 0);

  return (
    <div>
      <div className="mb-8">
        <Chip className="mb-4"><span className="w-1.5 h-1.5 rounded-full bg-acid" /> Datos en tiempo real</Chip>
        <h1 className="font-display font-bold text-3xl md:text-5xl tracking-tight leading-none">Dashboard del equipo.</h1>
        <p className="text-zinc-400 mt-2 max-w-lg">{participants.length} participantes. Todos los datos son publicos.</p>
      </div>

      {loading && <div className="text-center text-zinc-500 py-20">Cargando datos...</div>}

      {!loading && (
        <div className="grid grid-cols-12 gap-4">
          <motion.div className="col-span-12 md:col-span-4 card card-hover p-6 grad-acid" variants={fadeUp} initial="hidden" animate="show" custom={0}>
            <CardHeader label="Kg perdidos equipo" icon={<TrendingDown className="w-4 h-4 text-acid" />} />
            <div className="num text-6xl font-bold mt-3">{formatKg(totalKgLost)}<span className="text-xl text-zinc-500 ml-2">kg</span></div>
            <div className="text-xs text-zinc-500 mt-2">entre {withData.length} participantes con datos</div>
          </motion.div>

          <motion.div className="col-span-12 sm:col-span-6 md:col-span-4 card card-hover p-6" variants={fadeUp} initial="hidden" animate="show" custom={1}>
            <CardHeader label="Grasa perdida equipo" icon={<Activity className="w-4 h-4 text-zinc-500" />} />
            <div className="num text-5xl font-bold mt-3 text-acid">
              {totalFatKgLost > 0 ? totalFatKgLost.toFixed(1) : '—'}
              {totalFatKgLost > 0 && <span className="text-xl text-zinc-500 ml-2">kg</span>}
            </div>
            <div className="text-xs text-zinc-500 mt-1">acumulado entre {withFatData.length} participantes con datos</div>
          </motion.div>

          <motion.div className="col-span-12 sm:col-span-6 md:col-span-4 card card-hover p-6" variants={fadeUp} initial="hidden" animate="show" custom={2}>
            <CardHeader label="Puntos totales" icon={<Trophy className="w-4 h-4 text-zinc-500" />} />
            <div className="num text-5xl font-bold mt-3 text-acid">{Math.round(totalPoints)}</div>
            <div className="text-xs text-zinc-500 mt-1">acumulados por el equipo</div>
          </motion.div>

          {/* Tabla participantes con puntos */}
          <motion.div className="col-span-12 card card-hover p-6" variants={fadeUp} initial="hidden" animate="show" custom={3}>
            <div className="flex items-center justify-between mb-5">
              <div className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Clasificacion por puntos</div>
              <Chip tone="dim"><Users className="w-3 h-3" /> {participants.length}</Chip>
            </div>
            <div className="space-y-2">
              {scores.map((s) => {
                const p = participants.find((x) => x.id === s.userId);
                if (!p) return null;
                return (
                  <button key={s.userId} onClick={() => onOpenProfile(s.userId)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-panel2 transition text-left">
                    <div className="num font-bold text-zinc-600 w-5 text-sm">{s.rank}</div>
                    <Avatar initials={s.name.slice(0,2).toUpperCase()} color={s.color} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{s.name}</div>
                      <div className="text-xs text-zinc-500 flex flex-wrap gap-x-2 gap-y-0.5">
                        {s.kgLost > 0 && <span>{formatKg(s.kgLost)} kg perdidos</span>}
                        {s.fatKgLost != null && s.fatKgLost > 0 && <span>{s.fatKgLost.toFixed(1)} kg grasa</span>}
                        {s.streakWeeksImproving > 0 && <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-hot" />{s.streakWeeksImproving} sem</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="num font-bold text-acid">{s.totalPoints} pts</div>
                      <div className="text-xs text-zinc-500">{formatPct(deltaPct(p))}</div>
                    </div>
                  </button>
                );
              })}
              {scores.length === 0 && <div className="text-zinc-500 text-sm text-center py-8">No hay participantes</div>}
            </div>
          </motion.div>

          <motion.div className="col-span-12 card card-hover p-6" variants={fadeUp} initial="hidden" animate="show" custom={4}>
            <div className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-5">Actividad reciente</div>
            <div className="space-y-4">
              {mockActivities.map((a) => (
                <div key={a.id} className="flex items-center gap-4">
                  <Avatar initials={a.userInitials} color={a.userColor} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm"><span className="font-semibold">{a.userName}</span>{' '}<span className="text-zinc-500">{a.title}</span></div>
                    <div className="text-xs text-zinc-500 truncate">{a.detail}</div>
                  </div>
                  <div className="text-[10px] text-zinc-600 mono uppercase flex-shrink-0">{relativeTime(a.createdAt)}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
