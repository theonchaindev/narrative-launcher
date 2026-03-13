import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'green' | 'yellow' | 'red' | 'purple' | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-surface text-text-secondary border border-border': variant === 'default',
          'bg-accent-green/10 text-accent-green': variant === 'green',
          'bg-accent-yellow/10 text-accent-yellow': variant === 'yellow',
          'bg-accent-red/10 text-accent-red': variant === 'red',
          'bg-accent-purple/10 text-accent-purple': variant === 'purple',
          'border border-border text-text-secondary': variant === 'outline',
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
