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

const BAGS_API_BASE = process.env.BAGS_API_BASE_URL ?? 'https://api.bags.fm';
const PLATFORM_FEE_WALLET = process.env.PLATFORM_FEE_WALLET ?? '';

interface BagsMetadataResult {
  metadataId: string;
  metadataUri: string;
}

interface BagsFeeConfigResult {
  feeConfigId: string;
}

interface BagsTxResult {
  serializedTransaction: string;
}

interface BagsStatusResult {
  status: string;
  mintAddress?: string;
  error?: string;
}

export class BagsProvider implements LaunchProvider {
  readonly id: ProviderId = 'bags';
  readonly name = 'Bags';
  readonly isEnabled: boolean;

  constructor(
    private readonly apiKey: string,
    enabled = true,
  ) {
    this.isEnabled = enabled;
  }

  private get headers() {
    return { 'Content-Type': 'application/json', 'x-api-key': this.apiKey };
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${BAGS_API_BASE}${path}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Bags API ${path} failed: ${res.status} — ${text}`);
    }
    return res.json() as Promise<T>;
  }

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${BAGS_API_BASE}${path}`, { headers: this.headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Bags API GET ${path} failed: ${res.status} — ${text}`);
    }
    return res.json() as Promise<T>;
  }

  async getCapabilities(): Promise<ProviderCapability> {
    return {
      supportsDevBuy: false,
      supportsFeeShare: true,
      supportsCustomMetadata: true,
      supportsBanner: true,
      supportsWebsite: true,
      supportsTelegram: true,
      supportsTwitterLink: true,
      maxNameLength: 64,
      maxTickerLength: 12,
      maxDescriptionLength: 1000,
      maxImageSizeBytes: 10 * 1024 * 1024,
      allowedImageMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
      estimatedLaunchTimeMs: 10_000,
      launchFeeSOL: 0.03,
      featureFlags: { feeShare: true, banner: true },
    };
  }

  async healthCheck(): Promise<ProviderHealthStatus> {
    const start = Date.now();
    try {
      const res = await fetch(`${BAGS_API_BASE}/health`, {
        headers: this.headers,
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
    if (!request.token.imageUrl) {
      errors.push('Image is required for Bags launches');
    }
    if (!PLATFORM_FEE_WALLET) {
      warnings.push('Platform fee wallet not configured — fee share will be creator-only');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  async uploadMetadata(request: LaunchRequest): Promise<MetadataUploadResult> {
    // Step 1: Create metadata record in Bags
    const metaResult = await this.post<BagsMetadataResult>('/tokens/metadata', {
      name: request.token.name,
      ticker: request.token.ticker,
      description: request.token.description ?? '',
      imageUrl: request.token.imageUrl,
      bannerUrl: request.token.bannerUrl,
      website: request.token.websiteUrl,
      twitter: request.token.twitterUrl,
      telegram: request.token.telegramUrl,
      narrativeSource: request.token.xPostUrl,
    });

    return {
      metadataUri: metaResult.metadataUri,
      providerRef: metaResult.metadataId,
      uploadedAt: new Date(),
    };
  }

  async buildLaunchPayload(
    request: LaunchRequest,
    metadata: MetadataUploadResult,
  ): Promise<LaunchPayload> {
    // Step 2: Create fee share config
    let feeConfigId: string | undefined;
    try {
      const feeConfig = await this.post<BagsFeeConfigResult>('/tokens/fee-config', {
        metadataId: metadata.providerRef,
        creatorFeeBps: 50,  // 0.5% creator fee
        feeClaimerAddress: request.launcherWalletAddress,
        partnerFeeBps: PLATFORM_FEE_WALLET ? 10 : 0,
        partnerClaimerAddress: PLATFORM_FEE_WALLET || undefined,
      });
      feeConfigId = feeConfig.feeConfigId;
    } catch {
      // Fee config creation is non-blocking — warn but continue
      console.warn('[BagsProvider] Fee config creation failed — proceeding without fee share');
    }

    return {
      providerId: this.id,
      name: request.token.name,
      symbol: request.token.ticker,
      metadataUri: metadata.metadataUri,
      launcherWalletAddress: request.launcherWalletAddress,
      providerSpecific: {
        metadataId: metadata.providerRef,
        feeConfigId,
      },
    };
  }

  async createLaunchTransaction(payload: LaunchPayload): Promise<LaunchTransaction> {
    const txResult = await this.post<BagsTxResult>('/tokens/create-transaction', {
      metadataId: payload.providerSpecific.metadataId,
      feeConfigId: payload.providerSpecific.feeConfigId,
      creatorWallet: payload.launcherWalletAddress,
      initialLiquiditySOL: (payload.providerSpecific.initialLiquiditySOL as number | undefined) ?? 0,
    });

    return {
      serializedTransaction: txResult.serializedTransaction,
      signers: [payload.launcherWalletAddress],
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      metadata: { metadataId: payload.providerSpecific.metadataId },
    };
  }

  async submitLaunch(signedTx: string, payload: LaunchPayload): Promise<LaunchSubmitResponse> {
    const result = await this.post<{ txSignature: string; jobId?: string }>('/tokens/broadcast', {
      signedTransaction: signedTx,
      metadataId: payload.providerSpecific.metadataId,
    });

    return {
      txSignature: result.txSignature,
      providerJobId: result.jobId,
      submittedAt: new Date(),
    };
  }

  async pollLaunchStatus(submitResponse: LaunchSubmitResponse): Promise<LaunchResult> {
    const MAX_ATTEMPTS = 30;
    const INTERVAL_MS = 4_000;

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      await new Promise((r) => setTimeout(r, INTERVAL_MS));

      try {
        const statusResult = await this.get<BagsStatusResult>(
          `/tokens/status/${submitResponse.txSignature}`,
        );

        if (statusResult.status === 'confirmed') {
          return this.normalizeLaunchResult({ ...statusResult, txSignature: submitResponse.txSignature });
        }
        if (statusResult.status === 'failed') {
          return this.normalizeLaunchResult({ ...statusResult, txSignature: submitResponse.txSignature });
        }
      } catch {
        // Network error on poll — retry
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
        ? `https://bags.fm/token/${raw.mintAddress as string}`
        : undefined,
      launchedAt: raw.status === 'confirmed' ? new Date().toISOString() : undefined,
      failureReason: raw.error as string | undefined,
    };
  }

  async getLaunchQuote(request: LaunchRequest): Promise<LaunchQuote> {
    return {
      providerId: this.id,
      estimatedFeeSOL: 0.03,
      platformFeeSOL: 0.005,
      totalCostSOL: 0.035,
      estimatedLaunchTimeMs: 10_000,
      warnings: [],
      expiresAt: new Date(Date.now() + 120_000).toISOString(),
    };
  }
}
