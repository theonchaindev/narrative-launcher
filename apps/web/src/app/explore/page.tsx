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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Explore Narratives</h1>
        <p className="text-text-secondary">Browse all detected token narratives from X</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ticker or text..."
          className="h-10 rounded-lg bg-surface border border-border px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple w-full sm:w-64 transition-colors"
        />

        {/* Status filter */}
        <div className="flex items-center gap-2">
          {(['all', 'active', 'qualified', 'launched'] as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors capitalize ${
                filterStatus === s
                  ? 'bg-accent-purple text-white'
                  : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-text-muted">Sort:</span>
          {(['score', 'recent', 'engagement'] as SortKey[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors capitalize ${
                sort === s
                  ? 'bg-surface border border-accent-purple text-accent-purple'
                  : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <NarrativeFeed
        narratives={sorted}
        emptyMessage="No narratives match your filters."
      />
    </div>
  );
}
