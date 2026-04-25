import { useState } from 'react';
import confetti from 'canvas-confetti';
import { Scale, TrendingDown, Plus, Minus, Check } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';

const MOODS = [
  { k: 'strong', label: '💪 Fuerte' },
  { k: 'motivated', label: '🔥 Motivado' },
  { k: 'tired', label: '😴 Cansado' },
  { k: 'normal', label: '🤷 Normal' },
  { k: 'low', label: '🥲 Bajo' },
] as const;

export function RegisterWeightView({ onDone }: { onDone?: () => void }) {
  const [weight, setWeight] = useState(80.5);
  const [bodyFat, setBodyFat] = useState('22,4');
  const [waist, setWaist] = useState('86');
  const [muscle, setMuscle] = useState('62,1');
  const [mood, setMood] = useState<(typeof MOODS)[number]['k']>('motivated');
  const [note, setNote] = useState('');

  const handleSave = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#C6FF3D', '#FF3366', '#ffffff'],
    });
    onDone?.();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Chip className="mb-4">
          <Scale className="w-3 h-3" /> Pesada semanal
        </Chip>
        <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight leading-none">
          Nueva pesada.
        </h1>
        <p className="text-zinc-400 mt-2">Viernes 24 abr · 09:00 · en ayunas</p>
      </div>

      <div className="card p-8">
        {/* Peso grande */}
        <div className="text-center py-6 border-b border-line">
          <div className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-4">
            Peso actual
          </div>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setWeight((w) => +(w - 0.1).toFixed(1))}
              className="w-12 h-12 rounded-full border border-line text-zinc-400 hover:border-acid hover:text-acid transition flex items-center justify-center"
            >
              <Minus className="w-5 h-5" />
            </button>
            <div className="flex items-baseline">
              <input
                value={weight.toFixed(1).replace('.', ',')}
                onChange={(e) => {
                  const v = parseFloat(e.target.value.replace(',', '.'));
                  if (!isNaN(v)) setWeight(v);
                }}
                className="num text-7xl md:text-8xl font-bold bg-transparent text-center w-48 focus:outline-none"
              />
              <span className="text-2xl text-zinc-500 ml-2">kg</span>
            </div>
            <button
              onClick={() => setWeight((w) => +(w + 0.1).toFixed(1))}
              className="w-12 h-12 rounded-full border border-line text-zinc-400 hover:border-acid hover:text-acid transition flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 inline-flex">
            <Chip tone="hot">
              <TrendingDown className="w-3 h-3" /> −0,6 kg vs última pesada
            </Chip>
          </div>
        </div>

        {/* Métricas extra */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <ExtraField label="% Grasa" value={bodyFat} onChange={setBodyFat} unit="%" />
          <ExtraField label="Cintura" value={waist} onChange={setWaist} unit="cm" />
          <ExtraField label="Masa muscular" value={muscle} onChange={setMuscle} unit="kg" />
        </div>

        {/* Mood */}
        <div className="mt-8">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-3">
            ¿Cómo te sientes?
          </div>
          <div className="flex gap-2 flex-wrap">
            {MOODS.map((m) => (
              <button
                key={m.k}
                onClick={() => setMood(m.k)}
                type="button"
              >
                <Chip tone={mood === m.k ? 'acid' : 'dim'}>{m.label}</Chip>
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full mt-6 bg-panel2 border border-line rounded-xl p-4 text-sm placeholder-zinc-600 focus:outline-none focus:border-acid transition"
          rows={3}
          placeholder="Nota (opcional): cómo ha ido la semana, sensaciones, lo que quieras compartir…"
        />

        <div className="flex gap-3 mt-8">
          <Button variant="ghost" className="flex-1" onClick={onDone}>
            Cancelar
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleSave}>
            <Check className="w-4 h-4" /> Guardar pesada
          </Button>
        </div>
      </div>

      <div className="mt-4 text-center text-[11px] text-zinc-600">
        🔒 Tus datos son privados. Solo tú ves las cifras exactas — el equipo solo ve el % relativo.
      </div>
    </div>
  );
}

function ExtraField({
  label,
  value,
  onChange,
  unit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
}) {
  return (
    <div className="bg-panel2 border border-line rounded-xl p-4">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
        {label}
      </div>
      <div className="flex items-baseline mt-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="num text-3xl font-bold bg-transparent w-20 focus:outline-none"
        />
        <span className="text-sm text-zinc-500">{unit}</span>
      </div>
    </div>
  );
}
