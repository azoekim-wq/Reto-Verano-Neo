import { useEffect, useState } from 'react';
import { ArrowLeft, Scale, Ruler, Activity, Award, Check } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { getParticipant, deltaPct, latestEntry, startEntry, streakWeeks, latestBodyFat, metricSeries, calcBodyFat } from '@/services/participants.service';
import { calcScore } from '@/services/scoring.service';
import { calcAchievements, ACHIEVEMENT_DEFS } from '@/services/achievements.service';
import type { Participant } from '@/types/domain';
import { formatKg, formatPct } from '@/lib/utils';
import { Trophy, Flame, Target, Zap, Heart, Crown, Medal, Mountain, Star, Map, Rocket, Ruler as RulerIcon, type LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  trophy: Trophy, flame: Flame, target: Target, zap: Zap,
  heart: Heart, crown: Crown, medal: Medal, mountain: Mountain,
  star: Star, map: Map, rocket: Rocket, ruler: RulerIcon, check: Check, award: Award,
};

interface Props { participantId: string | null; onBack: () => void; }

function initialsOf(name: string) {
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0]! + p[p.length - 1][0]!).toUpperCase();
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-4">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">{label}</div>
      <div className="num text-2xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs text-zinc-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export function ProfileView({ participantId, onBack }: Props) {
  const [p, setP] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (!participantId) { setLoading(false); return; }
    getParticipant(participantId).then(setP).catch(console.error).finally(() => setLoading(false));
  }, [participantId]);

  if (loading) return <div className="text-zinc-500 py-20 text-center">Cargando perfil...</div>;
  if (!p) return (
    <div className="text-center py-20">
      <p className="text-zinc-500 mb-4">Participante no encontrado.</p>
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4" /> Volver</Button>
    </div>
  );

  const s = startEntry(p);
  const l = latestEntry(p);
  const dp = deltaPct(p);
  const sw = streakWeeks(p);
  const bf = latestBodyFat(p);
  const heightNum = parseFloat(String(p.height)) || null;
  const score = calcScore(p);
  const achievements = calcAchievements(p);
  const unlockedAchs = achievements.filter((a) => a.unlockedAt);

  const weightSeries = metricSeries(p, 'weight').filter((x) => x.value != null)
    .map((x) => ({ semana: `S${String(x.week).padStart(2, '0')}`, kg: x.value }));
  const waistSeries = metricSeries(p, 'waist').filter((x) => x.value != null)
    .map((x) => ({ semana: `S${String(x.week).padStart(2, '0')}`, cm: x.value }));

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4" /> Volver</Button>
      </div>

      {/* Hero */}
      <div className="card p-6 mb-6 flex items-center gap-6 flex-wrap">
        <Avatar initials={initialsOf(p.name)} color={p.color} size={80} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display font-bold text-3xl">{p.name}</h1>
            <Chip tone={dp <= 0 ? 'acid' : 'dim'}>{formatPct(dp)}</Chip>
            {sw > 0 && <Chip tone="dim"><Flame className="w-3 h-3 text-hot" /> {sw} sem</Chip>}
          </div>
          <div className="text-zinc-500 text-sm mt-1 flex gap-4 flex-wrap">
            {p.gender && <span>{p.gender === 'M' ? 'Hombre' : 'Mujer'}</span>}
            {heightNum && <span>{heightNum} cm</span>}
            {p.age && <span>{p.age} anos</span>}
          </div>
        </div>
        <div className="text-center">
          <div className="num text-4xl font-bold text-acid">{score.totalPoints}</div>
          <div className="text-xs text-zinc-500">puntos totales</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Peso inicial" value={s?.weight != null ? `${formatKg(s.weight)} kg` : '-'} />
        <StatCard label="Peso actual" value={l?.weight != null ? `${formatKg(l.weight)} kg` : '-'} />
        <StatCard label="Total perdido" value={s?.weight && l?.weight ? `${formatKg(s.weight - l.weight)} kg` : '-'} sub={formatPct(dp)} />
        <StatCard label="% Grasa" value={bf != null ? `${bf}%` : '-'} sub={score.fatKgLost != null && score.fatKgLost > 0 ? `${score.fatKgLost.toFixed(1)} kg grasa perdidos` : undefined} />
      </div>

      {/* Puntos desglosados */}
      <div className="card p-5 mb-6">
        <div className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-4">Desglose de puntos</div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="num text-3xl font-bold text-acid">{score.weightPoints}</div>
            <div className="text-xs text-zinc-500 mt-1">pts peso</div>
            <div className="text-[10px] text-zinc-600">{score.kgLost.toFixed(1)} kg x2</div>
          </div>
          <div className="text-center">
            <div className="num text-3xl font-bold text-emerald-400">{score.fatPoints}</div>
            <div className="text-xs text-zinc-500 mt-1">pts grasa</div>
            <div className="text-[10px] text-zinc-600">{score.fatLost != null ? `${score.fatLost.toFixed(1)}% x3` : 'sin datos'}</div>
          </div>
          <div className="text-center">
            <div className="num text-3xl font-bold text-orange-400">{score.streakPoints}</div>
            <div className="text-xs text-zinc-500 mt-1">pts racha</div>
            <div className="text-[10px] text-zinc-600">{score.streakWeeksImproving} sem x2</div>
          </div>
        </div>
      </div>

      {/* Logros */}
      <div className="card p-5 mb-6">
        <div className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-4 flex items-center gap-2">
          <Award className="w-3 h-3" /> Logros ({unlockedAchs.length}/{achievements.length})
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {achievements.map((a) => {
            const def = ACHIEVEMENT_DEFS.find((d) => d.id === a.achievementId);
            if (!def) return null;
            const Icon = ICONS[def.icon] ?? Award;
            const unlocked = !!a.unlockedAt;
            return (
              <div key={a.achievementId} className={`rounded-xl p-3 flex flex-col items-center text-center gap-1 ${unlocked ? 'bg-acid/10 border border-acid/30' : 'bg-panel2 border border-line opacity-50'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${unlocked ? 'bg-acid' : 'bg-panel border border-line'}`}>
                  <Icon className={`w-4 h-4 ${unlocked ? 'text-black' : 'text-zinc-600'}`} />
                </div>
                <div className="text-xs font-semibold leading-tight">{def.name}</div>
                {!unlocked && (
                  <div className="w-full h-1 bg-panel rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-acid/50 rounded-full" style={{ width: `${a.progressPct}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ultima medicion */}
      {l && (
        <div className="card p-5 mb-6">
          <div className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-4 flex items-center gap-2">
            <Ruler className="w-3 h-3" /> Ultima medicion (semana {l.week})
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { label: 'Cintura', value: l.waist, unit: 'cm' },
              { label: 'Cuello', value: l.neck, unit: 'cm' },
              ...(p.gender === 'F' ? [{ label: 'Cadera', value: l.hip, unit: 'cm' }] : []),
              { label: 'Brazo', value: l.armCm, unit: 'cm' },
              { label: 'Pecho', value: l.chestCm, unit: 'cm' },
            ].map(({ label, value, unit }) => (
              <div key={label} className="bg-panel2 rounded-xl p-3">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</div>
                <div className="num font-bold text-lg mt-1">{value != null && value !== '' ? `${value} ${unit}` : '-'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graficas */}
      {weightSeries.length > 1 && (
        <div className="card card-hover p-6 mb-6">
          <div className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-5 flex items-center gap-2">
            <Scale className="w-3 h-3" /> Evolucion del peso
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weightSeries} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="semana" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: '#141414', border: '1px solid #262626', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v} kg`, 'Peso']} />
              <Line type="monotone" dataKey="kg" stroke={p.color} strokeWidth={2.5} dot={{ r: 4, fill: p.color, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {waistSeries.length > 1 && (
        <div className="card card-hover p-6 mb-6">
          <div className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-5 flex items-center gap-2">
            <Activity className="w-3 h-3" /> Evolucion cintura
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={waistSeries} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="semana" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: '#141414', border: '1px solid #262626', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v} cm`, 'Cintura']} />
              <Line type="monotone" dataKey="cm" stroke={p.color} strokeWidth={2.5} dot={{ r: 4, fill: p.color, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Historial */}
      <div className="card card-hover overflow-hidden">
        <div className="overflow-x-auto">
        <div className="min-w-[540px]">
        <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-line text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mono">
          <div className="col-span-1">Sem</div>
          <div className="col-span-2 text-right">Peso</div>
          <div className="col-span-2 text-right">Cintura</div>
          <div className="col-span-2 text-right">Cuello</div>
          <div className="col-span-2 text-right">{p.gender === 'F' ? 'Cadera' : 'Brazo'}</div>
          <div className="col-span-1 text-right">Grasa</div>
          <div className="col-span-2 text-right">Br/Pe</div>
        </div>
        {[...(p.weeklyData ?? [])].sort((a, b) => b.week - a.week).map((e) => {
          const bf2 = e.bodyFat ?? (heightNum
            ? calcBodyFat(p.gender, heightNum, parseFloat(String(e.waist)) || null, parseFloat(String(e.neck)) || null, parseFloat(String(e.hip)) || null)
            : null);
          return (
            <div key={e.week} className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-line/50 text-sm items-center hover:bg-panel2/50 transition">
              <div className="col-span-1 mono font-semibold text-zinc-400">S{String(e.week).padStart(2,'0')}</div>
              <div className="col-span-2 text-right num">{e.weight != null ? `${e.weight}` : '-'}</div>
              <div className="col-span-2 text-right num text-zinc-400">{e.waist != null && e.waist !== '' ? `${e.waist}` : '-'}</div>
              <div className="col-span-2 text-right num text-zinc-400">{e.neck != null && e.neck !== '' ? `${e.neck}` : '-'}</div>
              <div className="col-span-2 text-right num text-zinc-400">{p.gender === 'F' ? (e.hip != null && e.hip !== '' ? `${e.hip}` : '-') : (e.armCm != null && e.armCm !== '' ? `${e.armCm}` : '-')}</div>
              <div className="col-span-1 text-right num text-zinc-400">{bf2 != null ? `${bf2}%` : '-'}</div>
              <div className="col-span-2 text-right num text-zinc-400">{e.armCm != null && e.armCm !== '' ? `${e.armCm}/${e.chestCm ?? '-'}` : '-'}</div>
            </div>
          );
        })}
        {(!p.weeklyData || p.weeklyData.length === 0) && (
          <div className="p-10 text-center text-zinc-500 text-sm">Sin datos registrados aun</div>
        )}
        </div>
        </div>
      </div>
    </div>
  );
}
