'use client';

import { useState } from 'react';
import { MOCK_NARRATIVES } from '@/lib/mock-data';
import { NarrativeFeed } from '@/components/narrative/NarrativeFeed';
import type { NarrativeListItem } from '@narrative-launcher/shared-types';

type SortKey = 'score' | 'recent' | 'engagement';
type FilterStatus = 'all' | 'active' | 'qualified' | 'launched';

export default function ExplorePage() {
  const [sort, setSort] = useState<SortKey>('score');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_NARRATIVES.filter((n) => {
    if (filterStatus !== 'all' && n.status !== filterStatus) return false;
    if (search && !n.ticker.toLowerCase().includes(search.toLowerCase()) &&
      !n.xPost.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a: NarrativeListItem, b: NarrativeListItem) => {
    if (sort === 'score') return b.narrativeScore - a.narrativeScore;
    if (sort === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === 'engagement') return b.xPost.likeCount - a.xPost.likeCount;
    return 0;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-mono text-text-muted tracking-widest uppercase mb-1">Explore</p>
        <h1 className="text-2xl font-bold font-mono text-text-primary">Narratives</h1>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 pb-6 border-b border-border">

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-green font-mono text-xs">›</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search ticker or text..."
            className="w-full h-9 rounded-lg bg-surface border border-border pl-7 pr-3 text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none input-green transition-colors"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1">
          {(['all', 'active', 'qualified', 'launched'] as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`h-7 px-3 rounded text-[11px] font-mono transition-all ${
                filterStatus === s
                  ? 'bg-accent-green-dim border border-accent-green-border text-accent-green'
                  : 'border border-border text-text-muted hover:text-text-secondary hover:border-border-hover'
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-mono text-text-muted tracking-wider">SORT</span>
          <div className="flex items-center gap-1">
            {(['score', 'recent', 'engagement'] as SortKey[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`h-7 px-3 rounded text-[11px] font-mono transition-all ${
                  sort === s
                    ? 'bg-accent-green-dim border border-accent-green-border text-accent-green'
                    : 'border border-border text-text-muted hover:text-text-secondary hover:border-border-hover'
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Results count */}
      <p className="text-[10px] font-mono text-text-muted mb-4 tracking-wider">
        {sorted.length} RESULT{sorted.length !== 1 ? 'S' : ''}
      </p>

      <NarrativeFeed
        narratives={sorted}
        emptyMessage="No narratives match your filters."
      />
    </div>
  );
}
