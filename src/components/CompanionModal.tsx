'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  FolderOpen,
  Zap,
  Globe,
  Sparkles,
  Briefcase,
  Search,
  Target,
  Rocket,
  Sliders,
} from 'lucide-react';

interface CompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompanionModal: React.FC<CompanionModalProps> = ({ isOpen, onClose }) => {
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    loading: boolean;
    success: boolean;
    candidateName?: string;
    targetCountry?: string;
    queuedCount?: number;
    error?: string;
  }>({
    loading: false,
    success: false,
  });

  const extensionFolderPath = 'd:\\divyansh\\My Tools\\job apply portal\\extension';
  const chromeExtensionsUrl = 'chrome://extensions';

  const checkSyncEndpoint = async () => {
    setSyncStatus((prev) => ({ ...prev, loading: true, error: undefined }));
    try {
      const res = await fetch('/api/extension/sync');
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSyncStatus({
          loading: false,
          success: true,
          candidateName: data.candidate?.name || 'Active Candidate',
          targetCountry: data.candidate?.targetCountry || 'India',
          queuedCount: data.activeQueueCount ?? 0,
        });
      } else {
        setSyncStatus({
          loading: false,
          success: false,
          error: data.error || 'Sync endpoint returned an unexpected response.',
        });
      }
    } catch (err: any) {
      setSyncStatus({
        loading: false,
        success: false,
        error: err?.message || 'Failed to reach /api/extension/sync',
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkSyncEndpoint();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyPath = () => {
    navigator.clipboard.writeText(extensionFolderPath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2500);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(chromeExtensionsUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-t-2xl flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center space-x-3.5 z-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/90 border border-indigo-400/40 flex items-center justify-center font-bold text-white shadow-inner">
              <Zap className="w-5 h-5 text-indigo-200 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold">AutoApplyPilot Chrome Companion</h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full">
                  Manifest V3 Ready
                </span>
              </div>
              <p className="text-xs text-slate-300">
                1-Click In-Browser Application Engine for LinkedIn, Indeed, Naukri, & Startups
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors z-10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Real-time Status Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              {syncStatus.loading ? (
                <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin shrink-0 mt-0.5" />
              ) : syncStatus.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              )}
              <div>
                <div className="text-xs font-bold text-slate-800">
                  {syncStatus.loading
                    ? 'Verifying Companion Endpoint...'
                    : syncStatus.success
                    ? 'Backend Sync Active & Ready'
                    : 'Endpoint Pending'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {syncStatus.success ? (
                    <span>
                      Profile: <strong className="text-slate-700">{syncStatus.candidateName}</strong> (Targeting{' '}
                      {syncStatus.targetCountry}) •{' '}
                      <span className="text-indigo-600 font-semibold">{syncStatus.queuedCount} roles</span> queued
                    </span>
                  ) : syncStatus.error ? (
                    <span className="text-rose-600">{syncStatus.error}</span>
                  ) : (
                    <span>Connects your web portal directly to your browser extension</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={checkSyncEndpoint}
              disabled={syncStatus.loading}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center space-x-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.loading ? 'animate-spin' : ''}`} />
              <span>Test Sync</span>
            </button>
          </div>

          {/* Quick Setup Instructions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quick 30-Second Chrome Installation
            </h4>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start space-x-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-slate-900">Open Chrome Extensions Tab</div>
                  <div className="text-slate-500 mt-0.5">
                    Navigate to <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono text-[11px]">chrome://extensions</code> in your Google Chrome browser.
                  </div>
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center space-x-1 transition-colors shrink-0"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                </button>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-slate-900">Enable Developer Mode</div>
                  <div className="text-slate-500 mt-0.5">
                    Switch on the <strong>Developer mode</strong> toggle located at the top-right corner of the Extensions page.
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="flex-1 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-900">Load Unpacked Extension</div>
                  <div className="text-slate-500">
                    Click <strong>&quot;Load unpacked&quot;</strong> and choose the companion folder:
                  </div>
                  <div className="font-mono text-[11px] bg-slate-100 text-slate-800 p-2 rounded-lg border border-slate-200 select-all break-all">
                    {extensionFolderPath}
                  </div>
                </div>
                <button
                  onClick={handleCopyPath}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg flex items-center space-x-1 transition-colors shrink-0"
                >
                  {copiedPath ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FolderOpen className="w-3.5 h-3.5" />}
                  <span>{copiedPath ? 'Copied!' : 'Copy Path'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Supported Platforms Chip Matrix */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Supported In-Browser Platforms
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center flex flex-col items-center justify-center">
                <Briefcase className="w-4 h-4 text-blue-600 mb-1" />
                <div className="text-xs font-bold text-slate-800">LinkedIn</div>
                <div className="text-xs text-slate-500">Easy Apply & Screening</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center flex flex-col items-center justify-center">
                <Search className="w-4 h-4 text-indigo-600 mb-1" />
                <div className="text-xs font-bold text-slate-800">Indeed</div>
                <div className="text-xs text-slate-500">Fast Apply Forms</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center flex flex-col items-center justify-center">
                <Globe className="w-4 h-4 text-amber-600 mb-1" />
                <div className="text-xs font-bold text-slate-800">Naukri.com</div>
                <div className="text-xs text-slate-500">Compensation & Notice</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center flex flex-col items-center justify-center">
                <Target className="w-4 h-4 text-purple-600 mb-1" />
                <div className="text-xs font-bold text-slate-800">Instahyre</div>
                <div className="text-xs text-slate-500">Indian Tech Startups</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center flex flex-col items-center justify-center">
                <Rocket className="w-4 h-4 text-rose-600 mb-1" />
                <div className="text-xs font-bold text-slate-800">Wellfound</div>
                <div className="text-xs text-slate-500">Global VC Startups</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center flex flex-col items-center justify-center">
                <Globe className="w-4 h-4 text-emerald-600 mb-1" />
                <div className="text-xs font-bold text-slate-800">Greenhouse</div>
                <div className="text-xs text-slate-500">Direct ATS Boards</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center flex flex-col items-center justify-center">
                <Sliders className="w-4 h-4 text-cyan-600 mb-1" />
                <div className="text-xs font-bold text-slate-800">Lever.co</div>
                <div className="text-xs text-slate-500">Direct ATS Boards</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center flex flex-col items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
                <div className="text-xs font-bold text-emerald-800">Live Sync</div>
                <div className="text-xs text-emerald-600">Localhost DB Connected</div>
              </div>
            </div>
          </div>

          {/* Safety & Compliance Card */}
          <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-xl p-4 flex items-start space-x-3 text-xs text-emerald-950">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold">Zero Bot-Detection Risk & 100% ToS Compliant</strong>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                By operating inside your real browser session with your residential IP address and logged-in accounts, AutoApplyPilot avoids Cloudflare CAPTCHAs, Arkose bot-detection, and account restrictions.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            AutoApplyPilot Chrome Extension Companion • Manifest V3
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Done & Ready
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanionModal;
