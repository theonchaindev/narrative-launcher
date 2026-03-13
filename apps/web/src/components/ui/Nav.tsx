'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useDevWallets } from '@/lib/devWallet';
import { shortenAddress } from '@/lib/utils';
import { WalletManagerPanel } from '@/components/wallet/WalletManagerPanel';

export function Nav() {
  const pathname = usePathname();
  const [walletPanelOpen, setWalletPanelOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { wallets, activeWallet } = useDevWallets();

  useEffect(() => { setMounted(true); }, []);

  const navLinks = [
    { href: '/', label: 'FEED' },
    { href: '/feed', label: 'LIVE', live: true },
    { href: '/explore', label: 'EXPLORE' },
    { href: '/docs', label: 'DOCS' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 h-12 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/logo.png" alt="what's the narra" width={28} height={28} className="rounded-sm" />
            <span className="font-mono text-xs text-text-muted hidden sm:block tracking-wide">
              what&apos;s the narra
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-0.5">
            {navLinks.map(({ href, label, live }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    active
                      ? 'text-accent-green bg-accent-green-dim'
                      : 'text-text-muted hover:text-text-secondary hover:bg-surface2'
                  }`}
                >
                  {live && (
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-accent-green status-pulse' : 'bg-text-muted'}`} />
                  )}
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right side: community + wallet */}
          <div className="flex items-center gap-2">
            <a
              href="https://discord.gg/narrativelauncher"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex h-8 items-center gap-1.5 px-3 rounded-lg border border-border bg-surface2 text-xs font-mono text-text-muted hover:text-text-secondary hover:border-border-hover transition-all"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.003.019.015.036.028.047a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              COMMUNITY
            </a>

            {mounted && (
              <button
                onClick={() => setWalletPanelOpen(true)}
                className={`h-8 flex items-center gap-2 px-3 rounded-lg border text-xs font-mono transition-all ${
                  activeWallet
                    ? 'border-accent-green-border bg-accent-green-dim text-accent-green hover:glow-green-sm'
                    : 'border-border bg-surface2 text-text-muted hover:text-text-secondary hover:border-border-hover'
                }`}
              >
                {activeWallet ? (
                  <>
                    <span className="live-dot" />
                    <span className="hidden sm:inline max-w-[72px] truncate">{activeWallet.name}</span>
                    <span className="text-[10px] opacity-60">{shortenAddress(activeWallet.publicKey, 3)}</span>
                  </>
                ) : (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                    <span>Dev Wallet</span>
                    {wallets.length > 0 && (
                      <span className="ml-0.5 text-[9px] bg-surface border border-border rounded px-1 text-text-muted">
                        {wallets.length}
                      </span>
                    )}
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </nav>

      {walletPanelOpen && (
        <WalletManagerPanel onClose={() => setWalletPanelOpen(false)} />
      )}
    </>
  );
}
