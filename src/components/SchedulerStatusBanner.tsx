'use client';

import React, { useState } from 'react';
import {
  Clock,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Play,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface SchedulerStatusBannerProps {
  onCycleComplete?: () => void;
}

export const SchedulerStatusBanner: React.FC<SchedulerStatusBannerProps> = ({
  onCycleComplete,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastExecuted, setLastExecuted] = useState<string>('Recently');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleRunNow = async () => {
    setIsRunning(true);
    setStatusMessage('Scanning Greenhouse, Lever & Arbeitnow live feeds...');
    setErrorNotice(null);

    try {
      // 1. Trigger Discovery
      const discRes = await fetch(
        '/api/cron/discover?country=India&roles=Senior%20Full%20Stack%20Developer,Full%20Stack%20Engineer,Backend%20Engineer,Software%20Engineer',
        { method: 'GET' }
      );
      const discData = await discRes.json().catch(() => ({}));

      // 2. Trigger Processing & Scoring
      setStatusMessage('Scoring newly ingested jobs against candidate profile...');
      const procRes = await fetch('/api/cron/process', { method: 'GET' });
      const procData = await procRes.json().catch(() => ({}));

      const discoveredCount = discData.discoveredCount || discData.jobsFound || 0;
      const scoredCount = procData.scored || 0;

      setStatusMessage(
        `Cycle complete: ${discoveredCount} jobs discovered, ${scoredCount} high-match profiles scored.`
      );
      setLastExecuted('Just now');

      if (onCycleComplete) {
        onCycleComplete();
      }

      setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    } catch (err: any) {
      setErrorNotice(err?.message || 'Cycle encountered network interruption');
      setTimeout(() => setErrorNotice(null), 5000);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-xl border border-indigo-900/40 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: Daemon & Scheduler Live Status */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold tracking-wide uppercase text-indigo-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              Headless Scheduler Engine Active
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-800/60 border border-indigo-700/60 text-indigo-200 font-medium">
              Every 6 Hours (Continuous)
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
            AutoApplyPilot continuously crawls Greenhouse, Lever, and open tech feeds, evaluating openings against your target preferences and pre-generating application kits.
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Last execution: <strong className="text-slate-200">{lastExecuted}</strong>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              Active Feed Directories: <strong className="text-slate-200">15+ Tech Boards</strong>
            </span>
          </div>
        </div>

        {/* Right Side: Manual Execution Trigger */}
        <div className="flex items-center gap-3 shrink-0 self-stretch md:self-auto justify-end">
          <button
            onClick={handleRunNow}
            disabled={isRunning}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/25 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Full Cycle Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Feedback Banners */}
      {statusMessage && (
        <div className="mt-3.5 pt-3 border-t border-indigo-900/50 flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/40 px-3 py-2 rounded-lg border border-emerald-800/40 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorNotice && (
        <div className="mt-3.5 pt-3 border-t border-rose-900/50 flex items-center gap-2 text-xs text-rose-300 bg-rose-950/40 px-3 py-2 rounded-lg border border-rose-800/40 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}
    </div>
  );
};

