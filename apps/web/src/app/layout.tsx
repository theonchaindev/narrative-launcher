import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/ui/Nav';

export const metadata: Metadata = {
  title: 'Narrative Launcher — Turn X Posts Into Token Launches',
  description:
    'Launch tokens from X posts across pump.fun, Bags, and LetsBonk. Multi-provider token launch orchestration for the Solana ecosystem.',
  keywords: ['solana', 'token launch', 'pump.fun', 'bags', 'bonk', 'letsbonk', 'memecoin'],
  openGraph: {
    title: 'Narrative Launcher',
    description: 'Turn X posts into token launches on Solana',
    type: 'website',
    url: 'https://narrativelauncher.xyz',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Narrative Launcher',
    description: 'Turn X posts into token launches on Solana',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-text-primary antialiased">
        <Nav />
        <main className="pt-12">{children}</main>
        <footer className="border-t border-border mt-24 py-6">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <p className="text-[10px] font-mono text-text-muted tracking-wider">
              NARRATIVE_LAUNCHER · SOLANA
            </p>
            <div className="flex items-center gap-5">
              <a
                href="https://x.com/NarrativeLaunch"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-text-muted hover:text-text-secondary transition-colors tracking-wider"
              >
                X
              </a>
              <a href="/docs" className="text-[10px] font-mono text-text-muted hover:text-text-secondary transition-colors tracking-wider">
                DOCS
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
