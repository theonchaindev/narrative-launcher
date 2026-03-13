'use client';

import { useState, useEffect, useCallback } from 'react';

export interface DevWallet {
  id: string;
  name: string;
  publicKey: string;
  secretKeyB64: string; // base64-encoded 64-byte Uint8Array
  createdAt: string;
  isActive: boolean;
}

const STORAGE_KEY = 'nl_dev_wallets';

// ── Persistence helpers ──────────────────────────────────────────

function loadWallets(): DevWallet[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DevWallet[]) : [];
  } catch {
    return [];
  }
}

function saveWallets(wallets: DevWallet[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets));
}

// ── Keypair generation ───────────────────────────────────────────

/** Generates a real Solana keypair using @solana/web3.js (dynamic import) */
export async function generateDevWallet(name: string): Promise<DevWallet> {
  const { Keypair } = await import('@solana/web3.js');
  const keypair = Keypair.generate();

  const secretKeyB64 = btoa(String.fromCharCode(...keypair.secretKey));

  return {
    id: crypto.randomUUID(),
    name,
    publicKey: keypair.publicKey.toBase58(),
    secretKeyB64,
    createdAt: new Date().toISOString(),
    isActive: false,
  };
}

/** Export as base58 private key (Phantom-importable) */
export async function exportAsBase58(wallet: DevWallet): Promise<string> {
  const { Keypair } = await import('@solana/web3.js');
  const { default: bs58 } = await import('bs58');
  const secretBytes = Uint8Array.from(atob(wallet.secretKeyB64), (c) => c.charCodeAt(0));
  const keypair = Keypair.fromSecretKey(secretBytes);
  return bs58.encode(keypair.secretKey);
}

/** Export as JSON byte array (Solana CLI format) */
export function exportAsArray(wallet: DevWallet): string {
  const secretBytes = Uint8Array.from(atob(wallet.secretKeyB64), (c) => c.charCodeAt(0));
  return JSON.stringify(Array.from(secretBytes));
}

// ── React hook ───────────────────────────────────────────────────

export function useDevWallets() {
  const [wallets, setWallets] = useState<DevWallet[]>([]);
  const [generating, setGenerating] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setWallets(loadWallets());
  }, []);

  const persist = useCallback((updated: DevWallet[]) => {
    setWallets(updated);
    saveWallets(updated);
  }, []);

  const createWallet = useCallback(async (name?: string) => {
    setGenerating(true);
    try {
      const existing = loadWallets();
      const walletName = name?.trim() || `Wallet ${existing.length + 1}`;
      const wallet = await generateDevWallet(walletName);

      // First wallet is automatically active
      const isFirst = existing.length === 0;
      const updated = isFirst
        ? [{ ...wallet, isActive: true }]
        : [...existing, wallet];

      persist(updated);
      return wallet;
    } finally {
      setGenerating(false);
    }
  }, [persist]);

  const renameWallet = useCallback((id: string, newName: string) => {
    const current = loadWallets();
    persist(current.map((w) => (w.id === id ? { ...w, name: newName.trim() || w.name } : w)));
  }, [persist]);

  const deleteWallet = useCallback((id: string) => {
    const current = loadWallets();
    const filtered = current.filter((w) => w.id !== id);
    // If we deleted the active wallet, make the first remaining one active
    const hasActive = filtered.some((w) => w.isActive);
    const updated =
      !hasActive && filtered.length > 0
        ? filtered.map((w, i) => ({ ...w, isActive: i === 0 }))
        : filtered;
    persist(updated);
  }, [persist]);

  const setActive = useCallback((id: string) => {
    const current = loadWallets();
    persist(current.map((w) => ({ ...w, isActive: w.id === id })));
  }, [persist]);

  const activeWallet = wallets.find((w) => w.isActive) ?? null;

  return {
    wallets,
    activeWallet,
    generating,
    createWallet,
    renameWallet,
    deleteWallet,
    setActive,
  };
}
