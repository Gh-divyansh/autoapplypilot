import { describe, it, expect } from 'vitest';
import { getAdapter } from '../src/lib/adapters/registry';
import { ArbeitnowAdapter } from '../src/lib/adapters/arbeitnow';

describe('Arbeitnow Open Job Board Adapter', () => {
  it('retrieves ArbeitnowAdapter from the adapter registry', () => {
    const adapter = getAdapter('arbeitnow');
    expect(adapter).toBeInstanceOf(ArbeitnowAdapter);
    expect(adapter?.providerId).toBe('arbeitnow');
  });

  it('fetches and normalizes tech opportunities into AutoApplyPilot schema', async () => {
    const adapter = new ArbeitnowAdapter();
    const jobs = await adapter.fetchJobs({
      keywords: ['Engineer', 'Developer'],
      targetCountry: 'India',
    });

    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs.length).toBeGreaterThan(0);

    const first = jobs[0];
    expect(first.sourceProvider).toBe('arbeitnow');
    expect(first.externalId).toMatch(/^an-/);
    expect(first.title).toBeDefined();
    expect(first.company).toBeDefined();
    expect(first.location).toBeDefined();
    expect(first.externalUrl).toBeDefined();
    expect(first.applicationMode).toBe('ASSISTED');
  });

  it('respects keyword filtering for specialized search', async () => {
    const adapter = new ArbeitnowAdapter();
    const jobs = await adapter.fetchJobs({
      keywords: ['Full Stack Engineer'],
      targetCountry: 'Worldwide Remote',
    });

    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0].title).toBeDefined();
  });
});

