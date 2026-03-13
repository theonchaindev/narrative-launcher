import type { ProviderId } from './provider';

export type LaunchRequestStatus =
  | 'created'
  | 'validating'
  | 'metadata_uploading'
  | 'tx_building'
  | 'awaiting_signature'
  | 'submitting'
  | 'confirming'
  | 'confirmed'
  | 'failed'
  | 'cancelled';

export interface LaunchTokenConfig {
  name: string;
  ticker: string;
  description: string;
  imageUrl: string;
  bannerUrl?: string;
  websiteUrl?: string;
  telegramUrl?: string;
  twitterUrl?: string;
  xPostUrl: string;
}

export interface DevBuyConfig {
  enabled: boolean;
  amountSOL: number;
  slippageBps: number;
}

export interface LaunchQuote {
  providerId: ProviderId;
  estimatedFeeSOL: number;
  platformFeeSOL: number;
  totalCostSOL: number;
  estimatedLaunchTimeMs: number;
  warnings: string[];
  expiresAt: string;
}

export interface LaunchRequest {
  id: string;
  idempotencyKey: string;
  narrativeId: string;
  providerId: ProviderId;
  launcherWallet: string;
  status: LaunchRequestStatus;
  token: LaunchTokenConfig;
  devBuy?: DevBuyConfig;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface LaunchTransaction {
  serializedTransaction: string;
  signers: string[];
  expiresAt: string;
  metadata: Record<string, unknown>;
}

export interface LaunchResult {
  providerId: ProviderId;
  status: 'pending' | 'confirmed' | 'failed' | 'unknown';
  mintAddress?: string;
  txSignature?: string;
  providerTokenUrl?: string;
  launchedAt?: string;
  failureReason?: string;
}

export interface LaunchStatusResponse {
  launchRequestId: string;
  status: LaunchRequestStatus;
  result?: LaunchResult;
  txSignature?: string;
  mintAddress?: string;
  tokenPageUrl?: string;
  providerTokenUrl?: string;
  error?: string;
}
