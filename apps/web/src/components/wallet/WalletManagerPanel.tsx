'use client';

import { useEffect, useRef, useState } from 'react';
import { useDevWallets, exportAsBase58, exportAsArray } from '@/lib/devWallet';
import type { DevWallet } from '@/lib/devWallet';
import { shortenAddress } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface WalletManagerPanelProps {
  onClose: () => void;
}

export function WalletManagerPanel({ onClose }: WalletManagerPanelProps) {
  const { wallets, activeWallet, generating, createWallet, renameWallet, deleteWallet, setActive } =
    useDevWallets();

  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportKey, setExportKey] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'base58' | 'array'>('base58');
  const [keyRevealed, setKeyRevealed] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const startExport = async (wallet: DevWallet) => {
    setExportingId(wallet.id);
    setKeyRevealed(false);
    setExportKey(null);
    setCopied(false);
    try {
      const key = exportFormat === 'base58'
        ? await exportAsBase58(wallet)
        : exportAsArray(wallet);
      setExportKey(key);
    } catch {
      setExportKey('Error generating key — try again');
    }
  };

  const handleCopy = () => {
    if (!exportKey) return;
    navigator.clipboard.writeText(exportKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startRename = (wallet: DevWallet) => {
    setRenamingId(wallet.id);
    setRenameValue(wallet.name);
  };

  const commitRename = () => {
    if (renamingId) renameWallet(renamingId, renameValue);
    setRenamingId(null);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-surface border-l border-border flex flex-col slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="font-semibold text-text-primary text-sm">Dev Wallets</h2>
            <p className="text-[11px] text-text-muted font-mono mt-0.5">
              {wallets.length} wallet{wallets.length !== 1 ? 's' : ''} · client-only
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-surface2 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Security warning */}
        <div className="mx-4 mt-4 p-3 rounded-lg border border-accent-yellow/20 bg-accent-yellow/5">
          <p className="text-[10px] text-accent-yellow font-mono leading-relaxed">
            ⚠ KEYS STORED IN LOCALSTORAGE · DO NOT USE FOR LARGE AMOUNTS · ALWAYS BACK UP PRIVATE KEYS
          </p>
        </div>

        {/* Create wallet button */}
        <div className="px-4 mt-4">
          <Button
            variant="primary"
            className="w-full"
            loading={generating}
            onClick={() => createWallet()}
          >
            {generating ? (
              'Generating keypair...'
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create new wallet
              </>
            )}
          </Button>
        </div>

        {/* Wallet list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {wallets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🔑</p>
              <p className="text-sm text-text-secondary">No dev wallets yet</p>
              <p className="text-xs text-text-muted mt-1">Create one to start launching tokens</p>
            </div>
          )}

          {wallets.map((wallet) => (
            <WalletRow
              key={wallet.id}
              wallet={wallet}
              isActive={wallet.isActive}
              isRenaming={renamingId === wallet.id}
              isConfirmingDelete={deleteConfirm === wallet.id}
              renameValue={renameValue}
              onRenameChange={setRenameValue}
              onStartRename={() => startRename(wallet)}
              onCommitRename={commitRename}
              onSetActive={() => setActive(wallet.id)}
              onExport={() => {
                setExportFormat('base58');
                startExport(wallet);
              }}
              onDelete={() => setDeleteConfirm(wallet.id)}
              onConfirmDelete={() => { deleteWallet(wallet.id); setDeleteConfirm(null); }}
              onCancelDelete={() => setDeleteConfirm(null)}
            />
          ))}
        </div>

        {/* Active wallet footer */}
        {activeWallet && (
          <div className="px-4 py-3 border-t border-border">
            <p className="text-[10px] text-text-muted font-mono mb-1">ACTIVE DEV WALLET</p>
            <div className="flex items-center gap-2">
              <span className="live-dot flex-shrink-0" />
              <span className="text-xs font-mono text-accent-green">{activeWallet.name}</span>
              <span className="text-[10px] font-mono text-text-muted ml-auto">
                {shortenAddress(activeWallet.publicKey)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Export modal */}
      {exportingId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => { setExportingId(null); setExportKey(null); }} />
          <div className="relative w-full max-w-md bg-surface border border-border rounded-2xl p-6 animate-scale-in">
            <h3 className="font-semibold text-text-primary mb-1">Export Private Key</h3>
            <p className="text-xs text-text-muted mb-4">
              {wallets.find((w) => w.id === exportingId)?.name}
            </p>

            <div className="p-3 rounded-lg border border-accent-red/30 bg-accent-red/5 mb-4">
              <p className="text-[11px] text-accent-red font-mono leading-relaxed">
                ⚠ NEVER SHARE YOUR PRIVATE KEY · ANYONE WITH THIS KEY HAS FULL CONTROL OF THIS WALLET · STORE SECURELY
              </p>
            </div>

            {/* Format selector */}
            <div className="flex gap-2 mb-4">
              {(['base58', 'array'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => {
                    setExportFormat(fmt);
                    const wallet = wallets.find((w) => w.id === exportingId);
                    if (wallet) startExport(wallet);
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
                      className="absolute inset-0 flex items-center justify-center text-xs text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Click to reveal
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => { setExportingId(null); setExportKey(null); setKeyRevealed(false); }}
                  >
                    Close
                  </Button>
                  {keyRevealed && (
                    <Button variant="primary" className="flex-1" onClick={handleCopy}>
                      {copied ? '✓ Copied!' : 'Copy key'}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </>
  );
}

// ── Wallet row sub-component ─────────────────────────────────────

interface WalletRowProps {
  wallet: DevWallet;
  isActive: boolean;
  isRenaming: boolean;
  isConfirmingDelete: boolean;
  renameValue: string;
  onRenameChange: (v: string) => void;
  onStartRename: () => void;
  onCommitRename: () => void;
  onSetActive: () => void;
  onExport: () => void;
  onDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

function WalletRow({
  wallet, isActive, isRenaming, isConfirmingDelete, renameValue, onRenameChange,
  onStartRename, onCommitRename, onSetActive, onExport, onDelete, onConfirmDelete, onCancelDelete,
}: WalletRowProps) {
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) renameInputRef.current?.focus();
  }, [isRenaming]);

  return (
    <div
      className={`p-3 rounded-xl border transition-all ${
        isActive
          ? 'border-accent-green-border bg-accent-green-dim animate-glow'
          : 'border-border bg-surface2 hover:border-border-hover'
      }`}
    >
      {/* Top row: name + active indicator */}
      <div className="flex items-center gap-2 mb-2">
        {isActive && <span className="live-dot" />}
        {isRenaming ? (
          <input
            ref={renameInputRef}
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onBlur={onCommitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommitRename();
              if (e.key === 'Escape') onCommitRename();
            }}
            className="flex-1 h-6 bg-transparent border-b border-accent-green-border text-sm text-text-primary font-semibold focus:outline-none font-mono"
          />
        ) : (
          <button
            onClick={onStartRename}
            className="flex-1 text-left text-sm font-semibold text-text-primary hover:text-accent-green transition-colors font-mono"
            title="Click to rename"
          >
            {wallet.name}
          </button>
        )}
      </div>

      {/* Address */}
      <p className="text-[10px] font-mono text-text-muted mb-3 break-all">
        {wallet.publicKey}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {!isActive && (
          <button
            onClick={onSetActive}
            className="flex-1 h-7 rounded-lg bg-accent-green-dim border border-accent-green-border text-accent-green text-[11px] font-mono hover:bg-accent-green-border transition-colors"
          >
            Set active
          </button>
        )}
        {isActive && (
          <span className="flex-1 h-7 flex items-center justify-center text-[11px] font-mono text-accent-green">
            ✓ Active
          </span>
        )}
        <button
          onClick={onExport}
          className="h-7 px-2.5 rounded-lg bg-surface border border-border text-text-muted hover:text-text-secondary text-[11px] font-mono transition-colors"
          title="Export private key"
        >
          Export
        </button>
        <button
          onClick={isConfirmingDelete ? onCancelDelete : onDelete}
          className={`h-7 px-2.5 rounded-lg text-[11px] font-mono transition-colors ${
            isConfirmingDelete
              ? 'bg-surface border border-border text-text-muted'
              : 'bg-accent-red/5 border border-accent-red/20 text-accent-red hover:bg-accent-red/10'
          }`}
          title={isConfirmingDelete ? 'Cancel' : 'Delete wallet'}
        >
          ✕
        </button>
      </div>

      {/* Inline delete confirmation */}
      {isConfirmingDelete && (
        <div className="mt-3 flex items-center justify-between pt-3 border-t border-accent-red/20">
          <p className="text-[10px] font-mono text-accent-red">
            Delete <span className="font-bold">{wallet.name}</span>? Cannot be undone.
          </p>
          <button
            onClick={onConfirmDelete}
            className="h-6 px-3 rounded bg-accent-red/10 border border-accent-red/30 text-accent-red hover:bg-accent-red/20 text-[10px] font-mono font-bold transition-colors ml-3 shrink-0"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}
