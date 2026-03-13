import Link from 'next/link';
import type { NarrativeListItem } from '@narrative-launcher/shared-types';
import { formatNumber, formatTimeAgo, getScoreLabel } from '@/lib/utils';

interface NarrativeCardProps {
  narrative: NarrativeListItem;
  className?: string;
}

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  active:    { label: 'READY',     cls: 'text-accent-green' },
  qualified: { label: 'QUALIFIED', cls: 'text-accent-yellow' },
  launched:  { label: 'LAUNCHED',  cls: 'text-text-muted' },
  pending:   { label: 'PENDING',   cls: 'text-text-muted' },
};

export function NarrativeCard({ narrative, className }: NarrativeCardProps) {
  const { label: scoreLabel } = getScoreLabel(narrative.narrativeScore);
  const status = STATUS_STYLES[narrative.status] ?? { label: narrative.status.toUpperCase(), cls: 'text-text-muted' };

  return (
    <Link href={`/narrative/${narrative.id}`} className="block group">
      <div className={`grid grid-cols-1 sm:grid-cols-[120px_1fr_72px_160px_100px_96px] px-4 py-3 hover:bg-surface2 transition-colors ${className ?? ''}`}>

        {/* Ticker */}
        <div className="flex items-center sm:pr-3 mb-1 sm:mb-0">
          <span className="font-mono font-bold text-sm text-accent-green group-hover:text-glow-green transition-all">
            ${narrative.ticker}
          </span>
        </div>

        {/* Post text */}
        <div className="sm:pr-4 mb-1 sm:mb-0">
          <p className="text-xs text-text-secondary line-clamp-1 leading-relaxed">
            {narrative.xPost.text}
          </p>
          <p className="text-[10px] font-mono text-text-muted mt-0.5">
            @{narrative.xPost.authorUsername} · {formatTimeAgo(narrative.createdAt)}
          </p>
        </div>

        {/* Score */}
        <div className="hidden sm:flex flex-col justify-center sm:pr-3">
          <span className="font-mono font-bold text-sm text-text-primary tabular-nums">{narrative.narrativeScore}</span>
          <span className="text-[10px] font-mono text-text-muted">{scoreLabel}</span>
        </div>

        {/* Engagement */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-text-muted sm:pr-3">
          <span>{formatNumber(narrative.xPost.likeCount)} lk</span>
          <span>{formatNumber(narrative.xPost.viewCount)} vw</span>
        </div>

        {/* Status */}
        <div className="hidden sm:flex items-center">
          <span className={`text-[10px] font-mono tracking-wider ${status.cls}`}>{status.label}</span>
        </div>

        {/* Action */}
        <div className="hidden sm:flex items-center justify-end">
          <span className="text-[10px] font-mono text-text-muted group-hover:text-accent-green transition-colors">
            VIEW →
          </span>
        </div>

      </div>
    </Link>
  );
}
