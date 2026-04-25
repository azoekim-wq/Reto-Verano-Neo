import { motion } from 'framer-motion';
import { Trophy, Crown, Flame, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { listParticipants } from '@/services/participants.service';
import { rankScores, rankScoresWeekly, type ScoreBreakdown } from '@/services/scoring.service';

interface Props { onOpenProfile: (id: string) => void; }

export function LeaderboardView({ onOpenProfile }: Props) {
  const [scores, setScores] = useState<ScoreBreakdown[]>([]);
  const [weekly, setWeekly] = useState<ScoreBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'total' | 'week'>('total');
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    listParticipants().then((ps) => {
      setScores(rankScores(ps));
      setWeekly(rankScoresWeekly(ps));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const rows = view === 'total' ? scores : weekly;
  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <Chip className="mb-4"><Trophy className="w-3 h-3" /> Clasificacion</Chip>
          <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight leading-none">Ranking.</h1>
          <p className="text-zinc-400 mt-2">Puntuacion por peso, grasa corporal y constancia.</p>
        </div>
        <button onClick={() => setShowInfo(!showInfo)}>
          <Chip tone={showInfo ? 'acid' : 'dim'}><Info className="w-3 h-3" /> Como se puntua</Chip>
        </button>
      </div>

      {showInfo && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="card p-5 mb-6 grad-acid">
          <div className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-4">Sistema de puntuacion</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-acid mt-1.5 flex-shrink-0" />
              <div><div className="font-semibold text-sm">Peso</div><div className="text-xs text-zinc-400 mt-0.5">2 puntos por cada kg bajado respecto al inicio.</div></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
              <div><div className="font-semibold text-sm">Grasa</div><div className="text-xs text-zinc-400 mt-0.5">3 puntos por cada 1% de grasa bajado. Requiere cuello y cintura.</div></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
              <div><div className="font-semibold text-sm">Racha</div><div className="text-xs text-zinc-400 mt-0.5">2 pts por semana mejorando peso o grasa. Sin datos no rompe racha.</div></div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Toggle total / semana */}
      <div className="flex gap-2 p-1 bg-panel rounded-xl border border-line w-fit mb-8">
        {([{ k: 'total', label: 'Acumulado' }, { k: 'week', label: 'Esta semana' }] as const).map((f) => (
          <button key={f.k} onClick={() => setView(f.k)}
            className={cn('px-4 py-2 rounded-lg text-xs font-semibold transition', view === f.k ? 'bg-acid text-black' : 'text-zinc-400 hover:text-white')}>
            {f.label}
          </button>
        ))}
      </div>

      {loading && <div className="text-zinc-500 text-center py-20">Cargando ranking...</div>}
      {!loading && rows.length === 0 && <div className="text-zinc-500 text-center py-20">Sin datos aun</div>}

      {!loading && rows.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8 items-end">
            <PodiumCard row={podium[1]} position={2} view={view} onOpenProfile={onOpenProfile} />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl p-6 text-center border border-acid bg-acid/5 relative -mt-6 shadow-glow cursor-pointer hover:bg-acid/10 transition"
              onClick={() => podium[0] && onOpenProfile(podium[0].userId)}>
              <div className="absolute top-3 left-1/2 -translate-x-1/2"><Crown className="w-6 h-6 text-acid" /></div>
              {podium[0] && <>
                <div className="flex justify-center mt-3"><Avatar initials={podium[0].name.slice(0,2).toUpperCase()} color={podium[0].color} size={64} /></div>
                <div className="font-display font-bold mt-3 text-lg">{podium[0].name}</div>
                <div className="num text-3xl sm:text-5xl font-bold mt-2 text-acid leading-none">
                  {view === 'total' ? podium[0].totalPoints : podium[0].weeklyWeightPoints + podium[0].weeklyFatPoints}
                </div>
                <div className="text-xs text-zinc-500 mb-2">puntos</div>
                <ScorePills s={podium[0]} view={view} />
                <div className="mt-4 text-5xl font-bold font-display text-acid">1</div>
              </>}
            </motion.div>
            <PodiumCard row={podium[2]} position={3} view={view} onOpenProfile={onOpenProfile} />
          </div>

          <div className="card overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 border-b border-line text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mono">
              <div className="col-span-1">#</div>
              <div className="col-span-7 md:col-span-3">Participante</div>
              <div className="col-span-4 md:col-span-2 text-right">Total pts</div>
              <div className="hidden md:block col-span-2 text-right">Peso</div>
              <div className="hidden md:block col-span-2 text-right">Grasa</div>
              <div className="hidden md:block col-span-2 text-right">Racha</div>
            </div>
            {rows.map((r) => {
              const pts = view === 'total' ? r.totalPoints : r.weeklyWeightPoints + r.weeklyFatPoints;
              const wPts = view === 'total' ? r.weightPoints : r.weeklyWeightPoints;
              const fPts = view === 'total' ? r.fatPoints : r.weeklyFatPoints;
              return (
                <button key={r.userId} onClick={() => onOpenProfile(r.userId)}
                  className="w-full grid grid-cols-12 gap-2 px-4 sm:px-6 py-4 border-b border-line/50 items-center hover:bg-panel2/50 transition">
                  <div className="col-span-1 num font-bold text-zinc-500">{r.rank}</div>
                  <div className="col-span-7 md:col-span-3 flex items-center gap-2">
                    <Avatar initials={r.name.slice(0,2).toUpperCase()} color={r.color} size={32} />
                    <span className="font-semibold text-sm text-left truncate">{r.name}</span>
                  </div>
                  <div className="col-span-4 md:col-span-2 text-right num font-bold text-acid whitespace-nowrap">{pts} pts</div>
                  <div className="hidden md:block col-span-2 text-right num text-zinc-400 text-xs">{wPts > 0 ? `+${wPts}` : '-'}</div>
                  <div className="hidden md:block col-span-2 text-right num text-zinc-400 text-xs">{fPts > 0 ? `+${fPts}` : '-'}</div>
                  <div className="hidden md:block col-span-2 text-right text-xs text-zinc-400 flex items-center justify-end gap-1">
                    {view === 'total' && r.streakPoints > 0 ? <><Flame className="w-3 h-3 text-hot" />{r.streakPoints}</> : '-'}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ScorePills({ s, view }: { s: ScoreBreakdown; view: 'total' | 'week' }) {
  const wPts = view === 'total' ? s.weightPoints : s.weeklyWeightPoints;
  const fPts = view === 'total' ? s.fatPoints : s.weeklyFatPoints;
  const kgL = view === 'total' ? s.kgLost : s.weeklyKgLost;
  const fatL = view === 'total' ? s.fatLost : s.weeklyFatLost;
  return (
    <div className="flex justify-center gap-1 flex-wrap mt-2">
      {wPts > 0 && <span className="text-[10px] bg-acid/10 text-acid rounded-full px-2 py-0.5 mono">{kgL.toFixed(1)}kg +{wPts}</span>}
      {fPts > 0 && <span className="text-[10px] bg-emerald-400/10 text-emerald-400 rounded-full px-2 py-0.5 mono">{fatL?.toFixed(1)}% +{fPts}</span>}
      {view === 'total' && s.streakPoints > 0 && <span className="text-[10px] bg-orange-400/10 text-orange-400 rounded-full px-2 py-0.5 mono">{s.streakWeeksImproving}sem +{s.streakPoints}</span>}
    </div>
  );
}

function PodiumCard({ row, position, view, onOpenProfile }: { row?: ScoreBreakdown; position: 2 | 3; view: 'total' | 'week'; onOpenProfile: (id: string) => void }) {
  if (!row) return <div className="rounded-2xl p-6 text-center border border-line bg-panel h-[240px]" />;
  const pts = view === 'total' ? row.totalPoints : row.weeklyWeightPoints + row.weeklyFatPoints;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: position * 0.05 }}
      className="rounded-2xl p-6 text-center border border-line relative cursor-pointer hover:border-zinc-600 transition"
      style={{ background: 'linear-gradient(135deg,#1a1a1a 0%, #242424 50%, #1a1a1a 100%)' }}
      onClick={() => onOpenProfile(row.userId)}>
      <div className="flex justify-center"><Avatar initials={row.name.slice(0,2).toUpperCase()} color={row.color} size={56} /></div>
      <div className="font-display font-bold mt-3">{row.name}</div>
      <div className="num text-2xl sm:text-4xl font-bold mt-2 leading-none">{pts}</div>
      <div className="text-xs text-zinc-500 mb-2">puntos</div>
      <ScorePills s={row} view={view} />
      <div className="mt-3 text-4xl font-bold font-display text-zinc-500">{position}</div>
    </motion.div>
  );
}
