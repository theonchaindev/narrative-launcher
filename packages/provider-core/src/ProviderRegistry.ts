import type { ProviderId, ProviderHealthStatus } from '@narrative-launcher/shared-types';
import type { LaunchProvider } from './LaunchProvider';

export class ProviderRegistry {
  private readonly providers = new Map<ProviderId, LaunchProvider>();
  private readonly healthCache = new Map<ProviderId, ProviderHealthStatus>();

  register(provider: LaunchProvider): void {
    this.providers.set(provider.id, provider);
  }

  get(id: ProviderId): LaunchProvider {
    const p = this.providers.get(id);
    if (!p) throw new Error(`Provider '${id}' is not registered`);
    return p;
  }

  getAll(): LaunchProvider[] {
    return [...this.providers.values()];
  }

  getEnabled(): LaunchProvider[] {
    return this.getAll().filter((p) => p.isEnabled);
  }

  async refreshAllHealth(): Promise<void> {
    const TIMEOUT_MS = 5_000;

    const results = await Promise.allSettled(
      this.getEnabled().map(async (p) => {
        const health = await Promise.race<ProviderHealthStatus>([
          p.healthCheck(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('health check timeout')), TIMEOUT_MS)),
        ]);
        this.healthCache.set(p.id, health);
      }),
    );

    // Mark timed-out providers as unavailable
    this.getEnabled().forEach((p) => {
      if (!this.healthCache.has(p.id)) {
        this.healthCache.set(p.id, {
          providerId: p.id,
          status: 'unavailable',
          latencyMs: TIMEOUT_MS,
          lastCheckedAt: new Date().toISOString(),
          errorMessage: 'Health check timed out',
          nextCheckAt: new Date(Date.now() + 60_000).toISOString(),
        });
      }
    });

    // Handle settled rejections — mark as unavailable
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        const provider = this.getEnabled()[i];
        if (provider) {
          this.healthCache.set(provider.id, {
            providerId: provider.id,
            status: 'unavailable',
            latencyMs: TIMEOUT_MS,
            lastCheckedAt: new Date().toISOString(),
            errorMessage: result.reason?.message ?? 'Unknown error',
            nextCheckAt: new Date(Date.now() + 60_000).toISOString(),
          });
        }
      }
    });
  }

  getHealth(id: ProviderId): ProviderHealthStatus | undefined {
    return this.healthCache.get(id);
  }

  getAllHealth(): ProviderHealthStatus[] {
    return [...this.healthCache.values()];
  }

  setCachedHealth(id: ProviderId, health: ProviderHealthStatus): void {
    this.healthCache.set(id, health);
  }
}
