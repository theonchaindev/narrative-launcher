import Link from 'next/link';
import type { NarrativeListItem } from '@narrative-launcher/shared-types';
import { formatNumber, formatTimeAgo, getScoreLabel } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface NarrativeCardProps {
  narrative: NarrativeListItem;
  className?: string;
}

const STATUS_BADGE: Record<string, { label: string; variant: 'green' | 'yellow' | 'default' | 'orange' }> = {
  active:    { label: 'Ready to launch', variant: 'green' },
  qualified: { label: 'Qualified',       variant: 'yellow' },
  launched:  { label: 'Launched',        variant: 'orange' },
  pending:   { label: 'Pending',         variant: 'default' },
};

export function NarrativeCard({ narrative, className }: NarrativeCardProps) {
  const { label: scoreLabel, color: scoreColor } = getScoreLabel(narrative.narrativeScore);
  const statusBadge = STATUS_BADGE[narrative.status] ?? { label: narrative.status, variant: 'default' as const };

  return (
    <Link href={`/narrative/${narrative.id}`} className="block group">
      <article className={`p-4 rounded-xl border border-border bg-surface card-hover card-hover-green cursor-pointer ${className ?? ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-accent-green-dim border border-accent-green-border flex items-center justify-center flex-shrink-0 text-accent-green font-bold text-xs font-mono">
              {narrative.ticker.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-text-primary font-mono text-sm ticker-hl">${narrative.ticker}</span>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5 truncate">{narrative.name}</p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="font-mono font-bold text-base text-text-primary tabular-nums">
              {narrative.narrativeScore}
            </div>
            <div className={`text-[10px] font-mono ${scoreColor}`}>{scoreLabel}</div>
          </div>
        </div>

        {/* Tweet text */}
        <p className="text-xs text-text-secondary line-clamp-2 mb-3 leading-relaxed">
          {narrative.xPost.text}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between gap-2 text-[11px] text-text-muted font-mono">
          <div className="flex items-center gap-3">
            <span className="text-text-secondary">@{narrative.xPost.authorUsername}</span>
            <span>❤ {formatNumber(narrative.xPost.likeCount)}</span>
            <span>↺ {formatNumber(narrative.xPost.repostCount)}</span>
            {narrative.xPost.viewCount > 0 && (
              <span>👁 {formatNumber(narrative.xPost.viewCount)}</span>
            )}
          </div>
          <span>{formatTimeAgo(narrative.createdAt)}</span>
        </div>
      </article>
    </Link>
  );
}
