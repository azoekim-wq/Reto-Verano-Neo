import { cn } from '@/lib/utils';

interface AvatarProps {
  initials: string;
  color?: string;
  size?: number;
  className?: string;
}

export function Avatar({ initials, color = '#C6FF3D', size = 40, className }: AvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-black font-display flex-shrink-0',
        className,
      )}
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}
