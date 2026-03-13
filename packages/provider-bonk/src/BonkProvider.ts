/**
 * BONK / LetsBonk Provider Adapter
 *
 * Integration status: PROVISIONAL
 *
 * This adapter targets the LetsBonk launchpad which runs on Raydium LaunchLab
 * infrastructure. Two integration paths are supported:
 *
 * PATH A: LetsBonk REST API (preferred — verify at build time)
 * PATH B: Raydium SDK direct on-chain instruction building (fallback)
 *
 * The provider starts DISABLED and requires:
 * 1. BONK_PROVIDER_ENABLED=true in environment
 * 2. Successful capability verification (verifyCapability())
 * 3. Manual feature flag enable via admin API
 *
 * Do not enable in production until at least 10 successful test launches
 * have been completed and confirmed.
 */

import type { LaunchProvider } from '@narrative-launcher/provider-core';
import type {
  MetadataUploadResult,
  LaunchPayload,
  LaunchSubmitResponse,
  ValidationResult,
} from '@narrative-launcher/provider-core';
import type {
  ProviderId,
  ProviderCapability,
  ProviderHealthStatus,
  LaunchRequest,
  LaunchQuote,
  LaunchTransaction,
  LaunchResult,
} from '@narrative-launcher/shared-types';

const BONK_API_BASE = process.env.BONK_API_BASE_URL ?? 'https://api.letsbonk.io';

export class BonkProvider implements LaunchProvider {
  readonly id: ProviderId = 'bonk';
  readonly name = 'LetsBonk';

  private _capabilityVerified = false;
  private _integrationPath: 'api' | 'sdk' | 'none' = 'none';

  get isEnabled(): boolean {
    return (
      process.env.BONK_PROVIDER_ENABLED === 'true' &&
      this._capabilityVerified &&
      this._integrationPath !== 'none'
    );
  }

  /**
   * Verify that at least one integration path is available.
   * Called at worker startup and every 5 minutes by the health check cron.
   */
  async verifyCapability(): Promise<boolean> {
    // Try Path A: LetsBonk REST API
    try {
      const res = await fetch(`${BONK_API_BASE}/health`, {
        signal: AbortSignal.timeout(5_000),
      });
      if (res.ok) {
        this._capabilityVerified = true;
        this._integrationPath = 'api';
        return true;
      }
    } catch {
      // Path A unavailable — try Path B
    }

    // Try Path B: Raydium SDK
    try {
      // Dynamic import — SDK is an optional peer dependency
      const raydiumModule = await import('@raydium-io/raydium-sdk-v2').catch(() => null);
      if (raydiumModule && 'Raydium' in raydiumModule) {
        this._capabilityVerified = true;
        this._integrationPath = 'sdk';
        return true;
      }
    } catch {
      // SDK not installed
    }

    this._capabilityVerified = false;
    this._integrationPath = 'none';
    return false;
  }

  async getCapabilities(): Promise<ProviderCapability> {
    return {
      supportsDevBuy: true,
      supportsFeeShare: false,
      supportsCustomMetadata: true,
      supportsBanner: false,
      supportsWebsite: true,
      supportsTelegram: true,
      supportsTwitterLink: true,
      maxNameLength: 32,
      maxTickerLength: 10,
      maxDescriptionLength: 500,
      maxImageSizeBytes: 5 * 1024 * 1024,
      allowedImageMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
      estimatedLaunchTimeMs: 15_000,
      launchFeeSOL: 0.025,
      featureFlags: {
        raydiumLaunchLab: true,
        apiPath: this._integrationPath === 'api',
        sdkPath: this._integrationPath === 'sdk',
      },
    };
  }

  async healthCheck(): Promise<ProviderHealthStatus> {
    const start = Date.now();

    if (!process.env.BONK_PROVIDER_ENABLED) {
      return {
        providerId: this.id,
        status: 'disabled',
        latencyMs: 0,
        lastCheckedAt: new Date().toISOString(),
        degradedReason: 'BONK_PROVIDER_ENABLED is not set',
        nextCheckAt: new Date(Date.now() + 300_000).toISOString(),
      };
    }

    const capable = await this.verifyCapability();
    const latencyMs = Date.now() - start;

    if (!capable) {
      return {
        providerId: this.id,
        status: 'unavailable',
        latencyMs,
        lastCheckedAt: new Date().toISOString(),
        errorMessage: 'Neither LetsBonk API nor Raydium SDK is available',
        nextCheckAt: new Date(Date.now() + 120_000).toISOString(),
      };
    }

    return {
      providerId: this.id,
      status: 'experimental',
      latencyMs,
      lastCheckedAt: new Date().toISOString(),
      degradedReason: `Using integration path: ${this._integrationPath}`,
      nextCheckAt: new Date(Date.now() + 60_000).toISOString(),
    };
  }

  async validateLaunchRequest(request: LaunchRequest): Promise<ValidationResult> {
    if (!this.isEnabled) {
      return {
        valid: false,
        errors: ['BONK provider is currently unavailable. Please select pump.fun or Bags.'],
        warnings: [],
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    if (!request.token.name || request.token.name.length > 32) {
      errors.push('Name must be 1–32 characters');
    }
    if (!request.token.ticker || request.token.ticker.length > 10) {
      errors.push('Ticker must be 1–10 characters');
    }

    warnings.push('LetsBonk integration is experimental. Verify transaction before signing.');

    return { valid: errors.length === 0, errors, warnings };
  }

  async uploadMetadata(request: LaunchRequest): Promise<MetadataUploadResult> {
    if (this._integrationPath === 'api') {
      return this._uploadMetadataViaApi(request);
    }
    // SDK path: use a public IPFS gateway
    return this._uploadMetadataViaIpfs(request);
  }

  private async _uploadMetadataViaApi(request: LaunchRequest): Promise<MetadataUploadResult> {
    const res = await fetch(`${BONK_API_BASE}/launch/metadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.BONK_API_KEY ?? '' },
      body: JSON.stringify({
        name: request.token.name,
        symbol: request.token.ticker,
        description: request.token.description,
        imageUrl: request.token.imageUrl,
        website: request.token.websiteUrl,
        twitter: request.token.twitterUrl,
        telegram: request.token.telegramUrl,
      }),
    });

    if (!res.ok) throw new Error(`LetsBonk metadata upload failed: ${res.status}`);
    const data = await res.json() as { metadataUri: string; metadataId: string };
    return { metadataUri: data.metadataUri, providerRef: data.metadataId, uploadedAt: new Date() };
  }

  private async _uploadMetadataViaIpfs(request: LaunchRequest): Promise<MetadataUploadResult> {
    // Fallback: upload metadata JSON to a public IPFS pinning service
    const metadata = {
      name: request.token.name,
      symbol: request.token.ticker,
      description: request.token.description,
      image: request.token.imageUrl,
      external_url: request.token.websiteUrl,
      attributes: [{ trait_type: 'narrative_source', value: request.token.xPostUrl }],
    };

    const res = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NFT_STORAGE_KEY ?? ''}`,
      },
      body: JSON.stringify(metadata),
    });

    if (!res.ok) throw new Error(`IPFS upload failed: ${res.status}`);
    const data = await res.json() as { value: { cid: string } };
    const metadataUri = `https://ipfs.io/ipfs/${data.value.cid}`;
    return { metadataUri, providerRef: data.value.cid, uploadedAt: new Date() };
  }

  async buildLaunchPayload(
    request: LaunchRequest,
    metadata: MetadataUploadResult,
  ): Promise<LaunchPayload> {
    return {
      providerId: this.id,
      name: request.token.name,
      symbol: request.token.ticker,
      metadataUri: metadata.metadataUri,
      launcherWalletAddress: request.launcherWalletAddress,
      providerSpecific: {
        integrationPath: this._integrationPath,
        devBuy: request.devBuy ?? { enabled: false, amountSOL: 0, slippageBps: 500 },
        launchLabProgramId: process.env.BONK_LAUNCHLAB_PROGRAM_ID,
      },
    };
  }

  async createLaunchTransaction(payload: LaunchPayload): Promise<LaunchTransaction> {
    if (this._integrationPath === 'api') {
      return this._createTxViaApi(payload);
    }
    return this._createTxViaSdk(payload);
  }

  private async _createTxViaApi(payload: LaunchPayload): Promise<LaunchTransaction> {
    const devBuy = payload.providerSpecific.devBuy as { enabled: boolean; amountSOL: number };

    const res = await fetch(`${BONK_API_BASE}/launch/create-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.BONK_API_KEY ?? '' },
      body: JSON.stringify({
        name: payload.name,
        symbol: payload.symbol,
        metadataUri: payload.metadataUri,
        creatorWallet: payload.launcherWalletAddress,
        initialBuyAmountSOL: devBuy?.enabled ? devBuy.amountSOL : 0,
      }),
    });

    if (!res.ok) throw new Error(`LetsBonk create-transaction failed: ${res.status}`);
    const data = await res.json() as { transaction: string };
    return {
      serializedTransaction: data.transaction,
      signers: [payload.launcherWalletAddress],
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      metadata: {},
    };
  }

  private async _createTxViaSdk(_payload: LaunchPayload): Promise<LaunchTransaction> {
    // Raydium SDK path — requires @raydium-io/raydium-sdk-v2
    // Implementation verified at runtime via verifyCapability()
    // This is a placeholder — fill in with actual Raydium LaunchLab SDK calls
    throw new Error('Raydium SDK path not yet implemented — awaiting SDK integration verification');
  }

  async submitLaunch(signedTx: string, _payload: LaunchPayload): Promise<LaunchSubmitResponse> {
    if (this._integrationPath === 'api') {
      const res = await fetch(`${BONK_API_BASE}/launch/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.BONK_API_KEY ?? '' },
        body: JSON.stringify({ signedTransaction: signedTx }),
      });
      if (!res.ok) throw new Error(`LetsBonk broadcast failed: ${res.status}`);
      const data = await res.json() as { txSignature: string };
      return { txSignature: data.txSignature, submittedAt: new Date() };
    }

    // SDK path: submit directly to RPC
    const res = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1,
        method: 'sendTransaction',
        params: [signedTx, { encoding: 'base64', preflightCommitment: 'confirmed' }],
      }),
    });
    const data = await res.json() as { result?: string; error?: { message: string } };
    if (data.error) throw new Error(`RPC error: ${data.error.message}`);
    return { txSignature: data.result!, submittedAt: new Date() };
  }

  async pollLaunchStatus(submitResponse: LaunchSubmitResponse): Promise<LaunchResult> {
    const MAX_ATTEMPTS = 30;
    const INTERVAL_MS = 5_000;

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      await new Promise((r) => setTimeout(r, INTERVAL_MS));

      if (this._integrationPath === 'api') {
        try {
          const res = await fetch(`${BONK_API_BASE}/launch/status/${submitResponse.txSignature}`, {
            headers: { 'x-api-key': process.env.BONK_API_KEY ?? '' },
          });
          if (res.ok) {
            const data = await res.json() as { status: string; mintAddress?: string; poolAddress?: string };
            if (data.status === 'confirmed') {
              return this.normalizeLaunchResult({ ...data, txSignature: submitResponse.txSignature });
            }
          }
        } catch {
          // polling error — continue
        }
      } else {
        // Fallback: poll Solana RPC directly
        const res = await fetch('https://api.mainnet-beta.solana.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0', id: 1,
            method: 'getSignatureStatuses',
            params: [[submitResponse.txSignature], { searchTransactionHistory: true }],
          }),
        });
        const data = await res.json() as { result?: { value?: Array<{ confirmationStatus?: string } | null> } };
        const status = data.result?.value?.[0];
        if (status?.confirmationStatus === 'confirmed' || status?.confirmationStatus === 'finalized') {
          return this.normalizeLaunchResult({ status: 'confirmed', txSignature: submitResponse.txSignature });
        }
      }
    }

    return this.normalizeLaunchResult({ status: 'unknown', txSignature: submitResponse.txSignature });
  }

  normalizeLaunchResult(rawResponse: unknown): LaunchResult {
    const raw = rawResponse as Record<string, unknown>;
    return {
      providerId: this.id,
      status: (raw.status as 'confirmed' | 'failed' | 'unknown' | 'pending') ?? 'unknown',
      txSignature: raw.txSignature as string | undefined,
      mintAddress: raw.mintAddress as string | undefined,
      providerTokenUrl: raw.mintAddress
        ? `https://letsbonk.io/token/${raw.mintAddress as string}`
        : undefined,
      launchedAt: raw.status === 'confirmed' ? new Date().toISOString() : undefined,
      failureReason: raw.error as string | undefined,
    };
  }

  async getLaunchQuote(_request: LaunchRequest): Promise<LaunchQuote> {
    if (!this.isEnabled) {
      return {
        providerId: this.id,
        estimatedFeeSOL: 0,
        platformFeeSOL: 0,
        totalCostSOL: 0,
        estimatedLaunchTimeMs: 0,
        warnings: ['LetsBonk provider is currently unavailable'],
        expiresAt: new Date().toISOString(),
      };
    }

    return {
      providerId: this.id,
      estimatedFeeSOL: 0.025,
      platformFeeSOL: 0.005,
      totalCostSOL: 0.03,
      estimatedLaunchTimeMs: 15_000,
      warnings: ['LetsBonk integration is experimental'],
      expiresAt: new Date(Date.now() + 120_000).toISOString(),
    };
  }
}
