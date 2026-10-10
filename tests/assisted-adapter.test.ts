import { describe, it, expect } from 'vitest';
import { LinkedInAssistedAdapter, IndeedAssistedAdapter } from '../src/lib/adapters/assisted';

describe('LinkedIn and Indeed Assisted Adapters (Compliance Testing)', () => {
  it('LinkedIn adapter fetches real jobs or returns compliant empty array with zero fake data', async () => {
    const adapter = new LinkedInAssistedAdapter();
    expect(adapter.providerId).toBe('linkedin');

    const jobs = await adapter.fetchJobs({
      keywords: ['Staff Frontend Engineer'],
      targetCountry: 'India',
    });

    // Zero fake jobs generated - returns array of real jobs or empty on timeout
    expect(Array.isArray(jobs)).toBe(true);
    if (jobs.length > 0) {
      expect(jobs[0].sourceProvider).toBe('linkedin');
      expect(jobs[0].applicationMode).toBe('ASSISTED');
      expect(jobs[0].externalUrl).toContain('linkedin.com/jobs/view');
    }

    // Verify compliance: direct headless automation must be rejected
    const submitResult = await adapter.submitApplication();
    expect(submitResult.success).toBe(false);
    expect(submitResult.error).toContain('compliance');
  });

  it('Indeed adapter does not generate fake jobs and directs users to companion extension', async () => {
    const adapter = new IndeedAssistedAdapter();
    expect(adapter.providerId).toBe('indeed');

    const jobs = await adapter.fetchJobs({
      keywords: ['DevOps Architect'],
      location: 'Remote',
    });

    // Zero fake jobs generated - real jobs enter dynamically via companion extension
    expect(jobs).toEqual([]);

    const submitResult = await adapter.submitApplication();
    expect(submitResult.success).toBe(false);
  });
});
