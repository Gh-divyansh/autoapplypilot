/**
 * AutoApplyPilot - Automated Headless Scheduler Daemon
 * 
 * Runs as a persistent background Node service that triggers automated
 * job discovery and scoring pipelines on a configurable interval.
 * 
 * Usage:
 *   npm run scheduler:daemon
 *   INTERVAL_MINUTES=60 npm run scheduler:daemon
 */

export interface SchedulerConfig {
  baseUrl: string;
  intervalMinutes: number;
  cronSecret?: string;
  country: string;
  roles: string[];
  maxRetries?: number;
}

export interface CronCycleReport {
  timestamp: string;
  discoverSuccess: boolean;
  discoverCount: number;
  processSuccess: boolean;
  scoredCount: number;
  appliedCount: number;
  error?: string;
}

export function calculateNextRun(from: Date, intervalMinutes: number): Date {
  return new Date(from.getTime() + intervalMinutes * 60 * 1000);
}

export function buildCronUrl(
  baseUrl: string,
  endpoint: string,
  options: { country?: string; roles?: string[]; secret?: string } = {}
): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  const url = new URL(`${cleanBase}/${cleanEndpoint}`);

  if (options.country) {
    url.searchParams.set('country', options.country);
  }
  if (options.roles && options.roles.length > 0) {
    url.searchParams.set('roles', options.roles.join(','));
  }
  if (options.secret) {
    url.searchParams.set('secret', options.secret);
  }

  return url.toString();
}

/**
 * Executes a single complete discovery & processing cycle
 */
export async function executeCronCycle(config: SchedulerConfig): Promise<CronCycleReport> {
  const timestamp = new Date().toISOString();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'AutoApplyPilot-SchedulerDaemon/1.0',
  };

  if (config.cronSecret) {
    headers['Authorization'] = `Bearer ${config.cronSecret}`;
  }

  let discoverCount = 0;
  let scoredCount = 0;
  let appliedCount = 0;
  let discoverSuccess = false;
  let processSuccess = false;

  try {
    // 1. Run Discovery
    const discoverUrl = buildCronUrl(config.baseUrl, '/api/cron/discover', {
      country: config.country,
      roles: config.roles,
      secret: config.cronSecret,
    });

    const discRes = await fetch(discoverUrl, { method: 'GET', headers });
    if (discRes.ok) {
      const discData = await discRes.json();
      discoverSuccess = true;
      discoverCount = discData.discoveredCount || discData.jobsFound || 0;
    } else {
      const errText = await discRes.text().catch(() => '');
      throw new Error(`Discovery failed with status ${discRes.status}: ${errText}`);
    }

    // 2. Run Process
    const processUrl = buildCronUrl(config.baseUrl, '/api/cron/process', {
      secret: config.cronSecret,
    });

    const procRes = await fetch(processUrl, { method: 'GET', headers });
    if (procRes.ok) {
      const procData = await procRes.json();
      processSuccess = true;
      scoredCount = procData.scored || 0;
      appliedCount = procData.applied || 0;
    } else {
      const errText = await procRes.text().catch(() => '');
      throw new Error(`Processing failed with status ${procRes.status}: ${errText}`);
    }

    return {
      timestamp,
      discoverSuccess,
      discoverCount,
      processSuccess,
      scoredCount,
      appliedCount,
    };
  } catch (err: any) {
    return {
      timestamp,
      discoverSuccess,
      discoverCount,
      processSuccess,
      scoredCount,
      appliedCount,
      error: err?.message || 'Unknown cycle error',
    };
  }
}

/**
 * Starts the scheduling daemon with interval timer and graceful shutdown
 */
export function startDaemon(customConfig?: Partial<SchedulerConfig>) {
  const config: SchedulerConfig = {
    baseUrl: customConfig?.baseUrl || process.env.APP_URL || 'http://localhost:3000',
    intervalMinutes: customConfig?.intervalMinutes || Number(process.env.INTERVAL_MINUTES || '360'),
    cronSecret: customConfig?.cronSecret || process.env.CRON_SECRET || '',
    country: customConfig?.country || process.env.TARGET_COUNTRY || 'India',
    roles: customConfig?.roles || (
      process.env.TARGET_ROLES
        ? process.env.TARGET_ROLES.split(',')
        : ['Senior Full Stack Developer', 'Full Stack Engineer', 'Backend Engineer', 'Software Engineer']
    ),
    maxRetries: customConfig?.maxRetries || 3,
  };

  let active = true;
  let timer: NodeJS.Timeout | null = null;

  const log = (msg: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    console.log(`[${time}] [SchedulerDaemon] ${msg}`);
  };

  log(`Autonomous Scheduler initialized.`);
  log(`Base URL: ${config.baseUrl}`);
  log(`Interval: ${config.intervalMinutes} minutes (${(config.intervalMinutes / 60).toFixed(1)} hrs)`);
  log(`Target Roles: ${config.roles.join(', ')}`);

  const runWithRetry = async (retryCount = 0): Promise<void> => {
    if (!active) return;

    log(`Triggering scheduled autonomous cycle...`);
    const report = await executeCronCycle(config);

    if (report.error) {
      log(`Cycle encountered error: ${report.error}`);
      if (retryCount < (config.maxRetries || 3)) {
        const backoffMs = Math.min(10000 * Math.pow(2, retryCount), 60000);
        log(`Retrying in ${backoffMs / 1000}s (Attempt ${retryCount + 1}/${config.maxRetries})...`);
        setTimeout(() => runWithRetry(retryCount + 1), backoffMs);
        return;
      } else {
        log(`Max retries reached. Sleeping until next cycle.`);
      }
    } else {
      log(`Cycle completed successfully: Discovered ${report.discoverCount} jobs | Scored ${report.scoredCount} | Auto-applied ${report.appliedCount}`);
    }

    if (active) {
      const nextRun = calculateNextRun(new Date(), config.intervalMinutes);
      log(`Next autonomous cycle scheduled for: ${nextRun.toLocaleTimeString()} (${nextRun.toLocaleDateString()})`);
      timer = setTimeout(() => runWithRetry(0), config.intervalMinutes * 60 * 1000);
    }
  };

  // Run initial cycle after brief startup grace period
  const startupTimer = setTimeout(() => runWithRetry(0), 3000);

  const stop = () => {
    active = false;
    if (timer) clearTimeout(timer);
    clearTimeout(startupTimer);
    log(`Autonomous Scheduler stopped gracefully.`);
  };

  return {
    stop,
    isRunning: () => active,
  };
}

// Direct CLI execution guard
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('scheduler-daemon')) {
  const daemon = startDaemon();

  process.on('SIGINT', () => {
    console.log('\nReceived SIGINT. Gracefully stopping daemon...');
    daemon.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM. Gracefully stopping daemon...');
    daemon.stop();
    process.exit(0);
  });
}

