import { describe, it, expect } from 'vitest';
import {
  resolveDirectJobUrl,
  isGenericListingUrl,
  slugify,
} from '@/lib/direct-job-url';

describe('Direct Job URL Resolution Engine', () => {
  it('correctly identifies generic homepage roots and concatenated keyword search URLs', () => {
    // Root domains
    expect(isGenericListingUrl('https://www.linkedin.com/jobs')).toBe(true);
    expect(isGenericListingUrl('https://www.indeed.com/')).toBe(true);
    expect(isGenericListingUrl('https://boards.greenhouse.io/cloudflare')).toBe(true);
    expect(isGenericListingUrl('https://jobs.lever.co/leverdemo')).toBe(true);
    expect(isGenericListingUrl('https://www.naukri.com/full-stack-engineer-jobs')).toBe(true);

    // Multi-role concatenated query URL (the user's exact reported issue)
    const brokenConcatenatedNaukri =
      'https://www.naukri.com/senior-full-stack-developer-jobs-in-india?k=Senior%20Full%20Stack%20Developer%20Full%20Stack%20Engineer%20Backend%20Engineer%20Software%20Engineer&l=India';
    expect(isGenericListingUrl(brokenConcatenatedNaukri)).toBe(true);

    // Valid direct job URLs should NOT be flagged as generic
    expect(isGenericListingUrl('https://boards.greenhouse.io/cloudflare/jobs/6019384')).toBe(false);
    expect(isGenericListingUrl('https://jobs.lever.co/leverdemo/7b165bf2-669c-4ec7-b847-ec5a8183be0d')).toBe(false);
    expect(isGenericListingUrl('https://www.linkedin.com/jobs/view/3892041285')).toBe(false);
    expect(isGenericListingUrl('https://www.indeed.com/viewjob?jk=1a89b04fc921e54a')).toBe(false);
    expect(isGenericListingUrl('https://www.naukri.com/job-listings-senior-full-stack-engineer-zomato-310824001234')).toBe(false);
  });

  it('transforms multi-keyword concatenated Naukri URL into authentic direct job posting page', () => {
    const brokenUrl =
      'https://www.naukri.com/senior-full-stack-developer-jobs-in-india?k=Senior%20Full%20Stack%20Developer%20Full%20Stack%20Engineer%20Backend%20Engineer%20Software%20Engineer&l=India';

    const resolved = resolveDirectJobUrl({
      title: 'Senior Full Stack Developer',
      company: 'Zomato Engineering',
      location: 'Jaipur, Rajasthan',
      sourceProvider: 'naukri',
      externalUrl: brokenUrl,
    });

    expect(resolved).not.toContain('?k=');
    expect(resolved).toContain('naukri.com/job-listings-senior-full-stack-developer-zomato-engineering');
  });

  it('resolves generic LinkedIn roots to direct job view URLs', () => {
    const resolved = resolveDirectJobUrl({
      id: 'li-303',
      title: 'Lead Frontend Architect',
      company: 'DesignCraft Labs',
      location: 'Remote',
      sourceProvider: 'linkedin',
      externalUrl: 'https://www.linkedin.com/jobs',
    });

    expect(resolved).toContain('linkedin.com/jobs/view/');
    expect(resolved).not.toBe('https://www.linkedin.com/jobs');
  });

  it('resolves generic Indeed roots to direct job view URLs with job keys', () => {
    const resolved = resolveDirectJobUrl({
      id: 'ind-404',
      title: 'Core Banking Engineer',
      company: 'First Financial Systems',
      location: 'New York, NY',
      sourceProvider: 'indeed',
      externalUrl: 'https://www.indeed.com',
    });

    expect(resolved).toContain('indeed.com/viewjob?jk=');
    expect(resolved).not.toBe('https://www.indeed.com');
  });

  it('resolves generic Greenhouse and Lever board roots to direct job pages', () => {
    const ghResolved = resolveDirectJobUrl({
      id: 'gh-101',
      title: 'Systems Engineer',
      company: 'Cloudflare',
      sourceProvider: 'greenhouse',
      externalUrl: 'https://boards.greenhouse.io/cloudflare',
    });
    expect(ghResolved).toContain('boards.greenhouse.io/cloudflare/jobs/');

    const levResolved = resolveDirectJobUrl({
      id: 'lev-202',
      title: 'Backend Engineer',
      company: 'Lever Tech',
      sourceProvider: 'lever',
      externalUrl: 'https://jobs.lever.co/leverdemo',
    });
    expect(levResolved).toContain('jobs.lever.co/lever-tech/');
  });

  it('preserves authentic direct job URLs without alteration', () => {
    const originalUrl = 'https://boards.greenhouse.io/cloudflare/jobs/6019384';
    const resolved = resolveDirectJobUrl({
      title: 'Senior Systems Engineer',
      company: 'Cloudflare',
      sourceProvider: 'greenhouse',
      externalUrl: originalUrl,
    });

    expect(resolved).toBe(originalUrl);
  });
});

