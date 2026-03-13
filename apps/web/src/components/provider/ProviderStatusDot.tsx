import { cn } from '@/lib/utils';
import type { ProviderStatus } from '@narrative-launcher/shared-types';

interface ProviderStatusDotProps {
  status: ProviderStatus;
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<ProviderStatus, { color: string; label: string; pulse: boolean }> = {
  healthy: { color: 'bg-accent-green', label: 'Live', pulse: false },
  degraded: { color: 'bg-accent-yellow', label: 'Degraded', pulse: true },
  unavailable: { color: 'bg-accent-red', label: 'Down', pulse: false },
  disabled: { color: 'bg-text-muted', label: 'Disabled', pulse: false },
  experimental: { color: 'bg-accent-purple', label: 'Beta', pulse: false },
};

export function ProviderStatusDot({ status, showLabel = false }: ProviderStatusDotProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          'w-2 h-2 rounded-full flex-shrink-0',
          config.color,
          config.pulse && 'status-pulse',
        )}
      />
      {showLabel && (
        <span className="text-xs text-text-secondary">{config.label}</span>
      )}
    </span>
  );
}
