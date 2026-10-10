import { JobProviderAdapter, JobSearchQuery, NormalizedJob } from './types';

export class WellfoundAdapter implements JobProviderAdapter {
  providerId = 'wellfound';

  async fetchJobs(_query: JobSearchQuery): Promise<NormalizedJob[]> {
    // Wellfound (AngelList) requires authenticated session or browser extension extraction.
    // Live jobs are dynamically synchronized directly from candidate browsing sessions
    // via the AutoApplyPilot Chrome Extension companion (/api/extension/sync).
    return [];
  }

  async submitApplication(): Promise<{ success: boolean; confirmationId?: string; error?: string }> {
    return {
      success: false,
      error: 'Direct automation is assisted via the AutoApplyPilot Chrome Extension Companion on Wellfound.',
    };
  }
}
