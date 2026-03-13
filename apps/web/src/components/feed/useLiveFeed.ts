'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface WatchedAccount {
  username: string;
  addedAt: string;
}

export interface FeedPost {
  id: string;
  accountUsername: string;
  text: string;
  likeCount: number;
  repostCount: number;
  viewCount: number;
  createdAt: string;
  isNew: boolean; // triggers dataIn animation
  detectedTicker: string | null;
  canonicalUrl: string;
}

const STORAGE_KEY = 'nl_watched_accounts';

// Ticker regex: $TICKER (2–10 uppercase letters/numbers)
const TICKER_RE = /\$([A-Z][A-Z0-9]{1,9})\b/;

function extractTicker(text: string): string | null {
  const m = text.toUpperCase().match(TICKER_RE);
  return m ? m[1] : null;
}

// Mock post templates per account
const POST_TEMPLATES = [
  (acct: string) => `someone ship $${randomTicker()} already, ${acct} has been talking about this for weeks`,
  (acct: string) => `$${randomTicker()} is inevitable. mark my words. — @${acct}`,
  (acct: string) => `this meme absolutely deserves a coin. $${randomTicker()} wen`,
  () => `just saw the funniest thing. $${randomTicker()} needs to exist RIGHT NOW`,
  (acct: string) => `gm. $${randomTicker()} is the play today @${acct} knows`,
  () => `launch $${randomTicker()} or i'm not showing up to the next bear market`,
  () => `$${randomTicker()} 1000x let's go 🚀`,
  (acct: string) => `someone explain to @${acct} why $${randomTicker()} hasn't launched yet`,
  () => `new meta just dropped: $${randomTicker()}`,
  () => `if $${randomTicker()} isn't a coin by end of week i'm building it myself`,
];

function randomTicker(): string {
  const tickers = ['WARPIG', 'SOLCAT', 'BONKDOG', 'MEMEWIZ', 'AIFROGE', 'REDPILL', 'MOONRAT', 'GIGABRAIN', 'COPIUM', 'HOPIUM', 'LMFAO', 'NGMI', 'WAGMI', 'DEGEN', 'CHIMP'];
  return tickers[Math.floor(Math.random() * tickers.length)];
}

function makePost(username: string, text?: string): FeedPost {
  const postText = text ?? POST_TEMPLATES[Math.floor(Math.random() * POST_TEMPLATES.length)](username);
  return {
    id: `post-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    accountUsername: username,
    text: postText,
    likeCount: Math.floor(Math.random() * 15000) + 100,
    repostCount: Math.floor(Math.random() * 4000) + 50,
    viewCount: Math.floor(Math.random() * 500000) + 10000,
    createdAt: new Date().toISOString(),
    isNew: true,
    detectedTicker: extractTicker(postText),
    canonicalUrl: `https://x.com/${username}/status/${Date.now()}`,
  };
}

// Seed some initial posts for an account
function seedPosts(username: string, count = 3): FeedPost[] {
  return Array.from({ length: count }, (_, i) => {
    const post = makePost(username);
    post.isNew = false;
    post.createdAt = new Date(Date.now() - i * 1000 * 60 * (5 + Math.random() * 30)).toISOString();
    return post;
  });
}

export function useLiveFeed() {
  const [watchedAccounts, setWatchedAccounts] = useState<WatchedAccount[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hydrate from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const accounts: WatchedAccount[] = raw ? JSON.parse(raw) : [];
      setWatchedAccounts(accounts);
      // Seed posts for all watched accounts
      const seeded = accounts.flatMap((a) => seedPosts(a.username));
      seeded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(seeded);
    } catch {
      setWatchedAccounts([]);
    }
  }, []);

  // Persist accounts
  const persistAccounts = useCallback((accounts: WatchedAccount[]) => {
    setWatchedAccounts(accounts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }, []);

  const addAccount = useCallback((username: string) => {
    const clean = username.replace(/^@/, '').trim().toLowerCase();
    if (!clean) return;
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as WatchedAccount[];
    if (existing.some((a) => a.username === clean)) return;
    const updated = [...existing, { username: clean, addedAt: new Date().toISOString() }];
    persistAccounts(updated);
    // Seed some initial posts for the new account
    const seeded = seedPosts(clean, 2);
    setPosts((prev) => [...seeded, ...prev]);
  }, [persistAccounts]);

  const removeAccount = useCallback((username: string) => {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as WatchedAccount[];
    const updated = existing.filter((a) => a.username !== username);
    persistAccounts(updated);
    setPosts((prev) => prev.filter((p) => p.accountUsername !== username));
  }, [persistAccounts]);

  // Simulate new posts arriving from watched accounts
  useEffect(() => {
    if (!mounted) return;

    intervalRef.current = setInterval(() => {
      const accounts = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as WatchedAccount[];
      if (accounts.length === 0) return;
      const randAccount = accounts[Math.floor(Math.random() * accounts.length)];
      const newPost = makePost(randAccount.username);
      setPosts((prev) => {
        // Mark all others as not-new
        const updated = prev.map((p) => ({ ...p, isNew: false }));
        return [newPost, ...updated].slice(0, 200); // cap at 200 posts
      });
    }, 15_000); // new post every 15s

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mounted]);

  // Mark a post as not-new after animation plays
  const markSeen = useCallback((postId: string) => {
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, isNew: false } : p));
  }, []);

  return {
    watchedAccounts,
    posts,
    addAccount,
    removeAccount,
    markSeen,
    mounted,
  };
}
