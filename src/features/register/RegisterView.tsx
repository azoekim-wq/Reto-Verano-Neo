import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Scale, Check, ChevronDown, UserPlus, Pencil } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import {
  listParticipants,
  addWeeklyEntry,
  addParticipant,
  latestEntry,
} from '@/services/participants.service';
import type { Participant, WeeklyEntry, Mood, Gender } from '@/types/domain';
import { cn } from '@/lib/utils';

const MOODS: { k: Mood; label: string }[] = [
  { k: 'strong',    label: '💪 Fuerte'   },
  { k: 'motivated', label: '🔥 Motivado' },
  { k: 'tired',     label: '😴 Cansado'  },
  { k: 'normal',    label: '🤷 Normal'   },
  { k: 'low',       label: '🥲 Bajo'     },
];

const PRESET_COLORS = [
  '#C6FF3D', '#FF3366', '#4f6ef7', '#FF9500',
  '#00E5CC', '#FF6B35', '#A855F7', '#10B981',
];

type Mode = 'new-week' | 'edit-week' | 'new-member';
type DoneMode = Mode | null;

interface Props {
  onDone?: () => void;
}

function Field({
  label, value, onChange, unit, placeholder = '—',
}: {
  label: string; value: string; onChange: (v: string) => void; unit: string; placeholder?: string;
}) {
  return (
    <div className="bg-panel2 border border-line rounded-xl p-4">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">{label}</div>
      <div className="flex items-baseline mt-2 gap-1">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="num text-2xl font-bold bg-transparent w-24 focus:outline-none placeholder-zinc-700"
        />
        <span className="text-sm text-zinc-500">{unit}</span>
      </div>
    </div>
  );
}

export function RegisterView({ onDone }: Props) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selected, setSelected]         = useState<Participant | null>(null);
  const [open, setOpen]                 = useState(false);
  const [mode, setMode]                 = useState<Mode>('new-week');
  const [editWeek, setEditWeek]         = useState<number | null>(null);
  const [saving, setSaving]             = useState(false);
  const [doneMode, setDoneMode]         = useState<DoneMode>(null);
  const [savedWeek, setSavedWeek]       = useState(0);

  // Campos de pesada
  const [weight,  setWeight]   = useState('');
  const [waist,   setWaist]    = useState('');
  const [neck,    setNeck]     = useState('');
  const [hip,     setHip]      = useState('');
  const [armCm,   setArmCm]    = useState('');
  const [chestCm, setChestCm]  = useState('');
  const [mood,    setMood]     = useState<Mood>('motivated');
  const [note,    setNote]     = useState('');

  // Campos de nuevo miembro
  const [newName,   setNewName]   = useState('');
  const [newGender, setNewGender] = useState<Gender>('M');
  const [newHeight, setNewHeight] = useState('');
  const [newAge,    setNewAge]    = useState('');
  const [newColor,  setNewColor]  = useState<string>('#C6FF3D');

  useEffect(() => {
    listParticipants().then(setParticipants).catch(console.error);
  }, []);

  function resetForm() {
    setWeight(''); setWaist(''); setNeck(''); setHip('');
    setArmCm(''); setChestCm(''); setMood('motivated'); setNote('');
  }

  function selectParticipant(p: Participant) {
    setSelected(p);
    setOpen(false);
    setMode('new-week');
    setEditWeek(null);
    resetForm();
    const l = latestEntry(p);
    if (l) {
      setWaist(l.waist != null ? String(l.waist) : '');
      setNeck(l.neck   != null ? String(l.neck)  : '');
      setHip(l.hip     != null ? String(l.hip)   : '');
    }
  }

  function switchToEditWeek(week: number) {
    if (!selected) return;
    const entry = selected.weeklyData.find((e) => e.week === week);
    if (!entry) return;
    setEditWeek(week);
    setWeight(entry.weight    != null ? String(entry.weight)  : '');
    setWaist(entry.waist      != null ? String(entry.waist)   : '');
    setNeck(entry.neck        != null ? String(entry.neck)    : '');
    setHip(entry.hip          != null ? String(entry.hip)     : '');
    setArmCm(entry.armCm      != null ? String(entry.armCm)   : '');
    setChestCm(entry.chestCm  != null ? String(entry.chestCm) : '');
    setMood(entry.mood ?? 'motivated');
    setNote(entry.note ?? '');
  }

  // Semana que se va a registrar/editar
  const nextWeek = selected ? (latestEntry(selected)?.week ?? 0) + 1 : 1;
  const weekToRegister = mode === 'edit-week' && editWeek != null ? editWeek : nextWeek;

  const editEntry = mode === 'edit-week' && editWeek != null
    ? selected?.weeklyData.find((e) => e.week === editWeek) ?? null
    : null;

  const showExtended =
    weekToRegister % 4 === 0 ||
    (editEntry != null && (editEntry.armCm != null || editEntry.chestCm != null));

  const isFemale = selected?.gender === 'F';

  const existingWeeks = selected
    ? [...selected.weeklyData].sort((a, b) => a.week - b.week)
    : [];

  async function handleSave() {
    if (!selected) return;
    const weightNum = parseFloat(weight.replace(',', '.'));
    if (isNaN(weightNum)) {
      alert('Introduce el peso antes de guardar.');
      return;
    }
    setSaving(true);
    try {
      const entry: WeeklyEntry = {
        week: weekToRegister,
        weight: weightNum,
        waist:   waist   !== '' ? parseFloat(waist.replace(',', '.'))   : undefined,
        neck:    neck    !== '' ? parseFloat(neck.replace(',', '.'))    : undefined,
        hip:     (isFemale && hip !== '') ? parseFloat(hip.replace(',', '.')) : undefined,
        armCm:   (showExtended && armCm !== '')   ? parseFloat(armCm.replace(',', '.'))   : undefined,
        chestCm: (showExtended && chestCm !== '') ? parseFloat(chestCm.replace(',', '.')) : undefined,
        mood,
        note: note.trim() || undefined,
        date: new Date().toISOString().slice(0, 10),
      };
      await addWeeklyEntry(selected.id, entry);
      if (mode !== 'edit-week') {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#C6FF3D', '#FF3366', '#ffffff'] });
      }
      setSavedWeek(weekToRegister);
      setDoneMode(mode);
    } catch (err) {
      console.error(err);
      alert('Error al guardar. Revisa la consola.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveMember() {
    if (!newName.trim()) { alert('El nombre no puede estar vacío.'); return; }
    const heightNum = parseFloat(newHeight.replace(',', '.'));
    if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
      alert('Introduce una altura válida (cm).');
      return;
    }
    setSaving(true);
    try {
      const created = await addParticipant({
        name: newName.trim(),
        gender: newGender,
        height: String(heightNum),
        age: newAge !== '' ? parseInt(newAge, 10) : undefined,
        color: newColor,
      });
      setParticipants((prev) => [...prev, created]);
      setNewName(''); setNewGender('M'); setNewHeight(''); setNewAge(''); setNewColor('#C6FF3D');
      setDoneMode('new-member');
      setSavedWeek(0);
      // Seleccionar al nuevo miembro para poder registrar su semana 1
      setSelected(created);
    } catch (err) {
      console.error(err);
      alert('Error al crear el miembro. Revisa la consola.');
    } finally {
      setSaving(false);
    }
  }

  // ─── Pantalla de confirmación ───────────────────────────────────────────────

  if (doneMode === 'new-member') {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="font-display font-bold text-3xl mb-2">¡Miembro creado!</h2>
        <p className="text-zinc-400 mb-8">{selected?.name} ya está en el reto. ¿Quieres registrar su primera semana?</p>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={onDone}>Ir al dashboard</Button>
          <Button variant="primary" onClick={() => { setDoneMode(null); setMode('new-week'); resetForm(); }}>
            Registrar semana 1
          </Button>
        </div>
      </div>
    );
  }

  if (doneMode === 'edit-week') {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="text-5xl mb-4">✏️</div>
        <h2 className="font-display font-bold text-3xl mb-2">¡Semana corregida!</h2>
        <p className="text-zinc-400 mb-8">Los datos de la semana {savedWeek} de {selected?.name} han sido actualizados.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={() => { setDoneMode(null); setMode('new-week'); setEditWeek(null); resetForm(); }}>
            Registrar otra
          </Button>
          <Button variant="primary" onClick={onDone}>Ir al dashboard</Button>
        </div>
      </div>
    );
  }

  if (doneMode === 'new-week') {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="font-display font-bold text-3xl mb-2">¡Pesada guardada!</h2>
        <p className="text-zinc-400 mb-8">Semana {savedWeek} de {selected?.name} registrada correctamente.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={() => { setDoneMode(null); setSelected(null); resetForm(); }}>
            Registrar otra
          </Button>
          <Button variant="primary" onClick={onDone}>Ir al dashboard</Button>
        </div>
      </div>
    );
  }

  // ─── Formulario nuevo miembro ───────────────────────────────────────────────

  if (mode === 'new-member') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Chip className="mb-4"><UserPlus className="w-3 h-3" /> Nuevo miembro</Chip>
          <h1 className="font-display font-bold text-4xl tracking-tight leading-none">Añadir miembro.</h1>
          <p className="text-zinc-400 mt-2">Rellena los datos del nuevo participante.</p>
        </div>

        <div className="space-y-6">
          {/* Nombre */}
          <div className="card p-6">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-3">Nombre</div>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre completo…"
              className="w-full text-2xl font-bold bg-transparent focus:outline-none placeholder-zinc-700 border-b border-line pb-2"
            />
          </div>

          {/* Género + Altura + Edad */}
          <div className="card p-6">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-4">Datos físicos</div>
            <div className="grid grid-cols-3 gap-4">
              {/* Género */}
              <div className="bg-panel2 border border-line rounded-xl p-4 col-span-1">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-2">Género</div>
                <div className="flex gap-2 mt-1">
                  {(['M', 'F'] as Gender[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setNewGender(g)}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-sm font-bold transition border',
                        newGender === g
                          ? 'bg-acid text-black border-acid'
                          : 'bg-transparent text-zinc-400 border-line hover:border-acid/50',
                      )}
                    >
                      {g === 'M' ? '♂ M' : '♀ F'}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Altura" value={newHeight} onChange={setNewHeight} unit="cm" placeholder="170" />
              <Field label="Edad"   value={newAge}    onChange={setNewAge}    unit="años" placeholder="—" />
            </div>
          </div>

          {/* Color avatar */}
          <div className="card p-6">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-4">Color de avatar</div>
            <div className="flex flex-wrap gap-3 items-center">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  style={{ backgroundColor: c }}
                  className={cn(
                    'w-9 h-9 rounded-full transition-transform',
                    newColor === c ? 'ring-2 ring-offset-2 ring-offset-black ring-white scale-110' : 'hover:scale-105',
                  )}
                />
              ))}
              <label className="relative cursor-pointer">
                <div
                  style={{ backgroundColor: PRESET_COLORS.includes(newColor) ? '#3f3f46' : newColor }}
                  className="w-9 h-9 rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center text-xs hover:scale-105 transition-transform"
                >
                  {PRESET_COLORS.includes(newColor) ? '+' : ''}
                </div>
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
              </label>
              <div
                className="w-9 h-9 rounded-full border border-line flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: newColor }}
              >
                <span className="text-[10px] font-bold text-black/70">
                  {newName.slice(0, 2).toUpperCase() || 'AB'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setMode('new-week')} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleSaveMember} disabled={saving}>
              <Check className="w-4 h-4" />
              {saving ? 'Guardando…' : 'Crear miembro'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Formulario de pesada (nueva semana o editar semana) ────────────────────

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Chip className="mb-4"><Scale className="w-3 h-3" /> Registro semanal</Chip>
        <h1 className="font-display font-bold text-4xl tracking-tight leading-none">
          {mode === 'edit-week' ? 'Editar semana.' : 'Nueva pesada.'}
        </h1>
        <p className="text-zinc-400 mt-2">Selecciona un participante e introduce las medidas.</p>
      </div>

      {/* Selector de participante */}
      <div className="card p-5 mb-6 relative">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-3">Participante</div>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-4 p-3 rounded-xl border border-line hover:border-acid transition"
        >
          {selected ? (
            <>
              <Avatar initials={selected.name.slice(0, 2).toUpperCase()} color={selected.color} size={40} />
              <div className="flex-1 text-left">
                <div className="font-semibold">{selected.name}</div>
                <div className="text-xs text-zinc-500">
                  {mode === 'edit-week' && editWeek != null
                    ? `Editando semana ${editWeek}`
                    : `Semana ${nextWeek} a registrar`}
                </div>
              </div>
            </>
          ) : (
            <div className="text-zinc-500 flex-1 text-left">Selecciona un participante…</div>
          )}
          <ChevronDown className={cn('w-4 h-4 text-zinc-500 transition-transform', open && 'rotate-180')} />
        </button>

        {open && (
          <div className="absolute left-4 right-4 top-full mt-2 z-50 card border border-line shadow-xl overflow-hidden">
            {participants.map((p) => (
              <button
                key={p.id}
                onClick={() => selectParticipant(p)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-panel2 transition text-left border-b border-line/50 last:border-0"
              >
                <Avatar initials={p.name.slice(0, 2).toUpperCase()} color={p.color} size={36} />
                <div>
                  <div className="font-semibold text-sm">{p.name}</div>
                  <div className="text-xs text-zinc-500">
                    {latestEntry(p) ? `Última: semana ${latestEntry(p)!.week}` : 'Sin datos aún'}
                  </div>
                </div>
              </button>
            ))}
            {/* Añadir nuevo miembro */}
            <button
              onClick={() => { setOpen(false); setMode('new-member'); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-panel2 transition text-left text-acid border-t border-line"
            >
              <div className="w-9 h-9 rounded-full border-2 border-dashed border-acid/40 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="font-semibold text-sm">Añadir nuevo miembro</div>
            </button>
          </div>
        )}
      </div>

      {selected && (
        <div className="space-y-6">
          {/* Toggle nueva semana / editar semana (solo si hay semanas previas) */}
          {existingWeeks.length > 0 && (
            <div className="card p-4">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-3">Modo</div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setMode('new-week'); setEditWeek(null); resetForm();
                    const l = latestEntry(selected);
                    if (l) {
                      setWaist(l.waist != null ? String(l.waist) : '');
                      setNeck(l.neck   != null ? String(l.neck)  : '');
                      setHip(l.hip     != null ? String(l.hip)   : '');
                    }
                  }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition',
                    mode === 'new-week'
                      ? 'bg-acid text-black border-acid'
                      : 'bg-transparent text-zinc-400 border-line hover:border-acid/50',
                  )}
                >
                  <Scale className="w-4 h-4" /> Nueva semana {nextWeek}
                </button>
                <button
                  onClick={() => { setMode('edit-week'); setEditWeek(null); resetForm(); }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition',
                    mode === 'edit-week'
                      ? 'bg-acid text-black border-acid'
                      : 'bg-transparent text-zinc-400 border-line hover:border-acid/50',
                  )}
                >
                  <Pencil className="w-4 h-4" /> Editar semana anterior
                </button>
              </div>

              {/* Selector de semana a editar */}
              {mode === 'edit-week' && (
                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-2">
                    ¿Qué semana quieres corregir?
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {existingWeeks.map((e) => (
                      <button
                        key={e.week}
                        onClick={() => switchToEditWeek(e.week)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg border text-sm font-semibold transition',
                          editWeek === e.week
                            ? 'bg-acid text-black border-acid'
                            : 'bg-panel2 text-zinc-300 border-line hover:border-acid/50',
                        )}
                      >
                        Sem. {e.week}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Formulario: se muestra si es nueva semana, o si es edit y ya eligió semana */}
          {(mode === 'new-week' || (mode === 'edit-week' && editWeek != null)) && (
            <>
              {/* Peso */}
              <div className="card p-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-4">
                  Peso — semana {weekToRegister}
                </div>
                <div className="flex items-baseline gap-2">
                  <input
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="80,5"
                    className="num text-6xl font-bold bg-transparent focus:outline-none placeholder-zinc-700 w-48"
                  />
                  <span className="text-2xl text-zinc-500">kg</span>
                </div>
              </div>

              {/* Medidas semanales */}
              <div className="card p-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-4">
                  Perímetros semanales
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Cuello"  value={neck}  onChange={setNeck}  unit="cm" />
                  <Field label="Cintura" value={waist} onChange={setWaist} unit="cm" />
                  {isFemale && (
                    <Field label="Cadera" value={hip} onChange={setHip} unit="cm" />
                  )}
                </div>
              </div>

              {/* Medidas cada 4 semanas */}
              {showExtended && (
                <div className="card p-6 border-acid/30">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">
                    Perímetros adicionales
                  </div>
                  <div className="text-xs text-zinc-500 mb-4">Se toman cada 4 semanas (semana {weekToRegister})</div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Brazo" value={armCm}   onChange={setArmCm}   unit="cm" />
                    <Field label="Pecho" value={chestCm} onChange={setChestCm} unit="cm" />
                  </div>
                </div>
              )}

              {/* Mood */}
              <div className="card p-5">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-3">
                  ¿Cómo se siente?
                </div>
                <div className="flex gap-2 flex-wrap">
                  {MOODS.map((m) => (
                    <button key={m.k} onClick={() => setMood(m.k)} type="button">
                      <Chip tone={mood === m.k ? 'acid' : 'dim'}>{m.label}</Chip>
                    </button>
                  ))}
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full mt-4 bg-panel2 border border-line rounded-xl p-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-acid transition"
                  rows={2}
                  placeholder="Nota opcional…"
                />
              </div>

              {/* Acciones */}
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={onDone} disabled={saving}>
                  Cancelar
                </Button>
                <Button variant="primary" className="flex-1" onClick={handleSave} disabled={saving}>
                  <Check className="w-4 h-4" />
                  {saving
                    ? 'Guardando…'
                    : mode === 'edit-week'
                      ? `Guardar corrección semana ${weekToRegister}`
                      : `Guardar semana ${weekToRegister}`}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
