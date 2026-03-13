import Link from 'next/link';
import { MOCK_NARRATIVES, MOCK_PROVIDERS } from '@/lib/mock-data';
import { NarrativeFeed } from '@/components/narrative/NarrativeFeed';
import { ProviderStatusDot } from '@/components/provider/ProviderStatusDot';
import { formatNumber, formatTimeAgo } from '@/lib/utils';

export default function HomePage() {
  const trendingNarratives = MOCK_NARRATIVES.filter((n) => n.status !== 'launched').slice(0, 6);
  const recentlyLaunched = MOCK_NARRATIVES.filter((n) => n.status === 'launched');
  const totalViews = MOCK_NARRATIVES.reduce((sum, n) => sum + n.xPost.viewCount, 0);
  const activeNarratives = MOCK_NARRATIVES.filter((n) => n.status === 'active').slice(0, 4);

  return (
    <div>

      {/* ─── HERO ─── */}
      <section className="relative border-b border-border overflow-hidden">
        {/* Grid bg across full width */}
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        {/* Green glow bottom-left */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-accent-green/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-0 min-h-[400px]">

            {/* Left — headline + CTA */}
            <div className="flex flex-col justify-center py-16 lg:pr-12 lg:border-r lg:border-border">

              <div className="flex items-center gap-2 mb-6">
                <span className="live-dot" />
                <span className="text-[10px] font-mono text-text-muted tracking-widest uppercase">
                  Live on Solana Mainnet
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-mono text-text-primary leading-[1.05] mb-6 tracking-tight">
                X posts{' '}
                <span className="block text-accent-green" style={{ textShadow: '0 0 40px #00FF8840' }}>
                  → launches.
                </span>
              </h1>

              <p className="text-sm text-text-secondary max-w-sm mb-8 leading-relaxed">
                Detect token narratives from X, launch on pump.fun or Bags, permanently link the genesis post on-chain.
              </p>

              {/* Import bar */}
              <div className="flex items-stretch max-w-md mb-8">
                <div className="flex items-center flex-1 bg-surface border border-border border-r-0 rounded-l-lg px-3 gap-2 min-w-0">
                  <span className="text-accent-green font-mono text-sm shrink-0">›</span>
                  <input
                    type="text"
                    placeholder="paste x.com post URL..."
                    className="flex-1 bg-transparent h-11 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none min-w-0"
                  />
                </div>
                <button className="h-11 px-5 rounded-r-lg bg-accent-green hover:bg-accent-green-hover text-black text-xs font-mono font-black transition-colors shrink-0 tracking-wider">
                  IMPORT
                </button>
              </div>

              {/* Provider status */}
              <div className="flex items-center gap-5 flex-wrap">
                {MOCK_PROVIDERS.map((p) => (
                  <div key={p.id} className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted">
                    <ProviderStatusDot status={p.health.status} />
                    <span>{p.name}</span>
                    <span className="opacity-40">{p.health.latencyMs}ms</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — active narrative panel */}
            <div className="hidden lg:flex flex-col border-l border-border">
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="live-dot" />
                  <span className="text-[10px] font-mono text-text-muted tracking-widest uppercase">Active Narratives</span>
                </div>
                <Link href="/explore" className="text-[10px] font-mono text-accent-green hover:underline">all →</Link>
              </div>

              {/* Narrative rows */}
              <div className="flex-1 divide-y divide-border">
                {activeNarratives.map((n) => (
                  <Link key={n.id} href={`/narrative/${n.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-surface2 transition-colors group">
                    <div className="w-7 h-7 rounded bg-accent-green-dim border border-accent-green-border flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-mono font-bold text-accent-green">{n.ticker.slice(0, 2)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-accent-green">${n.ticker}</span>
                        <span className="text-[10px] font-mono text-text-muted">{formatTimeAgo(n.createdAt)}</span>
                      </div>
                      <p className="text-[10px] text-text-muted truncate mt-0.5">{n.xPost.text}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-text-primary">{n.narrativeScore}</div>
                      <div className="text-[9px] font-mono text-accent-green group-hover:opacity-100 opacity-0 transition-opacity">LAUNCH →</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Panel footer — stats */}
              <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
                {[
                  { v: MOCK_NARRATIVES.length, l: 'narratives' },
                  { v: formatNumber(totalViews), l: 'impressions' },
                  { v: recentlyLaunched.length, l: 'launched' },
                ].map((s) => (
                  <div key={s.l} className="px-4 py-3 text-center">
                    <div className="text-sm font-mono font-bold text-accent-green tabular-nums">{s.v}</div>
                    <div className="text-[9px] font-mono text-text-muted tracking-wider uppercase mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── BODY ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">

        {/* Live feed CTA */}
        <Link
          href="/feed"
          className="flex items-center justify-between px-5 py-4 border border-border rounded-lg hover:border-accent-green-border hover:bg-accent-green-dim group transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg border border-border bg-surface2 flex items-center justify-center shrink-0 group-hover:border-accent-green-border transition-colors">
              <span className="live-dot" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-text-primary group-hover:text-accent-green transition-colors tracking-wider">
                LIVE FEED
              </p>
              <p className="text-[11px] text-text-muted mt-0.5">
                Add X accounts · monitor posts in real time · launch directly
              </p>
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted group-hover:text-accent-green transition-colors shrink-0">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        {/* Trending narratives */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-text-muted tracking-widest uppercase">Trending</span>
              <span className="text-[10px] font-mono text-text-muted bg-surface2 border border-border px-2 py-0.5 rounded tabular-nums">
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
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-mono text-text-muted tracking-widest uppercase">Recently Launched</span>
              <span className="text-[10px] font-mono text-text-muted bg-surface2 border border-border px-2 py-0.5 rounded tabular-nums">
                {recentlyLaunched.length}
              </span>
            </div>
            <NarrativeFeed narratives={recentlyLaunched} />
          </section>
        )}

        {/* How it works */}
        <section className="border-t border-border pt-10">
          <p className="text-[10px] font-mono text-text-muted tracking-widest uppercase mb-6">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border border border-border rounded-lg overflow-hidden">
            {[
              {
                n: '01',
                title: 'Detect',
                desc: "A $TOKEN mention gets traction on X — what's the narra picks it up, or paste the URL yourself.",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                n: '02',
                title: 'Configure',
                desc: 'Pick pump.fun or Bags. Set name, ticker, upload PFP, configure dev buy and fee strategy.',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                n: '03',
                title: 'Launch',
                desc: 'Sign one Solana transaction. Token is live, forever linked to the genesis post on-chain.',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.n} className="bg-surface p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-accent-green/50 font-bold tracking-widest">{item.n}</span>
                  <span className="text-text-muted">{item.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-mono font-bold text-text-primary mb-2">{item.title}</p>
                  <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
