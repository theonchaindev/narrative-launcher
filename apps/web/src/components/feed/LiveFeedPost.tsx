'use client';

import { useEffect, useRef, useState } from 'react';
import type { FeedPost } from './useLiveFeed';
import type { ProviderInfo } from '@narrative-launcher/shared-types';
import { formatNumber, formatTimeAgo } from '@/lib/utils';
import { LaunchModal } from '@/components/launch/LaunchModal';
import { MOCK_PROVIDERS } from '@/lib/mock-data';

interface LiveFeedPostProps {
  post: FeedPost;
  onSeen: () => void;
}

export function LiveFeedPost({ post, onSeen }: LiveFeedPostProps) {
  const [launchOpen, setLaunchOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Mark as seen after animation completes
  useEffect(() => {
    if (!post.isNew) return;
    const timer = setTimeout(onSeen, 500);
    return () => clearTimeout(timer);
  }, [post.isNew, onSeen]);

  // Build a mock NarrativeListItem from this post so we can reuse LaunchModal
  const mockNarrative = {
    id: post.id,
    ticker: post.detectedTicker ?? 'TOKEN',
    name: post.detectedTicker ?? 'Token',
    imageUrl: null,
    narrativeScore: Math.floor(Math.random() * 40) + 50,
    status: 'active' as const,
    xPost: {
      tweetId: post.id,
      authorUsername: post.accountUsername,
      text: post.text,
      likeCount: post.likeCount,
      repostCount: post.repostCount,
      viewCount: post.viewCount,
      canonicalUrl: post.canonicalUrl,
    },
    launchCount: 0,
    createdAt: post.createdAt,
  };

  // Highlight $TICKER in text
  const renderText = (text: string) => {
    const parts = text.split(/(\$[A-Z][A-Z0-9]{1,9})/g);
    return parts.map((part, i) =>
      /^\$[A-Z]/.test(part) ? (
        <span key={i} className="ticker-hl">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  };

  return (
    <>
      <div
        ref={ref}
        className={`p-4 border border-border rounded-xl bg-surface transition-all ${
          post.isNew
            ? 'animate-data-in border-accent-green-border bg-accent-green-dim'
            : 'card-hover card-hover-green'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-surface2 border border-border flex items-center justify-center text-text-secondary text-xs font-mono font-bold flex-shrink-0">
              {post.accountUsername.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-mono font-semibold text-text-primary">
                @{post.accountUsername}
              </p>
              <p className="text-[10px] font-mono text-text-muted">{formatTimeAgo(post.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {post.isNew && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-accent-green bg-accent-green-dim border border-accent-green-border px-2 py-0.5 rounded">
                <span className="w-1 h-1 rounded-full bg-accent-green animate-blink" />
                NEW
              </span>
            )}
            <a
              href={post.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text-secondary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.858L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Post text */}
        <p className="text-sm text-text-primary leading-relaxed mb-3">
          {renderText(post.text)}
        </p>

        {/* Engagement + launch row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-[11px] font-mono text-text-muted">
            <span>❤ {formatNumber(post.likeCount)}</span>
            <span>↺ {formatNumber(post.repostCount)}</span>
            <span>👁 {formatNumber(post.viewCount)}</span>
          </div>

          {post.detectedTicker && (
            <button
              onClick={() => setLaunchOpen(true)}
              className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-accent-green text-black text-xs font-mono font-semibold hover:bg-accent-green-hover transition-colors"
            >
              Launch
              <span className="font-bold">${post.detectedTicker}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {launchOpen && (
        <LaunchModal
          narrative={mockNarrative}
          providers={MOCK_PROVIDERS}
          onClose={() => setLaunchOpen(false)}
        />
      )}
    </>
  );
}
