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

          {/* Right side: profile + community + wallet */}
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-all ${
                pathname === '/profile'
                  ? 'border-accent-green-border bg-accent-green-dim text-accent-green'
                  : 'border-border bg-surface2 text-text-muted hover:text-text-secondary hover:border-border-hover'
              }`}
              title="Profile"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" strokeLinecap="round" />
              </svg>
            </Link>
            <a
              href="https://x.com/whatsthenarra"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex h-8 items-center gap-1.5 px-3 rounded-lg border border-border bg-surface2 text-xs font-mono text-text-muted hover:text-text-secondary hover:border-border-hover transition-all"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.636L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
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
