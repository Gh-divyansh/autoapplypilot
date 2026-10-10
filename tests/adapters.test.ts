import { describe, it, expect } from 'vitest';
import { getAdapter } from '../src/lib/adapters/registry';
import { GreenhouseAdapter } from '../src/lib/adapters/greenhouse';
import { LeverAdapter } from '../src/lib/adapters/lever';

describe('Job Provider Adapters', () => {
  it('retrieves Greenhouse adapter from registry', () => {
    const adapter = getAdapter('greenhouse');
    expect(adapter).toBeDefined();
    expect(adapter).toBeInstanceOf(GreenhouseAdapter);
    expect(adapter?.providerId).toBe('greenhouse');
  });

  it('retrieves Lever adapter from registry', () => {
    const adapter = getAdapter('lever');
    expect(adapter).toBeDefined();
    expect(adapter).toBeInstanceOf(LeverAdapter);
    expect(adapter?.providerId).toBe('lever');
  });

  it('fetches normalized jobs and submits application using GreenhouseAdapter', async () => {
    const adapter = getAdapter('greenhouse')!;
    const jobs = await adapter.fetchJobs({ keywords: ['Engineer'] });
    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs.length).toBeGreaterThan(0);

    const job = jobs[0];
    expect(job).toHaveProperty('externalId');
    expect(job).toHaveProperty('sourceProvider', 'greenhouse');
    expect(job).toHaveProperty('title');
    expect(job).toHaveProperty('company');
    expect(job).toHaveProperty('description');
    expect(job).toHaveProperty('externalUrl');
    expect(job.applicationMode).toBe('AUTOMATIC');

    expect(adapter.submitApplication).toBeDefined();
    const result = await adapter.submitApplication!(
      job,
      { name: 'John Doe', email: 'john@example.com', resumeUrl: 'https://example.com/resume.pdf' },
      { coverLetter: 'Hello' }
    );

    expect(result.success).toBe(true);
    expect(result.confirmationId).toBeDefined();
  });

  it('fetches normalized jobs and submits application using LeverAdapter', async () => {
    const adapter = getAdapter('lever')!;
    const jobs = await adapter.fetchJobs({ keywords: ['Backend'] });
    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs.length).toBeGreaterThan(0);

    const job = jobs[0];
    expect(job).toHaveProperty('externalId');
    expect(job).toHaveProperty('sourceProvider', 'lever');
    expect(job).toHaveProperty('title');
    expect(job).toHaveProperty('company');
    expect(job).toHaveProperty('description');
    expect(job).toHaveProperty('externalUrl');
    expect(job.applicationMode).toBe('AUTOMATIC');

    expect(adapter.submitApplication).toBeDefined();
    const result = await adapter.submitApplication!(
      job,
      { name: 'Jane Doe', email: 'jane@example.com', resumeUrl: 'https://example.com/resume.pdf' },
      { coverLetter: 'Hi' }
    );

    expect(result.success).toBe(true);
    expect(result.confirmationId).toBeDefined();
  });
});
