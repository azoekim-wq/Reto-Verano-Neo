import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-[transform,box-shadow,border-color,color] duration-150 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-acid text-black hover:shadow-[0_0_0_4px_rgba(198,255,61,0.15)] hover:-translate-y-0.5',
  ghost:
    'bg-transparent text-zinc-200 border border-line hover:border-acid hover:text-acid',
  danger:
    'bg-hot text-white hover:shadow-[0_0_0_4px_rgba(255,51,102,0.2)] hover:-translate-y-0.5',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  ),
);
Button.displayName = 'Button';
