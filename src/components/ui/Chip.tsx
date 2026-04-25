import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'acid' | 'hot' | 'dim';

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  children: ReactNode;
}

const toneStyles: Record<Tone, string> = {
  acid: 'bg-acid/10 text-acid border-acid/25',
  hot: 'bg-hot/10 text-hot border-hot/30',
  dim: 'bg-white/5 text-zinc-400 border-white/10',
};

export function Chip({ tone = 'acid', className, children, ...rest }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.06em] border',
        toneStyles[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
