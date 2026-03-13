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
        'focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        effectivelyDisabled
          ? 'opacity-50 cursor-not-allowed border-border bg-surface'
          : 'cursor-pointer hover:border-accent-purple/50 bg-surface hover:bg-surface/80',
        selected
          ? 'border-accent-purple bg-accent-purple/5 ring-1 ring-accent-purple'
          : 'border-border',
      )}
    >
      {/* Provider header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-primary">{provider.name}</span>
            {provider.isExperimental && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-accent-purple/10 text-accent-purple">
                Beta
              </span>
            )}
          </div>
          <ProviderStatusDot status={provider.health.status} showLabel />
        </div>
        {selected && (
          <span className="w-5 h-5 rounded-full bg-accent-purple flex items-center justify-center flex-shrink-0">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4l2.5 3L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>

      {/* Fee */}
      <div className="mb-3">
        <span className="text-lg font-mono font-bold text-text-primary">
          ~{provider.capabilities.launchFeeSOL} SOL
        </span>
        <span className="text-xs text-text-muted ml-1">launch fee</span>
      </div>

      {/* Capability badges */}
      <div className="flex flex-wrap gap-1">
        {provider.capabilities.supportsDevBuy && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border text-text-secondary">
            Dev buy
          </span>
        )}
        {provider.capabilities.supportsFeeShare && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent-green/5 border border-accent-green/20 text-accent-green">
            Fee share
          </span>
        )}
        {provider.capabilities.featureFlags.raydiumLaunchLab && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border text-text-secondary">
            Raydium LP
          </span>
        )}
      </div>

      {/* Unavailable overlay message */}
      {isUnavailable && provider.health.degradedReason && (
        <p className="mt-2 text-xs text-text-muted">{provider.health.degradedReason}</p>
      )}
    </button>
  );
}
