import Link from 'next/link';
import { MOCK_NARRATIVES, MOCK_PROVIDERS } from '@/lib/mock-data';
import { NarrativeFeed } from '@/components/narrative/NarrativeFeed';
import { ProviderStatusDot } from '@/components/provider/ProviderStatusDot';
import { formatNumber } from '@/lib/utils';

export default function HomePage() {
  const trendingNarratives = MOCK_NARRATIVES.filter((n) => n.status !== 'launched').slice(0, 6);
  const recentlyLaunched = MOCK_NARRATIVES.filter((n) => n.status === 'launched');

  const totalViews = MOCK_NARRATIVES.reduce((sum, n) => sum + n.xPost.viewCount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <section className="relative text-center py-16 sm:py-24 max-w-3xl mx-auto overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        {/* Scanline overlay */}
        <div className="absolute inset-0 scanline-overlay pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green-dim border border-accent-green-border text-accent-green text-xs font-mono mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green status-pulse" />
            Live on Solana · Multi-provider launch
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-text-primary mb-6 text-balance">
            Turn X posts into{' '}
            <span className="text-accent-green text-glow-green">token narratives</span>
          </h1>

          <p className="text-lg text-text-secondary mb-10 text-balance leading-relaxed">
            Discover token ideas from X. Launch on pump.fun, Bags, or LetsBonk —
            all from one place. The original post is permanently linked as the token&apos;s genesis.
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="relative w-full sm:w-96">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">𝕏</span>
              <input
                type="text"
                placeholder="Paste an X post URL to import..."
                className="w-full h-12 rounded-xl bg-surface border border-border pl-8 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none input-green transition-colors"
              />
            </div>
            <button className="h-12 px-6 rounded-xl bg-accent-green hover:bg-accent-green-hover text-black text-sm font-mono font-semibold transition-colors flex-shrink-0">
              Import & Launch →
            </button>
          </div>

          {/* Provider status pills */}
          <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
            {MOCK_PROVIDERS.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-sm text-text-secondary font-mono">
                <ProviderStatusDot status={p.health.status} />
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
        {[
          { label: 'Narratives detected', value: formatNumber(MOCK_NARRATIVES.length) },
          { label: 'X post impressions', value: formatNumber(totalViews) },
          { label: 'Tokens launched', value: formatNumber(recentlyLaunched.length) },
        ].map((stat, i) => (
          <div key={stat.label} className={`text-center p-4 rounded-xl bg-surface border border-border animate-fade-up stagger-${i + 1}`}>
            <div className="font-mono text-2xl font-bold text-accent-green tabular-nums">{stat.value}</div>
            <div className="text-xs text-text-muted mt-1 font-mono">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Live Feed CTA */}
      <section className="mb-10">
        <Link
          href="/feed"
          className="block p-5 rounded-xl bg-surface border border-border card-hover card-hover-green group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="live-dot" />
              <div>
                <p className="text-sm font-mono font-semibold text-text-primary group-hover:text-accent-green transition-colors">
                  Live X Feed
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  Monitor specific X accounts and launch tokens directly from their posts
                </p>
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-text-muted group-hover:text-accent-green transition-colors shrink-0">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Link>
      </section>

      {/* Trending narratives */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Trending Narratives</h2>
            <p className="text-sm text-text-secondary mt-0.5">
              Qualified X posts ready to launch
            </p>
          </div>
          <Link
            href="/explore"
            className="text-sm font-mono text-accent-green hover:underline"
          >
            View all →
          </Link>
        </div>
        <NarrativeFeed narratives={trendingNarratives} />
      </section>

      {/* Recently launched */}
      {recentlyLaunched.length > 0 && (
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-text-primary">Recently Launched</h2>
            <p className="text-sm text-text-secondary mt-0.5">Tokens that went live</p>
          </div>
          <NarrativeFeed narratives={recentlyLaunched} />
        </section>
      )}

      {/* How it works */}
      <section className="py-16 border-t border-border">
        <h2 className="text-2xl font-bold text-text-primary text-center mb-3">
          How It Works
        </h2>
        <p className="text-sm text-text-muted text-center font-mono mb-12">three steps to launch</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              step: '01',
              title: 'Detect the narrative',
              desc: 'Post on X, mention a ticker like $TOKEN. Narrative Launcher detects it automatically or you can paste the URL.',
            },
            {
              step: '02',
              title: 'Choose your provider',
              desc: 'Compare pump.fun, Bags, and LetsBonk. Pick based on fees, features, and ecosystem preference.',
            },
            {
              step: '03',
              title: 'Sign & launch',
              desc: 'Confirm your token metadata, sign one transaction in your wallet. The token is forever linked to the original X post.',
            },
          ].map((item, i) => (
            <div key={item.step} className={`p-6 rounded-xl border border-border bg-surface card-hover card-hover-green animate-fade-up stagger-${i + 1}`}>
              <div className="font-mono text-4xl font-bold text-accent-green/20 mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{item.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
