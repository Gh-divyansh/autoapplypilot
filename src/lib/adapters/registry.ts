import { JobProviderAdapter } from './types';
import { GreenhouseAdapter } from './greenhouse';
import { LeverAdapter } from './lever';
import { LinkedInAssistedAdapter, IndeedAssistedAdapter } from './assisted';
import { NaukriAdapter } from './naukri';
import { InstahyreAdapter } from './instahyre';
import { WellfoundAdapter } from './wellfound';
import { ArbeitnowAdapter } from './arbeitnow';
import { AdzunaAdapter } from './adzuna';

const adapters = new Map<string, JobProviderAdapter>();

export function registerAdapter(adapter: JobProviderAdapter): void {
  adapters.set(adapter.providerId, adapter);
}

export function getAdapter(providerId: string): JobProviderAdapter | undefined {
  return adapters.get(providerId);
}

export function getAllAdapters(): JobProviderAdapter[] {
  return Array.from(adapters.values());
}

// Register default adapters
registerAdapter(new GreenhouseAdapter());
registerAdapter(new LeverAdapter());
registerAdapter(new LinkedInAssistedAdapter());
registerAdapter(new IndeedAssistedAdapter());
registerAdapter(new NaukriAdapter());
registerAdapter(new InstahyreAdapter());
registerAdapter(new WellfoundAdapter());
registerAdapter(new ArbeitnowAdapter());
registerAdapter(new AdzunaAdapter());
