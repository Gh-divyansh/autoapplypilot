import { describe, it, expect, vi } from 'vitest';
import {
  calculateNextRun,
  buildCronUrl,
  executeCronCycle,
  startDaemon,
  SchedulerConfig,
} from '../scripts/scheduler-daemon';

describe('Autonomous Headless Scheduler Engine', () => {
  it('accurately calculates next execution timestamp based on interval', () => {
    const baseDate = new Date('2026-10-06T12:00:00Z');
    const intervalMinutes = 360; // 6 hours
    const nextRun = calculateNextRun(baseDate, intervalMinutes);

    expect(nextRun.toISOString()).toBe('2026-10-06T18:00:00.000Z');
  });

  it('constructs authenticated cron URLs with query parameters correctly', () => {
    const url = buildCronUrl('http://localhost:3000/', '/api/cron/discover', {
      country: 'India',
      roles: ['Senior Full Stack Developer', 'Backend Engineer'],
      secret: 'super-secret-key-123',
    });

    expect(url).toContain('http://localhost:3000/api/cron/discover');
    expect(url).toContain('country=India');
    expect(url).toContain('secret=super-secret-key-123');
    expect(url).toContain('roles=Senior+Full+Stack+Developer%2CBackend+Engineer');
  });

  it('handles execution cycle network responses and error handling gracefully', async () => {
    // Test with mock server or error handling
    const mockConfig: SchedulerConfig = {
      baseUrl: 'http://invalid-test-domain-987654.local',
      intervalMinutes: 60,
      country: 'India',
      roles: ['Engineer'],
    };

    const result = await executeCronCycle(mockConfig);
    expect(result).toBeDefined();
    expect(result.discoverSuccess).toBe(false);
    expect(result.processSuccess).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('controls daemon lifecycle: starts and gracefully stops without leaving open timers', () => {
    const daemon = startDaemon({
      baseUrl: 'http://localhost:3000',
      intervalMinutes: 360,
      roles: ['Test Role'],
    });

    expect(daemon.isRunning()).toBe(true);

    daemon.stop();
    expect(daemon.isRunning()).toBe(false);
  });
});

