'use client';

import { useState } from 'react';

const CA = 'NaRRaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

export function CopyCA() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(CA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 group"
      title="Copy contract address"
    >
      <span className="text-[10px] font-mono text-text-muted tracking-wider">CA:</span>
      <span className="text-[10px] font-mono text-text-muted group-hover:text-accent-green transition-colors tracking-wide hidden sm:inline">
        {CA.slice(0, 6)}…{CA.slice(-4)}
      </span>
      <span className={`text-[10px] font-mono transition-colors ${copied ? 'text-accent-green' : 'text-text-muted group-hover:text-accent-green'}`}>
        {copied ? '✓ copied' : (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </span>
    </button>
  );
}
