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

const PUMP_PORTAL_API = 'https://pumpportal.fun/api';
const PUMP_IPFS_API = 'https://pump.fun/api/ipfs';

export class PumpProvider implements LaunchProvider {
  readonly id: ProviderId = 'pump';
  readonly name = 'pump.fun';
  readonly isEnabled: boolean;

  constructor(
    private readonly apiKey: string,
    enabled = true,
  ) {
    this.isEnabled = enabled;
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
      estimatedLaunchTimeMs: 8_000,
      launchFeeSOL: 0.02,
      featureFlags: { devBuy: true },
    };
  }

  async healthCheck(): Promise<ProviderHealthStatus> {
    const start = Date.now();
    try {
      const res = await fetch(`${PUMP_PORTAL_API}/health`, {
        signal: AbortSignal.timeout(4_000),
      });
      const latencyMs = Date.now() - start;
      return {
        providerId: this.id,
        status: res.ok ? 'healthy' : 'degraded',
        latencyMs,
        lastCheckedAt: new Date().toISOString(),
        nextCheckAt: new Date(Date.now() + 60_000).toISOString(),
      };
    } catch (err) {
      return {
        providerId: this.id,
        status: 'unavailable',
        latencyMs: Date.now() - start,
        lastCheckedAt: new Date().toISOString(),
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        nextCheckAt: new Date(Date.now() + 60_000).toISOString(),
      };
    }
  }

  async validateLaunchRequest(request: LaunchRequest): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const caps = await this.getCapabilities();

    if (!request.token.name || request.token.name.length > caps.maxNameLength) {
      errors.push(`Name must be 1–${caps.maxNameLength} characters`);
    }
    if (!request.token.ticker || request.token.ticker.length > caps.maxTickerLength) {
      errors.push(`Ticker must be 1–${caps.maxTickerLength} characters`);
    }
    if (request.token.description && request.token.description.length > caps.maxDescriptionLength) {
      errors.push(`Description must be ≤${caps.maxDescriptionLength} characters`);
    }
    if (request.devBuy?.enabled && (request.devBuy.amountSOL < 0 || request.devBuy.amountSOL > 85)) {
      errors.push('Dev buy amount must be between 0 and 85 SOL');
    }

    if (!request.token.imageUrl) {
      warnings.push('No image provided — a default image will be used');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  async uploadMetadata(request: LaunchRequest): Promise<MetadataUploadResult> {
    const formData = new FormData();

    // Fetch the image from our CDN and re-upload to PumpPortal IPFS
    const imageRes = await fetch(request.token.imageUrl);
    const imageBlob = await imageRes.blob();
    formData.append('file', imageBlob, 'token.png');
    formData.append('name', request.token.name);
    formData.append('symbol', request.token.ticker);
    formData.append('description', request.token.description ?? '');
    formData.append('twitter', request.token.twitterUrl ?? '');
    formData.append('telegram', request.token.telegramUrl ?? '');
    formData.append('website', request.token.websiteUrl ?? '');
    formData.append('showName', 'true');

    const res = await fetch(PUMP_IPFS_API, { method: 'POST', body: formData });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`PumpPortal IPFS upload failed: ${res.status} — ${text}`);
    }

    const json = await res.json() as { metadataUri: string };
    return {
      metadataUri: json.metadataUri,
      providerRef: json.metadataUri,
      uploadedAt: new Date(),
    };
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
        devBuy: request.devBuy ?? { enabled: false, amountSOL: 0, slippageBps: 500 },
        apiKey: this.apiKey,
      },
    };
  }

  async createLaunchTransaction(payload: LaunchPayload): Promise<LaunchTransaction> {
    const devBuy = payload.providerSpecific.devBuy as { enabled: boolean; amountSOL: number; slippageBps: number };

    const body = {
      action: 'create',
      tokenMetadata: {
        name: payload.name,
        symbol: payload.symbol,
        uri: payload.metadataUri,
      },
      // In production: generate ephemeral mint keypair server-side and pass secret key
      // For scaffold: placeholder
      mint: 'GENERATE_MINT_KEYPAIR_HERE',
      denominatedInSol: 'true',
      amount: devBuy?.enabled ? devBuy.amountSOL : 0,
      slippage: devBuy?.slippageBps ?? 500,
      priorityFee: 0.0001,
      pool: 'pump',
    };

    const res = await fetch(`${PUMP_PORTAL_API}/trade-local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': this.apiKey },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`PumpPortal trade-local failed: ${res.status}`);
    }

    const txBase64 = Buffer.from(await res.arrayBuffer()).toString('base64');

    return {
      serializedTransaction: txBase64,
      signers: [payload.launcherWalletAddress],
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      metadata: { mintAddress: 'PROVISIONAL_MINT_ADDRESS' },
    };
  }

  async submitLaunch(signedTx: string, _payload: LaunchPayload): Promise<LaunchSubmitResponse> {
    // Submit signed transaction to Solana RPC
    // In production: use Helius RPC sendTransaction
    const res = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'sendTransaction',
        params: [signedTx, { encoding: 'base64', preflightCommitment: 'confirmed' }],
      }),
    });

    const data = await res.json() as { result?: string; error?: { message: string } };
    if (data.error) throw new Error(`RPC error: ${data.error.message}`);

    return {
      txSignature: data.result!,
      submittedAt: new Date(),
    };
  }

  async pollLaunchStatus(submitResponse: LaunchSubmitResponse): Promise<LaunchResult> {
    const MAX_ATTEMPTS = 30;
    const INTERVAL_MS = 3_000;

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      await new Promise((r) => setTimeout(r, INTERVAL_MS));

      const res = await fetch('https://api.mainnet-beta.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignatureStatuses',
          params: [[submitResponse.txSignature], { searchTransactionHistory: true }],
        }),
      });

      const data = await res.json() as { result?: { value?: Array<{ confirmationStatus?: string; err?: unknown } | null> } };
      const status = data.result?.value?.[0];

      if (!status) continue;
      if (status.err) {
        return this.normalizeLaunchResult({ status: 'failed', error: status.err, txSignature: submitResponse.txSignature });
      }
      if (status.confirmationStatus === 'confirmed' || status.confirmationStatus === 'finalized') {
        return this.normalizeLaunchResult({ status: 'confirmed', txSignature: submitResponse.txSignature });
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
        ? `https://pump.fun/coin/${raw.mintAddress as string}`
        : undefined,
      launchedAt: raw.status === 'confirmed' ? new Date().toISOString() : undefined,
      failureReason: raw.error ? JSON.stringify(raw.error) : undefined,
    };
  }

  async getLaunchQuote(request: LaunchRequest): Promise<LaunchQuote> {
    const devBuyCost = request.devBuy?.enabled ? request.devBuy.amountSOL : 0;
    return {
      providerId: this.id,
      estimatedFeeSOL: 0.02,
      platformFeeSOL: 0.005,
      totalCostSOL: 0.025 + devBuyCost,
      estimatedLaunchTimeMs: 8_000,
      warnings: devBuyCost > 10 ? ['Large dev buy may attract sniper attention'] : [],
      expiresAt: new Date(Date.now() + 120_000).toISOString(),
    };
  }
}
