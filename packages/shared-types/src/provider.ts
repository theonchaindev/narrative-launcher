export type ProviderId = 'pump' | 'bags' | 'bonk';

export type ProviderStatus =
  | 'healthy'
  | 'degraded'
  | 'unavailable'
  | 'disabled'
  | 'experimental';

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
  lastCheckedAt: string;
  errorMessage?: string;
  degradedReason?: string;
  nextCheckAt: string;
}

export interface ProviderInfo {
  id: ProviderId;
  name: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  health: ProviderHealthStatus;
  capabilities: ProviderCapability;
  displayOrder: number;
  isExperimental: boolean;
}
