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
        <main className="pt-16">{children}</main>
        <footer className="border-t border-border mt-24 py-12 text-center text-text-muted text-sm">
          <p>Narrative Launcher · Built on Solana · Multi-provider token launch</p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <a
              href="https://x.com/NarrativeLaunch"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-secondary transition-colors"
            >
              X / Twitter
            </a>
            <a href="/docs" className="hover:text-text-secondary transition-colors">
              Docs
            </a>
            <a href="/spec" className="hover:text-text-secondary transition-colors">
              Spec
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
