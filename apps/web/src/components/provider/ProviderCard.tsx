'use client';

import { cn } from '@/lib/utils';
import type { ProviderInfo } from '@narrative-launcher/shared-types';
import { ProviderStatusDot } from './ProviderStatusDot';

interface ProviderCardProps {
  provider: ProviderInfo;
  selected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}

export function ProviderCard({ provider, selected, onSelect, disabled }: ProviderCardProps) {
  const isUnavailable =
    provider.health.status === 'unavailable' || provider.health.status === 'disabled';
  const effectivelyDisabled = disabled || isUnavailable;

  return (
    <button
      onClick={onSelect}
      disabled={effectivelyDisabled}
      className={cn(
        'relative w-full text-left p-4 rounded-xl border transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-green',
        effectivelyDisabled
          ? 'opacity-40 cursor-not-allowed border-border bg-surface'
          : 'cursor-pointer bg-surface',
        selected
          ? 'border-accent-green-border bg-accent-green-dim glow-green-sm'
          : 'border-border',
        !effectivelyDisabled && !selected && 'card-hover card-hover-green',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-primary text-sm">{provider.name}</span>
            {provider.isExperimental && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-green-dim text-accent-green border border-accent-green-border font-mono">
                BETA
              </span>
            )}
          </div>
          <div className="mt-0.5">
            <ProviderStatusDot status={provider.health.status} showLabel />
          </div>
        </div>
        {selected && (
          <span className="w-4 h-4 rounded-full bg-accent-green flex items-center justify-center flex-shrink-0">
            <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
              <path d="M1 4l2.5 3L9 1" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>

      <div className="mb-3">
        <span className={cn('text-base font-mono font-bold tabular-nums', selected ? 'text-accent-green text-glow-green' : 'text-text-primary')}>
          ~{provider.capabilities.launchFeeSOL} SOL
        </span>
        <span className="text-[10px] text-text-muted ml-1 font-mono">launch</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {provider.capabilities.supportsDevBuy && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface2 border border-border text-text-muted font-mono tracking-wider">
            DEV BUY
          </span>
        )}
        {provider.capabilities.supportsFeeShare && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-green-dim border border-accent-green-border text-accent-green font-mono tracking-wider">
            FEE SHARE
          </span>
        )}
        {provider.capabilities.featureFlags.raydiumLaunchLab && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface2 border border-border text-text-muted font-mono tracking-wider">
            RAY LP
          </span>
        )}
      </div>

      {isUnavailable && provider.health.degradedReason && (
        <p className="mt-2 text-[10px] text-text-muted font-mono leading-relaxed">{provider.health.degradedReason}</p>
      )}
    </button>
  );
}
