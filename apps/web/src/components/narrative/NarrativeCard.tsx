import Link from 'next/link';
import type { NarrativeListItem } from '@narrative-launcher/shared-types';
import { formatNumber, formatTimeAgo, getScoreLabel } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface NarrativeCardProps {
  narrative: NarrativeListItem;
}

const STATUS_BADGE: Record<string, { label: string; variant: 'green' | 'yellow' | 'purple' | 'default' }> = {
  active: { label: 'Ready to launch', variant: 'green' },
  qualified: { label: 'Qualified', variant: 'yellow' },
  launched: { label: 'Launched', variant: 'purple' },
  pending: { label: 'Pending', variant: 'default' },
};

export function NarrativeCard({ narrative }: NarrativeCardProps) {
  const { label: scoreLabel, color: scoreColor } = getScoreLabel(narrative.narrativeScore);
  const statusBadge = STATUS_BADGE[narrative.status] ?? { label: narrative.status, variant: 'default' as const };

  return (
    <Link href={`/narrative/${narrative.id}`} className="block group">
      <article className="p-5 rounded-xl border border-border bg-surface hover:border-accent-purple/40 hover:bg-surface/80 transition-all duration-150 cursor-pointer">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Token identity */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Ticker icon */}
            <div className="w-10 h-10 rounded-full bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center flex-shrink-0 text-accent-purple font-bold text-sm">
              ${narrative.ticker.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-text-primary font-mono">${narrative.ticker}</span>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </div>
              <p className="text-xs text-text-muted mt-0.5 truncate">{narrative.name}</p>
            </div>
          </div>

          {/* Score */}
          <div className="text-right flex-shrink-0">
            <div className="font-mono font-bold text-lg text-text-primary">
              {narrative.narrativeScore}
            </div>
            <div className={`text-xs ${scoreColor}`}>{scoreLabel}</div>
          </div>
        </div>

        {/* Tweet preview */}
        <p className="text-sm text-text-secondary line-clamp-2 mb-3 leading-relaxed">
          {narrative.xPost.text}
        </p>

        {/* Meta row */}
        <div className="flex items-center justify-between gap-2 text-xs text-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="text-text-secondary">@{narrative.xPost.authorUsername}</span>
            </span>
            <span className="flex items-center gap-1">
              ❤ {formatNumber(narrative.xPost.likeCount)}
            </span>
            <span className="flex items-center gap-1">
              🔁 {formatNumber(narrative.xPost.repostCount)}
            </span>
            {narrative.xPost.viewCount > 0 && (
              <span className="flex items-center gap-1">
                👁 {formatNumber(narrative.xPost.viewCount)}
              </span>
            )}
          </div>
          <span>{formatTimeAgo(narrative.createdAt)}</span>
        </div>
      </article>
    </Link>
  );
}
