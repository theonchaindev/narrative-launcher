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
      <section className="text-center py-16 sm:py-24 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-purple status-pulse" />
          Live on Solana · Multi-provider launch
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-text-primary mb-6 text-balance">
          Turn X posts into{' '}
          <span className="text-accent-purple">token narratives</span>
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
              className="w-full h-12 rounded-xl bg-surface border border-border pl-8 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple transition-colors"
            />
          </div>
          <button className="h-12 px-6 rounded-xl bg-accent-purple hover:bg-accent-purple-hover text-white text-sm font-semibold transition-colors flex-shrink-0">
            Import & Launch →
          </button>
        </div>

        {/* Provider status pills */}
        <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
          {MOCK_PROVIDERS.map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-sm text-text-secondary">
              <ProviderStatusDot status={p.health.status} />
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="grid grid-cols-3 sm:grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
        {[
          { label: 'Narratives detected', value: formatNumber(MOCK_NARRATIVES.length) },
          { label: 'X post impressions tracked', value: formatNumber(totalViews) },
          { label: 'Tokens launched', value: formatNumber(recentlyLaunched.length) },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-4 rounded-xl bg-surface border border-border">
            <div className="font-mono text-2xl font-bold text-text-primary">{stat.value}</div>
            <div className="text-xs text-text-muted mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Trending narratives */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary">🔥 Trending Narratives</h2>
            <p className="text-sm text-text-secondary mt-0.5">
              Qualified X posts ready to launch
            </p>
          </div>
          <Link
            href="/explore"
            className="text-sm text-accent-purple hover:underline"
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
            <h2 className="text-xl font-bold text-text-primary">🚀 Recently Launched</h2>
            <p className="text-sm text-text-secondary mt-0.5">Tokens that went live</p>
          </div>
          <NarrativeFeed narratives={recentlyLaunched} />
        </section>
      )}

      {/* How it works */}
      <section className="py-16 border-t border-border">
        <h2 className="text-2xl font-bold text-text-primary text-center mb-12">
          How It Works
        </h2>
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
          ].map((item) => (
            <div key={item.step} className="p-6 rounded-xl border border-border bg-surface">
              <div className="font-mono text-4xl font-bold text-accent-purple/30 mb-4">
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
