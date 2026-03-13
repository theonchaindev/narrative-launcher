import type { ProviderInfo } from '@narrative-launcher/shared-types';
import { ProviderStatusDot } from './ProviderStatusDot';

interface ProviderComparisonProps {
  providers: ProviderInfo[];
}

const ROWS = [
  { label: 'Launch fee', key: (p: ProviderInfo) => `~${p.capabilities.launchFeeSOL} SOL` },
  { label: 'Fee share', key: (p: ProviderInfo) => (p.capabilities.supportsFeeShare ? '✅ Yes' : '—') },
  { label: 'Dev buy', key: (p: ProviderInfo) => (p.capabilities.supportsDevBuy ? '✅ Yes' : '—') },
  { label: 'Raydium LP', key: (p: ProviderInfo) => (p.capabilities.featureFlags.raydiumLaunchLab ? '✅ Yes' : '—') },
  {
    label: 'Avg launch time',
    key: (p: ProviderInfo) => `~${(p.capabilities.estimatedLaunchTimeMs / 1000).toFixed(0)}s`,
  },
  { label: 'Max ticker', key: (p: ProviderInfo) => `${p.capabilities.maxTickerLength} chars` },
];

export function ProviderComparison({ providers }: ProviderComparisonProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 pr-6 text-text-muted font-normal w-32">Feature</th>
            {providers.map((p) => (
              <th key={p.id} className="py-3 px-4 text-center font-medium text-text-primary">
                <div className="flex flex-col items-center gap-1">
                  <span>{p.name}</span>
                  <ProviderStatusDot status={p.health.status} showLabel />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-b border-border/50">
              <td className="py-3 pr-6 text-text-secondary">{row.label}</td>
              {providers.map((p) => (
                <td key={p.id} className="py-3 px-4 text-center text-text-primary font-mono text-xs">
                  {row.key(p)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
