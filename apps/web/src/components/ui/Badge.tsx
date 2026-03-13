import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'green' | 'yellow' | 'red' | 'orange' | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium tracking-wide',
        {
          'bg-surface2 text-text-secondary border border-border': variant === 'default',
          'bg-accent-green-dim text-accent-green border border-accent-green-border': variant === 'green',
          'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20': variant === 'yellow',
          'bg-accent-red/10 text-accent-red border border-accent-red/20': variant === 'red',
          'bg-accent-orange/10 text-accent-orange border border-accent-orange/20': variant === 'orange',
          'border border-border text-text-muted': variant === 'outline',
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
