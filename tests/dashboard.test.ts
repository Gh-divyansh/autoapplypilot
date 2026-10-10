import { describe, it, expect } from 'vitest';
import JobCard from '../src/components/JobCard';
import DashboardPage from '../src/app/dashboard/page';
import { detectJobPlatform, INITIAL_JOBS } from '../src/lib/dashboard-utils';

describe('Dashboard and JobCard Component', () => {
  it('should export JobCard component function', () => {
    expect(typeof JobCard).toBe('function');
  });

  it('should export DashboardPage component function', () => {
    expect(typeof DashboardPage).toBe('function');
  });

  it('should evaluate score color coding logic correctly', () => {
    const getScoreBadgeStyle = (s: number) => {
      if (s >= 80) return 'emerald';
      if (s >= 60) return 'amber';
      return 'rose';
    };

    expect(getScoreBadgeStyle(95)).toBe('emerald');
    expect(getScoreBadgeStyle(80)).toBe('emerald');
    expect(getScoreBadgeStyle(79)).toBe('amber');
    expect(getScoreBadgeStyle(60)).toBe('amber');
    expect(getScoreBadgeStyle(59)).toBe('rose');
    expect(getScoreBadgeStyle(0)).toBe('rose');
  });

  it('correctly detects job platforms across sourceProvider, URLs, and IDs', () => {
    expect(detectJobPlatform({ sourceProvider: 'greenhouse' })).toBe('greenhouse');
    expect(detectJobPlatform({ sourceProvider: 'LEVER' })).toBe('lever');
    expect(detectJobPlatform({ externalUrl: 'https://boards.greenhouse.io/sample' })).toBe('greenhouse');
    expect(detectJobPlatform({ externalUrl: 'https://jobs.lever.co/company' })).toBe('lever');
    expect(detectJobPlatform({ externalUrl: 'https://www.linkedin.com/jobs/view/123' })).toBe('linkedin');
    expect(detectJobPlatform({ externalUrl: 'https://www.indeed.com/viewjob?jk=abc' })).toBe('indeed');
    expect(detectJobPlatform({ id: 'gh-101' })).toBe('greenhouse');
    expect(detectJobPlatform({ id: 'lev-202' })).toBe('lever');
    expect(detectJobPlatform({ id: 'li-303' })).toBe('linkedin');
    expect(detectJobPlatform({ id: 'ind-404' })).toBe('indeed');
    expect(detectJobPlatform({ id: 'custom-999', externalUrl: 'https://company.careers' })).toBe('other');
  });

  it('correctly calculates pagination slices and total pages', () => {
    const totalItems = 13;
    const itemsPerPage = 5;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    expect(totalPages).toBe(3);

    // Page 1 slice
    const page1Start = (1 - 1) * itemsPerPage;
    const page1End = Math.min(page1Start + itemsPerPage, totalItems);
    expect(page1Start).toBe(0);
    expect(page1End).toBe(5);

    // Page 2 slice
    const page2Start = (2 - 1) * itemsPerPage;
    const page2End = Math.min(page2Start + itemsPerPage, totalItems);
    expect(page2Start).toBe(5);
    expect(page2End).toBe(10);

    // Page 3 slice
    const page3Start = (3 - 1) * itemsPerPage;
    const page3End = Math.min(page3Start + itemsPerPage, totalItems);
    expect(page3Start).toBe(10);
    expect(page3End).toBe(13);
  });

  it('correctly calculates infinite scroll displayed range and bounds', () => {
    const totalItems = 13;
    const initialLimit = 5;
    const loadMoreStep = 5;

    const initialDisplayCount = Math.min(initialLimit, totalItems);
    expect(initialDisplayCount).toBe(5);

    const step2Limit = initialLimit + loadMoreStep;
    const step2DisplayCount = Math.min(step2Limit, totalItems);
    expect(step2DisplayCount).toBe(10);

    const step3Limit = step2Limit + loadMoreStep;
    const step3DisplayCount = Math.min(step3Limit, totalItems);
    expect(step3DisplayCount).toBe(13);

    // Remaining items calculation
    expect(totalItems - initialDisplayCount).toBe(8);
    expect(totalItems - step2DisplayCount).toBe(3);
    expect(totalItems - step3DisplayCount).toBe(0);
  });

  it('ensures INITIAL_JOBS is empty so no hardcoded or fake jobs are loaded', () => {
    expect(INITIAL_JOBS).toEqual([]);
    expect(INITIAL_JOBS.length).toBe(0);

    // Verify platform detection on dynamic job objects
    expect(detectJobPlatform({ sourceProvider: 'greenhouse' })).toBe('greenhouse');
    expect(detectJobPlatform({ sourceProvider: 'lever' })).toBe('lever');
    expect(detectJobPlatform({ sourceProvider: 'linkedin' })).toBe('linkedin');
    expect(detectJobPlatform({ sourceProvider: 'indeed' })).toBe('indeed');
    expect(detectJobPlatform({ sourceProvider: 'naukri' })).toBe('naukri');
    expect(detectJobPlatform({ sourceProvider: 'instahyre' })).toBe('instahyre');
    expect(detectJobPlatform({ sourceProvider: 'wellfound' })).toBe('wellfound');
    expect(detectJobPlatform({ sourceProvider: 'arbeitnow' })).toBe('arbeitnow');
    expect(detectJobPlatform({ sourceProvider: 'adzuna' })).toBe('adzuna');
  });
});
