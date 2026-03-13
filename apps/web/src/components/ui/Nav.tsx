'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Nav() {
  const [importing, setImporting] = useState(false);
  const [importUrl, setImportUrl] = useState('');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-accent-purple flex items-center justify-center text-white font-bold text-sm">
            N
          </div>
          <span className="font-semibold text-text-primary hidden sm:block">
            Narrative Launcher
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6 text-sm text-text-secondary">
          <Link href="/" className="hover:text-text-primary transition-colors">
            Feed
          </Link>
          <Link href="/explore" className="hover:text-text-primary transition-colors">
            Explore
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {importing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="Paste X post URL..."
                className="h-9 w-64 rounded-lg bg-surface border border-border px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple transition-colors"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setImporting(false);
                    setImportUrl('');
                  }
                  if (e.key === 'Enter' && importUrl) {
                    window.location.href = `/?import=${encodeURIComponent(importUrl)}`;
                  }
                }}
              />
              <button
                onClick={() => { setImporting(false); setImportUrl(''); }}
                className="h-9 px-3 text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setImporting(true)}
              className="h-9 px-4 rounded-lg bg-surface border border-border text-sm text-text-secondary hover:text-text-primary hover:border-accent-purple transition-all"
            >
              Import from X
            </button>
          )}

          <button className="h-9 px-4 rounded-lg bg-accent-purple hover:bg-accent-purple-hover text-white text-sm font-medium transition-colors">
            Connect Wallet
          </button>
        </div>
      </div>
    </nav>
  );
}
