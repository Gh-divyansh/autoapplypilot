import { JobProviderAdapter, JobSearchQuery, NormalizedJob } from './types';
import { resolveDirectJobUrl } from '../direct-job-url';

export class NaukriAdapter implements JobProviderAdapter {
  providerId = 'naukri';

  async fetchJobs(_query: JobSearchQuery): Promise<NormalizedJob[]> {
    // Naukri.com does not offer a public server-side API.
    // Live jobs are dynamically synchronized directly from candidate browsing sessions
    // via the AutoApplyPilot Chrome Extension companion (/api/extension/sync).
    return [];
  }

  async submitApplication(): Promise<{ success: boolean; confirmationId?: string; error?: string }> {
    return {
      success: false,
      error: 'Direct automation is assisted via the AutoApplyPilot Chrome Extension Companion on Naukri.com for 100% compliance.',
    };
  }
}
