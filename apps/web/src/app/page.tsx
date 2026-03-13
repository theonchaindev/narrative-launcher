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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

      {/* Hero — terminal style */}
      <section className="relative mb-14">
        <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" />
        <div className="relative z-10 pt-10 pb-12">

          {/* Breadcrumb / system label */}
          <p className="text-[11px] font-mono text-text-muted mb-5 tracking-widest">
            NARRATIVE_LAUNCHER v0.1 · SOLANA · MULTI-PROVIDER
          </p>

          <h1 className="text-3xl sm:text-5xl font-bold font-mono text-text-primary mb-4 leading-tight">
            X posts →{' '}
            <span className="text-accent-green text-glow-green">token launches</span>
          </h1>

          <p className="text-sm text-text-secondary max-w-xl mb-8 leading-relaxed">
            Detect token narratives from X. Launch on pump.fun or Bags. The original post is permanently linked on-chain.
          </p>

          {/* Import input */}
          <div className="flex items-center gap-0 max-w-xl">
            <div className="flex items-center flex-1 h-10 bg-surface border border-border border-r-0 rounded-l-lg px-3 gap-2">
              <span className="text-accent-green font-mono text-xs">›</span>
              <input
                type="text"
                placeholder="paste x.com post URL..."
                className="flex-1 bg-transparent text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none"
              />
            </div>
            <button className="h-10 px-5 rounded-r-lg bg-accent-green hover:bg-accent-green-hover text-black text-xs font-mono font-bold transition-colors flex-shrink-0">
              IMPORT
            </button>
          </div>

          {/* Provider status row */}
          <div className="flex items-center gap-6 mt-6 flex-wrap">
            {MOCK_PROVIDERS.map((p) => (
              <div key={p.id} className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted">
                <ProviderStatusDot status={p.health.status} />
                <span>{p.name}</span>
                <span className="text-text-muted/50">{p.health.latencyMs}ms</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-3 gap-px bg-border mb-12 border border-border rounded-lg overflow-hidden">
        {[
          { label: 'narratives', value: MOCK_NARRATIVES.length },
          { label: 'impressions tracked', value: formatNumber(totalViews) },
          { label: 'tokens launched', value: recentlyLaunched.length },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface px-5 py-4">
            <div className="font-mono text-xl font-bold text-accent-green tabular-nums">{stat.value}</div>
            <div className="text-[10px] text-text-muted font-mono tracking-wider mt-0.5 uppercase">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Live feed CTA */}
      <section className="mb-10">
        <Link
          href="/feed"
          className="flex items-center justify-between px-4 py-3 border border-border rounded-lg hover:border-accent-green-border hover:bg-accent-green-dim group transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="live-dot" />
            <div>
              <span className="text-xs font-mono font-semibold text-text-primary group-hover:text-accent-green transition-colors">
                LIVE FEED
              </span>
              <span className="text-[10px] font-mono text-text-muted ml-3">
                Monitor X accounts · launch directly from posts
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-text-muted group-hover:text-accent-green transition-colors">→</span>
        </Link>
      </section>

      {/* Trending narratives */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-mono font-semibold text-text-secondary tracking-widest uppercase">
              Trending Narratives
            </h2>
            <span className="text-[10px] font-mono text-text-muted bg-surface2 border border-border px-2 py-0.5 rounded">
              {trendingNarratives.length}
            </span>
          </div>
          <Link href="/explore" className="text-[11px] font-mono text-accent-green hover:underline">
            explore all →
          </Link>
        </div>
        <NarrativeFeed narratives={trendingNarratives} />
      </section>

      {/* Recently launched */}
      {recentlyLaunched.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs font-mono font-semibold text-text-secondary tracking-widest uppercase">
              Recently Launched
            </h2>
            <span className="text-[10px] font-mono text-text-muted bg-surface2 border border-border px-2 py-0.5 rounded">
              {recentlyLaunched.length}
            </span>
          </div>
          <NarrativeFeed narratives={recentlyLaunched} />
        </section>
      )}

      {/* How it works — compact terminal style */}
      <section className="border-t border-border pt-12">
        <p className="text-[10px] font-mono text-text-muted tracking-widest uppercase mb-6">How it works</p>
        <div className="space-y-0 border border-border rounded-lg overflow-hidden">
          {[
            { n: '01', title: 'Detect', desc: 'Post mentions $TOKEN on X — Narrative Launcher captures it, or paste the URL yourself.' },
            { n: '02', title: 'Configure', desc: 'Pick pump.fun or Bags. Set token metadata, dev buy, fee strategy, upload PFP.' },
            { n: '03', title: 'Launch', desc: 'Sign one Solana transaction. Token goes live, forever linked to the original post.' },
          ].map((item, i) => (
            <div key={item.n} className={`flex items-start gap-6 px-5 py-4 ${i < 2 ? 'border-b border-border' : ''} hover:bg-surface2 transition-colors`}>
              <span className="font-mono text-xs text-accent-green/40 font-bold w-5 shrink-0 mt-0.5">{item.n}</span>
              <div>
                <span className="font-mono text-xs font-semibold text-text-primary">{item.title}</span>
                <span className="text-[11px] text-text-muted ml-3">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
