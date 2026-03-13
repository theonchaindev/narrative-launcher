'use client';

import { useState, useRef } from 'react';
import type { ProviderInfo, NarrativeListItem } from '@narrative-launcher/shared-types';
import { ProviderCard } from '@/components/provider/ProviderCard';
import { ProviderComparison } from '@/components/provider/ProviderComparison';
import { Button } from '@/components/ui/Button';

type LaunchStep = 'provider' | 'configure' | 'review' | 'signing' | 'confirming' | 'success';

interface LaunchModalProps {
  narrative: NarrativeListItem;
  providers: ProviderInfo[];
  onClose: () => void;
}

export function LaunchModal({ narrative, providers, onClose }: LaunchModalProps) {
  const [step, setStep] = useState<LaunchStep>('provider');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [devBuyEnabled, setDevBuyEnabled] = useState(false);
  const [devBuyAmount, setDevBuyAmount] = useState('0.5');
  const [devFeeStrategy, setDevFeeStrategy] = useState<'hold' | 'lp'>('hold');
  const [pfpPreview, setPfpPreview] = useState<string | null>(null);
  const [pfpFile, setPfpFile] = useState<File | null>(null);
  const pfpInputRef = useRef<HTMLInputElement>(null);
  const [tokenName, setTokenName] = useState(narrative.name);
  const [tokenDescription, setTokenDescription] = useState(
    `The original $${narrative.ticker} narrative. Originated from X: ${narrative.xPost.canonicalUrl}`,
  );

  const selectedProvider = providers.find((p) => p.id === selectedProviderId);

  const stepTitles: Record<LaunchStep, string> = {
    provider: 'Choose Launch Provider',
    configure: 'Configure Token',
    review: 'Review & Launch',
    signing: 'Waiting for Signature',
    confirming: 'Confirming on Chain',
    success: 'Token Launched! 🚀',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background border border-border rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-semibold text-text-primary">{stepTitles[step]}</h2>
            <p className="text-xs text-text-muted mt-0.5">
              ${narrative.ticker} · Narrative Launcher
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-surface flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Step: Provider Selection */}
          {step === 'provider' && (
            <div>
              <p className="text-sm text-text-secondary mb-6">
                Select where you want to launch <span className="font-mono font-bold text-text-primary">${narrative.ticker}</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {providers.map((p) => (
                  <ProviderCard
                    key={p.id}
                    provider={p}
                    selected={selectedProviderId === p.id}
                    onSelect={() => setSelectedProviderId(p.id)}
                  />
                ))}
              </div>

              {/* Comparison toggle */}
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="w-full text-sm text-text-secondary hover:text-text-primary transition-colors mb-4 flex items-center justify-center gap-1"
              >
                {showComparison ? '▲' : '▼'} Compare providers
              </button>

              {showComparison && (
                <div className="mb-6 p-4 rounded-xl bg-surface border border-border">
                  <ProviderComparison providers={providers} />
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                disabled={!selectedProviderId}
                onClick={() => setStep('configure')}
              >
                Continue with {selectedProvider?.name ?? 'provider'} →
              </Button>
            </div>
          )}

          {/* Step: Configure */}
          {step === 'configure' && (
            <div className="space-y-5">
              <div className="p-3 rounded-lg bg-surface border border-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-green-dim flex items-center justify-center text-accent-green text-xs font-mono font-bold">
                  {selectedProvider?.name.slice(0, 2)}
                </div>
                <span className="text-sm text-text-secondary">
                  Launching via <span className="text-text-primary font-medium">{selectedProvider?.name}</span>
                </span>
              </div>

              {/* PFP Upload */}
              <div>
                <label className="block text-xs font-mono font-medium text-text-secondary mb-2 tracking-wider uppercase">
                  Token Image (PFP)
                </label>
                <div className="flex items-center gap-4">
                  {/* Preview or placeholder */}
                  <div
                    onClick={() => pfpInputRef.current?.click()}
                    className={`w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center flex-shrink-0 cursor-pointer transition-all overflow-hidden ${
                      pfpPreview
                        ? 'border-accent-green-border'
                        : 'border-border hover:border-accent-green-border hover:bg-accent-green-dim'
                    }`}
                  >
                    {pfpPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pfpPreview} alt="Token PFP" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted mx-auto mb-1">
                          <rect x="3" y="3" width="18" height="18" rx="3" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                        <span className="text-[9px] font-mono text-text-muted">UPLOAD</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <button
                      onClick={() => pfpInputRef.current?.click()}
                      className="h-9 px-4 rounded-lg border border-border bg-surface2 text-xs font-mono text-text-secondary hover:border-accent-green-border hover:text-accent-green transition-all"
                    >
                      {pfpFile ? pfpFile.name : 'Choose image'}
                    </button>
                    <p className="text-[10px] text-text-muted font-mono mt-1.5">
                      PNG, JPG, GIF, WEBP · max {selectedProvider ? Math.round((selectedProvider.capabilities.maxImageSizeBytes ?? 5242880) / 1024 / 1024) : 5}MB
                    </p>
                    {pfpFile && (
                      <button
                        onClick={() => { setPfpFile(null); setPfpPreview(null); }}
                        className="text-[10px] font-mono text-accent-red hover:underline mt-1"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <input
                  ref={pfpInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setPfpFile(file);
                    const reader = new FileReader();
                    reader.onload = (ev) => setPfpPreview(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Token Name</label>
                <input
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  className="w-full h-10 rounded-lg bg-surface border border-border px-3 text-sm text-text-primary focus:outline-none focus:border-accent-green transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Ticker</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono">$</span>
                  <input
                    value={narrative.ticker}
                    readOnly
                    className="w-full h-10 rounded-lg bg-surface/50 border border-border pl-7 pr-3 text-sm text-text-secondary font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
                <textarea
                  value={tokenDescription}
                  onChange={(e) => setTokenDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg bg-surface border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-green transition-colors resize-none"
                />
              </div>

              {/* Dev buy (pump.fun only) */}
              {selectedProvider?.capabilities.supportsDevBuy && (
                <div className="p-4 rounded-xl border border-border bg-surface">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Dev Buy</p>
                      <p className="text-xs text-text-muted">Buy tokens at launch to support the market</p>
                    </div>
                    <button
                      onClick={() => setDevBuyEnabled(!devBuyEnabled)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${devBuyEnabled ? 'bg-accent-green' : 'bg-surface border border-border'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${devBuyEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  {devBuyEnabled && (
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={devBuyAmount}
                        onChange={(e) => setDevBuyAmount(e.target.value)}
                        step="0.1"
                        min="0.1"
                        max="85"
                        className="flex-1 h-9 rounded-lg bg-background border border-border px-3 text-sm font-mono text-text-primary focus:outline-none focus:border-accent-green"
                      />
                      <span className="text-sm text-text-secondary">SOL</span>
                    </div>
                  )}
                </div>
              )}

              {/* Dev fee strategy (pump.fun only) */}
              {selectedProvider?.capabilities.supportsDevBuy && (
                <div className="p-4 rounded-xl border border-border bg-surface">
                  <p className="text-sm font-medium text-text-primary mb-1">Dev Fee Strategy</p>
                  <p className="text-xs text-text-muted mb-3">What happens when this token collects dev fees</p>
                  <div className="space-y-2">
                    {/* Hold option */}
                    <button
                      onClick={() => setDevFeeStrategy('hold')}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all ${
                        devFeeStrategy === 'hold'
                          ? 'border-accent-green-border bg-accent-green-dim'
                          : 'border-border bg-background hover:border-border-hover'
                      }`}
                    >
                      <span className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors ${
                        devFeeStrategy === 'hold' ? 'border-accent-green bg-accent-green' : 'border-border'
                      }`} />
                      <div className="text-left">
                        <p className={`text-xs font-mono font-semibold ${devFeeStrategy === 'hold' ? 'text-accent-green' : 'text-text-primary'}`}>
                          Hold in dev wallet
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">Fees accumulate in your active dev wallet</p>
                      </div>
                    </button>
                    {/* Auto-LP option */}
                    <button
                      onClick={() => setDevFeeStrategy('lp')}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all ${
                        devFeeStrategy === 'lp'
                          ? 'border-accent-green-border bg-accent-green-dim'
                          : 'border-border bg-background hover:border-border-hover'
                      }`}
                    >
                      <span className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors ${
                        devFeeStrategy === 'lp' ? 'border-accent-green bg-accent-green' : 'border-border'
                      }`} />
                      <div className="text-left flex-1">
                        <p className={`text-xs font-mono font-semibold ${devFeeStrategy === 'lp' ? 'text-accent-green' : 'text-text-primary'}`}>
                          Auto-LP: Add to liquidity pool
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          When this token graduates, dev fees are deposited into a Raydium LP
                        </p>
                        {devFeeStrategy === 'lp' && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] font-mono text-accent-green">
                              Est. LP contribution: ~{devBuyEnabled ? (parseFloat(devBuyAmount) * 0.5).toFixed(2) : '0.25'} SOL
                            </span>
                            <span className="text-[9px] text-text-muted bg-surface2 border border-border px-1.5 py-0.5 rounded font-mono">
                              TODO: Wire LP API
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Fee share (Bags only) */}
              {selectedProvider?.capabilities.supportsFeeShare && (
                <div className="p-4 rounded-xl border border-accent-green/20 bg-accent-green/5">
                  <p className="text-sm font-medium text-accent-green mb-1">Fee Share Enabled</p>
                  <p className="text-xs text-text-secondary">
                    You will receive 0.5% of all trading fees as the token creator.
                    Narrative Launcher takes 0.1%.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep('provider')} className="flex-1">
                  ← Back
                </Button>
                <Button onClick={() => setStep('review')} className="flex-2">
                  Review launch →
                </Button>
              </div>
            </div>
          )}

          {/* Step: Review */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                {pfpPreview && (
                  <div className="flex items-center gap-3 pb-3 border-b border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pfpPreview} alt="Token PFP" className="w-10 h-10 rounded-lg object-cover border border-border" />
                    <span className="text-xs font-mono text-text-muted">{pfpFile?.name}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Token</span>
                  <span className="font-mono font-bold text-text-primary">${narrative.ticker}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Provider</span>
                  <span className="text-text-primary">{selectedProvider?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Launch fee</span>
                  <span className="font-mono text-text-primary">~{selectedProvider?.capabilities.launchFeeSOL} SOL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Platform fee</span>
                  <span className="font-mono text-text-primary">0.005 SOL</span>
                </div>
                {devBuyEnabled && selectedProvider?.capabilities.supportsDevBuy && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Dev buy</span>
                    <span className="font-mono text-text-primary">{devBuyAmount} SOL</span>
                  </div>
                )}
                {selectedProvider?.capabilities.supportsDevBuy && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Fee strategy</span>
                    <span className={`font-mono text-xs ${devFeeStrategy === 'lp' ? 'text-accent-green' : 'text-text-primary'}`}>
                      {devFeeStrategy === 'lp' ? 'Auto-LP (Raydium)' : 'Hold in wallet'}
                    </span>
                  </div>
                )}
                <div className="border-t border-border pt-3 flex justify-between text-sm font-semibold">
                  <span className="text-text-primary">Total</span>
                  <span className="font-mono text-text-primary">
                    ~{(
                      (selectedProvider?.capabilities.launchFeeSOL ?? 0) +
                      0.005 +
                      (devBuyEnabled ? parseFloat(devBuyAmount) || 0 : 0)
                    ).toFixed(3)}{' '}
                    SOL
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-accent-yellow/5 border border-accent-yellow/20 text-xs text-accent-yellow">
                ⚠ You will be asked to sign a single Solana transaction in your wallet. Review carefully before approving.
              </div>

              {narrative.xPost.canonicalUrl && (
                <div className="p-3 rounded-lg bg-surface border border-border text-xs text-text-muted">
                  Narrative source permanently linked to:{' '}
                  <a
                    href={narrative.xPost.canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-green hover:underline truncate block mt-1"
                  >
                    {narrative.xPost.canonicalUrl}
                  </a>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep('configure')} className="flex-1">
                  ← Back
                </Button>
                <Button
                  className="flex-2"
                  onClick={() => {
                    setStep('signing');
                    // Simulate signing flow
                    setTimeout(() => {
                      setStep('confirming');
                      setTimeout(() => setStep('success'), 3000);
                    }, 2000);
                  }}
                >
                  Sign & Launch 🚀
                </Button>
              </div>
            </div>
          )}

          {/* Step: Signing */}
          {step === 'signing' && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full border-2 border-accent-green border-t-transparent animate-spin mx-auto mb-6" />
              <h3 className="font-semibold text-text-primary mb-2">Waiting for Wallet</h3>
              <p className="text-sm text-text-secondary">
                Approve the transaction in your wallet to launch{' '}
                <span className="font-mono font-bold">${narrative.ticker}</span>
              </p>
            </div>
          )}

          {/* Step: Confirming */}
          {step === 'confirming' && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full border-2 border-accent-green border-t-transparent animate-spin mx-auto mb-6" />
              <h3 className="font-semibold text-text-primary mb-2">Confirming on Solana</h3>
              <p className="text-sm text-text-secondary">
                Transaction submitted. Waiting for block confirmation...
              </p>
              <p className="text-xs text-text-muted mt-2">Usually 5–15 seconds</p>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="py-8 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                ${narrative.ticker} is live!
              </h3>
              <p className="text-sm text-text-secondary mb-6">
                Your token has launched on {selectedProvider?.name}.
              </p>

              <div className="p-4 rounded-xl bg-surface border border-border text-left space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Provider</span>
                  <span className="text-text-primary">{selectedProvider?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Mint address</span>
                  <span className="font-mono text-xs text-text-primary">So11...11111 (demo)</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={onClose}>
                  Close
                </Button>
                <Button className="flex-1">View token page →</Button>
              </div>

              <button className="mt-4 text-sm text-accent-green hover:underline">
                Share on X 𝕏
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
