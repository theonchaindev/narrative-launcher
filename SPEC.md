# Narrative Launcher — Production Technical Specification

**Version:** 1.0.0
**Date:** March 2026
**Status:** Implementation-Ready

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [System Architecture](#2-system-architecture)
3. [Provider Abstraction Layer](#3-provider-abstraction-layer)
4. [Provider-Specific Integrations](#4-provider-specific-integrations)
5. [X API Integration](#5-x-api-integration)
6. [User Flows](#6-user-flows)
7. [Database Schema](#7-database-schema)
8. [Backend API Design](#8-backend-api-design)
9. [Transaction and Wallet Strategy](#9-transaction-and-wallet-strategy)
10. [Security and Abuse Prevention](#10-security-and-abuse-prevention)
11. [Analytics and Monitoring](#11-analytics-and-monitoring)
12. [Frontend UX / UI](#12-frontend-ux--ui)
13. [Monetization](#13-monetization)
14. [Scalability](#14-scalability)
15. [Repository Structure](#15-repository-structure)
16. [Development Roadmap](#16-development-roadmap)
17. [Engineering Decisions](#17-engineering-decisions)

---

## 1. Product Overview

### What It Does

Narrative Launcher converts posts on X (formerly Twitter) into launchable token narratives. When a user posts something like `"someone should launch $AIDOG"` or `"this meme deserves a coin $WARCAT"`, Narrative Launcher ingests that post, qualifies it as a token idea, and surfaces a launch UI where the originator or any wallet holder can choose to deploy that token across one of multiple Solana launchpads: **pump.fun**, **Bags**, or **BONK / LetsBonk**.

Each launched token is permanently linked to its origin X post as canonical narrative provenance. The social moment that seeded the token idea lives on-chain and on the narrative page forever.

### Target Users

| Segment | Description |
|---------|-------------|
| Memecoin creators | Want to launch tokens tied to viral moments or trending ideas |
| X power users | Generate high-engagement posts about coins; want to profit from their narrative creation |
| Speculators | Discover narratives early before they are launched |
| Launchpad arbitrageurs | Want to select the cheapest or most advantageous launch venue |
| Community builders | Want to attribute token genesis to a specific cultural moment |

### Why Multi-Provider Launching Matters

Single-launchpad platforms create provider lock-in, force users into a provider's fee structure, and fail when a provider has downtime or policy changes. Real users actively choose between pump.fun (maximum visibility, deep liquidity), Bags (fee share mechanics, builder-aligned), and BONK / LetsBonk (community-aligned, Raydium-based LP mechanics). Forcing users into one path means losing users to direct launchpad UIs.

Narrative Launcher's multi-provider model:
- Retains users regardless of which launchpad they prefer
- Creates a comparison and selection surface that becomes a competitive moat
- Allows fee capture on top of any provider
- Hedges against any single provider's downtime or deprecation

### Why X Is the Narrative Source

X is the primary social layer for crypto. Token launches are announced, hyped, debated, and discovered on X before they ever appear on-chain. The X post is the cultural artifact — it has a timestamp, an author, an engagement signal, and a social proof trail. Anchoring a token to its X post origin creates authentic provenance that purely anonymous launches cannot replicate.

### What Differentiates Narrative Launcher

| Feature | Regular Launchpad | Narrative Launcher |
|---------|------------------|--------------------|
| Launch trigger | Manual form fill | X post-triggered narrative |
| Provider choice | One fixed provider | pump.fun + Bags + BONK |
| Social provenance | None | X post permanently linked |
| Discovery | None pre-launch | Narrative feed, trending |
| Narrative scoring | None | Engagement-weighted scoring |
| Provider comparison | N/A | Fee, speed, ecosystem comparison |
| Viral loop | None | Bot replies, quote tweet mechanics |

---

## 2. System Architecture

### Component Map

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NARRATIVE LAUNCHER                              │
│                                                                        │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐ │
│  │   apps/web   │    │   apps/api   │    │      apps/worker         │ │
│  │  (Next.js)   │◄──►│  (Fastify)   │◄──►│  (BullMQ consumers)     │ │
│  └──────────────┘    └──────┬───────┘    └──────────────────────────┘ │
│                             │                                          │
│              ┌──────────────┼──────────────────┐                      │
│              │              │                  │                      │
│        ┌─────▼────┐   ┌─────▼────┐   ┌────────▼────────┐            │
│        │ PostgreSQL│   │  Redis   │   │  Provider Layer  │           │
│        │  (Prisma) │   │(BullMQ + │   │  ┌────────────┐ │           │
│        └──────────┘   │  Cache)  │   │  │ pump-adapter│ │           │
│                       └──────────┘   │  ├────────────┤ │           │
│                                      │  │ bags-adapter│ │           │
│        ┌──────────┐                  │  ├────────────┤ │           │
│        │ X API    │                  │  │ bonk-adapter│ │           │
│        │ Stream / │                  │  └────────────┘ │           │
│        │ Polling  │                  └─────────────────┘            │
│        └──────────┘                                                  │
│                                                                       │
│        ┌──────────────────┐    ┌──────────────────┐                  │
│        │  Analytics       │    │  Observability   │                  │
│        │  (PostHog/custom)│    │  (Sentry/Prom)   │                  │
│        └──────────────────┘    └──────────────────┘                  │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**apps/web (Next.js 15, App Router)**
- Narrative discovery feed
- Narrative detail + launch pages
- Provider picker and comparison UI
- Wallet connection (Solana wallet-adapter)
- Real-time launch status via SSE or WebSocket
- Admin/moderation dashboard (route-guarded)

**apps/api (Fastify + TypeScript)**
- REST API serving the frontend
- X post ingestion endpoint
- Provider capability discovery
- Launch request orchestration
- Narrative CRUD
- Queue job enqueue
- Webhook receiver for provider callbacks
- Rate limiting, auth, validation

**apps/worker (BullMQ + TypeScript)**
- X narrative detection processor
- Narrative qualification and scoring
- Metadata generation pipeline
- Launch orchestration jobs
- Provider health check scheduler
- Engagement metric refresh
- X bot reply sender
- Audit log flusher

**Queue Design (Redis + BullMQ)**

| Queue | Purpose | Concurrency |
|-------|---------|-------------|
| `x-ingest` | Process raw X events into narrative candidates | 10 |
| `qualification` | Score and qualify narratives | 5 |
| `metadata-gen` | Generate/upload token metadata | 5 |
| `launch-orchestration` | Execute multi-step launch pipeline | 3 per provider |
| `provider-health` | Periodic provider health checks | 1 |
| `engagement-refresh` | Refresh X engagement metrics | 20 |
| `x-reply` | Post bot replies to X | 2 (rate-limited) |
| `audit-flush` | Flush audit log buffer to DB | 1 |

**PostgreSQL (via Prisma)**
- Source of truth for all persistent state
- Narrative, launch, provider, user data
- Audit trail storage

**Redis**
- BullMQ job queues
- Provider health state cache
- API response cache (narrative lists, trending)
- Rate limit counters
- Distributed lock primitives
- Active launch status cache

**Provider Adapters (packages/provider-*)**
- Isolated adapter modules, one per provider
- Conform to `LaunchProvider` interface from `packages/provider-core`
- No cross-provider dependencies

**X API Integration**
- Filtered stream for real-time detection (when quota allows)
- Polling fallback on v2 search endpoint
- Mention-based reply system
- URL-based manual import via lookup endpoint

### Data Flow: X Post → Launched Token

```
X Post appears
      │
      ▼
[X Ingest Worker] ──► raw post stored in x_posts
      │
      ▼
[Qualification Worker] ──► narrative_candidates scored
      │
      ├── Score < threshold ──► candidate.status = 'rejected'
      │
      ▼ Score ≥ threshold
[Narrative Created] ──► narratives.status = 'active'
      │
      ▼
[X Reply Worker] ──► bot reply posted with launch link
      │
      ▼
[User Opens Narrative Page]
      │
      ▼
[Provider Capability Check] ──► Redis cache of provider states
      │
      ▼
[User Selects Provider + Confirms Metadata]
      │
      ▼
[Launch Request Created] ──► launch_requests record
      │
      ▼
[Launch Orchestration Worker]
      ├── validateLaunchRequest()
      ├── uploadMetadata()
      ├── buildLaunchPayload()
      ├── createLaunchTransaction() ──► unsigned tx returned to frontend
      │
      ▼
[Frontend: User Signs Transaction]
      │
      ▼
[submitLaunch()] ──► tx broadcast to provider
      │
      ▼
[pollLaunchStatus()] ──► periodic status checks
      │
      ▼
[normalizeLaunchResult()] ──► LaunchResult stored
      │
      ▼
[Narrative Token Page Live]
```

---

## 3. Provider Abstraction Layer

### Core Interface

```typescript
// packages/provider-core/src/types.ts

export type ProviderId = 'pump' | 'bags' | 'bonk';

export type ProviderStatus = 'healthy' | 'degraded' | 'unavailable' | 'disabled' | 'experimental';

export interface ProviderCapability {
  supportsDevBuy: boolean;
  supportsFeeShare: boolean;
  supportsCustomMetadata: boolean;
  supportsBanner: boolean;
  supportsWebsite: boolean;
  supportsTelegram: boolean;
  supportsTwitterLink: boolean;
  maxNameLength: number;
  maxTickerLength: number;
  maxDescriptionLength: number;
  maxImageSizeBytes: number;
  allowedImageMimeTypes: string[];
  estimatedLaunchTimeMs: number;
  launchFeeSOL: number;
  featureFlags: Record<string, boolean>;
}

export interface ProviderHealthStatus {
  providerId: ProviderId;
  status: ProviderStatus;
  latencyMs: number;
  lastCheckedAt: Date;
  errorMessage?: string;
  degradedReason?: string;
  nextCheckAt: Date;
}

export interface LaunchRequest {
  idempotencyKey: string;
  narrativeId: string;
  providerId: ProviderId;
  launcherWalletAddress: string;
  token: {
    name: string;
    ticker: string;
    description: string;
    imageUrl: string;
    bannerUrl?: string;
    websiteUrl?: string;
    telegramUrl?: string;
    twitterUrl?: string;
    xPostUrl: string;
  };
  providerConfig: Record<string, unknown>;  // provider-specific extras
  devBuy?: {
    enabled: boolean;
    amountSOL: number;
    slippageBps: number;
  };
}

export interface LaunchQuote {
  providerId: ProviderId;
  estimatedFeeSOL: number;
  platformFeeSOL: number;
  totalCostSOL: number;
  estimatedLaunchTimeMs: number;
  warnings: string[];
  expiresAt: Date;
}

export interface LaunchTransaction {
  serializedTransaction: string;  // base64 serialized VersionedTransaction
  signers: string[];              // public keys that must sign
  expiresAt: Date;
  metadata: Record<string, unknown>;
}

export interface LaunchResult {
  providerId: ProviderId;
  status: 'pending' | 'confirmed' | 'failed' | 'unknown';
  mintAddress?: string;
  txSignature?: string;
  providerTokenId?: string;
  providerTokenUrl?: string;
  launchedAt?: Date;
  failureReason?: string;
  providerRawResponse: unknown;
  normalizedAt: Date;
}

export interface ProviderError {
  providerId: ProviderId;
  code: string;
  message: string;
  retryable: boolean;
  retryAfterMs?: number;
  rawError?: unknown;
}
```

### LaunchProvider Interface

```typescript
// packages/provider-core/src/LaunchProvider.ts

export interface LaunchProvider {
  readonly id: ProviderId;
  readonly name: string;
  readonly isEnabled: boolean;

  // Returns current capabilities — may vary at runtime
  getCapabilities(): Promise<ProviderCapability>;

  // Health check — must complete in < 5s
  healthCheck(): Promise<ProviderHealthStatus>;

  // Validate request against provider constraints before any side effects
  validateLaunchRequest(request: LaunchRequest): Promise<ValidationResult>;

  // Upload token metadata to provider-specific storage (e.g. IPFS via PumpPortal, Bags CDN)
  uploadMetadata(request: LaunchRequest): Promise<MetadataUploadResult>;

  // Build provider-specific launch payload (not yet a tx)
  buildLaunchPayload(request: LaunchRequest, metadataResult: MetadataUploadResult): Promise<LaunchPayload>;

  // Generate the unsigned Solana transaction(s) for signing
  createLaunchTransaction(payload: LaunchPayload): Promise<LaunchTransaction>;

  // Submit signed transaction to provider/network
  submitLaunch(signedTx: string, payload: LaunchPayload): Promise<LaunchSubmitResponse>;

  // Poll provider for launch confirmation
  pollLaunchStatus(submitResponse: LaunchSubmitResponse): Promise<LaunchResult>;

  // Normalize any raw provider response into canonical LaunchResult
  normalizeLaunchResult(rawResponse: unknown): LaunchResult;

  // Return a quote for launching without committing
  getLaunchQuote(request: LaunchRequest): Promise<LaunchQuote>;
}
```

### Provider Registry

```typescript
// packages/provider-core/src/ProviderRegistry.ts

export class ProviderRegistry {
  private providers: Map<ProviderId, LaunchProvider> = new Map();
  private healthCache: Map<ProviderId, ProviderHealthStatus> = new Map();

  register(provider: LaunchProvider): void {
    this.providers.set(provider.id, provider);
  }

  get(id: ProviderId): LaunchProvider {
    const p = this.providers.get(id);
    if (!p) throw new Error(`Provider ${id} not registered`);
    return p;
  }

  getEnabled(): LaunchProvider[] {
    return [...this.providers.values()].filter(p => p.isEnabled);
  }

  async refreshAllHealth(): Promise<void> {
    const checks = this.getEnabled().map(async (p) => {
      try {
        const health = await Promise.race([
          p.healthCheck(),
          timeout(5000, { providerId: p.id, status: 'unavailable', latencyMs: 5000, lastCheckedAt: new Date(), nextCheckAt: new Date(Date.now() + 60_000) })
        ]);
        this.healthCache.set(p.id, health);
      } catch {
        this.healthCache.set(p.id, { providerId: p.id, status: 'unavailable', latencyMs: 9999, lastCheckedAt: new Date(), nextCheckAt: new Date(Date.now() + 60_000) });
      }
    });
    await Promise.allSettled(checks);
  }

  getHealth(id: ProviderId): ProviderHealthStatus | undefined {
    return this.healthCache.get(id);
  }

  getAllHealth(): ProviderHealthStatus[] {
    return [...this.healthCache.values()];
  }
}
```

### Provider Capability Matrix

| Capability | pump.fun | Bags | BONK/LetsBonk |
|------------|----------|------|---------------|
| Dev buy | ✅ | ❌ | TBD |
| Fee share | ❌ | ✅ | ❌ |
| Custom metadata | ✅ | ✅ | ✅ |
| Banner image | ❌ | ✅ | TBD |
| Website URL | ✅ | ✅ | TBD |
| Telegram link | ✅ | ✅ | TBD |
| Twitter link | ✅ | ✅ | TBD |
| Raydium LP | ❌ | ❌ | ✅ |
| Bonding curve | ✅ | ✅ | ✅ |
| Max ticker length | 10 | 12 | 10 |
| Max name length | 32 | 64 | 32 |

### Frontend Provider Status Display

The frontend fetches provider health from `GET /api/providers` (cached 30s in Redis). It maps `ProviderStatus` to UI state:

| Status | Badge | Behavior |
|--------|-------|----------|
| `healthy` | Green dot | Fully selectable |
| `degraded` | Yellow dot | Selectable with warning |
| `unavailable` | Red dot | Disabled, tooltip explains |
| `disabled` | Grey dot | Hidden from picker unless admin |
| `experimental` | Purple badge | Selectable with "beta" label |

---

## 4. Provider-Specific Integrations

### 4A. Pump.fun Provider (via PumpPortal)

**Integration Path:** PumpPortal developer API (`https://pumpportal.fun/api`)

**Authentication:** API key passed as `api-key` header. Store in `PUMPPORTAL_API_KEY` env var. Never expose client-side.

#### Metadata Upload Flow

PumpPortal accepts a `multipart/form-data` request to its metadata endpoint. The system must upload the token image to IPFS through PumpPortal's proxy, receive back an IPFS URI, and embed it in the launch payload.

```typescript
// packages/provider-pump/src/PumpProvider.ts

async uploadMetadata(request: LaunchRequest): Promise<MetadataUploadResult> {
  const formData = new FormData();

  // Download image from our CDN, re-upload to PumpPortal IPFS
  const imageBuffer = await fetchImageBuffer(request.token.imageUrl);
  formData.append('file', new Blob([imageBuffer], { type: 'image/png' }), 'token.png');
  formData.append('name', request.token.name);
  formData.append('symbol', request.token.ticker);
  formData.append('description', request.token.description);
  formData.append('twitter', request.token.twitterUrl ?? '');
  formData.append('telegram', request.token.telegramUrl ?? '');
  formData.append('website', request.token.websiteUrl ?? '');
  formData.append('showName', 'true');

  const res = await fetchWithRetry('https://pump.fun/api/ipfs', {
    method: 'POST',
    body: formData,
    headers: { /* no Content-Type; let browser set boundary */ },
  });

  if (!res.ok) throw new ProviderError({ code: 'METADATA_UPLOAD_FAILED', retryable: true });

  const json = await res.json();
  // Returns { metadataUri: "https://ipfs.io/ipfs/Qm..." }
  return { metadataUri: json.metadataUri, providerRef: json.metadataUri };
}
```

#### Token Creation Transaction Flow

PumpPortal's `/api/trade-local` endpoint generates a pre-built Solana transaction. The system retrieves it unsigned and returns it to the frontend for wallet signing.

```typescript
async createLaunchTransaction(payload: PumpLaunchPayload): Promise<LaunchTransaction> {
  const mint = Keypair.generate(); // ephemeral mint keypair

  const body = {
    action: 'create',
    tokenMetadata: {
      name: payload.name,
      symbol: payload.symbol,
      uri: payload.metadataUri,
    },
    mint: bs58.encode(mint.secretKey),
    denominatedInSol: 'true',
    amount: payload.devBuy?.amountSOL ?? 0,
    slippage: payload.devBuy?.slippageBps ?? 500,
    priorityFee: 0.0001,
    pool: 'pump',
  };

  const res = await fetchWithRetry('https://pumpportal.fun/api/trade-local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': PUMPPORTAL_API_KEY },
    body: JSON.stringify(body),
  });

  // Returns serialized VersionedTransaction (base64 or ArrayBuffer)
  const txBytes = await res.arrayBuffer();
  const tx = VersionedTransaction.deserialize(new Uint8Array(txBytes));

  // tx requires two signers: user wallet + mint keypair
  // We sign with mint keypair server-side (ephemeral, generated here)
  tx.sign([mint]);

  return {
    serializedTransaction: Buffer.from(tx.serialize()).toString('base64'),
    signers: [payload.launcherWalletAddress],  // user must sign
    expiresAt: new Date(Date.now() + 60_000),
    metadata: { mintAddress: mint.publicKey.toBase58() },
  };
}
```

**Important:** The mint keypair is generated per request, used to co-sign the creation transaction, then discarded. The public key (mint address) is stored as provisional until confirmed on-chain.

#### Dev Buy Configuration

```typescript
interface PumpDevBuyConfig {
  enabled: boolean;
  amountSOL: number;  // 0.001 to 85 SOL
  slippageBps: number; // recommended: 500–2000
}
```

Dev buy is bundled into the same creation transaction by PumpPortal. If `amountSOL > 0`, PumpPortal appends buy instructions to the creation transaction. This means the user pays for both the creation fee and the dev buy in a single signature.

#### WebSocket Subscription for Launch Monitoring

```typescript
// PumpPortal real-time event subscription
const ws = new WebSocket('wss://pumpportal.fun/api/data');

ws.onopen = () => {
  // Subscribe to new token events for our mint
  ws.send(JSON.stringify({
    method: 'subscribeNewToken',
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.mint === expectedMintAddress) {
    // Token confirmed on-chain
    launchResultQueue.emit(data.mint, data);
  }
};
```

The worker subscribes before broadcasting the transaction and uses a channel-based promise that resolves when the token event arrives, with a 120s timeout fallback to RPC polling.

#### Pump Provider Failure Modes

| Failure | Handling |
|---------|----------|
| IPFS upload timeout | Retry 3x with exponential backoff (1s, 4s, 16s) |
| `trade-local` 429 | Backoff per `Retry-After` header; circuit break after 5 consecutive |
| Transaction build fails | Return `ProviderError { code: 'TX_BUILD_FAILED', retryable: true }` |
| User signature rejected | Mark attempt `user_rejected`; allow retry |
| On-chain confirmation timeout | Fallback to RPC `getSignatureStatuses` polling |

---

### 4B. Bags Provider

**Integration Path:** Official Bags API (`https://api.bags.fm` — verify endpoint at build time).

**Authentication:** API key passed as `x-api-key` header. Store in `BAGS_API_KEY` env var.

#### Bags Launch Sequence

The Bags launch flow is multi-step and requires sequential API calls:

**Step 1: Create Metadata Record**

```typescript
const metadataRes = await bagsApi.post('/tokens/metadata', {
  name: request.token.name,
  ticker: request.token.ticker,
  description: request.token.description,
  imageUrl: request.token.imageUrl,
  website: request.token.websiteUrl,
  twitter: request.token.twitterUrl,
  telegram: request.token.telegramUrl,
  // Narrative provenance — stored in description or custom field
  narrativeSource: request.token.xPostUrl,
});
// Returns { metadataId: string, metadataUri: string }
```

**Step 2: Create Fee Share Config (optional but recommended)**

```typescript
const feeShareRes = await bagsApi.post('/tokens/fee-config', {
  metadataId: metadataRes.metadataId,
  creatorFeeBps: 50,  // 0.5% — configurable per narrative
  feeClaimerAddress: request.launcherWalletAddress,
  partnerFeeBps: 10,  // 0.1% — Narrative Launcher platform cut
  partnerClaimerAddress: PLATFORM_FEE_WALLET,
});
// Returns { feeConfigId: string }
```

**Step 3: Generate Token Creation Transaction**

```typescript
const txRes = await bagsApi.post('/tokens/create-transaction', {
  metadataId: metadataRes.metadataId,
  feeConfigId: feeShareRes.feeConfigId,
  creatorWallet: request.launcherWalletAddress,
  initialLiquiditySOL: request.providerConfig.initialLiquiditySOL ?? 0,
});
// Returns { serializedTransaction: string (base64) }
```

**Step 4: Frontend Signs Transaction**

The serialized transaction is returned to the frontend. The Solana wallet adapter presents it to the user for signing.

**Step 5: Broadcast Signed Transaction**

```typescript
async submitLaunch(signedTx: string, payload: BagsLaunchPayload): Promise<LaunchSubmitResponse> {
  const submitRes = await bagsApi.post('/tokens/broadcast', {
    signedTransaction: signedTx,
    metadataId: payload.metadataId,
  });
  // Returns { txSignature: string, status: string }
  return { txSignature: submitRes.txSignature, providerJobId: submitRes.jobId };
}
```

**Step 6: Poll Confirmation**

```typescript
async pollLaunchStatus(submitResponse: BagsSubmitResponse): Promise<LaunchResult> {
  const maxAttempts = 30;
  const intervalMs = 4000;

  for (let i = 0; i < maxAttempts; i++) {
    await sleep(intervalMs);
    const statusRes = await bagsApi.get(`/tokens/status/${submitResponse.txSignature}`);

    if (statusRes.status === 'confirmed') {
      return this.normalizeLaunchResult(statusRes);
    }
    if (statusRes.status === 'failed') {
      throw new ProviderError({ code: 'LAUNCH_FAILED', message: statusRes.error, retryable: false });
    }
  }
  throw new ProviderError({ code: 'CONFIRMATION_TIMEOUT', retryable: true });
}
```

#### Bags Fee Share Model

Bags supports on-chain fee share where trading fees are split between creator, platform, and optionally Narrative Launcher. This is a key differentiator — a launched token via Bags continues generating revenue for the creator. The UI should highlight this prominently in the provider comparison card.

```typescript
interface BagsFeeShareConfig {
  creatorFeeBps: number;   // creator's cut of trading fees
  platformFeeBps: number;  // Narrative Launcher's cut
  feeClaimerAddress: string;
  partnerClaimerAddress: string;
}
```

#### Bags Provider Failure Modes

| Failure | Handling |
|---------|----------|
| Metadata API 422 | Surface validation error to UI; block launch |
| Fee config creation fails | Retry once; fall back to no fee share with user warning |
| Transaction generation timeout | Retry up to 3x; if persistent, mark provider `degraded` |
| Broadcast rejected | Check error code; if nonce stale, regenerate tx |
| Confirmation timeout | Fall back to direct RPC `getTransaction` polling |

---

### 4C. BONK / LetsBonk Provider

**Integration Path:** LetsBonk (LetsBonk.io) / Raydium LaunchLab

**Status at Design Time:** The LetsBonk/BONK launchpad operates on Raydium's LaunchLab infrastructure. A public developer API or SDK may require verification at build time. The architecture must treat this provider as required but conditionally enabled.

#### Capability Verification Strategy

The BONK provider adapter implements a startup capability check:

```typescript
// packages/provider-bonk/src/BonkProvider.ts

export class BonkProvider implements LaunchProvider {
  readonly id: ProviderId = 'bonk';
  readonly name = 'LetsBonk';
  private _isEnabled = false;  // starts disabled

  async verifyCapability(): Promise<boolean> {
    // Attempt to reach the LetsBonk API or SDK
    try {
      const res = await fetchWithTimeout('https://api.letsbonk.io/health', 5000);
      if (res.ok) {
        this._isEnabled = true;
        return true;
      }
    } catch {
      // Check if Raydium LaunchLab SDK is available
      try {
        const { LaunchLab } = await import('@raydium-io/raydium-sdk-v2');
        if (LaunchLab) {
          this._isEnabled = true;
          return true;
        }
      } catch {
        // SDK not available
      }
    }
    this._isEnabled = false;
    return false;
  }

  get isEnabled(): boolean {
    return this._isEnabled && process.env.BONK_PROVIDER_ENABLED === 'true';
  }

  // ...
}
```

This runs at worker startup and is repeated every 5 minutes by the `provider-health` queue. If capability fails, the provider registry marks BONK as `unavailable` and the frontend disables the BONK card.

#### Feature Flag System

```typescript
// Feature flag in environment config
BONK_PROVIDER_ENABLED=false   // master kill switch
BONK_USE_DIRECT_RPC=false     // use direct on-chain instruction building
BONK_API_BASE_URL=https://api.letsbonk.io
BONK_LAUNCHLAB_PROGRAM_ID=<program_id>  // Raydium LaunchLab program ID
```

An admin endpoint `POST /api/admin/providers/bonk/toggle` allows toggling without redeployment.

#### Provisional BONK Adapter Design

The BONK adapter is designed against two possible integration paths, selected by feature flag:

**Path A: LetsBonk REST API (preferred if available)**

```typescript
async createLaunchTransaction(payload: BonkLaunchPayload): Promise<LaunchTransaction> {
  const res = await fetch(`${BONK_API_BASE_URL}/launch/create-transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': BONK_API_KEY },
    body: JSON.stringify({
      name: payload.name,
      symbol: payload.symbol,
      metadataUri: payload.metadataUri,
      creatorWallet: payload.launcherWalletAddress,
      initialBuyAmountSOL: payload.devBuy?.amountSOL ?? 0,
    }),
  });
  const data = await res.json();
  return { serializedTransaction: data.transaction, signers: [payload.launcherWalletAddress], expiresAt: new Date(Date.now() + 60_000), metadata: {} };
}
```

**Path B: Direct Raydium LaunchLab On-Chain (SDK)**

```typescript
import { Raydium, LaunchpadPool } from '@raydium-io/raydium-sdk-v2';

async createLaunchTransaction(payload: BonkLaunchPayload): Promise<LaunchTransaction> {
  const raydium = await Raydium.load({ connection, owner: payerPublicKey });

  const { transaction } = await raydium.launchpad.createPool({
    programId: new PublicKey(BONK_LAUNCHLAB_PROGRAM_ID),
    mintInfo: { name: payload.name, symbol: payload.symbol, uri: payload.metadataUri },
    configId: BONK_DEFAULT_CONFIG_ID,
    buyAmount: new BN(payload.devBuy?.amountSOL * LAMPORTS_PER_SOL ?? 0),
    slippage: new Percent(payload.devBuy?.slippageBps ?? 500, 10000),
  });

  return {
    serializedTransaction: Buffer.from(transaction.serialize({ requireAllSignatures: false })).toString('base64'),
    signers: [payload.launcherWalletAddress],
    expiresAt: new Date(Date.now() + 60_000),
    metadata: {},
  };
}
```

**Recommendation:** Build both paths. On startup, `verifyCapability()` probes Path A first. If unavailable, probe Path B (Raydium SDK). If neither is available, mark provider `unavailable`.

#### Raydium LaunchLab Analytics Integration

Tokens launched via BONK sit in Raydium LaunchLab pools. Analytics tracking must:
- Index the LaunchLab pool address (different from pump.fun bonding curve)
- Subscribe to Raydium pool events for price/volume updates
- Track graduation to full AMM separately from pump.fun's graduation
- Store `raydium_pool_address` in `launched_tokens` table

#### BONK Provider Failure Modes

| Failure | Handling |
|---------|----------|
| API unavailable at startup | Mark `unavailable`, feature-flag disables UI card |
| SDK not installed | Falls back to API path; if both fail, mark `disabled` |
| Metadata upload fails | Retry IPFS upload via alternate gateway |
| Transaction rejected | Surface Raydium error code to UI |
| LaunchLab program version mismatch | Alert on-call; disable BONK provider immediately |

---

## 5. X API Integration

### Ingestion Strategy

The system supports three ingestion modes, prioritized by quality:

**Mode 1: Filtered Stream (v2 API — requires elevated access)**

```typescript
// Real-time stream filtering for launch signals
const STREAM_RULES = [
  { value: '"$" lang:en -is:retweet has:hashtags', tag: 'ticker-mention' },
  { value: 'launch "deserves a coin" -is:retweet', tag: 'explicit-launch' },
  { value: 'someone make "$ " -is:retweet', tag: 'create-request' },
  { value: '@NarrativeLaunch -is:retweet', tag: 'bot-mention' },
];
```

The stream worker connects to `GET /2/tweets/search/stream` and processes events into the `x-ingest` BullMQ queue. Connection is maintained with exponential reconnect (1s, 2s, 4s, max 60s).

**Mode 2: Polling Search (v2 API — free/basic tier)**

When filtered stream quota is unavailable, the worker polls `GET /2/tweets/search/recent` every 15 seconds with the same rule set. De-duplication is handled by storing processed tweet IDs in a Redis sorted set with a 1-hour TTL.

**Mode 3: URL Import (user-initiated)**

Any user can paste an X post URL into the Narrative Launcher UI. The API calls `GET /2/tweets/:id` to fetch post data, then processes it through the same qualification pipeline.

### Rate Limit Handling

| X API Operation | Rate Limit | Handling |
|----------------|------------|----------|
| Filtered stream | 1 connection (basic) / 25 (elevated) | Single persistent connection; queue events |
| Search recent | 1 req/sec (basic) | Token bucket; buffer requests |
| Tweet lookup | 300 req/15min | Redis counter; return cached data if needed |
| Post tweet (bot) | 50 req/24h (basic) | Deduplicated queue; prioritize by engagement |
| User lookup | 900 req/15min | Aggressive caching in Redis |

### Duplicate Prevention

```typescript
// Redis key: `x:processed:{tweetId}`
// TTL: 7 days
// On ingest, check existence before enqueuing
async function isAlreadyProcessed(tweetId: string): Promise<boolean> {
  return redis.exists(`x:processed:${tweetId}`) === 1;
}

async function markProcessed(tweetId: string): Promise<void> {
  await redis.setex(`x:processed:${tweetId}`, 7 * 86400, '1');
}
```

Additionally, the `x_posts` table has a unique constraint on `tweet_id`. Any duplicate insert attempt returns a conflict and the ingest worker gracefully skips.

### Edited and Deleted Posts

The system performs a staleness check when a narrative page is opened:

```typescript
async function refreshPostData(tweetId: string): Promise<void> {
  const tweet = await xClient.tweets.findTweetById(tweetId, {
    'tweet.fields': ['text', 'edit_history_tweet_ids', 'public_metrics'],
  });

  if (!tweet.data) {
    // Post was deleted — mark narrative as `source_deleted`
    await db.narratives.update({ status: 'source_deleted' });
    return;
  }

  const wasEdited = tweet.data.edit_history_tweet_ids?.length > 1;
  if (wasEdited) {
    // Update stored text; re-run ticker extraction
    await db.x_posts.update({ text: tweet.data.text, edited: true });
    await narrativeQualificationQueue.add({ narrativeId });
  }
}
```

### Bot Reply Construction

When a narrative is qualified, the bot posts a reply to the original X post:

```typescript
async function postLaunchReply(post: XPost, narrative: Narrative): Promise<void> {
  const launchUrl = `https://narrativelauncher.xyz/n/${narrative.id}`;
  const text = `🚀 "${narrative.ticker}" is now a launchable narrative!\n\nLaunch on pump.fun, Bags, or BONK:\n${launchUrl}`;

  await xClient.tweets.createTweet({
    text,
    reply: { in_reply_to_tweet_id: post.tweetId },
  });
}
```

Bot replies are queued through `x-reply` queue with concurrency 2 to respect rate limits. Each reply is idempotent — a `bot_replied_at` field on `narratives` prevents double-posting.

### Engagement Metric Refresh

Engagement is refreshed on a schedule:
- First 1 hour post-detection: every 5 minutes
- Hours 1–24: every 30 minutes
- After 24 hours: every 6 hours
- After 7 days: daily

```typescript
// Stored in engagement_snapshots table with timestamp
// Used for trending score calculation
```

---

## 6. User Flows

### Flow 1: Bot-Detected Post to Launch

```
1. User posts "launch $WARCAT this meme deserves a coin" on X
2. X filtered stream or polling catches the tweet
3. x-ingest worker stores it in x_posts, enqueues qualification job
4. Qualification worker scores it: ticker=WARCAT (high confidence), engagement=medium, spam=low → qualified
5. Narrative record created: narrative.status = 'active'
6. x-reply worker posts: "🚀 $WARCAT is now launchable: narrativelauncher.xyz/n/abc123"
7. User sees the reply, clicks the link
8. Narrative page loads with embedded X post + 3 provider cards
9. User selects "Launch on Bags"
10. Metadata confirmation modal opens (name, ticker, description, image)
11. User edits description, confirms image (auto-generated from post)
12. User clicks "Continue to Launch"
13. Backend validates launch request, generates Bags metadata + fee config
14. Bags API returns unsigned transaction
15. Frontend presents transaction to Phantom/Backpack wallet
16. User approves signing (one click)
17. Signed transaction broadcast via Bags API
18. Launch status page shows "Confirming..."
19. WebSocket/polling detects confirmation (usually 2–8s)
20. Token page goes live: narrativelauncher.xyz/n/abc123/token
21. Tweet is updated with token mint address (optional)
```

### Flow 2: URL Import Flow

```
1. User discovers an old X post they want to launch
2. They open narrativelauncher.xyz, click "Import from X"
3. They paste: https://x.com/user/status/1234567890
4. API fetches tweet data via X v2 lookup
5. Post runs through qualification pipeline
6. If qualified: narrative created, user redirected to narrative page
7. If duplicate: user shown existing narrative page
8. If rejected: user shown rejection reason (e.g., "post contains prohibited content")
```

### Flow 3: Failed Launch Flow

```
1. User reaches signature step
2. Wallet rejects (user cancelled, insufficient funds, etc.)
3. launch_attempt marked status='user_rejected' or 'failed'
4. UI shows "Launch cancelled — you can try again"
5. Retry button re-initiates from metadata confirmation step
6. Previous failed attempts stored in launch_attempts with error detail
7. User can switch providers and retry
```

### Flow 4: Duplicate Ticker Flow

```
1. User tries to launch $DOGE on pump.fun
2. Qualification engine detects high-frequency ticker
3. System checks: is there already a launched narrative for $DOGE in last 7 days?
4. If yes: UI shows "This ticker was recently launched. View existing → or override?"
5. Override allowed: new narrative created with unique ID, original linked
6. Provider validates: if pump.fun rejects duplicate ticker, surface error pre-launch
```

### Flow 5: Provider Unavailable Flow

```
1. User selects BONK on narrative page
2. Provider health check returns status='unavailable'
3. BONK card shows red badge: "Temporarily unavailable"
4. User hovers: "LetsBonk API is currently unreachable. Try pump.fun or Bags."
5. If user had already started launch with BONK:
   - UI shows "Provider became unavailable during launch"
   - Prompts: "Switch to pump.fun?" with one click
   - New launch request created with pump provider, previous attempt archived
```

### Flow 6: Moderation Rejection Flow

```
1. Post contains slur, prohibited keyword, or impersonates a public figure
2. Moderation rules engine flags it during qualification
3. Narrative created with status='rejected', reason stored
4. If auto-rejected: user sees "This narrative was rejected: [reason]"
5. User can submit appeal through /appeal form
6. Human moderator reviews flagged_content queue in admin dashboard
7. Moderator approves or confirms rejection
8. On approval: narrative requalified and made active
```

---

## 7. Database Schema

### users

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email         TEXT UNIQUE,
  username      TEXT UNIQUE,
  role          TEXT NOT NULL DEFAULT 'user',  -- user | moderator | admin
  is_banned     BOOLEAN NOT NULL DEFAULT FALSE,
  ban_reason    TEXT,
  reputation    INTEGER NOT NULL DEFAULT 100,
  launch_count  INTEGER NOT NULL DEFAULT 0,
  metadata      JSONB DEFAULT '{}'
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### wallets

```sql
CREATE TABLE wallets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  address         TEXT NOT NULL UNIQUE,
  chain           TEXT NOT NULL DEFAULT 'solana',
  is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_address ON wallets(address);
```

### x_accounts

```sql
CREATE TABLE x_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twitter_user_id TEXT NOT NULL UNIQUE,
  username        TEXT NOT NULL,
  display_name    TEXT,
  profile_image   TEXT,
  follower_count  INTEGER DEFAULT 0,
  verified        BOOLEAN DEFAULT FALSE,
  user_id         UUID REFERENCES users(id),
  linked_at       TIMESTAMPTZ,
  last_synced_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_x_accounts_twitter_id ON x_accounts(twitter_user_id);
CREATE INDEX idx_x_accounts_user_id ON x_accounts(user_id);
```

### x_posts

```sql
CREATE TABLE x_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_id        TEXT NOT NULL UNIQUE,
  author_id       TEXT NOT NULL,
  author_username TEXT NOT NULL,
  text            TEXT NOT NULL,
  lang            TEXT,
  created_at_x    TIMESTAMPTZ NOT NULL,
  like_count      INTEGER DEFAULT 0,
  repost_count    INTEGER DEFAULT 0,
  reply_count     INTEGER DEFAULT 0,
  quote_count     INTEGER DEFAULT 0,
  view_count      INTEGER DEFAULT 0,
  media_urls      TEXT[],
  canonical_url   TEXT NOT NULL,
  is_edited       BOOLEAN DEFAULT FALSE,
  is_deleted      BOOLEAN DEFAULT FALSE,
  source          TEXT NOT NULL DEFAULT 'stream',  -- stream | poll | import | mention
  raw_payload     JSONB,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_x_posts_tweet_id ON x_posts(tweet_id);
CREATE INDEX idx_x_posts_author_id ON x_posts(author_id);
CREATE INDEX idx_x_posts_ingested_at ON x_posts(ingested_at DESC);
```

### narratives

```sql
CREATE TABLE narratives (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  x_post_id           UUID NOT NULL REFERENCES x_posts(id),
  created_by_user_id  UUID REFERENCES users(id),
  status              TEXT NOT NULL DEFAULT 'pending',
    -- pending | qualified | active | launched | rejected | source_deleted | expired
  ticker              TEXT NOT NULL,
  name                TEXT NOT NULL,
  description         TEXT,
  image_url           TEXT,
  banner_url          TEXT,
  narrative_score     DECIMAL(5,2) DEFAULT 0,
  ticker_confidence   DECIMAL(5,4) DEFAULT 0,
  qualification_notes JSONB DEFAULT '{}',
  bot_replied_at      TIMESTAMPTZ,
  bot_reply_tweet_id  TEXT,
  is_featured         BOOLEAN DEFAULT FALSE,
  view_count          INTEGER DEFAULT 0,
  launch_count        INTEGER DEFAULT 0,
  moderation_status   TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | rejected | appealed
  moderation_notes    TEXT,
  metadata_snapshot   JSONB DEFAULT '{}',
  slug                TEXT UNIQUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_narratives_status ON narratives(status);
CREATE INDEX idx_narratives_ticker ON narratives(ticker);
CREATE INDEX idx_narratives_score ON narratives(narrative_score DESC);
CREATE INDEX idx_narratives_x_post ON narratives(x_post_id);
CREATE INDEX idx_narratives_slug ON narratives(slug);
```

### launch_requests

```sql
CREATE TABLE launch_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key     TEXT NOT NULL UNIQUE,
  narrative_id        UUID NOT NULL REFERENCES narratives(id),
  provider_id         TEXT NOT NULL,  -- pump | bags | bonk
  launcher_user_id    UUID REFERENCES users(id),
  launcher_wallet     TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'created',
    -- created | validating | metadata_uploading | tx_building | awaiting_signature
    -- | submitting | confirming | confirmed | failed | cancelled
  token_name          TEXT NOT NULL,
  token_ticker        TEXT NOT NULL,
  token_description   TEXT,
  token_image_url     TEXT,
  token_banner_url    TEXT,
  token_website_url   TEXT,
  token_telegram_url  TEXT,
  token_twitter_url   TEXT,
  provider_config     JSONB DEFAULT '{}',
  dev_buy_config      JSONB,
  metadata_result     JSONB,
  launch_payload      JSONB,
  quote_snapshot      JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at          TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '1 hour'
);
CREATE INDEX idx_launch_requests_narrative ON launch_requests(narrative_id);
CREATE INDEX idx_launch_requests_status ON launch_requests(status);
CREATE INDEX idx_launch_requests_wallet ON launch_requests(launcher_wallet);
CREATE INDEX idx_launch_requests_provider ON launch_requests(provider_id);
```

### launch_attempts

```sql
CREATE TABLE launch_attempts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_request_id   UUID NOT NULL REFERENCES launch_requests(id),
  attempt_number      INTEGER NOT NULL DEFAULT 1,
  status              TEXT NOT NULL,
    -- started | awaiting_signature | user_rejected | submitted | confirmed | failed
  tx_signature        TEXT,
  error_code          TEXT,
  error_message       TEXT,
  provider_response   JSONB,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  UNIQUE(launch_request_id, attempt_number)
);
CREATE INDEX idx_launch_attempts_request ON launch_attempts(launch_request_id);
CREATE INDEX idx_launch_attempts_tx ON launch_attempts(tx_signature);
```

### providers

```sql
CREATE TABLE providers (
  id              TEXT PRIMARY KEY,  -- pump | bags | bonk
  name            TEXT NOT NULL,
  is_enabled      BOOLEAN DEFAULT TRUE,
  is_experimental BOOLEAN DEFAULT FALSE,
  display_order   INTEGER DEFAULT 0,
  capabilities    JSONB NOT NULL DEFAULT '{}',
  config          JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### provider_health_checks

```sql
CREATE TABLE provider_health_checks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id TEXT NOT NULL REFERENCES providers(id),
  status      TEXT NOT NULL,
  latency_ms  INTEGER,
  error       TEXT,
  checked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_health_checks_provider ON provider_health_checks(provider_id, checked_at DESC);
-- Partition by month in production; retain 30 days
```

### launched_tokens

```sql
CREATE TABLE launched_tokens (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  narrative_id        UUID NOT NULL REFERENCES narratives(id),
  launch_request_id   UUID NOT NULL REFERENCES launch_requests(id),
  provider_id         TEXT NOT NULL,
  mint_address        TEXT NOT NULL UNIQUE,
  tx_signature        TEXT NOT NULL,
  launcher_wallet     TEXT NOT NULL,
  token_name          TEXT NOT NULL,
  token_ticker        TEXT NOT NULL,
  provider_token_url  TEXT,
  raydium_pool_addr   TEXT,  -- for BONK/LaunchLab tokens
  bonding_curve_addr  TEXT,  -- for pump.fun tokens
  launched_at         TIMESTAMPTZ NOT NULL,
  metadata_uri        TEXT,
  metadata_snapshot   JSONB NOT NULL DEFAULT '{}',
  origin_x_post_url   TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_launched_tokens_mint ON launched_tokens(mint_address);
CREATE INDEX idx_launched_tokens_narrative ON launched_tokens(narrative_id);
CREATE INDEX idx_launched_tokens_provider ON launched_tokens(provider_id);
CREATE INDEX idx_launched_tokens_launched_at ON launched_tokens(launched_at DESC);
```

### token_metrics

```sql
CREATE TABLE token_metrics (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launched_token_id   UUID NOT NULL REFERENCES launched_tokens(id),
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  price_usd           DECIMAL(20,8),
  price_sol           DECIMAL(20,10),
  market_cap_usd      DECIMAL(20,2),
  volume_24h_usd      DECIMAL(20,2),
  holder_count        INTEGER,
  liquidity_usd       DECIMAL(20,2),
  graduated          BOOLEAN DEFAULT FALSE,
  source              TEXT  -- dexscreener | birdeye | on-chain
);
CREATE INDEX idx_token_metrics_token ON token_metrics(launched_token_id, recorded_at DESC);
-- Partition by week; hot data in Redis
```

### engagement_snapshots

```sql
CREATE TABLE engagement_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  x_post_id       UUID NOT NULL REFERENCES x_posts(id),
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  like_count      INTEGER DEFAULT 0,
  repost_count    INTEGER DEFAULT 0,
  reply_count     INTEGER DEFAULT 0,
  quote_count     INTEGER DEFAULT 0,
  view_count      INTEGER DEFAULT 0,
  score_at_time   DECIMAL(5,2)
);
CREATE INDEX idx_engagement_post ON engagement_snapshots(x_post_id, recorded_at DESC);
```

### moderation_flags

```sql
CREATE TABLE moderation_flags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  narrative_id    UUID NOT NULL REFERENCES narratives(id),
  flagged_by      UUID REFERENCES users(id),
  flag_type       TEXT NOT NULL,
    -- auto_spam | auto_offensive | auto_duplicate | user_report | admin_review
  reason          TEXT,
  status          TEXT NOT NULL DEFAULT 'pending',  -- pending | reviewed | resolved
  reviewer_id     UUID REFERENCES users(id),
  reviewed_at     TIMESTAMPTZ,
  resolution      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_mod_flags_narrative ON moderation_flags(narrative_id);
CREATE INDEX idx_mod_flags_status ON moderation_flags(status);
```

### audit_logs

```sql
CREATE TABLE audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,  -- narrative | launch_request | user | provider
  entity_id   TEXT NOT NULL,
  action      TEXT NOT NULL,
  actor_id    UUID,
  actor_type  TEXT,  -- user | worker | system
  details     JSONB NOT NULL DEFAULT '{}',
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
-- Partition by month
```

---

## 8. Backend API Design

### Base URL: `https://api.narrativelauncher.xyz/v1`

### Authentication

Most read endpoints are public. Write endpoints require wallet signature auth (SIWS — Sign In With Solana) or JWT after wallet auth. Admin endpoints require `role=admin` JWT claim.

### Endpoints

#### `POST /ingest/x-post`
Import an X post by URL.

**Request:**
```json
{
  "url": "https://x.com/cryptodegen/status/1234567890"
}
```
**Response:**
```json
{
  "narrativeId": "uuid",
  "status": "qualified",
  "ticker": "WARCAT",
  "narrative": { ... }
}
```
**Rate limit:** 10 req/min per IP; 50 req/hour per wallet.

---

#### `GET /narratives`
List narratives with filters.

**Query params:** `status`, `ticker`, `sort` (trending|recent|score), `page`, `limit`

**Response:**
```json
{
  "data": [{ "id": "uuid", "ticker": "WARCAT", "score": 84.2, "xPost": {...}, "providers": [...] }],
  "meta": { "total": 1204, "page": 1, "limit": 20 }
}
```

---

#### `GET /narratives/:id`
Get full narrative detail.

---

#### `GET /providers`
Get all providers with current health and capabilities.

**Response:**
```json
{
  "providers": [
    {
      "id": "pump",
      "name": "pump.fun",
      "status": "healthy",
      "latencyMs": 142,
      "capabilities": { "supportsDevBuy": true, "launchFeeSOL": 0.02, ... },
      "lastCheckedAt": "2026-03-13T10:00:00Z"
    },
    {
      "id": "bags",
      "name": "Bags",
      "status": "healthy",
      "capabilities": { "supportsFeeShare": true, ... }
    },
    {
      "id": "bonk",
      "name": "LetsBonk",
      "status": "unavailable",
      "degradedReason": "API endpoint unreachable"
    }
  ]
}
```

---

#### `POST /launch/quote`
Get a launch quote before committing.

**Request:**
```json
{
  "narrativeId": "uuid",
  "providerId": "bags",
  "launcherWallet": "7xKX..."
}
```
**Response:**
```json
{
  "providerId": "bags",
  "estimatedFeeSOL": 0.025,
  "platformFeeSOL": 0.005,
  "totalCostSOL": 0.030,
  "estimatedLaunchTimeMs": 8000,
  "warnings": [],
  "expiresAt": "2026-03-13T10:05:00Z"
}
```

---

#### `POST /launch/request`
Create a launch request.

**Request:**
```json
{
  "narrativeId": "uuid",
  "providerId": "pump",
  "launcherWallet": "7xKX...",
  "token": {
    "name": "War Cat",
    "ticker": "WARCAT",
    "description": "The original war cat narrative from X",
    "imageUrl": "https://cdn.narrativelauncher.xyz/warcat.png",
    "websiteUrl": "",
    "telegramUrl": "",
    "twitterUrl": "https://x.com/cryptodegen/status/1234567890"
  },
  "devBuy": { "enabled": true, "amountSOL": 0.5, "slippageBps": 1000 }
}
```
**Response:**
```json
{
  "launchRequestId": "uuid",
  "status": "created",
  "idempotencyKey": "uuid"
}
```

---

#### `POST /launch/:launchRequestId/prepare`
Trigger metadata upload + transaction building. Returns unsigned transaction for signing.

**Response:**
```json
{
  "status": "awaiting_signature",
  "transaction": {
    "serializedTransaction": "base64...",
    "signers": ["7xKX..."],
    "expiresAt": "2026-03-13T10:06:00Z"
  }
}
```

---

#### `POST /launch/:launchRequestId/submit`
Submit signed transaction.

**Request:**
```json
{
  "signedTransaction": "base64...",
  "walletAddress": "7xKX..."
}
```
**Response:**
```json
{
  "status": "confirming",
  "txSignature": "5abc...",
  "pollUrl": "/launch/uuid/status"
}
```

---

#### `GET /launch/:launchRequestId/status`
Poll launch status.

**Response:**
```json
{
  "status": "confirmed",
  "mintAddress": "So11...",
  "txSignature": "5abc...",
  "tokenPageUrl": "https://narrativelauncher.xyz/n/uuid/token",
  "providerTokenUrl": "https://pump.fun/coin/So11..."
}
```

---

#### `GET /narratives/:id/token`
Get launched token data for a narrative.

---

#### `POST /narratives/:id/report`
User-report a narrative (flags for moderation).

---

#### `GET /admin/moderation/queue`
Protected — returns pending moderation items.

---

## 9. Transaction and Wallet Strategy

### Architecture Principle

**Client-side signing is mandatory.** The platform must never hold user private keys. The backend prepares unsigned transactions and returns them to the frontend. The user signs with their connected wallet (Phantom, Backpack, Solflare, etc.) via Solana wallet-adapter.

### Signing Flow

```
Backend builds unsigned VersionedTransaction
              │
              ▼
Returns base64 serialized tx to frontend
              │
              ▼
Frontend deserializes → wallet.signTransaction()
              │
              ▼ User approves in wallet extension
Frontend re-serializes → sends to backend
              │
              ▼
Backend verifies signature authenticity
              │
              ▼
Backend submits to provider (pump/bags/bonk) or directly to Solana RPC
```

### Transaction Validation (Server-Side Pre-submission)

Before broadcasting a signed transaction, the server verifies:
1. Signer matches `launcherWallet` from the launch request
2. Transaction has not expired (`expiresAt` check)
3. No extra instructions were appended (byte-length check)
4. Idempotency key has not already been used

```typescript
function validateSignedTransaction(
  signedTxBase64: string,
  expectedSigner: string,
  expectedPayload: LaunchPayload,
): void {
  const tx = VersionedTransaction.deserialize(Buffer.from(signedTxBase64, 'base64'));
  const accountKeys = tx.message.getAccountKeys();
  if (!accountKeys.staticAccountKeys.some(k => k.toBase58() === expectedSigner)) {
    throw new Error('Signer mismatch');
  }
  // Compare serialized length — reject if modified
  if (tx.serialize().length !== expectedPayload.expectedTxSize) {
    throw new Error('Transaction was modified');
  }
}
```

### Hot Wallet Strategy (Platform Fee Collection)

The platform fee wallet is a hot wallet used only to receive fees, never to sign launch transactions. It is isolated from any signing keypairs. Key management:
- Fee wallet private key stored in a secrets manager (AWS Secrets Manager / Doppler)
- Rotated quarterly
- Spending from fee wallet requires manual approval (multi-sig in production)

### Nonce and Replay Protection

Solana transactions include a recent blockhash that expires after ~2 minutes. This provides natural replay protection. Additionally:
- Each `launchRequestId` is consumed atomically in Redis before submission
- Re-submitting the same `launchRequestId` returns the existing `txSignature`

### RPC Provider Strategy

Use a tiered RPC setup:
1. **Primary:** Helius (paid) — highest throughput, reliable confirmation
2. **Secondary:** QuickNode — failover
3. **Fallback:** Public mainnet-beta (only for reads)

```typescript
const rpcConnection = new Connection(
  process.env.HELIUS_RPC_URL!,
  { commitment: 'confirmed', confirmTransactionInitialTimeout: 60000 }
);
```

---

## 10. Security and Abuse Prevention

### Spam Launch Prevention

**Rate limits per wallet:**
- Max 3 launch requests per 10 minutes
- Max 10 launches per 24 hours
- Cooldown doubles after failed attempts

**Rate limits per IP:**
- Max 20 API requests per minute (read)
- Max 5 launch initiations per hour

**Narrative deduplication:**
- Hash of (ticker, 24-hour window) checked against existing narratives
- Duplicate within 24h → redirect to existing; no new narrative created

### Ticker Validation

```typescript
const PROHIBITED_TICKERS = ['SOL', 'ETH', 'BTC', 'BONK', 'USDC', 'USDT', ...];
const PROHIBITED_NAMES_REGEX = /\b(trump|biden|sex|[a-z]*racial_slur[a-z]*)\b/i;

function validateTicker(ticker: string): ValidationResult {
  if (PROHIBITED_TICKERS.includes(ticker.toUpperCase())) {
    return { valid: false, reason: 'Ticker conflicts with existing major token' };
  }
  if (!/^[A-Z0-9]{2,10}$/.test(ticker)) {
    return { valid: false, reason: 'Invalid ticker format' };
  }
  return { valid: true };
}
```

### X Post Authenticity Verification

When a URL is imported, the post is fetched directly from the X API (not from user input). The `tweet_id` is extracted from the URL and used to call `GET /2/tweets/:id` — the text and metadata come directly from X, not from user input. This prevents post spoofing.

### Image Upload Safety

Token images uploaded by users go through:
1. **MIME type verification** — check magic bytes, not Content-Type header
2. **Size limit:** 5MB max
3. **Dimension check:** min 400x400, max 4096x4096
4. **NSFW classification:** integrate a moderation model (Sightengine or AWS Rekognition)
5. **Malware scan:** ClamAV on upload worker
6. **CDN re-host:** never serve images from user-provided URLs; always re-host on our CDN (Cloudflare R2)

### Provider Circuit Breakers

```typescript
class ProviderCircuitBreaker {
  private failureCount = 0;
  private lastFailureAt?: Date;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  readonly threshold = 5;  // failures before opening
  readonly resetTimeMs = 60_000;  // 1 minute

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureAt!.getTime() > this.resetTimeMs) {
        this.state = 'half-open';
      } else {
        throw new ProviderError({ code: 'CIRCUIT_OPEN', retryable: false, retryAfterMs: this.resetTimeMs });
      }
    }
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (e) {
      this.onFailure();
      throw e;
    }
  }
}
```

### Content Moderation

**Automated layer:**
- Keyword blocklist for ticker names and descriptions
- Regex patterns for known slur variants
- Duplicate/near-duplicate detection (SimHash on description)
- AI moderation for images (Rekognition)

**Human review queue:**
- All narratives with moderation score 40–70 (borderline) go to human review
- Flagged by community reports
- SLA: 4-hour review window
- Admin dashboard with approve/reject/ban actions

### Bot and Farm Detection

- Launch attempts from wallets with < 0.01 SOL flagged as potentially empty
- Wallets that launched > 50 tokens flagged for review
- IP-based session fingerprinting to detect coordinated burst activity
- CAPTCHA challenge triggered when: new wallet + first launch + high-volume period

---

## 11. Analytics and Monitoring

### Provider Analytics Dashboard

Track per-provider:
- Total launches attempted
- Success rate (%)
- Average time from request to confirmation (ms)
- Failure breakdown by error code
- Health check uptime (%)
- P95 transaction latency

### Launch Conversion Funnel

```
Narrative created
  → narrative_opened (view)
    → provider_selected
      → metadata_confirmed
        → wallet_prompted
          → signature_approved
            → tx_submitted
              → tx_confirmed (launch complete)
```

Each step tracked as a PostHog event with `narrative_id`, `provider_id`, `wallet_address` (hashed).

### Narrative Performance Metrics

- Time from X post to narrative created
- Engagement velocity (likes/hour in first 3 hours)
- Launch conversion rate by narrative score band
- Provider selection distribution per narrative

### Post-Launch Token Analytics

Token price, volume, and holder data sourced from:
- DexScreener API (public, no key required)
- Birdeye API (comprehensive Solana data)
- Direct on-chain RPC queries for holder count

```typescript
// Refresh token metrics every 5 minutes for new tokens, every hour after 24h
async function refreshTokenMetrics(mintAddress: string): Promise<void> {
  const [dexData, birdeyeData] = await Promise.allSettled([
    fetchDexScreener(mintAddress),
    fetchBirdeye(mintAddress),
  ]);
  // Normalize and store in token_metrics
}
```

### Alerting Rules

| Alert | Condition | Severity |
|-------|-----------|----------|
| Provider down | `status=unavailable` for > 5 min | P1 |
| Launch failure rate | > 20% over last 100 launches | P2 |
| Queue backlog | `x-ingest` depth > 10,000 | P2 |
| API error rate | > 5% 5xx over 5 min | P1 |
| Signing timeout | > 30% of transactions expire unsigned | P3 |
| RPC degraded | Confirmation time > 30s | P2 |

Stack: Prometheus + Grafana for metrics; Sentry for error tracking; PagerDuty for P1/P2 on-call.

---

## 12. Frontend UX / UI

### Design System

- **Framework:** Next.js 15 App Router
- **Styling:** Tailwind CSS + `cn()` utility
- **Component library:** Radix UI primitives + custom components in `packages/ui`
- **Wallet:** `@solana/wallet-adapter-react`
- **Color scheme:** Dark mode-first, near-black background (`#0a0a0a`), electric purple accents (`#7c3aed`), neon green confirmations (`#22c55e`)
- **Typography:** Inter (UI), Mono for addresses

### Pages

#### `/` — Home / Trending Feed

- Header: logo, wallet connect button, nav links
- Hero: "Turn X posts into token narratives"
- Trending narratives grid (score-sorted, live updates)
- Import X post input: paste URL → instant qualification
- Filters: All / Pending Launch / Recently Launched / Trending

#### `/n/[id]` — Narrative Detail Page

```
┌─────────────────────────────────────────────────────────┐
│  [Back to feed]                     [Report]  [Share]   │
│                                                         │
│  ┌─── X Post Embed ──────────────────────────────────┐  │
│  │  @cryptodegen · 2h                                │  │
│  │  "this meme deserves a coin $WARCAT"              │  │
│  │  ❤ 1.2K  🔁 342  💬 89  👁 48K                   │  │
│  └────────────────────────────────────────────────────┘  │
│                                                         │
│  $WARCAT  — War Cat                                     │
│  Narrative Score: 84 / 100  🔥                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  LAUNCH ON                                              │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  pump.fun   │  │    Bags     │  │  LetsBonk   │    │
│  │  🟢 Healthy │  │  🟢 Healthy │  │  🔴 Down    │    │
│  │  ~0.02 SOL  │  │  ~0.03 SOL  │  │  Unavail.   │    │
│  │  [Launch →] │  │  [Launch →] │  │  [Disabled] │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
│  [Compare providers ▾]                                  │
└─────────────────────────────────────────────────────────┘
```

#### Launch Flow Modal

Step 1: **Token Setup**
- Name, ticker (pre-filled from narrative), description
- Image (auto-generated or upload)
- Social links

Step 2: **Provider Config**
- pump.fun: dev buy toggle + SOL amount
- Bags: fee share percentage + fee wallet
- BONK: initial liquidity config

Step 3: **Review & Sign**
- Summary: token details + estimated cost
- "Connect wallet" if not connected
- "Sign & Launch" button
- Clear: "You will sign ONE transaction in your wallet"

Step 4: **Confirming**
- Animated spinner
- Transaction signature link (Solscan)
- "Usually confirms in 5–10 seconds"

Step 5: **Launched!**
- Mint address
- Links: pump.fun / Bags / DexScreener / Solscan
- Share on X button (pre-drafted tweet)

#### Provider Comparison Sheet

Slide-up panel triggered by "Compare providers":

| | pump.fun | Bags | LetsBonk |
|--|---------|------|----------|
| Launch fee | ~0.02 SOL | ~0.03 SOL | ~0.025 SOL |
| Fee share | No | Yes (0.5%) | No |
| Dev buy | Yes | No | Yes |
| Ecosystem | pump.fun community | Bags community | BONK community |
| LP | Bonding curve | Bonding curve | Raydium LaunchLab |
| Speed | Fast | Fast | Medium |
| Status | 🟢 | 🟢 | 🔴 |

---

## 13. Monetization

### Revenue Streams

**1. Platform Launch Fee (Primary)**
- 0.005 SOL per successful launch
- Collected automatically as part of the launch transaction
- For Bags launches: embedded in the fee share config as `partnerFeeBps`
- For pump.fun: additional instruction or post-launch transfer
- Estimate: 100 launches/day × 0.005 SOL = 0.5 SOL/day (~$75–150/day at current prices)

**2. Provider Premium Placement**
- Providers can pay to appear first in the provider picker
- Display "Featured" or "Recommended" badge
- Monthly fixed fee from launchpad partners

**3. Featured Narrative Placement**
- Top-of-feed placement for narratives
- User pays a boost fee (0.1–0.5 SOL) for 24-hour featuring
- 100% revenue, low marginal cost

**4. Analytics Subscriptions (B2B)**
- Token projects pay for deep analytics on their narrative performance
- Provider API access with higher rate limits
- $50/month starter; $200/month pro

**5. Creator Attribution Revenue**
- When Bags fee share is configured, Narrative Launcher takes `partnerFeeBps` from every trade
- Long-tail revenue that compounds as successful tokens trade

---

## 14. Scalability

### Queue Architecture

All heavy processing is asynchronous via BullMQ. The API layer is stateless and can scale horizontally without coordination.

**Backpressure Design:**
```typescript
// x-ingest queue: if depth > 50,000, pause stream ingestion
const queue = new Queue('x-ingest');
queue.on('waiting', async (count) => {
  if (count > 50_000) {
    await streamClient.pause();
    setTimeout(() => streamClient.resume(), 5000);
  }
});
```

**Worker Autoscaling:**
- Deploy workers on Railway/Fly.io with horizontal scaling
- Scale `x-ingest` workers on queue depth
- Scale `launch-orchestration` workers on active launch count
- Use Kubernetes HPA in production

**Idempotency:**
Every job includes an `idempotencyKey`. If a job fails and is retried, the same key prevents duplicate side effects (double metadata uploads, double transactions).

**Distributed Locks:**
```typescript
// Prevent two workers from processing the same narrative simultaneously
const lock = await redis.set(
  `lock:qualify:${narrativeId}`,
  workerId,
  'NX', 'EX', 30
);
if (!lock) return; // another worker has it
```

### Caching Strategy

| Data | TTL | Cache Key |
|------|-----|-----------|
| Provider health | 30s | `provider:health:{id}` |
| Narrative list | 60s | `narratives:trending:{page}` |
| X post data | 300s | `x:post:{tweetId}` |
| Token metrics | 60s | `token:metrics:{mintAddress}` |
| Launch quote | 120s | `quote:{narrativeId}:{providerId}` |

### Viral Event Handling

During viral events (e.g., a meme goes viral with 1M impressions, triggering 10K concurrent launch requests):
1. API rate limiter (per IP/wallet) caps individual abuse
2. Launch queue workers process in order; users see queue position
3. Provider circuit breakers prevent provider overload
4. Static pages served from CDN edge cache — no DB hit for narrative views
5. Read replicas handle analytics queries; primary handles writes

---

## 15. Repository Structure

```
narrative-launcher/
├── apps/
│   ├── web/                     # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/             # App Router pages
│   │   │   │   ├── page.tsx     # Home / trending feed
│   │   │   │   ├── narrative/[id]/page.tsx
│   │   │   │   ├── explore/page.tsx
│   │   │   │   └── api/         # API route handlers (BFF)
│   │   │   ├── components/
│   │   │   │   ├── launch/      # LaunchModal, ProviderPicker, SignStep
│   │   │   │   ├── narrative/   # NarrativeCard, NarrativeFeed, XPostEmbed
│   │   │   │   ├── provider/    # ProviderCard, ProviderComparison
│   │   │   │   └── ui/          # Button, Modal, Badge, etc.
│   │   │   ├── lib/             # API clients, wallet utils
│   │   │   └── types/           # Frontend-specific types
│   │   ├── package.json
│   │   └── next.config.ts
│   │
│   ├── api/                     # Fastify REST API
│   │   ├── src/
│   │   │   ├── routes/          # Route handlers
│   │   │   ├── services/        # Business logic
│   │   │   ├── middleware/      # Auth, rate limit, CORS
│   │   │   ├── queue/           # BullMQ job producers
│   │   │   └── db/              # Prisma client
│   │   └── package.json
│   │
│   └── worker/                  # BullMQ worker processes
│       ├── src/
│       │   ├── processors/      # One processor per queue
│       │   │   ├── xIngest.ts
│       │   │   ├── qualification.ts
│       │   │   ├── metadataGen.ts
│       │   │   ├── launchOrchestration.ts
│       │   │   ├── providerHealth.ts
│       │   │   └── engagementRefresh.ts
│       │   └── index.ts
│       └── package.json
│
├── packages/
│   ├── provider-core/           # Abstract interfaces and registry
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── LaunchProvider.ts
│   │   │   ├── ProviderRegistry.ts
│   │   │   └── CircuitBreaker.ts
│   │   └── package.json
│   │
│   ├── provider-pump/           # pump.fun / PumpPortal adapter
│   │   ├── src/
│   │   │   ├── PumpProvider.ts
│   │   │   ├── ipfs.ts
│   │   │   └── websocket.ts
│   │   └── package.json
│   │
│   ├── provider-bags/           # Bags adapter
│   │   ├── src/
│   │   │   ├── BagsProvider.ts
│   │   │   ├── feeShare.ts
│   │   │   └── BagsClient.ts
│   │   └── package.json
│   │
│   ├── provider-bonk/           # BONK / LetsBonk adapter
│   │   ├── src/
│   │   │   ├── BonkProvider.ts
│   │   │   ├── capabilityCheck.ts
│   │   │   └── raydiumLaunchLab.ts
│   │   └── package.json
│   │
│   ├── shared-types/            # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── narrative.ts
│   │   │   ├── launch.ts
│   │   │   ├── provider.ts
│   │   │   └── user.ts
│   │   └── package.json
│   │
│   ├── ui/                      # Shared React components
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── config/                  # Shared config (eslint, tsconfig)
│       ├── eslint-config/
│       └── typescript-config/
│
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.worker
│   │   └── docker-compose.yml
│   ├── terraform/               # AWS / GCP infra as code
│   └── k8s/                     # Kubernetes manifests
│
├── SPEC.md                      # This document
├── package.json                 # Root workspace
├── turbo.json
└── .env.example
```

---

## 16. Development Roadmap

### Phase 1 — Foundation (Weeks 1–6)

- [x] Monorepo setup (Turborepo)
- [ ] `packages/shared-types` — all core types
- [ ] `packages/provider-core` — interface + registry + circuit breaker
- [ ] `packages/provider-pump` — PumpPortal adapter (primary launch path)
- [ ] `apps/api` — core endpoints: ingest, narratives, providers, launch
- [ ] `apps/worker` — x-ingest, qualification, launch-orchestration processors
- [ ] `apps/web` — home feed, narrative page, launch modal (pump only)
- [ ] PostgreSQL schema migrations via Prisma
- [ ] Redis + BullMQ setup
- [ ] X API integration: URL import + polling search
- [ ] Basic wallet auth (SIWS)
- [ ] Deploy: API on Railway, Web on Vercel

**Milestone:** First end-to-end launch: X URL → narrative → pump.fun token in < 60s

### Phase 2 — Multi-Provider (Weeks 7–12)

- [ ] `packages/provider-bags` — full Bags adapter with fee share
- [ ] Provider comparison UI
- [ ] Provider health check cron
- [ ] BONK adapter scaffolded with capability check + feature flag
- [ ] Engagement metric refresh workers
- [ ] Token analytics (DexScreener + Birdeye integration)
- [ ] X filtered stream integration (when API access secured)
- [ ] Bot reply system
- [ ] Basic moderation rules engine
- [ ] Narrative scoring v1

**Milestone:** Three provider options live; provider status visible in UI; post-launch token metrics page

### Phase 3 — Quality and Scale (Weeks 13–20)

- [ ] `packages/provider-bonk` — full BONK adapter if LetsBonk API is stable
- [ ] Admin/moderation dashboard
- [ ] Human review queue
- [ ] Image NSFW detection
- [ ] Rate limiting hardening
- [ ] Queue autoscaling
- [ ] Narrative trending algorithm v2
- [ ] User profiles + launch history
- [ ] Referral / attribution tracking
- [ ] Platform fee collection
- [ ] Observability: Grafana dashboards, PagerDuty alerts

**Milestone:** Production-ready; moderation live; BONK enabled or explicitly feature-flagged off with ETA

### Phase 4 — Growth (Weeks 21+)

- [ ] Creator profiles with narrative portfolio
- [ ] Advanced analytics subscription product
- [ ] Narrative boost / featured placement marketplace
- [ ] Provider marketplace (allow third-party providers to integrate)
- [ ] Mobile-responsive improvements
- [ ] Launch automation API (headless launch for power users)
- [ ] Narrative collections and curation
- [ ] Multi-language support

---

## 17. Engineering Decisions

### Backend Language: TypeScript on Node.js

**Decision:** TypeScript. **Rationale:** Shared types between frontend, backend, and provider packages. Strong ecosystem for Solana (web3.js, wallet-adapter all TS-native). Team velocity is higher when frontend and backend share a language and type system.

### Queue Technology: BullMQ on Redis

**Decision:** BullMQ. **Rationale:** Mature, production-proven, excellent TypeScript support, built-in retry/backoff, delayed jobs, repeatable jobs (health checks, engagement refresh), and a UI dashboard (Bull Board). Alternative (SQS) adds AWS dependency with no meaningful advantage at this scale.

### ORM: Prisma

**Decision:** Prisma. **Rationale:** Best-in-class TypeScript integration, auto-generated client, excellent migration tooling. Alternative (Drizzle) is faster but less mature; worth re-evaluating at 10M+ rows.

### Transaction Signing: Client-Side Only

**Decision:** Never sign on server. **Rationale:** Security. Any server-side signing requires private key exposure, hot wallet risk, and regulatory complexity. Solana wallet-adapter on the frontend handles all signing safely.

### Provider Adapter Pattern: Strategy + Registry

**Decision:** Each provider is a class implementing `LaunchProvider`. A singleton `ProviderRegistry` holds instances. **Rationale:** Clean separation, testable, addable without modifying existing code, naturally isolates provider failures.

### Deployment Stack

| Service | Platform | Rationale |
|---------|----------|-----------|
| `apps/web` | Vercel | Next.js-native, edge caching, zero-config |
| `apps/api` | Railway | Simple containerized deploy, auto-scaling |
| `apps/worker` | Railway | Same infrastructure as API, separate scaling |
| PostgreSQL | Supabase or Railway | Managed Postgres with good Prisma support |
| Redis | Upstash | Serverless Redis, pay-per-use, BullMQ compatible |
| Media CDN | Cloudflare R2 | Cheap, fast, S3-compatible |
| Secrets | Doppler | Environment variable management across services |

### Observability Stack

| Tool | Purpose |
|------|---------|
| Sentry | Error tracking, performance monitoring |
| PostHog | Product analytics, funnel analysis |
| Grafana + Prometheus | Infrastructure metrics, provider health |
| PagerDuty | On-call alerting for P1/P2 incidents |
| Axiom | Log aggregation and search |

### BONK Integration Decision

At build time, attempt to integrate LetsBonk REST API (Path A). If unavailable, use Raydium SDK direct (Path B). In both cases, the BONK provider starts with `isEnabled=false` and is activated via feature flag once the integration has passed a 24-hour test period in production with at least 10 successful launches. Do not launch BONK support publicly until this bar is met.
