import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/ui/Nav';

export const metadata: Metadata = {
  title: "what's the narra — Turn X Posts Into Token Launches",
  description:
    'Launch tokens from X posts across pump.fun and Bags. Multi-provider token launch orchestration for the Solana ecosystem.',
  keywords: ['solana', 'token launch', 'pump.fun', 'bags', 'memecoin', 'narra'],
  openGraph: {
    title: "what's the narra",
    description: 'Turn X posts into token launches on Solana',
    type: 'website',
    url: 'https://whatsthenarra.xyz',
  },
  twitter: {
    card: 'summary_large_image',
    title: "what's the narra",
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
              WHAT&apos;S THE NARRA · SOLANA
            </p>
            <div className="flex items-center gap-5">
              <a
                href="https://x.com/whatsthenarra"
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
