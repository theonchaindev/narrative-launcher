import type { NarrativeListItem } from '@narrative-launcher/shared-types';
import { NarrativeCard } from './NarrativeCard';

interface NarrativeFeedProps {
  narratives: NarrativeListItem[];
  emptyMessage?: string;
}

export function NarrativeFeed({
  narratives,
  emptyMessage = 'No narratives found.',
}: NarrativeFeedProps) {
  if (narratives.length === 0) {
    return (
      <div className="border border-border rounded-lg py-12 text-center">
        <p className="font-mono text-xs text-text-muted tracking-wider">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Column headers */}
      <div className="hidden sm:grid grid-cols-[120px_1fr_72px_160px_100px_96px] gap-0 border-b border-border bg-surface2 px-4 py-2">
        {['TICKER', 'POST', 'SCORE', 'ENGAGEMENT', 'STATUS', ''].map((h) => (
          <span key={h} className="text-[10px] font-mono text-text-muted tracking-widest">{h}</span>
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-border">
        {narratives.map((n) => (
          <NarrativeCard key={n.id} narrative={n} />
        ))}
      </div>
    </div>
  );
}
