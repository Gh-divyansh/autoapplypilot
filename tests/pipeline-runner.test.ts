import { describe, it, expect } from 'vitest';
import { runAutonomousPipeline } from '../src/lib/cron/runner';

describe('Autonomous Pipeline Runner', () => {
  it('executes full discovery and scoring pipeline end-to-end', async () => {
    const result = await runAutonomousPipeline({
      keywords: ['Full Stack', 'Engineer'],
      maxJobsToScore: 3,
    });

    expect(result.success).toBe(true);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(typeof result.timestamp).toBe('string');

    // Discovery phase assertions
    expect(result.discovery.adaptersRun).toContain('greenhouse');
    expect(result.discovery.adaptersRun).toContain('lever');
    expect(result.discovery.adaptersRun).toContain('linkedin');
    expect(result.discovery.adaptersRun).toContain('indeed');
    expect(result.discovery.jobsDiscovered).toBeGreaterThan(0);
    expect(result.discovery.jobs.length).toBeGreaterThan(0);

    // Scoring phase assertions
    expect(result.scoring.jobsScored).toBeGreaterThan(0);
    expect(result.scoring.scores.length).toBeGreaterThan(0);

    const firstScore = result.scoring.scores[0];
    expect(firstScore).toHaveProperty('jobId');
    expect(firstScore).toHaveProperty('title');
    expect(firstScore).toHaveProperty('score');
    expect(firstScore.score).toBeGreaterThanOrEqual(0);
    expect(firstScore.score).toBeLessThanOrEqual(100);
    expect(['QUEUED', 'NEEDS_REVIEW', 'SCORED']).toContain(firstScore.status);
    expect(['HIGH_MATCH', 'MEDIUM_MATCH', 'LOW_MATCH']).toContain(firstScore.matchLevel);
  }, 30000);

  it('respects maxJobsToScore limit', async () => {
    const result = await runAutonomousPipeline({
      maxJobsToScore: 2,
    });

    expect(result.success).toBe(true);
    expect(result.scoring.jobsScored).toBeLessThanOrEqual(2);
  }, 30000);
});

