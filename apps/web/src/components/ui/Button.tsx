import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-green',
        {
          'bg-accent-green hover:bg-accent-green-hover text-black font-semibold tracking-tight':
            variant === 'primary',
          'bg-surface2 hover:bg-border text-text-secondary hover:text-text-primary border border-border hover:border-border-hover':
            variant === 'secondary',
          'hover:bg-surface2 text-text-secondary hover:text-text-primary':
            variant === 'ghost',
          'bg-accent-red/10 hover:bg-accent-red/20 text-accent-red border border-accent-red/20':
            variant === 'danger',
        },
        {
          'h-8 px-3 text-xs': size === 'sm',
          'h-10 px-4 text-sm': size === 'md',
          'h-11 px-6 text-sm': size === 'lg',
        },
        className,
      )}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
