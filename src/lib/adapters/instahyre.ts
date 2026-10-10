import { JobProviderAdapter, JobSearchQuery, NormalizedJob } from './types';

export class InstahyreAdapter implements JobProviderAdapter {
  providerId = 'instahyre';

  async fetchJobs(_query: JobSearchQuery): Promise<NormalizedJob[]> {
    // Instahyre does not provide a public server-side job search API.
    // Live jobs are dynamically synchronized directly from candidate browsing sessions
    // via the AutoApplyPilot Chrome Extension companion (/api/extension/sync).
    return [];
  }

  async submitApplication(): Promise<{ success: boolean; confirmationId?: string; error?: string }> {
    return {
      success: false,
      error: 'Direct automation is assisted via the AutoApplyPilot Chrome Extension Companion on Instahyre.',
    };
  }
}
