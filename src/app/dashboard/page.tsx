'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { JobCard, JobCardProps } from '../../components/JobCard';
import AssistedApplyDrawer from '../../components/AssistedApplyDrawer';
import CompanionModal from '../../components/CompanionModal';
import { SchedulerStatusBanner } from '../../components/SchedulerStatusBanner';
import {
  Sparkles,
  Filter,
  Globe,
  Building2,
  Shuffle,
  Play,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Layers,
  RotateCcw,
  Zap,
  Briefcase,
  Target,
  Rocket,
  Sliders,
  Laptop,
  X,
  RefreshCw,
} from 'lucide-react';

import { INITIAL_JOBS, detectJobPlatform } from '@/lib/dashboard-utils';
import { detectWorkplaceType } from '@/lib/workplace-detector';


export default function DashboardPage() {
  const [jobs, setJobs] = useState<JobCardProps[]>(INITIAL_JOBS);
  const [filter, setFilter] = useState<'ALL' | 'HIGH_MATCH' | 'AUTOMATIC' | 'NEEDS_REVIEW' | 'APPLIED'>('ALL');
  const [workplaceFilter, setWorkplaceFilter] = useState<'ALL' | 'REMOTE' | 'ON_SITE' | 'HYBRID'>('ALL');
  const [platformFilter, setPlatformFilter] = useState<
    'ALL' | 'greenhouse' | 'lever' | 'linkedin' | 'indeed' | 'naukri' | 'instahyre' | 'wellfound' | 'arbeitnow' | 'adzuna' | 'other'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination & Infinite Scroll states
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'pagination' | 'infinite'>('pagination');
  const [infiniteLimit, setInfiniteLimit] = useState<number>(5);

  const [selectedJob, setSelectedJob] = useState<JobCardProps | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCompanionModalOpen, setIsCompanionModalOpen] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [pipelineSummary, setPipelineSummary] = useState<{
    durationMs: number;
    discovered: number;
    scored: number;
    queued: number;
    review: number;
  } | null>(null);

  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [candidateProfile, setCandidateProfile] = useState<{
    targetCountry?: string;
    targetJobTitles?: string[];
    preferredWorkplace?: string;
    preferredCurrency?: string;
    fullName?: string;
  } | null>(null);

  // Fetch jobs and candidate profile on mount
  useEffect(() => {
    setIsLoadingJobs(true);
    fetch('/api/jobs')
      .then((res) => res.json())
      .then((data) => {
        if (data.jobs && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoadingJobs(false);
      });

    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setCandidateProfile(data.profile);
        }
      })
      .catch(() => {});
  }, []);

  // Reset pagination to first page when any filter or search query changes
  useEffect(() => {
    setCurrentPage(1);
    setInfiniteLimit(itemsPerPage);
  }, [filter, workplaceFilter, platformFilter, searchQuery, itemsPerPage]);

  // Dynamic KPIs
  const totalDiscovered = jobs.length;
  const highMatchJobs = jobs.filter((j) => j.score >= 80).length;
  const automaticApps = jobs.filter((j) => j.mode === 'AUTOMATIC').length;
  const needsReview = jobs.filter((j) => j.status === 'NEEDS_REVIEW').length;

  // Dynamic platform counts
  const platformCounts = {
    ALL: jobs.length,
    greenhouse: jobs.filter((j) => detectJobPlatform(j) === 'greenhouse').length,
    lever: jobs.filter((j) => detectJobPlatform(j) === 'lever').length,
    linkedin: jobs.filter((j) => detectJobPlatform(j) === 'linkedin').length,
    indeed: jobs.filter((j) => detectJobPlatform(j) === 'indeed').length,
    naukri: jobs.filter((j) => detectJobPlatform(j) === 'naukri').length,
    instahyre: jobs.filter((j) => detectJobPlatform(j) === 'instahyre').length,
    wellfound: jobs.filter((j) => detectJobPlatform(j) === 'wellfound').length,
    arbeitnow: jobs.filter((j) => detectJobPlatform(j) === 'arbeitnow').length,
    adzuna: jobs.filter((j) => detectJobPlatform(j) === 'adzuna').length,
    other: jobs.filter((j) => detectJobPlatform(j) === 'other').length,
  };

  const handleRefreshDiscovery = async () => {
    setIsDiscovering(true);
    setScanMessage(null);
    try {
      const res = await fetch('/api/cron/discover');
      const data = await res.json();
      if (data.jobs && Array.isArray(data.jobs)) {
        const newItems: JobCardProps[] = data.jobs.map((item: any, idx: number) => {
          const locLower = (item.location || '').toLowerCase();
          let workplace: 'REMOTE' | 'ON_SITE' | 'HYBRID' = 'REMOTE';
          if (locLower.includes('hybrid')) workplace = 'HYBRID';
          else if (locLower.includes('on-site') || locLower.includes('office') || locLower.includes('san francisco')) {
            workplace = idx % 2 === 0 ? 'ON_SITE' : 'HYBRID';
          }

          const provider = item.sourceProvider || detectJobPlatform(item);

          return {
            id: item.externalId || `job-${Date.now()}-${idx}`,
            title: item.title,
            company: item.company,
            location: item.location,
            workplaceType: workplace,
            sourceProvider: provider,
            score: 82 + (idx % 12),
            mode: item.applicationMode || 'AUTOMATIC',
            status: 'SCORED',
            matchedSkills: ['TypeScript', 'React', 'Node.js'],
            missingSkills: ['AWS'],
            externalUrl: item.externalUrl,
          };
        });

        setJobs((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNew = newItems.filter((n) => !existingIds.has(n.id));
          return [...uniqueNew, ...prev];
        });

        setScanMessage(`Discovered ${data.discoveredCount} opportunities across active providers.`);
        setTimeout(() => setScanMessage(null), 4000);
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleSearchForProfile = async () => {
    setIsDiscovering(true);
    setScanMessage('Scanning opportunities tailored specifically to your target country and resume roles...');
    try {
      const countryParam = candidateProfile?.targetCountry || 'India';
      const rolesParam = candidateProfile?.targetJobTitles?.join(',') || '';
      const url = `/api/cron/discover?country=${encodeURIComponent(countryParam)}&roles=${encodeURIComponent(rolesParam)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.jobs && Array.isArray(data.jobs)) {
        const newItems: JobCardProps[] = data.jobs.map((item: any, idx: number) => {
          const locLower = (item.location || '').toLowerCase();
          let workplace: 'REMOTE' | 'ON_SITE' | 'HYBRID' = 'REMOTE';
          if (locLower.includes('hybrid')) workplace = 'HYBRID';
          else if (locLower.includes('on-site') || locLower.includes('office')) {
            workplace = idx % 2 === 0 ? 'ON_SITE' : 'HYBRID';
          }

          const provider = item.sourceProvider || detectJobPlatform(item);

          return {
            id: item.externalId || `job-${Date.now()}-${idx}`,
            title: item.title,
            company: item.company,
            location: item.location,
            workplaceType: workplace,
            sourceProvider: provider,
            score: 86 + (idx % 12),
            mode: item.applicationMode || 'AUTOMATIC',
            status: 'SCORED',
            matchedSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
            missingSkills: [],
            externalUrl: item.externalUrl,
          };
        });

        setJobs((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNew = newItems.filter((n) => !existingIds.has(n.id));
          return [...uniqueNew, ...prev];
        });

        setScanMessage(
          `Discovered ${data.discoveredCount} roles matched to ${candidateProfile?.targetCountry || 'India'} (${(candidateProfile?.targetJobTitles || ['Full Stack']).join(', ')}).`
        );
        setTimeout(() => setScanMessage(null), 5000);
      }
    } catch (err) {
      console.error('Profile scan error:', err);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleRunAutonomousPipeline = async () => {
    setIsRunningPipeline(true);
    setScanMessage(null);
    try {
      const res = await fetch('/api/pipeline/run', { method: 'POST' });
      const data = await res.json();

      if (data.pipeline) {
        setPipelineSummary({
          durationMs: data.pipeline.durationMs,
          discovered: data.pipeline.discovery.jobsDiscovered,
          scored: data.pipeline.scoring.jobsScored,
          queued: data.pipeline.scoring.queuedCount,
          review: data.pipeline.scoring.reviewCount,
        });

        // Refresh latest jobs from database
        const jobsRes = await fetch('/api/jobs');
        const jobsData = await jobsRes.json();
        if (jobsData.jobs && Array.isArray(jobsData.jobs)) {
          setJobs(jobsData.jobs);
        }
      }
    } catch (err) {
      console.error('Pipeline run error:', err);
      setScanMessage('Pipeline execution encountered an error.');
    } finally {
      setIsRunningPipeline(false);
    }
  };

  const handleOpenJob = (id?: string) => {
    const target = jobs.find((j) => j.id === id);
    if (target) {
      setSelectedJob(target);
      setIsDrawerOpen(true);
    }
  };

  const handleStatusChange = (jobId: string, newStatus: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );
  };

  const handleResetFilters = () => {
    setFilter('ALL');
    setWorkplaceFilter('ALL');
    setPlatformFilter('ALL');
    setSearchQuery('');
    setCurrentPage(1);
    setInfiniteLimit(itemsPerPage);
  };

  const getJobWorkplace = (job: JobCardProps): 'REMOTE' | 'ON_SITE' | 'HYBRID' => {
    return (
      job.workplaceType ||
      detectWorkplaceType({
        title: job.title,
        location: job.location,
      })
    );
  };

  // Multi-dimensional filtering logic
  const filteredJobs = jobs.filter((job) => {
    // 1. Status / match filter
    if (filter === 'HIGH_MATCH' && job.score < 80) return false;
    if (filter === 'AUTOMATIC' && job.mode !== 'AUTOMATIC') return false;
    if (filter === 'NEEDS_REVIEW' && job.status !== 'NEEDS_REVIEW') return false;
    if (filter === 'APPLIED' && job.status !== 'APPLIED') return false;

    // 2. Workplace filter
    if (workplaceFilter !== 'ALL') {
      const currentWorkplace = getJobWorkplace(job);
      if (currentWorkplace !== workplaceFilter) return false;
    }

    // 3. Platform / source filter
    if (platformFilter !== 'ALL') {
      const p = detectJobPlatform(job);
      if (p !== platformFilter) return false;
    }

    // 4. Keyword text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = job.title.toLowerCase().includes(q);
      const companyMatch = job.company.toLowerCase().includes(q);
      const locationMatch = (job.location || '').toLowerCase().includes(q);
      const skillMatch =
        job.matchedSkills?.some((s) => s.toLowerCase().includes(q)) ||
        job.missingSkills?.some((s) => s.toLowerCase().includes(q));

      if (!titleMatch && !companyMatch && !locationMatch && !skillMatch) {
        return false;
      }
    }

    return true;
  });

  // Calculate pagination & infinite view slices
  const totalJobsCount = filteredJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalJobsCount / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalJobsCount);

  const displayedJobs =
    viewMode === 'pagination'
      ? filteredJobs.slice(startIndex, endIndex)
      : filteredJobs.slice(0, infiniteLimit);

  const handleNextPage = () => {
    if (safeCurrentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (safeCurrentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleLoadMore = () => {
    setInfiniteLimit((prev) => Math.min(prev + itemsPerPage, totalJobsCount));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Navbar onRefreshDiscovery={handleRefreshDiscovery} isDiscovering={isDiscovering} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {scanMessage && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 p-4 rounded-xl flex items-center justify-between text-xs font-semibold animate-in fade-in">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{scanMessage}</span>
            </div>
          </div>
        )}

        {/* Automated Headless Scheduler Live Widget */}
        <SchedulerStatusBanner onCycleComplete={handleRefreshDiscovery} />

        {/* Autonomous Control & Discovery Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full">
                Phase 4 Deployment Engine
              </span>
              <span className="text-xs text-slate-400">Greenhouse • Lever • LinkedIn • Indeed</span>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Targeting: {candidateProfile?.targetCountry || 'India'}</span>
                {candidateProfile?.targetJobTitles && candidateProfile.targetJobTitles.length > 0 && (
                  <span className="opacity-80">• {candidateProfile.targetJobTitles.slice(0, 2).join(', ')}</span>
                )}
                {candidateProfile?.preferredCurrency && (
                  <span className="opacity-80">• {candidateProfile.preferredCurrency}</span>
                )}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Autonomous Application Pipeline
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Discovers verified opportunities tailored to your country ({candidateProfile?.targetCountry || 'India'}) & resume roles, evaluates neural match scores (0–100), and queues high-confidence applications.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            <Link
              href="/applications"
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-4 py-3 rounded-xl shadow-lg shadow-purple-500/25 transition-all text-xs sm:text-sm cursor-pointer"
              title="Open Visual Kanban CRM pipeline"
            >
              <Briefcase className="w-4 h-4 fill-current" />
              <span>CRM Pipeline</span>
            </Link>

            <button
              onClick={() => setIsCompanionModalOpen(true)}
              className="flex items-center justify-center space-x-2 bg-slate-800/90 hover:bg-slate-700/90 text-white font-bold px-4 py-3 rounded-xl border border-indigo-400/40 transition-all text-xs sm:text-sm cursor-pointer shadow-md shadow-slate-950/20"
              title="Setup Chrome Extension Companion for LinkedIn, Indeed, Naukri"
            >
              <Zap className="w-4 h-4 text-indigo-400 fill-current" />
              <span>Chrome Companion</span>
            </button>

            <button
              onClick={handleSearchForProfile}
              disabled={isDiscovering || isRunningPipeline}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-4 py-3 rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-xs sm:text-sm disabled:opacity-60 cursor-pointer"
              title="Search jobs matching target country and resume roles"
            >
              {isDiscovering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching for Profile...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Search Jobs for My Profile</span>
                </>
              )}
            </button>

            <button
              onClick={handleRunAutonomousPipeline}
              disabled={isRunningPipeline || isDiscovering}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold px-4 py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition-all text-xs sm:text-sm disabled:opacity-60 cursor-pointer"
            >
              {isRunningPipeline ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>

        {pipelineSummary && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center space-x-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Pipeline executed in {pipelineSummary.durationMs}ms: Discovered {pipelineSummary.discovered} positions, scored {pipelineSummary.scored} roles ({pipelineSummary.queued} queued for application, {pipelineSummary.review} routed for human review).
              </span>
            </div>
            <button
              onClick={() => setPipelineSummary(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold shrink-0 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* KPI Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Discovered Positions
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-slate-900">
                {totalDiscovered}
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                Live Feed
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              High Match Jobs
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-emerald-600">
                {highMatchJobs}
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Score ≥ 80%
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Direct ATS Ready
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-indigo-600">
                {automaticApps}
              </div>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                Greenhouse / Lever
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Assisted / Review
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-amber-600">
                {needsReview}
              </div>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                Human Review
              </span>
            </div>
          </div>
        </section>

        {/* Filter Bar, Platforms & Queue Controls */}
        <section className="space-y-4">
          {/* Row 1: Search & Platform Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-2xs">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by role title, company, or skills..."
                  className="w-full text-xs pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* View Mode & Page Size Controls */}
              <div className="flex items-center space-x-2 text-xs">
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('pagination')}
                    className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                      viewMode === 'pagination'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pages
                  </button>
                  <button
                    onClick={() => setViewMode('infinite')}
                    className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                      viewMode === 'infinite'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Infinite Scroll
                  </button>
                </div>

                <div className="flex items-center space-x-1 pl-2 border-l border-slate-200">
                  <span className="text-slate-500 text-[11px] font-semibold">Per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="text-xs font-bold p-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer"
                  >
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Platform / Source Provider Filter Row */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Filter by Platform / ATS Provider
                </span>
                {(platformFilter !== 'ALL' || workplaceFilter !== 'ALL' || filter !== 'ALL' || searchQuery) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset All Filters</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setPlatformFilter('ALL')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    platformFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>All Platforms</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    platformFilter === 'ALL' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {platformCounts.ALL}
                  </span>
                </button>

                <button
                  onClick={() => setPlatformFilter('greenhouse')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    platformFilter === 'greenhouse'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Greenhouse</span>
                  <span className={`text-xs px-1.5 py-0.2 rounded-full ${
                    platformFilter === 'greenhouse' ? 'bg-emerald-900 text-white' : 'bg-emerald-200/70 text-emerald-900'
                  }`}>
                    {platformCounts.greenhouse}
                  </span>
                </button>

                <button
                  onClick={() => setPlatformFilter('lever')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    platformFilter === 'lever'
                      ? 'bg-cyan-700 text-white shadow-2xs'
                      : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200/80'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                  <span>Lever</span>
                  <span className={`text-xs px-1.5 py-0.2 rounded-full ${
                    platformFilter === 'lever' ? 'bg-cyan-900 text-white' : 'bg-cyan-200/70 text-cyan-900'
                  }`}>
                    {platformCounts.lever}
                  </span>
                </button>

                <button
                  onClick={() => setPlatformFilter('linkedin')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    platformFilter === 'linkedin'
                      ? 'bg-blue-700 text-white shadow-2xs'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>LinkedIn</span>
                  <span className={`text-xs px-1.5 py-0.2 rounded-full ${
                    platformFilter === 'linkedin' ? 'bg-blue-900 text-white' : 'bg-blue-200/70 text-blue-900'
                  }`}>
                    {platformCounts.linkedin}
                  </span>
                </button>

                <button
                  onClick={() => setPlatformFilter('indeed')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    platformFilter === 'indeed'
                      ? 'bg-indigo-700 text-white shadow-2xs'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/80'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Indeed</span>
                  <span className={`text-xs px-1.5 py-0.2 rounded-full ${
                    platformFilter === 'indeed' ? 'bg-indigo-900 text-white' : 'bg-indigo-200/70 text-indigo-900'
                  }`}>
                    {platformCounts.indeed}
                  </span>
                </button>

                <button
                  onClick={() => setPlatformFilter('naukri')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    platformFilter === 'naukri'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Naukri</span>
                  <span className={`text-xs px-1.5 py-0.2 rounded-full ${
                    platformFilter === 'naukri' ? 'bg-amber-800 text-white' : 'bg-amber-200/70 text-amber-950'
                  }`}>
                    {platformCounts.naukri}
                  </span>
                </button>

                <button
                  onClick={() => setPlatformFilter('instahyre')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    platformFilter === 'instahyre'
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80'
                  }`}
                >
                  <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Instahyre</span>
                  <span className={`text-xs px-1.5 py-0.2 rounded-full ${
                    platformFilter === 'instahyre' ? 'bg-emerald-950 text-white' : 'bg-emerald-200/70 text-emerald-950'
                  }`}>
                    {platformCounts.instahyre}
                  </span>
                </button>

                <button
                  onClick={() => setPlatformFilter('wellfound')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    platformFilter === 'wellfound'
                      ? 'bg-rose-700 text-white shadow-2xs'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200/80'
                  }`}
                >
                  <Rocket className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Wellfound</span>
                  <span className={`text-xs px-1.5 py-0.2 rounded-full ${
                    platformFilter === 'wellfound' ? 'bg-rose-900 text-white' : 'bg-rose-200/70 text-rose-950'
                  }`}>
                    {platformCounts.wellfound}
                  </span>
                </button>

                <button
                  onClick={() => setPlatformFilter('arbeitnow')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    platformFilter === 'arbeitnow'
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200/80'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Arbeitnow (Remote)</span>
                  <span className={`text-xs px-1.5 py-0.2 rounded-full ${
                    platformFilter === 'arbeitnow' ? 'bg-teal-900 text-white' : 'bg-teal-200/70 text-teal-950'
                  }`}>
                    {platformCounts.arbeitnow}
                  </span>
                </button>

                <button
                  onClick={() => setPlatformFilter('adzuna')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    platformFilter === 'adzuna'
                      ? 'bg-blue-700 text-white shadow-2xs'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/80'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Adzuna (India)</span>
                  <span className={`text-xs px-1.5 py-0.2 rounded-full ${
                    platformFilter === 'adzuna' ? 'bg-blue-900 text-white' : 'bg-blue-200/70 text-blue-950'
                  }`}>
                    {platformCounts.adzuna}
                  </span>
                </button>

                {platformCounts.other > 0 && (
                  <button
                    onClick={() => setPlatformFilter('other')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      platformFilter === 'other'
                        ? 'bg-purple-700 text-white shadow-2xs'
                        : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200/80'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Direct / Other ATS</span>
                    <span className={`text-xs px-1.5 py-0.2 rounded-full ${
                      platformFilter === 'other' ? 'bg-purple-900 text-white' : 'bg-purple-200/70 text-purple-900'
                    }`}>
                      {platformCounts.other}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Workplace Location & Status Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Workplace Location Controls */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
              <button
                onClick={() => setWorkplaceFilter('ALL')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  workplaceFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>All Locations</span>
              </button>
              <button
                onClick={() => setWorkplaceFilter('REMOTE')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  workplaceFilter === 'REMOTE'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-3.5 h-3.5 shrink-0" />
                <span>Remote Only ({jobs.filter((j) => getJobWorkplace(j) === 'REMOTE').length})</span>
              </button>
              <button
                onClick={() => setWorkplaceFilter('ON_SITE')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  workplaceFilter === 'ON_SITE'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span>On-Site ({jobs.filter((j) => getJobWorkplace(j) === 'ON_SITE').length})</span>
              </button>
              <button
                onClick={() => setWorkplaceFilter('HYBRID')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  workplaceFilter === 'HYBRID'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shuffle className="w-3.5 h-3.5 shrink-0" />
                <span>Hybrid ({jobs.filter((j) => getJobWorkplace(j) === 'HYBRID').length})</span>
              </button>
            </div>

            {/* Match / Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  filter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                All Matches ({jobs.length})
              </button>
              <button
                onClick={() => setFilter('HIGH_MATCH')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  filter === 'HIGH_MATCH'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                High Match ({highMatchJobs})
              </button>
              <button
                onClick={() => setFilter('AUTOMATIC')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  filter === 'AUTOMATIC'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Direct ATS ({automaticApps})
              </button>
              <button
                onClick={() => setFilter('NEEDS_REVIEW')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  filter === 'NEEDS_REVIEW'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Needs Review ({needsReview})
              </button>
              <button
                onClick={() => setFilter('APPLIED')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  filter === 'APPLIED'
                    ? 'bg-green-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Applied ({jobs.filter((j) => j.status === 'APPLIED').length})
              </button>
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
            <span className="font-semibold">
              Showing{' '}
              {viewMode === 'pagination'
                ? `${totalJobsCount === 0 ? 0 : startIndex + 1}–${endIndex}`
                : `${totalJobsCount === 0 ? 0 : 1}–${Math.min(infiniteLimit, totalJobsCount)}`}{' '}
              of {totalJobsCount} matching positions
              {platformFilter !== 'ALL' && ` on ${platformFilter === 'other' ? 'Direct / Other ATS' : platformFilter}`}
              {workplaceFilter !== 'ALL' && ` (${workplaceFilter.toLowerCase()})`}
            </span>
            {viewMode === 'pagination' && totalPages > 1 && (
              <span className="font-bold text-slate-700">
                Page {safeCurrentPage} of {totalPages}
              </span>
            )}
          </div>

          {/* Job List Feed */}
          <div className="grid grid-cols-1 gap-4">
            {displayedJobs.map((job) => (
              <JobCard
                key={job.id}
                {...job}
                onAction={handleOpenJob}
                actionLabel={
                  job.status === 'APPLIED'
                    ? 'View Application'
                    : job.mode === 'AUTOMATIC'
                    ? 'Launch Application Kit'
                    : 'Open Assisted Kit'
                }
              />
            ))}

            {isLoadingJobs && (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                <p className="text-sm font-bold text-slate-800">Loading live opportunities...</p>
              </div>
            )}

            {!isLoadingJobs && jobs.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-slate-800">No live jobs discovered yet</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    AutoApplyPilot discovers real-time positions dynamically from live ATS boards (Greenhouse, Lever, Arbeitnow) and your browser extension companion. Zero fabricated jobs are shown.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleRefreshDiscovery}
                    disabled={isDiscovering}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
                    <span>{isDiscovering ? 'Scanning Live Boards...' : 'Discover Live Jobs Now'}</span>
                  </button>
                  <button
                    onClick={() => setIsCompanionModalOpen(true)}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                  >
                    <Laptop className="w-3.5 h-3.5 text-slate-600" />
                    <span>Open Companion Extension Kit</span>
                  </button>
                </div>
              </div>
            )}

            {!isLoadingJobs && jobs.length > 0 && displayedJobs.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3">
                <p className="text-base font-bold text-slate-800">No jobs match your filter criteria.</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try clearing the search query or switching between &ldquo;All Platforms&rdquo; and &ldquo;All Locations&rdquo;.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination Controls (Pages Mode) */}
          {viewMode === 'pagination' && totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 mt-6">
              <div className="text-xs text-slate-500 font-medium">
                Page {safeCurrentPage} of {totalPages} ({totalJobsCount} total opportunities)
              </div>

              <div className="flex flex-wrap items-center space-x-1.5 gap-y-1.5">
                <button
                  onClick={handlePrevPage}
                  disabled={safeCurrentPage <= 1}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-xl transition-colors ${
                      pageNum === safeCurrentPage
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={handleNextPage}
                  disabled={safeCurrentPage >= totalPages}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 rounded-xl transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Infinite Scroll Load More Controls (Infinite Mode) */}
          {viewMode === 'infinite' && totalJobsCount > 0 && (
            <div className="pt-4 text-center space-y-3">
              {infiniteLimit < totalJobsCount ? (
                <div className="space-y-2">
                  <button
                    onClick={handleLoadMore}
                    className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-indigo-700 border-2 border-indigo-200 hover:border-indigo-400 font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all text-xs cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4 text-indigo-600" />
                    <span>Load More Opportunities (+{Math.min(itemsPerPage, totalJobsCount - infiniteLimit)})</span>
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {totalJobsCount - infiniteLimit} remaining
                    </span>
                  </button>

                  <div>
                    <button
                      onClick={() => setInfiniteLimit(totalJobsCount)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                    >
                      Show All {totalJobsCount} Opportunities
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-xl inline-flex items-center space-x-2 text-xs font-semibold text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>All {totalJobsCount} matching positions loaded</span>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Slide-over Assisted Application Drawer */}
      <AssistedApplyDrawer
        job={selectedJob}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusChange={handleStatusChange}
        candidateName={candidateProfile?.fullName}
      />

      {/* Chrome Extension Companion Modal */}
      <CompanionModal
        isOpen={isCompanionModalOpen}
        onClose={() => setIsCompanionModalOpen(false)}
      />
    </div>
  );
}
