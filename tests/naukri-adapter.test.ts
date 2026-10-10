import { describe, it, expect } from 'vitest';
import { getAdapter } from '../src/lib/adapters/registry';
import { NaukriAdapter } from '../src/lib/adapters/naukri';
import { InstahyreAdapter } from '../src/lib/adapters/instahyre';
import { WellfoundAdapter } from '../src/lib/adapters/wellfound';

describe('Multi-Platform ATS Adapters (Naukri, Instahyre, Wellfound)', () => {
  it('retrieves all newly added adapters from registry', () => {
    const naukri = getAdapter('naukri');
    expect(naukri).toBeInstanceOf(NaukriAdapter);
    expect(naukri?.providerId).toBe('naukri');

    const instahyre = getAdapter('instahyre');
    expect(instahyre).toBeInstanceOf(InstahyreAdapter);
    expect(instahyre?.providerId).toBe('instahyre');

    const wellfound = getAdapter('wellfound');
    expect(wellfound).toBeInstanceOf(WellfoundAdapter);
    expect(wellfound?.providerId).toBe('wellfound');
  });

  describe('NaukriAdapter', () => {
    it('does not generate fake jobs and guides users to companion extension', async () => {
      const adapter = new NaukriAdapter();
      const jobs = await adapter.fetchJobs({
        keywords: ['Full Stack Engineer', 'Backend Developer'],
        targetCountry: 'India',
        targetLocations: ['Jaipur', 'Bengaluru'],
      });

      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs.length).toBe(0);
    });

    it('safely guides users to companion extension when submitApplication is called', async () => {
      const adapter = new NaukriAdapter();
      const res = await adapter.submitApplication();
      expect(res.success).toBe(false);
      expect(res.error).toContain('AutoApplyPilot Chrome Extension Companion');
    });
  });

  describe('InstahyreAdapter', () => {
    it('does not generate fake jobs without live extension session', async () => {
      const adapter = new InstahyreAdapter();
      const jobs = await adapter.fetchJobs({
        keywords: ['Senior Full Stack Engineer'],
        targetLocations: ['Bengaluru'],
      });

      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs.length).toBe(0);
    });

    it('safely guides users to companion extension when submitApplication is called', async () => {
      const adapter = new InstahyreAdapter();
      const res = await adapter.submitApplication();
      expect(res.success).toBe(false);
      expect(res.error).toContain('AutoApplyPilot Chrome Extension Companion');
    });
  });

  describe('WellfoundAdapter', () => {
    it('does not generate fake jobs without live extension session', async () => {
      const adapter = new WellfoundAdapter();
      const jobs = await adapter.fetchJobs({
        keywords: ['Full Stack Engineer'],
        targetCountry: 'India',
      });

      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs.length).toBe(0);
    });

    it('safely guides users to companion extension when submitApplication is called', async () => {
      const adapter = new WellfoundAdapter();
      const res = await adapter.submitApplication();
      expect(res.success).toBe(false);
      expect(res.error).toContain('AutoApplyPilot Chrome Extension Companion');
    });
  });
});
