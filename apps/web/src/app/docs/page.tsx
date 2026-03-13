import Link from 'next/link';

const sections = [
  {
    id: 'overview',
    title: 'Overview',
    content: [
      {
        type: 'text',
        value: 'Narrative Launcher turns X posts into launchable token narratives on Solana. When a ticker like $TOKEN gets mentioned in a post with strong engagement, it becomes a candidate for launch. You can monitor accounts in real time, configure token metadata, pick a launch provider, and sign a single transaction.',
      },
      {
        type: 'kv',
        rows: [
          { k: 'Chain', v: 'Solana (mainnet-beta)' },
          { k: 'Providers', v: 'pump.fun, Bags' },
          { k: 'Wallet storage', v: 'localStorage (client-only, no server)' },
          { k: 'Ticker detection', v: '$[A-Z][A-Z0-9]{1,9} regex on post text' },
        ],
      },
    ],
  },
  {
    id: 'quickstart',
    title: 'Quick start',
    content: [
      {
        type: 'steps',
        rows: [
          { n: '01', title: 'Import a post', desc: 'Paste an x.com post URL into the import bar on the home page. The post text is scanned for a $TICKER pattern and a narrative is created.' },
          { n: '02', title: 'Or use the Live Feed', desc: 'Go to /feed, add X accounts to your watchlist. Posts appear in real time. Click Launch $TICKER on any post to open the launch flow.' },
          { n: '03', title: 'Create a dev wallet', desc: 'Click Dev Wallet in the nav. Create a keypair — it stays in your browser. Set one as active; it will be used for dev buys and fee collection.' },
          { n: '04', title: 'Configure & launch', desc: 'Pick a provider, set token name, ticker, description, and upload a PFP. Configure dev buy and fee strategy if using pump.fun. Review the summary, then sign.' },
        ],
      },
    ],
  },
  {
    id: 'providers',
    title: 'Providers',
    content: [
      {
        type: 'table',
        headers: ['Provider', 'Launch fee', 'Dev buy', 'Fee share', 'Notes'],
        rows: [
          ['pump.fun', '~0.02 SOL', 'Yes', 'No', 'Largest Solana launchpad. Instant bonding curve.'],
          ['Bags', '~0.03 SOL', 'No', 'Yes (0.5%)', 'Creator earns 0.5% of all trading fees on-chain.'],
        ],
      },
      {
        type: 'note',
        value: 'Provider health status is shown in the nav and on the provider selection step. Degraded or unavailable providers are greyed out.',
      },
    ],
  },
  {
    id: 'token-config',
    title: 'Token configuration',
    content: [
      {
        type: 'kv',
        rows: [
          { k: 'Name', v: 'Up to 32 chars (pump.fun) / 64 chars (Bags)' },
          { k: 'Ticker', v: 'Uppercase letters and numbers, max 10 chars. Auto-detected from post; editable.' },
          { k: 'Description', v: 'Up to 500 chars (pump.fun) / 1000 chars (Bags)' },
          { k: 'Image (PFP)', v: 'PNG, JPG, GIF, WEBP. Max 5MB (pump) / 10MB (Bags). Square recommended.' },
          { k: 'Website / Twitter / Telegram', v: 'Optional social links added to token metadata.' },
        ],
      },
    ],
  },
  {
    id: 'dev-buy',
    title: 'Dev buy',
    content: [
      {
        type: 'text',
        value: 'pump.fun supports a dev buy: buying tokens from the bonding curve at launch time using the developer wallet. This gives the dev wallet an initial position and signals confidence. The amount (0.1–85 SOL) is included in the launch transaction.',
      },
      {
        type: 'note',
        value: 'Dev buy requires an active dev wallet to be set. The wallet must hold enough SOL to cover the dev buy plus the launch fee.',
      },
    ],
  },
  {
    id: 'fee-strategy',
    title: 'Dev fee strategy',
    content: [
      {
        type: 'text',
        value: 'When using pump.fun, you can choose what happens to dev fees collected by the token.',
      },
      {
        type: 'kv',
        rows: [
          { k: 'Hold in wallet', v: 'Default. Fees accumulate directly in the active dev wallet.' },
          { k: 'Auto-LP (Raydium)', v: 'When the token graduates from the bonding curve, dev fees are deposited into a Raydium liquidity pool. Deepens the market automatically. LP API integration coming soon.' },
        ],
      },
    ],
  },
  {
    id: 'dev-wallet',
    title: 'Dev wallet',
    content: [
      {
        type: 'text',
        value: 'Dev wallets are Solana keypairs generated in the browser and stored in localStorage. They are never sent to a server. You can create as many as you want and switch the active one at any time.',
      },
      {
        type: 'kv',
        rows: [
          { k: 'Create', v: 'Click Dev Wallet in nav → Create new wallet. A keypair is generated client-side using @solana/web3.js.' },
          { k: 'Rename', v: 'Click the wallet name in the panel to edit it inline.' },
          { k: 'Export', v: 'Two formats: base58 (Phantom-importable) or JSON array (Solana CLI). Key is hidden by default — click reveal.' },
          { k: 'Delete', v: 'Confirmation required. Cannot be undone — export first if needed.' },
          { k: 'Active wallet', v: 'One wallet can be active at a time. Shown in the nav bar with a green indicator.' },
        ],
      },
      {
        type: 'warn',
        value: 'localStorage is not encrypted. Do not store large amounts of SOL in dev wallets. They are intended for small launch operations only.',
      },
    ],
  },
  {
    id: 'live-feed',
    title: 'Live feed',
    content: [
      {
        type: 'text',
        value: 'The live feed (/feed) lets you monitor X accounts and see their posts in real time. Posts are scanned for $TICKER mentions. If a ticker is detected, a Launch button appears directly on the post.',
      },
      {
        type: 'kv',
        rows: [
          { k: 'Add account', v: 'Type @username in the sidebar input and press Enter.' },
          { k: 'Remove account', v: 'Hover the account row and click the × button.' },
          { k: 'Persistence', v: 'Watched accounts are saved to localStorage.' },
          { k: 'Polling', v: 'Currently simulated at 15s intervals for demo. Production will use SSE stream from the API.' },
        ],
      },
    ],
  },
  {
    id: 'narrative-score',
    title: 'Narrative score',
    content: [
      {
        type: 'text',
        value: 'Each narrative gets a score 0–100 based on engagement signals from the source post.',
      },
      {
        type: 'table',
        headers: ['Range', 'Label', 'Meaning'],
        rows: [
          ['80–100', 'HOT', 'Very high engagement. Strong narrative momentum.'],
          ['60–79', 'STRONG', 'Good engagement. Viable candidate for launch.'],
          ['40–59', 'MODERATE', 'Moderate interest. May need more traction.'],
          ['0–39', 'WEAK', 'Low engagement. Unlikely to sustain a launch.'],
        ],
      },
    ],
  },
];

type SectionContent =
  | { type: 'text'; value: string }
  | { type: 'note'; value: string }
  | { type: 'warn'; value: string }
  | { type: 'kv'; rows: { k: string; v: string }[] }
  | { type: 'steps'; rows: { n: string; title: string; desc: string }[] }
  | { type: 'table'; headers: string[]; rows: string[][] };

function renderContent(c: SectionContent, i: number) {
  if (c.type === 'text') {
    return <p key={i} className="text-sm text-text-secondary leading-relaxed">{c.value}</p>;
  }
  if (c.type === 'note') {
    return (
      <div key={i} className="flex gap-3 p-3 rounded border border-border bg-surface2">
        <span className="text-accent-green font-mono text-xs mt-0.5 shrink-0">›</span>
        <p className="text-xs text-text-secondary leading-relaxed">{c.value}</p>
      </div>
    );
  }
  if (c.type === 'warn') {
    return (
      <div key={i} className="flex gap-3 p-3 rounded border border-accent-yellow/20 bg-accent-yellow/5">
        <span className="text-accent-yellow font-mono text-xs mt-0.5 shrink-0">!</span>
        <p className="text-xs text-accent-yellow leading-relaxed">{c.value}</p>
      </div>
    );
  }
  if (c.type === 'kv') {
    return (
      <div key={i} className="border border-border rounded overflow-hidden">
        {c.rows.map((row, j) => (
          <div key={j} className={`grid grid-cols-[160px_1fr] gap-0 ${j < c.rows.length - 1 ? 'border-b border-border' : ''}`}>
            <div className="px-3 py-2 bg-surface2">
              <span className="text-[11px] font-mono text-text-muted">{row.k}</span>
            </div>
            <div className="px-3 py-2">
              <span className="text-xs text-text-secondary">{row.v}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (c.type === 'steps') {
    return (
      <div key={i} className="border border-border rounded overflow-hidden">
        {c.rows.map((row, j) => (
          <div key={j} className={`flex gap-4 px-4 py-3 ${j < c.rows.length - 1 ? 'border-b border-border' : ''} hover:bg-surface2 transition-colors`}>
            <span className="font-mono text-[11px] text-accent-green/50 font-bold w-5 shrink-0 mt-0.5">{row.n}</span>
            <div>
              <span className="font-mono text-xs font-semibold text-text-primary">{row.title}</span>
              <span className="text-xs text-text-muted ml-2">{row.desc}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (c.type === 'table') {
    return (
      <div key={i} className="border border-border rounded overflow-hidden overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-surface2">
              {c.headers.map((h) => (
                <th key={h} className="px-3 py-2 text-left font-mono text-[10px] text-text-muted tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {c.rows.map((row, j) => (
              <tr key={j} className="hover:bg-surface2 transition-colors">
                {row.map((cell, k) => (
                  <td key={k} className={`px-3 py-2 ${k === 0 ? 'font-mono text-accent-green' : 'text-text-secondary'}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return null;
}

export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex gap-8">

        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-16 pt-2">
            <p className="text-[10px] font-mono text-text-muted tracking-widest uppercase mb-3">Contents</p>
            <nav className="space-y-0.5">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block text-xs font-mono text-text-muted hover:text-accent-green transition-colors py-1 pl-2 border-l border-transparent hover:border-accent-green-border"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-10">
            <p className="text-[10px] font-mono text-text-muted tracking-widest uppercase mb-1">Documentation</p>
            <h1 className="text-2xl font-bold font-mono text-text-primary mb-3">Narrative Launcher</h1>
            <p className="text-sm text-text-secondary">
              Everything you need to launch tokens from X posts on Solana.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-12">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-16">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                  <h2 className="font-mono font-semibold text-sm text-text-primary">{section.title}</h2>
                </div>
                <div className="space-y-4">
                  {section.content.map((c, i) => renderContent(c as SectionContent, i))}
                </div>
              </section>
            ))}
          </div>

          {/* Footer links */}
          <div className="mt-16 pt-6 border-t border-border flex items-center gap-6">
            <Link href="/" className="text-xs font-mono text-text-muted hover:text-accent-green transition-colors">← Home</Link>
            <Link href="/explore" className="text-xs font-mono text-text-muted hover:text-accent-green transition-colors">Explore →</Link>
          </div>
        </main>

      </div>
    </div>
  );
}
