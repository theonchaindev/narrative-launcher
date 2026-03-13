'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDevWallets, exportAsBase58, exportAsArray } from '@/lib/devWallet';
import type { DevWallet } from '@/lib/devWallet';
import { shortenAddress, formatTimeAgo } from '@/lib/utils';

// ── Mock fee data ─────────────────────────────────────────────────

interface ClaimableFee {
  id: string;
  ticker: string;
  mintAddress: string;
  provider: 'bags' | 'pump';
  claimableSol: number;
  totalEarnedSol: number;
  launchedAt: string;
  volume24h: number;
}

const MOCK_FEES: ClaimableFee[] = [
  {
    id: 'f-001',
    ticker: 'BUILD',
    mintAddress: 'Bui1dXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX',
    provider: 'bags',
    claimableSol: 0.042,
    totalEarnedSol: 0.21,
    launchedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    volume24h: 84200,
  },
  {
    id: 'f-002',
    ticker: 'WARCAT',
    mintAddress: 'WaRcAtXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx',
    provider: 'bags',
    claimableSol: 0.018,
    totalEarnedSol: 0.09,
    launchedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    volume24h: 31400,
  },
  {
    id: 'f-003',
    ticker: 'AIDOG',
    mintAddress: 'AiDoGXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX',
    provider: 'bags',
    claimableSol: 0.007,
    totalEarnedSol: 0.034,
    launchedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    volume24h: 9800,
  },
];

const MOCK_LAUNCHES = [
  { ticker: 'BUILD', provider: 'bags', launchedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), status: 'live' },
  { ticker: 'WARCAT', provider: 'bags', launchedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), status: 'live' },
  { ticker: 'AIDOG', provider: 'bags', launchedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), status: 'graduated' },
];

// ── Profile page ──────────────────────────────────────────────────

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [xHandle, setXHandle] = useState<string | null>(null);
  const [xInput, setXInput] = useState('');
  const [connectingX, setConnectingX] = useState(false);
  const [claiming, setClaiming] = useState<string | 'all' | null>(null);
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const [fees, setFees] = useState<ClaimableFee[]>(MOCK_FEES);
  const [activeSection, setActiveSection] = useState<'wallets' | 'fees' | 'connected' | 'launches'>('wallets');

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('nl_x_handle');
    if (stored) setXHandle(stored);
  }, []);

  const connectX = () => {
    const handle = xInput.replace('@', '').trim();
    if (!handle) return;
    setConnectingX(true);
    setTimeout(() => {
      setXHandle(handle);
      localStorage.setItem('nl_x_handle', handle);
      setXInput('');
      setConnectingX(false);
    }, 1200);
  };

  const disconnectX = () => {
    setXHandle(null);
    localStorage.removeItem('nl_x_handle');
  };

  const claimFee = (id: string) => {
    setClaiming(id);
    setTimeout(() => {
      setClaimed((prev) => new Set([...prev, id]));
      setFees((prev) => prev.map((f) => f.id === id ? { ...f, claimableSol: 0 } : f));
      setClaiming(null);
    }, 1400);
  };

  const claimAll = () => {
    const claimable = fees.filter((f) => f.claimableSol > 0);
    if (!claimable.length) return;
    setClaiming('all');
    setTimeout(() => {
      const ids = new Set(claimable.map((f) => f.id));
      setClaimed((prev) => new Set([...prev, ...ids]));
      setFees((prev) => prev.map((f) => ({ ...f, claimableSol: 0 })));
      setClaiming(null);
    }, 1800);
  };

  const totalClaimable = fees.reduce((sum, f) => sum + f.claimableSol, 0);
  const totalEarned = MOCK_FEES.reduce((sum, f) => sum + f.totalEarnedSol, 0);

  const tabs: { key: typeof activeSection; label: string }[] = [
    { key: 'wallets', label: 'WALLETS' },
    { key: 'fees', label: 'FEES' },
    { key: 'connected', label: 'CONNECTED' },
    { key: 'launches', label: 'LAUNCHES' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">

        {/* ── Left: identity card ── */}
        <aside>
          <div className="sticky top-16 space-y-3">

            {/* Avatar + name */}
            <div className="border border-border rounded-lg bg-surface overflow-hidden">
              <div className="h-16 bg-gradient-to-br from-accent-green/10 to-transparent border-b border-border relative">
                <div className="absolute inset-0 grid-bg opacity-20" />
              </div>
              <div className="px-4 pb-4 -mt-6 relative">
                <div className="w-12 h-12 rounded-xl border-2 border-border bg-surface2 flex items-center justify-center mb-3 overflow-hidden">
                  <Image src="/logo.png" alt="narra" width={40} height={40} className="rounded-lg" />
                </div>
                {xHandle ? (
                  <div>
                    <p className="text-sm font-mono font-bold text-text-primary">@{xHandle}</p>
                    <p className="text-[10px] font-mono text-text-muted mt-0.5">Connected via X</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-mono font-bold text-text-primary">Anonymous</p>
                    <p className="text-[10px] font-mono text-text-muted mt-0.5">Connect X to show profile</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="border border-border rounded-lg bg-surface divide-y divide-border">
              {[
                { label: 'TOKENS LAUNCHED', value: MOCK_LAUNCHES.length },
                { label: 'TOTAL FEES EARNED', value: `${totalEarned.toFixed(4)} SOL` },
                { label: 'CLAIMABLE NOW', value: `${totalClaimable.toFixed(4)} SOL`, green: totalClaimable > 0 },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[10px] font-mono text-text-muted tracking-wider">{s.label}</span>
                  <span className={`text-xs font-mono font-bold tabular-nums ${s.green ? 'text-accent-green' : 'text-text-primary'}`}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Nav links */}
            <nav className="space-y-0.5">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveSection(t.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center gap-2 ${
                    activeSection === t.key
                      ? 'bg-accent-green-dim text-accent-green border border-accent-green-border'
                      : 'text-text-muted hover:text-text-secondary hover:bg-surface2 border border-transparent'
                  }`}
                >
                  <span className="opacity-40">{activeSection === t.key ? '›' : '·'}</span>
                  {t.label}
                </button>
              ))}
            </nav>

          </div>
        </aside>

        {/* ── Right: main content ── */}
        <main className="min-w-0 space-y-6">

          {/* WALLETS */}
          {activeSection === 'wallets' && mounted && <WalletsSection />}

          {/* FEES */}
          {activeSection === 'fees' && mounted && (
            <FeesSection
              fees={fees}
              totalClaimable={totalClaimable}
              claiming={claiming}
              claimed={claimed}
              onClaim={claimFee}
              onClaimAll={claimAll}
            />
          )}

          {/* CONNECTED ACCOUNTS */}
          {activeSection === 'connected' && (
            <ConnectedSection
              xHandle={xHandle}
              xInput={xInput}
              connectingX={connectingX}
              onXInputChange={setXInput}
              onConnectX={connectX}
              onDisconnectX={disconnectX}
            />
          )}

          {/* LAUNCHES */}
          {activeSection === 'launches' && <LaunchesSection launches={MOCK_LAUNCHES} />}

        </main>
      </div>
    </div>
  );
}

// ── Wallets section ───────────────────────────────────────────────

function WalletsSection() {
  const { wallets, activeWallet, generating, createWallet, renameWallet, deleteWallet, setActive } = useDevWallets();
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportKey, setExportKey] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'base58' | 'array'>('base58');
  const [keyRevealed, setKeyRevealed] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const startExport = async (wallet: DevWallet, fmt: 'base58' | 'array' = exportFormat) => {
    setExportingId(wallet.id);
    setKeyRevealed(false);
    setExportKey(null);
    try {
      const key = fmt === 'base58' ? await exportAsBase58(wallet) : exportAsArray(wallet);
      setExportKey(key);
    } catch {
      setExportKey('Error generating key');
    }
  };

  const handleCopy = () => {
    if (!exportKey) return;
    navigator.clipboard.writeText(exportKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const commitRename = () => {
    if (renamingId) renameWallet(renamingId, renameValue);
    setRenamingId(null);
  };

  return (
    <>
      <SectionHeader
        title="Dev Wallets"
        subtitle={`${wallets.length} wallet${wallets.length !== 1 ? 's' : ''} · stored in browser`}
        action={
          <button
            onClick={() => createWallet()}
            disabled={generating}
            className="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-accent-green hover:bg-accent-green-hover text-black text-xs font-mono font-bold transition-colors disabled:opacity-50"
          >
            {generating ? (
              <span className="animate-spin text-xs">⟳</span>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            )}
            {generating ? 'Generating...' : 'New wallet'}
          </button>
        }
      />

      <div className="border border-accent-yellow/20 bg-accent-yellow/5 rounded-lg px-4 py-2.5 mb-4">
        <p className="text-[10px] font-mono text-accent-yellow leading-relaxed">
          ⚠ KEYS STORED IN LOCALSTORAGE · DO NOT USE FOR LARGE AMOUNTS · ALWAYS BACK UP PRIVATE KEYS
        </p>
      </div>

      {wallets.length === 0 ? (
        <div className="border border-border rounded-lg bg-surface py-16 text-center">
          <p className="text-3xl mb-3">🔑</p>
          <p className="text-sm font-mono text-text-secondary">No dev wallets</p>
          <p className="text-xs text-text-muted mt-1">Create one to start launching tokens</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg bg-surface overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_140px_80px_96px] gap-0 border-b border-border bg-surface2 px-4 py-2">
            {['WALLET', 'ADDRESS', 'BALANCE', 'ACTIONS'].map((h) => (
              <span key={h} className="text-[10px] font-mono text-text-muted tracking-widest">{h}</span>
            ))}
          </div>
          {/* Rows */}
          <div className="divide-y divide-border">
            {wallets.map((wallet) => (
              <WalletTableRow
                key={wallet.id}
                wallet={wallet}
                isActive={wallet.isActive}
                isRenaming={renamingId === wallet.id}
                renameValue={renameValue}
                onRenameChange={setRenameValue}
                onStartRename={() => { setRenamingId(wallet.id); setRenameValue(wallet.name); }}
                onCommitRename={commitRename}
                onSetActive={() => setActive(wallet.id)}
                onExport={() => startExport(wallet)}
                onDelete={() => setDeleteConfirm(wallet.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Export modal */}
      {exportingId && (
        <Modal onClose={() => { setExportingId(null); setExportKey(null); setKeyRevealed(false); }}>
          <h3 className="font-semibold text-text-primary mb-1 font-mono">Export Private Key</h3>
          <p className="text-xs text-text-muted mb-4 font-mono">
            {wallets.find((w) => w.id === exportingId)?.name}
          </p>
          <div className="p-3 rounded-lg border border-accent-red/30 bg-accent-red/5 mb-4">
            <p className="text-[10px] text-accent-red font-mono leading-relaxed">
              ⚠ NEVER SHARE YOUR PRIVATE KEY · ANYONE WITH THIS KEY HAS FULL CONTROL · STORE SECURELY
            </p>
          </div>
          <div className="flex gap-2 mb-4">
            {(['base58', 'array'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => {
                  setExportFormat(fmt);
                  const wallet = wallets.find((w) => w.id === exportingId);
                  if (wallet) startExport(wallet, fmt);
                }}
                className={`flex-1 h-8 rounded-lg text-xs font-mono transition-colors ${
                  exportFormat === fmt
                    ? 'bg-accent-green-dim border border-accent-green-border text-accent-green'
                    : 'bg-surface2 border border-border text-text-muted hover:text-text-secondary'
                }`}
              >
                {fmt === 'base58' ? 'Base58 (Phantom)' : 'Array (CLI)'}
              </button>
            ))}
          </div>
          {exportKey && (
            <>
              <div className="relative mb-4">
                <div
                  className={`p-3 rounded-lg bg-surface2 border border-border font-mono text-xs break-all transition-all ${
                    keyRevealed ? 'text-text-primary select-all' : 'text-transparent blur-sm select-none'
                  }`}
                  style={{ minHeight: '60px' }}
                >
                  {exportKey}
                </div>
                {!keyRevealed && (
                  <button
                    onClick={() => setKeyRevealed(true)}
                    className="absolute inset-0 flex items-center justify-center text-xs text-text-secondary hover:text-text-primary transition-colors font-mono"
                  >
                    click to reveal
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setExportingId(null); setExportKey(null); setKeyRevealed(false); }}
                  className="flex-1 h-9 rounded-lg border border-border bg-surface2 text-xs font-mono text-text-muted hover:text-text-secondary transition-colors"
                >
                  Close
                </button>
                {keyRevealed && (
                  <button
                    onClick={handleCopy}
                    className="flex-1 h-9 rounded-lg bg-accent-green hover:bg-accent-green-hover text-black text-xs font-mono font-bold transition-colors"
                  >
                    {copied ? '✓ Copied' : 'Copy key'}
                  </button>
                )}
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(null)}>
          <h3 className="font-semibold text-text-primary mb-1 font-mono">Delete wallet?</h3>
          <p className="text-sm font-mono text-text-secondary mb-1">
            {wallets.find((w) => w.id === deleteConfirm)?.name}
          </p>
          <p className="text-xs text-accent-red mb-6">
            Cannot be undone. Export your private key first if needed.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 h-9 rounded-lg border border-border bg-surface2 text-xs font-mono text-text-muted hover:text-text-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { deleteWallet(deleteConfirm); setDeleteConfirm(null); }}
              className="flex-1 h-9 rounded-lg bg-accent-red/10 border border-accent-red/30 text-accent-red hover:bg-accent-red/20 text-xs font-mono font-bold transition-colors"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ── Wallet table row ──────────────────────────────────────────────

interface WalletTableRowProps {
  wallet: DevWallet;
  isActive: boolean;
  isRenaming: boolean;
  renameValue: string;
  onRenameChange: (v: string) => void;
  onStartRename: () => void;
  onCommitRename: () => void;
  onSetActive: () => void;
  onExport: () => void;
  onDelete: () => void;
}

function WalletTableRow({
  wallet, isActive, isRenaming, renameValue, onRenameChange,
  onStartRename, onCommitRename, onSetActive, onExport, onDelete,
}: WalletTableRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) inputRef.current?.focus();
  }, [isRenaming]);

  return (
    <div className={`grid grid-cols-[1fr_140px_80px_96px] gap-0 items-center px-4 py-3 transition-colors ${isActive ? 'bg-accent-green-dim' : 'hover:bg-surface2'}`}>
      {/* Name */}
      <div className="flex items-center gap-2 min-w-0">
        {isActive && <span className="live-dot shrink-0" />}
        {isRenaming ? (
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onBlur={onCommitRename}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') onCommitRename(); }}
            className="bg-transparent border-b border-accent-green-border text-sm font-mono text-text-primary focus:outline-none w-full"
          />
        ) : (
          <button
            onClick={onStartRename}
            title="Click to rename"
            className={`text-sm font-mono font-semibold truncate hover:text-accent-green transition-colors ${isActive ? 'text-accent-green' : 'text-text-primary'}`}
          >
            {wallet.name}
          </button>
        )}
      </div>
      {/* Address */}
      <span className="text-[10px] font-mono text-text-muted truncate pr-2">
        {shortenAddress(wallet.publicKey, 5)}
      </span>
      {/* Balance (mock) */}
      <span className="text-xs font-mono text-text-muted tabular-nums">0.00 SOL</span>
      {/* Actions */}
      <div className="flex items-center gap-1">
        {!isActive && (
          <button
            onClick={onSetActive}
            className="h-6 px-2 rounded bg-accent-green-dim border border-accent-green-border text-accent-green text-[10px] font-mono hover:bg-accent-green-border transition-colors"
          >
            Set active
          </button>
        )}
        <button
          onClick={onExport}
          className="h-6 w-6 flex items-center justify-center rounded bg-surface2 border border-border text-text-muted hover:text-text-secondary transition-colors"
          title="Export private key"
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="h-6 w-6 flex items-center justify-center rounded bg-accent-red/5 border border-accent-red/20 text-accent-red hover:bg-accent-red/10 transition-colors text-[10px]"
          title="Delete wallet"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ── Fees section ──────────────────────────────────────────────────

function FeesSection({
  fees, totalClaimable, claiming, claimed, onClaim, onClaimAll,
}: {
  fees: ClaimableFee[];
  totalClaimable: number;
  claiming: string | 'all' | null;
  claimed: Set<string>;
  onClaim: (id: string) => void;
  onClaimAll: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Claimable Fees"
          subtitle="Trading fee share from tokens launched via Bags"
        />
        <button
          onClick={onClaimAll}
          disabled={totalClaimable === 0 || claiming !== null}
          className="h-8 flex items-center gap-2 px-4 rounded-lg bg-accent-green hover:bg-accent-green-hover text-black text-xs font-mono font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {claiming === 'all' ? (
            <><span className="animate-spin inline-block">⟳</span> Claiming...</>
          ) : (
            <>Claim all · {totalClaimable.toFixed(4)} SOL</>
          )}
        </button>
      </div>

      <div className="border border-border rounded-lg bg-surface overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[80px_1fr_100px_100px_100px_80px] gap-0 border-b border-border bg-surface2 px-4 py-2">
          {['TICKER', 'MINT', 'CLAIMABLE', 'TOTAL EARNED', 'VOL 24H', ''].map((h, i) => (
            <span key={i} className="text-[10px] font-mono text-text-muted tracking-widest">{h}</span>
          ))}
        </div>
        {fees.map((fee) => {
          const isClaiming = claiming === fee.id || claiming === 'all';
          const isClaimed = fee.claimableSol === 0;
          return (
            <div key={fee.id} className="grid grid-cols-[80px_1fr_100px_100px_100px_80px] gap-0 items-center px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface2 transition-colors">
              <span className="text-xs font-mono font-bold text-accent-green">${fee.ticker}</span>
              <span className="text-[10px] font-mono text-text-muted truncate pr-2">{shortenAddress(fee.mintAddress, 5)}</span>
              <span className={`text-xs font-mono font-bold tabular-nums ${isClaimed ? 'text-text-muted' : 'text-accent-green'}`}>
                {isClaimed ? '—' : `${fee.claimableSol.toFixed(4)} SOL`}
              </span>
              <span className="text-xs font-mono text-text-muted tabular-nums">{fee.totalEarnedSol.toFixed(4)} SOL</span>
              <span className="text-xs font-mono text-text-muted tabular-nums">${fee.volume24h.toLocaleString()}</span>
              <div className="flex justify-end">
                {isClaimed ? (
                  <span className="text-[10px] font-mono text-text-muted">Claimed</span>
                ) : (
                  <button
                    onClick={() => onClaim(fee.id)}
                    disabled={isClaiming || claiming !== null}
                    className="h-6 px-2.5 rounded bg-accent-green-dim border border-accent-green-border text-accent-green text-[10px] font-mono hover:bg-accent-green-border transition-colors disabled:opacity-50"
                  >
                    {isClaiming ? '...' : 'Claim'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border border-border rounded-lg bg-surface px-4 py-3">
        <p className="text-[10px] font-mono text-text-muted leading-relaxed">
          › Fee share is available on tokens launched via Bags. 0.5% of all trading volume is claimable by the token creator. what&apos;s the narra retains 0.1%.
        </p>
      </div>
    </>
  );
}

// ── Connected accounts section ────────────────────────────────────

function ConnectedSection({
  xHandle, xInput, connectingX, onXInputChange, onConnectX, onDisconnectX,
}: {
  xHandle: string | null;
  xInput: string;
  connectingX: boolean;
  onXInputChange: (v: string) => void;
  onConnectX: () => void;
  onDisconnectX: () => void;
}) {
  return (
    <>
      <SectionHeader title="Connected Accounts" subtitle="Link external accounts to your profile" />

      {/* X account */}
      <div className="border border-border rounded-lg bg-surface">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface2 border border-border flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-text-primary">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.636L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-mono font-semibold text-text-primary">X (Twitter)</p>
              <p className="text-[11px] font-mono text-text-muted">Monitor accounts · post from profile</p>
            </div>
          </div>
          {xHandle && (
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span className="text-xs font-mono text-accent-green">@{xHandle}</span>
            </div>
          )}
        </div>
        <div className="px-5 py-4">
          {xHandle ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-text-primary font-semibold">@{xHandle}</p>
                <p className="text-[10px] font-mono text-text-muted mt-0.5">Connected · monitoring active</p>
              </div>
              <button
                onClick={onDisconnectX}
                className="h-7 px-3 rounded-lg border border-border bg-surface2 text-[11px] font-mono text-text-muted hover:text-accent-red hover:border-accent-red/30 transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-text-muted mb-3 leading-relaxed">
                Connect your X account to personalise your feed and auto-populate launch metadata.
              </p>
              <div className="flex items-stretch gap-0">
                <div className="flex items-center flex-1 bg-surface2 border border-border border-r-0 rounded-l-lg px-3 gap-2">
                  <span className="text-text-muted font-mono text-sm shrink-0">@</span>
                  <input
                    type="text"
                    value={xInput}
                    onChange={(e) => onXInputChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') onConnectX(); }}
                    placeholder="username"
                    className="flex-1 bg-transparent h-9 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none"
                  />
                </div>
                <button
                  onClick={onConnectX}
                  disabled={!xInput.trim() || connectingX}
                  className="h-9 px-4 rounded-r-lg bg-accent-green hover:bg-accent-green-hover text-black text-xs font-mono font-bold transition-colors disabled:opacity-50"
                >
                  {connectingX ? (
                    <span className="animate-spin inline-block">⟳</span>
                  ) : 'Connect'}
                </button>
              </div>
              <p className="text-[10px] font-mono text-text-muted mt-2">
                › Full OAuth coming soon. For now, saves your handle locally.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Phantom / wallet adapter (future) */}
      <div className="border border-border rounded-lg bg-surface opacity-50">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface2 border border-border flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-text-muted">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-4 0v2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-mono font-semibold text-text-primary">Wallet Adapter</p>
              <p className="text-[11px] font-mono text-text-muted">Phantom, Backpack — coming soon</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-text-muted border border-border rounded px-2 py-0.5">SOON</span>
        </div>
      </div>
    </>
  );
}

// ── Launch history section ────────────────────────────────────────

function LaunchesSection({ launches }: { launches: typeof MOCK_LAUNCHES }) {
  return (
    <>
      <SectionHeader title="Launch History" subtitle={`${launches.length} tokens launched`} />

      {launches.length === 0 ? (
        <div className="border border-border rounded-lg bg-surface py-16 text-center">
          <p className="text-sm font-mono text-text-secondary">No launches yet</p>
          <p className="text-xs text-text-muted mt-1">Launch your first token from the feed</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-mono text-accent-green hover:underline"
          >
            Go to feed →
          </Link>
        </div>
      ) : (
        <div className="border border-border rounded-lg bg-surface overflow-hidden">
          <div className="grid grid-cols-[80px_100px_100px_1fr] gap-0 border-b border-border bg-surface2 px-4 py-2">
            {['TICKER', 'PROVIDER', 'STATUS', 'LAUNCHED'].map((h) => (
              <span key={h} className="text-[10px] font-mono text-text-muted tracking-widest">{h}</span>
            ))}
          </div>
          {launches.map((l, i) => (
            <div key={i} className="grid grid-cols-[80px_100px_100px_1fr] gap-0 items-center px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface2 transition-colors">
              <span className="text-xs font-mono font-bold text-accent-green">${l.ticker}</span>
              <span className="text-xs font-mono text-text-muted">{l.provider}</span>
              <span className={`text-[10px] font-mono font-bold tracking-wider ${
                l.status === 'graduated' ? 'text-accent-green' : 'text-text-secondary'
              }`}>
                {l.status.toUpperCase()}
              </span>
              <span className="text-[11px] font-mono text-text-muted">{formatTimeAgo(l.launchedAt)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── Shared primitives ─────────────────────────────────────────────

function SectionHeader({
  title, subtitle, action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-sm font-mono font-bold text-text-primary tracking-wide">{title}</h2>
        {subtitle && <p className="text-[11px] font-mono text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface border border-border rounded-xl p-6 animate-scale-in">
        {children}
      </div>
    </div>
  );
}
