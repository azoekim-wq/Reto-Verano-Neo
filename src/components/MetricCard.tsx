import type { ReactNode } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  delta?: string;
  deltaTone?: 'acid' | 'hot' | 'zinc';
  icon?: ReactNode;
  className?: string;
  tint?: 'acid' | 'hot' | 'none';
}

export function MetricCard({
  label,
  value,
  unit,
  delta,
  deltaTone = 'zinc',
  icon,
  className,
  tint = 'none',
}: MetricCardProps) {
  const tintClass = tint === 'acid' ? 'grad-acid' : tint === 'hot' ? 'grad-hot' : '';
  const deltaClass =
    deltaTone === 'acid' ? 'text-acid' : deltaTone === 'hot' ? 'text-hot' : 'text-zinc-500';
  return (
    <Card className={cn('p-5', tintClass, className)}>
      <CardHeader label={label} icon={icon} />
      <div className="num text-5xl font-bold mt-3 flex items-baseline">
        {value}
        {unit && <span className="text-sm text-zinc-500 ml-2">{unit}</span>}
      </div>
      {delta && <div className={cn('text-xs mt-1', deltaClass)}>{delta}</div>}
    </Card>
  );
}
