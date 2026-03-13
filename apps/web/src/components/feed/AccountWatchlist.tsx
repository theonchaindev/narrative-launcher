'use client';

import { useState } from 'react';
import type { WatchedAccount } from './useLiveFeed';
import { formatTimeAgo } from '@/lib/utils';

interface AccountWatchlistProps {
  accounts: WatchedAccount[];
  onAdd: (username: string) => void;
  onRemove: (username: string) => void;
}

export function AccountWatchlist({ accounts, onAdd, onRemove }: AccountWatchlistProps) {
  const [input, setInput] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    const clean = input.replace(/^@/, '').trim();
    if (!clean) return;
    onAdd(clean);
    setInput('');
    setAdding(false);
  };

  return (
    <div className="w-64 shrink-0 border-r border-border flex flex-col bg-surface h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-xs font-mono font-semibold text-text-secondary tracking-widest uppercase mb-3">
          Watching
        </h2>

        {adding ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="@username"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') { setAdding(false); setInput(''); }
              }}
              className="flex-1 h-8 rounded-lg bg-surface2 border border-border px-2.5 text-xs font-mono text-text-primary placeholder:text-text-muted input-green focus:outline-none transition-all"
            />
            <button
              onClick={handleAdd}
              className="h-8 w-8 rounded-lg bg-accent-green text-black flex items-center justify-center flex-shrink-0 hover:bg-accent-green-hover transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12l5 5L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full h-8 rounded-lg border border-dashed border-border hover:border-accent-green-border text-xs font-mono text-text-muted hover:text-accent-green transition-all flex items-center justify-center gap-2"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Add account
          </button>
        )}
      </div>

      {/* Account list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {accounts.length === 0 && (
          <div className="pt-8 text-center">
            <p className="text-2xl mb-3">📡</p>
            <p className="text-xs text-text-muted font-mono leading-relaxed">
              Add X accounts to monitor their posts
            </p>
          </div>
        )}
        {accounts.map((account) => (
          <div
            key={account.username}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-surface2 group transition-colors"
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-accent-green-dim border border-accent-green-border flex items-center justify-center flex-shrink-0 text-accent-green text-xs font-mono font-bold">
              {account.username.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-text-primary truncate">@{account.username}</p>
              <p className="text-[10px] font-mono text-text-muted">{formatTimeAgo(account.addedAt)}</p>
            </div>
            <button
              onClick={() => onRemove(account.username)}
              className="w-5 h-5 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center text-text-muted hover:text-accent-red transition-all"
              title="Remove"
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Footer stats */}
      {accounts.length > 0 && (
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted">
            <span className="live-dot" />
            Monitoring {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
