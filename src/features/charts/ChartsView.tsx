import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Chip } from '@/components/ui/Chip';
import { BarChart2 } from 'lucide-react';
import { listParticipants, metricSeries } from '@/services/participants.service';
import { METRICS, type MetricKey } from '@/types/domain';
import type { Participant } from '@/types/domain';
import { cn } from '@/lib/utils';

export function ChartsView() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<MetricKey>('weight');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    listParticipants()
      .then(setParticipants)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setSelectedIds(new Set()); }, [metric]);

  const toggleParticipant = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const currentMetric = METRICS.find((m) => m.key === metric)!;

  // Filtra participantes según género si la métrica lo requiere
  const eligible = participants.filter(
    (p) => !currentMetric.genderFilter || p.gender === currentMetric.genderFilter,
  );

  // Construye el dataset: una fila por semana, una propiedad por participante
  const allWeeks = Array.from(
    new Set(eligible.flatMap((p) => (p.weeklyData ?? []).map((e) => e.week))),
  ).sort((a, b) => a - b);

  const chartData = allWeeks.map((week) => {
    const row: Record<string, number | string> = { week: `S${String(week).padStart(2, '0')}` };
    for (const p of eligible) {
      const series = metricSeries(p, metric);
      const entry = series.find((s) => s.week === week);
      if (entry?.value != null) row[p.id] = entry.value;
    }
    return row;
  });

  // Tabla de última medición
  const lastValues = eligible.map((p) => {
    const series = metricSeries(p, metric).filter((s) => s.value != null);
    const first = series[0];
    const last = series[series.length - 1];
    return {
      p,
      first: first?.value ?? null,
      last: last?.value ?? null,
      delta: first?.value != null && last?.value != null ? last.value - first.value : null,
    };
  }).sort((a, b) => {
    if (a.last == null) return 1;
    if (b.last == null) return -1;
    return b.last - a.last;
  });

  return (
    <div>
      <div className="mb-8">
        <Chip className="mb-4">
          <BarChart2 className="w-3 h-3" /> Comparativa del equipo
        </Chip>
        <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight leading-none">
          Gráficas.
        </h1>
        <p className="text-zinc-400 mt-2">Evolución semanal por métrica. Selecciona qué quieres ver.</p>
      </div>

      {/* Selector de métrica */}
      <div className="flex gap-2 flex-wrap mb-8">
        {METRICS.map((m) => (
          <button key={m.key} onClick={() => setMetric(m.key)}>
            <Chip tone={metric === m.key ? 'acid' : 'dim'}>
              {m.label} <span className="text-zinc-500">{m.unit}</span>
              {m.genderFilter && (
                <span className="ml-1 text-[10px] opacity-60">{m.genderFilter === 'F' ? '♀' : '♂'}</span>
              )}
            </Chip>
          </button>
        ))}
      </div>

      {loading && <div className="text-zinc-500 py-20 text-center">Cargando datos…</div>}

      {!loading && (
        <motion.div
          key={metric}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* Gráfica */}
          <div className="card card-hover p-6" onClick={clearSelection}>
            <div className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-6">
              {currentMetric.label} ({currentMetric.unit}) — evolución semanal
              {selectedIds.size > 0 && (
                <span className="ml-3 normal-case text-zinc-600 font-normal">
                  — haz clic fuera para ver todos
                </span>
              )}
            </div>
            {chartData.length === 0 ? (
              <div className="text-zinc-500 text-sm text-center py-12">Sin datos para esta métrica</div>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="week" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip active={false} />
                  <Legend
                    content={({ payload }) => (
                      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-3">
                        {(payload ?? []).map((entry: any) => {
                          const p = eligible.find((x) => x.id === entry.dataKey);
                          const active = selectedIds.size === 0 || selectedIds.has(entry.dataKey);
                          return (
                            <button
                              key={entry.dataKey}
                              onClick={(e) => { e.stopPropagation(); toggleParticipant(entry.dataKey); }}
                              className={cn(
                                'flex items-center gap-1.5 text-xs transition-opacity duration-200',
                                active ? 'opacity-100' : 'opacity-25',
                              )}
                            >
                              <span className="w-4 h-0.5 inline-block rounded-full" style={{ background: entry.color }} />
                              {p?.name ?? entry.dataKey}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                  {eligible.map((p) => {
                    const active = selectedIds.size === 0 || selectedIds.has(p.id);
                    return (
                      <Line
                        key={p.id}
                        type="monotone"
                        dataKey={p.id}
                        stroke={p.color}
                        strokeWidth={active && selectedIds.size > 0 ? 3 : 2}
                        strokeOpacity={active ? 1 : 0.1}
                        dot={{ r: 3, fill: p.color, strokeWidth: 0, opacity: active ? 1 : 0.1 }}
                        activeDot={{ r: 5 }}
                        connectNulls={true}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Tabla resumen */}
          <div className="card card-hover overflow-hidden">
            <div className="overflow-x-auto">
            <div className="min-w-[360px]">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-line text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mono">
              <div className="col-span-1">#</div>
              <div className="col-span-7">Participante</div>
              <div className="col-span-2 text-right">Último ({currentMetric.unit})</div>
              <div className="col-span-2 text-right">Δ ({currentMetric.unit})</div>
            </div>
            {lastValues.map(({ p, last, delta }, i) => (
              <div
                key={p.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-line/50 items-center hover:bg-panel2/50 transition"
              >
                <div className="col-span-1 num font-bold text-zinc-500">{i + 1}</div>
                <div className="col-span-7 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
                  <span className="font-semibold text-sm truncate">{p.name}</span>
                </div>
                <div className="col-span-2 text-right num font-semibold">
                  {last != null ? `${last}` : '—'}
                </div>
                <div className={cn(
                  'col-span-2 text-right num font-bold',
                  delta == null ? 'text-zinc-600' : delta <= 0 ? 'text-acid' : 'text-hot',
                )}>
                  {delta != null
                    ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}`
                    : '—'}
                </div>
              </div>
            ))}
            {lastValues.length === 0 && (
              <div className="p-10 text-center text-zinc-500 text-sm">Sin datos para esta métrica</div>
            )}
            </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
