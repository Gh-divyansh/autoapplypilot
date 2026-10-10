'use client';

import React from 'react';
import {
  Laptop,
  Building2,
  Shuffle,
  Globe,
  Search,
  Sliders,
  Briefcase,
  Target,
  Rocket,
  Zap,
  Check,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { resolveDirectJobUrl } from '@/lib/direct-job-url';
import { detectWorkplaceType } from '@/lib/workplace-detector';

export interface JobCardProps {
  id?: string;
  title: string;
  company: string;
  location?: string | null;
  workplaceType?: 'REMOTE' | 'ON_SITE' | 'HYBRID';
  score: number;
  mode: 'AUTOMATIC' | 'ASSISTED';
  status: string;
  sourceProvider?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  externalUrl?: string;
  actionLabel?: string;
  onAction?: (id?: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  id,
  title,
  company,
  location,
  workplaceType,
  score,
  mode,
  status,
  sourceProvider,
  matchedSkills = [],
  missingSkills = [],
  externalUrl,
  actionLabel,
  onAction,
}) => {
  const effectiveWorkplace =
    workplaceType ||
    detectWorkplaceType({
      title,
      location,
    });

  const getScoreBadgeStyle = (s: number) => {
    if (s >= 80) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    }
    if (s >= 60) {
      return 'bg-amber-50 text-amber-800 border-amber-300';
    }
    return 'bg-rose-50 text-rose-800 border-rose-300';
  };

  const getStatusBadgeStyle = (st: string) => {
    switch (st.toUpperCase()) {
      case 'APPLIED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'NEEDS_REVIEW':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'QUEUED':
      case 'APPLYING':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'FAILED':
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getWorkplaceBadge = () => {
    switch (effectiveWorkplace) {
      case 'ON_SITE':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <Building2 className="w-3 h-3 text-purple-600 shrink-0" />
            <span>On-site</span>
          </span>
        );
      case 'HYBRID':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200">
            <Shuffle className="w-3 h-3 text-teal-600 shrink-0" />
            <span>Hybrid</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-sky-50 text-sky-700 border border-sky-200">
            <Laptop className="w-3 h-3 text-sky-600 shrink-0" />
            <span>Remote</span>
          </span>
        );
    }
  };

  const getPlatformBadge = () => {
    let platform = (sourceProvider || '').toLowerCase();
    if (!platform) {
      const url = (externalUrl || '').toLowerCase();
      const jobId = (id || '').toLowerCase();
      if (url.includes('greenhouse.io') || jobId.startsWith('gh-')) platform = 'greenhouse';
      else if (url.includes('lever.co') || jobId.startsWith('lev-')) platform = 'lever';
      else if (url.includes('linkedin.com') || jobId.startsWith('li-')) platform = 'linkedin';
      else if (url.includes('indeed.com') || jobId.startsWith('ind-')) platform = 'indeed';
      else if (url.includes('naukri.com') || jobId.startsWith('nk-')) platform = 'naukri';
      else if (url.includes('instahyre.com') || jobId.startsWith('inst-')) platform = 'instahyre';
      else if (url.includes('wellfound.com') || jobId.startsWith('wf-')) platform = 'wellfound';
    }

    switch (platform) {
      case 'greenhouse':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Globe className="w-3 h-3 text-emerald-600" />
            <span>Greenhouse</span>
          </span>
        );
      case 'lever':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
            <Sliders className="w-3 h-3 text-cyan-600" />
            <span>Lever</span>
          </span>
        );
      case 'linkedin':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            <Briefcase className="w-3 h-3 text-blue-600" />
            <span>LinkedIn</span>
          </span>
        );
      case 'indeed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Search className="w-3 h-3 text-indigo-600" />
            <span>Indeed</span>
          </span>
        );
      case 'naukri':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <Globe className="w-3 h-3 text-amber-600" />
            <span>Naukri</span>
          </span>
        );
      case 'instahyre':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-800 border border-purple-200">
            <Target className="w-3 h-3 text-purple-600" />
            <span>Instahyre</span>
          </span>
        );
      case 'wellfound':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            <Rocket className="w-3 h-3 text-teal-600" />
            <span>Wellfound</span>
          </span>
        );
      default:
        return null;
    }
  };

  const defaultActionLabel = () => {
    if (actionLabel) return actionLabel;
    if (status === 'NEEDS_REVIEW') return 'Review Application';
    if (status === 'APPLIED') return 'View Details';
    return mode === 'AUTOMATIC' ? 'Auto Apply' : 'Start Application';
  };

  const handleClick = () => {
    if (onAction) {
      onAction(id);
    } else if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 leading-snug truncate">
              {title}
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
              <strong className="text-slate-700">{company}</strong> • {location || 'Remote / Direct'}
            </p>
          </div>

          <div
            className={`inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-lg border shrink-0 ${getScoreBadgeStyle(
              score
            )}`}
          >
            <Zap className="w-3 h-3 text-emerald-600 fill-current" />
            <span>{score}% Match</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span
            className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
              mode === 'AUTOMATIC'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {mode}
          </span>

          <span
            className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadgeStyle(
              status
            )}`}
          >
            {status.replace(/_/g, ' ')}
          </span>

          {getWorkplaceBadge()}
          {getPlatformBadge()}
        </div>

        {(matchedSkills.length > 0 || missingSkills.length > 0) && (
          <div className="pt-1 text-xs space-y-1.5">
            {matchedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="font-semibold text-slate-500 text-[11px]">Matched:</span>
                {matchedSkills.slice(0, 4).map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] font-medium"
                  >
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            )}
            {missingSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="font-semibold text-slate-500 text-[11px]">Missing:</span>
                {missingSkills.slice(0, 3).map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md text-[11px] font-medium"
                  >
                    <X className="w-3 h-3 text-rose-600 shrink-0" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        {externalUrl ? (
          <a
            href={resolveDirectJobUrl({ id, title, company, location, sourceProvider, externalUrl })}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open direct job posting for ${title} at ${company}`}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span>Source Listing</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <div />
        )}

        <button
          onClick={handleClick}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-2xs cursor-pointer"
        >
          <span>{defaultActionLabel()}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default JobCard;

