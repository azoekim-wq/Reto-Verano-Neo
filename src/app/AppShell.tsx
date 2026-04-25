import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type Tab = 'dashboard' | 'ranking' | 'graficas' | 'perfil' | 'logros' | 'registrar';

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'ranking',   label: 'Ranking' },
  { id: 'graficas',  label: 'Gráficas' },
  { id: 'logros',    label: 'Logros' },
  { id: 'registrar', label: 'Registrar' },
];

interface AppShellProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  children: ReactNode;
}

export function AppShell({ tab, onTabChange, children }: AppShellProps) {
  const visibleTab = tab === 'perfil' ? 'ranking' : tab;

  return (
    <>
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-ink/80 border-b border-line">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-acid flex items-center justify-center">
              <Flame className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="font-display font-bold text-lg tracking-tight">
                RETO<span className="text-acid">/</span>VERANO
              </div>
              <div className="text-[10px] text-zinc-500 -mt-1 tracking-widest uppercase">
                Challenge · 2026
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={cn(
                  'relative transition-colors',
                  visibleTab === t.id ? 'text-acid' : 'hover:text-zinc-200',
                )}
              >
                {t.label}
                {visibleTab === t.id && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute left-1/2 -bottom-3 w-1.5 h-1.5 bg-acid rounded-full -translate-x-1/2"
                    style={{ boxShadow: '0 0 12px #C6FF3D' }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-acid animate-pulse-dot" />
            <span className="mono uppercase tracking-wider hidden sm:inline">live</span>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden border-t border-line overflow-x-auto">
          <div className="flex gap-6 px-6 py-3 text-xs font-medium text-zinc-400 whitespace-nowrap">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={cn('transition-colors', visibleTab === t.id ? 'text-acid' : '')}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">{children}</main>

      <footer className="max-w-7xl mx-auto px-6 py-10 mt-10 border-t border-line">
        <div className="flex items-center justify-between text-xs text-zinc-600 flex-wrap gap-2">
          <div className="mono uppercase tracking-widest">Reto/Verano · 2026</div>
          <div>v2.0 · todos los datos son públicos</div>
        </div>
      </footer>
    </>
  );
}
