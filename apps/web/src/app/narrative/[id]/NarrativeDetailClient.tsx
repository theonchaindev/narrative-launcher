'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { NarrativeListItem, ProviderInfo } from '@narrative-launcher/shared-types';
import { ProviderCard } from '@/components/provider/ProviderCard';
import { ProviderComparison } from '@/components/provider/ProviderComparison';
import { LaunchModal } from '@/components/launch/LaunchModal';
import { Badge } from '@/components/ui/Badge';
import { formatNumber, formatTimeAgo, getScoreLabel } from '@/lib/utils';

interface NarrativeDetailClientProps {
  narrative: NarrativeListItem;
  providers: ProviderInfo[];
}

export function NarrativeDetailClient({ narrative, providers }: NarrativeDetailClientProps) {
  const [launchOpen, setLaunchOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const { label: scoreLabel, color: scoreColor } = getScoreLabel(narrative.narrativeScore);

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
  };

  const handleLaunchClick = () => {
    if (selectedProvider) setLaunchOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary mb-8 transition-colors">
        ← Back to feed
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Narrative info */}
        <div className="lg:col-span-3 space-y-6">
          {/* Token header */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple font-bold text-xl flex-shrink-0">
              ${narrative.ticker.slice(0, 2)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary font-mono">
                ${narrative.ticker}
              </h1>
              <p className="text-text-secondary mt-0.5">{narrative.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={narrative.status === 'active' ? 'green' : 'yellow'}>
                  {narrative.status === 'active' ? 'Ready to launch' : narrative.status}
                </Badge>
                <span className={`text-sm font-medium ${scoreColor}`}>{scoreLabel}</span>
              </div>
            </div>
          </div>

          {/* X Post embed */}
          <div className="p-5 rounded-2xl border border-border bg-surface">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-text-secondary text-sm font-bold">
                {narrative.xPost.authorUsername.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  @{narrative.xPost.authorUsername}
                </p>
                <p className="text-xs text-text-muted">{formatTimeAgo(narrative.createdAt)}</p>
              </div>
              <a
                href={narrative.xPost.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-text-muted hover:text-text-secondary transition-colors"
                title="View on X"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.858L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>

            <p className="text-base text-text-primary leading-relaxed">{narrative.xPost.text}</p>

            {/* Engagement metrics */}
            <div className="flex items-center gap-4 mt-4 text-sm text-text-muted">
              <span className="flex items-center gap-1">
                <span>❤</span>
                <span>{formatNumber(narrative.xPost.likeCount)}</span>
              </span>
              <span className="flex items-center gap-1">
                <span>🔁</span>
                <span>{formatNumber(narrative.xPost.repostCount)}</span>
              </span>
              {narrative.xPost.viewCount > 0 && (
                <span className="flex items-center gap-1">
                  <span>👁</span>
                  <span>{formatNumber(narrative.xPost.viewCount)}</span>
                </span>
              )}
            </div>
          </div>

          {/* Narrative score breakdown */}
          <div className="p-5 rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Narrative Score</h3>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-mono font-bold text-text-primary">
                  {narrative.narrativeScore}
                </div>
                <span className="text-text-muted text-sm">/ 100</span>
              </div>
            </div>

            {/* Score bar */}
            <div className="w-full h-2 rounded-full bg-border mb-4">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-green transition-all"
                style={{ width: `${narrative.narrativeScore}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Ticker confidence', value: '94%' },
                { label: 'Engagement quality', value: '88%' },
                { label: 'Spam signal', value: 'Low' },
                { label: 'Author reputation', value: 'Good' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-text-secondary">
                  <span>{item.label}</span>
                  <span className="text-text-primary font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Launch panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl border border-border bg-surface sticky top-20">
            <h2 className="font-semibold text-text-primary mb-4">Launch on</h2>

            <div className="space-y-3 mb-4">
              {providers.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  selected={selectedProvider === p.id}
                  onSelect={() => handleProviderSelect(p.id)}
                />
              ))}
            </div>

            <button
              onClick={() => setShowComparison(!showComparison)}
              className="w-full text-xs text-text-muted hover:text-text-secondary transition-colors mb-4 text-center"
            >
              {showComparison ? '▲ Hide' : '▼ Show'} provider comparison
            </button>

            {showComparison && (
              <div className="mb-4 overflow-x-auto">
                <ProviderComparison providers={providers} />
              </div>
            )}

            <button
              onClick={handleLaunchClick}
              disabled={!selectedProvider}
              className="w-full h-12 rounded-xl bg-accent-purple hover:bg-accent-purple-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
            >
              {selectedProvider
                ? `Launch on ${providers.find((p) => p.id === selectedProvider)?.name} →`
                : 'Select a provider above'}
            </button>

            <p className="text-xs text-text-muted text-center mt-3">
              One transaction · Non-custodial · You keep your keys
            </p>
          </div>
        </div>
      </div>

      {/* Launch Modal */}
      {launchOpen && (
        <LaunchModal
          narrative={narrative}
          providers={providers}
          onClose={() => setLaunchOpen(false)}
        />
      )}
    </div>
  );
}
