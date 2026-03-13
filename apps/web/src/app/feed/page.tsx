'use client';

import { useLiveFeed } from '@/components/feed/useLiveFeed';
import { AccountWatchlist } from '@/components/feed/AccountWatchlist';
import { LiveFeedPost } from '@/components/feed/LiveFeedPost';

export default function FeedPage() {
  const { watchedAccounts, posts, addAccount, removeAccount, markSeen, mounted } = useLiveFeed();

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Left sidebar — account watchlist */}
      <AccountWatchlist
        accounts={watchedAccounts}
        onAdd={addAccount}
        onRemove={removeAccount}
      />

      {/* Main feed area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-surface flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="live-dot" />
            <h1 className="text-sm font-mono font-semibold text-text-primary tracking-widest uppercase">
              Live Feed
            </h1>
            {watchedAccounts.length > 0 && (
              <span className="text-[10px] font-mono text-text-muted bg-surface2 border border-border px-2 py-0.5 rounded">
                {watchedAccounts.length} account{watchedAccounts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-text-muted">
            {posts.length} post{posts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Feed list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!mounted ? (
            /* Loading skeletons */
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`h-36 rounded-xl skeleton stagger-${i + 1}`} />
            ))
          ) : posts.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full pt-16 pb-32">
              <div className="text-5xl mb-4">📡</div>
              <p className="text-text-secondary font-mono text-sm mb-1">No posts yet</p>
              <p className="text-text-muted font-mono text-xs text-center max-w-xs leading-relaxed">
                Add X accounts in the sidebar to start monitoring their posts and launch tokens from them.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <LiveFeedPost
                key={post.id}
                post={post}
                onSeen={() => markSeen(post.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
