import { describe, it, expect } from 'vitest';
import { evaluateDeterministicFilters } from '../src/lib/ai/matcher';

describe('Deterministic Hard Filter Engine', () => {
  it('blocks jobs from excluded companies', () => {
    const criteria = {
      excludedCompanies: ['BadCorp', 'SpamMedia'],
    };

    const job = {
      title: 'Senior Engineer',
      company: 'BadCorp',
      location: 'Remote',
      description: 'Exciting opportunity',
    };

    const result = evaluateDeterministicFilters(criteria, job);
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('excluded company');
  });

  it('blocks on-site jobs when candidate strictly requires remote', () => {
    const criteria = {
      remoteOnly: true,
    };

    const job = {
      title: 'Platform Engineer',
      company: 'OfficeCorp',
      location: 'New York, NY (In-office 5 days/week)',
      description: 'On-site required',
    };

    const result = evaluateDeterministicFilters(criteria, job);
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('Remote-only');
  });

  it('passes jobs that meet all criteria', () => {
    const criteria = {
      targetRoles: ['Full Stack', 'Software Engineer'],
      excludedCompanies: ['CompetitorX'],
      remoteOnly: true,
    };

    const job = {
      title: 'Full Stack Engineer',
      company: 'FutureTech',
      location: 'Fully Remote (US/Canada)',
      description: 'Modern stack developer',
    };

    const result = evaluateDeterministicFilters(criteria, job);
    expect(result.passed).toBe(true);
  });
});
