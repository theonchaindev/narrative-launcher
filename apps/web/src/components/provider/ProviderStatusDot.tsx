import { cn } from '@/lib/utils';
import type { ProviderStatus } from '@narrative-launcher/shared-types';

interface ProviderStatusDotProps {
  status: ProviderStatus;
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<ProviderStatus, { dotClass: string; label: string }> = {
  healthy:      { dotClass: 'bg-accent-green shadow-green-sm',  label: 'Live' },
  degraded:     { dotClass: 'bg-accent-yellow status-pulse',    label: 'Degraded' },
  unavailable:  { dotClass: 'bg-accent-red',                    label: 'Down' },
  disabled:     { dotClass: 'bg-text-muted',                    label: 'Disabled' },
  experimental: { dotClass: 'bg-accent-green status-pulse',     label: 'Beta' },
};

export function ProviderStatusDot({ status, showLabel = false }: ProviderStatusDotProps) {
  const { dotClass, label } = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotClass)} />
      {showLabel && (
        <span className="text-[11px] text-text-muted font-mono">{label}</span>
      )}
    </span>
  );
}
