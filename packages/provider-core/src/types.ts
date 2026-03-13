import type { ProviderId, ProviderStatus, ProviderCapability, ProviderHealthStatus } from '@narrative-launcher/shared-types';

export type { ProviderId, ProviderStatus, ProviderCapability, ProviderHealthStatus };

export interface MetadataUploadResult {
  metadataUri: string;
  imageUri?: string;
  providerRef: string;
  uploadedAt: Date;
}

export interface LaunchPayload {
  providerId: ProviderId;
  name: string;
  symbol: string;
  metadataUri: string;
  launcherWalletAddress: string;
  expectedTxSize?: number;
  providerSpecific: Record<string, unknown>;
}

export interface LaunchSubmitResponse {
  txSignature: string;
  providerJobId?: string;
  submittedAt: Date;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ProviderError {
  providerId: ProviderId;
  code: string;
  message: string;
  retryable: boolean;
  retryAfterMs?: number;
  rawError?: unknown;
}

export class ProviderException extends Error {
  constructor(public readonly error: ProviderError) {
    super(error.message);
    this.name = 'ProviderException';
  }
}
