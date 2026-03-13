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
      <div className="text-center py-16 text-text-muted">
        <p className="text-4xl mb-4">📡</p>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {narratives.map((n) => (
        <NarrativeCard key={n.id} narrative={n} />
      ))}
    </div>
  );
}
