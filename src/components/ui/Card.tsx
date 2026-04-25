import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

export function Card({ children, hoverable = true, className, ...rest }: CardProps) {
  return (
    <div className={cn('card', hoverable && 'card-hover', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ label, icon }: { label: string; icon?: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">{label}</div>
      {icon}
    </div>
  );
}
