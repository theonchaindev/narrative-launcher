'use client';

import Link from 'next/link';
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
    { href: '/', label: 'Feed' },
    { href: '/feed', label: 'Live Feed', live: true },
    { href: '/explore', label: 'Explore' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 h-14 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-accent-green flex items-center justify-center text-black font-bold text-[10px] font-mono tracking-tight">
              NL
            </div>
            <span className="font-semibold text-text-primary text-sm hidden sm:block tracking-tight">
              Narrative<span className="text-accent-green">.</span>Launch
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

          {/* Dev wallet button */}
          <div className="flex items-center">
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
