import type {
  ProviderId,
  ProviderCapability,
  ProviderHealthStatus,
} from '@narrative-launcher/shared-types';
import type {
  MetadataUploadResult,
  LaunchPayload,
  LaunchSubmitResponse,
  ValidationResult,
} from './types';
import type { LaunchRequest, LaunchQuote, LaunchTransaction, LaunchResult } from '@narrative-launcher/shared-types';

export interface LaunchProvider {
  readonly id: ProviderId;
  readonly name: string;
  readonly isEnabled: boolean;

  getCapabilities(): Promise<ProviderCapability>;
  healthCheck(): Promise<ProviderHealthStatus>;

  validateLaunchRequest(request: LaunchRequest): Promise<ValidationResult>;
  uploadMetadata(request: LaunchRequest): Promise<MetadataUploadResult>;
  buildLaunchPayload(request: LaunchRequest, metadata: MetadataUploadResult): Promise<LaunchPayload>;
  createLaunchTransaction(payload: LaunchPayload): Promise<LaunchTransaction>;
  submitLaunch(signedTx: string, payload: LaunchPayload): Promise<LaunchSubmitResponse>;
  pollLaunchStatus(submitResponse: LaunchSubmitResponse): Promise<LaunchResult>;
  normalizeLaunchResult(rawResponse: unknown): LaunchResult;
  getLaunchQuote(request: LaunchRequest): Promise<LaunchQuote>;
}
