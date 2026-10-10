'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Filter,
  Plus,
  Mail,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  Briefcase,
  Trophy,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Zap,
  Banknote,
  Globe,
  Sliders,
  Target,
  Rocket,
  Bookmark,
  Award,
  Archive,
  Code,
  Calendar,
} from 'lucide-react';
import { ApplicationItem } from '@/lib/types/applications';
import ApplicationDetailsDrawer from './ApplicationDetailsDrawer';
import InboundEmailSimulatorModal from './InboundEmailSimulatorModal';
import AddApplicationModal from './AddApplicationModal';

const COLUMNS = [
  {
    key: 'DISCOVERED',
    label: 'Wishlist',
    description: 'Saved or discovered roles',
    icon: Bookmark,
    headerBg: 'bg-slate-100',
    badgeColor: 'bg-slate-200 text-slate-700',
  },
  {
    key: 'QUEUED',
    label: 'Queued',
    description: 'Ready for Autopilot dispatch',
    icon: Sparkles,
    headerBg: 'bg-amber-100/70',
    badgeColor: 'bg-amber-200/80 text-amber-800',
  },
  {
    key: 'APPLIED',
    label: 'Applied',
    description: 'Submitted direct or companion',
    icon: Briefcase,
    headerBg: 'bg-indigo-100/70',
    badgeColor: 'bg-indigo-200/80 text-indigo-800',
  },
  {
    key: 'NEEDS_REVIEW',
    label: 'Assessment',
    description: 'Coding test & screening forms',
    icon: Code,
    headerBg: 'bg-purple-100/70',
    badgeColor: 'bg-purple-200/80 text-purple-800',
  },
  {
    key: 'INTERVIEW',
    label: 'Interviewing',
    description: 'Recruiter or tech round booked',
    icon: Calendar,
    headerBg: 'bg-emerald-100/70',
    badgeColor: 'bg-emerald-200/80 text-emerald-800',
  },
  {
    key: 'OFFER',
    label: 'Offer',
    description: 'Official offer received',
    icon: Award,
    headerBg: 'bg-teal-100/70',
    badgeColor: 'bg-teal-200/80 text-teal-800',
  },
  {
    key: 'REJECTED',
    label: 'Archived',
    description: 'Closed or passed on',
    icon: Archive,
    headerBg: 'bg-rose-100/70',
    badgeColor: 'bg-rose-200/80 text-rose-800',
  },
];

const COLUMN_KEYS = COLUMNS.map((c) => c.key);

export const KanbanBoard: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');

  // Modals & Drawers
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (data.applications && Array.isArray(data.applications)) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === appId
              ? {
                  ...app,
                  status: newStatus as any,
                  updatedAt: new Date().toISOString(),
                  logs: [
                    {
                      id: `log-${Date.now()}`,
                      step: 'STAGE_MOVED',
                      details: `Moved to ${newStatus} column.`,
                      createdAt: new Date().toISOString(),
                    },
                    ...app.logs,
                  ],
                }
              : app
          )
        );

        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp((prev) => (prev ? { ...prev, status: newStatus as any } : null));
        }

        showToast(`Moved application to ${newStatus}`);
      }
    } catch (err) {
      console.error('Error changing stage:', err);
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== appId));
        showToast('Application removed from CRM.');
      }
    } catch (err) {
      console.error('Error deleting application:', err);
    }
  };

  const handleMoveStage = (app: ApplicationItem, direction: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIdx = COLUMN_KEYS.indexOf(app.status);
    if (currentIdx === -1) return;

    const nextIdx = direction === 'right' ? currentIdx + 1 : currentIdx - 1;
    if (nextIdx >= 0 && nextIdx < COLUMN_KEYS.length) {
      handleStatusChange(app.id, COLUMN_KEYS[nextIdx]);
    }
  };

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    if (platformFilter !== 'ALL') {
      const p = (app.platform || '').toLowerCase();
      if (!p.includes(platformFilter.toLowerCase())) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = (app.title || '').toLowerCase().includes(q);
      const companyMatch = (app.company || '').toLowerCase().includes(q);
      const locMatch = (app.location || '').toLowerCase().includes(q);
      if (!titleMatch && !companyMatch && !locMatch) return false;
    }

    return true;
  });

  // Top Metrics
  const totalApps = applications.length;
  const activePipelines = applications.filter(
    (a) => a.status === 'APPLIED' || a.status === 'NEEDS_REVIEW' || a.status === 'INTERVIEW'
  ).length;
  const interviewsCount = applications.filter((a) => a.status === 'INTERVIEW').length;
  const offersCount = applications.filter((a) => a.status === 'OFFER').length;
  const responseRate = totalApps > 0 ? Math.round(((interviewsCount + offersCount) / totalApps) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Stats Banner */}
      <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Tracked</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalApps}</div>
          <div className="text-xs text-slate-400 mt-0.5">Across all platforms</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">Active Pipeline</div>
          <div className="text-2xl font-black text-indigo-700 mt-1">{activePipelines}</div>
          <div className="text-xs text-slate-400 mt-0.5">Applied / Screening / OA</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">Interviews Active</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{interviewsCount}</div>
          <div className="text-xs text-emerald-600 mt-0.5">High conversion roles</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-600">Offers Extended</div>
          <div className="text-2xl font-black text-teal-700 mt-1">{offersCount}</div>
          <div className="text-xs text-teal-600 mt-0.5">Package discussions</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600">Response Rate</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{responseRate}%</div>
          <div className="text-xs text-slate-400 mt-0.5">Interview / offer ratio</div>
        </div>
      </section>

      {/* Control Bar: Search, Filter & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search & Platform Filter */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by company or role in CRM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Platforms' },
              { id: 'linkedin', label: 'LinkedIn' },
              { id: 'indeed', label: 'Indeed' },
              { id: 'naukri', label: 'Naukri' },
              { id: 'instahyre', label: 'Instahyre' },
              { id: 'wellfound', label: 'Wellfound' },
              { id: 'greenhouse', label: 'Greenhouse' },
              { id: 'lever', label: 'Lever' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatformFilter(p.id)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                  platformFilter === p.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            title="Simulate inbound recruiter emails to test auto-stage advancement"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Simulate Recruiter Email</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Application</span>
          </button>

          <button
            onClick={fetchApplications}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Refresh CRM data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="overflow-x-auto pb-6">
        <div className="flex items-start gap-4 min-w-[1400px]">
          {COLUMNS.map((column) => {
            const ColumnIcon = column.icon;
            const columnApps = filteredApps.filter((a) => a.status === column.key);
            const currentColumnIdx = COLUMN_KEYS.indexOf(column.key);
            const hasPrev = currentColumnIdx > 0;
            const hasNext = currentColumnIdx < COLUMN_KEYS.length - 1;

            return (
              <div
                key={column.key}
                className="w-72 bg-slate-100/80 rounded-2xl p-3 border border-slate-200/80 flex flex-col shrink-0 min-h-[600px]"
              >
                {/* Column Header */}
                <div className={`p-3 rounded-xl mb-3 ${column.headerBg} border border-slate-200/70 flex items-center justify-between`}>
                  <div className="flex items-center space-x-2">
                    <ColumnIcon className="w-4 h-4 text-slate-700" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-tight">
                        {column.label}
                      </h3>
                      <p className="text-xs text-slate-500">{column.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-black ${column.badgeColor}`}>
                    {columnApps.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex-1 space-y-2.5 overflow-y-auto">
                  {columnApps.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                      <span className="text-xs font-medium text-slate-400">No applications</span>
                      <span className="text-xs text-slate-400 mt-0.5">Drop or move cards here</span>
                    </div>
                  ) : (
                    columnApps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => {
                          setSelectedApp(app);
                          setIsDrawerOpen(true);
                        }}
                        className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group space-y-2.5"
                      >
                        {/* Provider tag & score */}
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 text-xs font-bold uppercase rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {app.platform}
                          </span>
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 text-xs font-extrabold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Zap className="w-3 h-3 text-emerald-600 fill-current" />
                            <span>{app.matchScore}%</span>
                          </span>
                        </div>

                        {/* Title & Company */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                            {app.title}
                          </h4>
                          <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-semibold mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{app.company}</span>
                          </div>
                        </div>

                        {/* Compensation or Location */}
                        <div className="text-xs text-slate-500 flex items-center space-x-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{app.location || 'Remote'}</span>
                        </div>

                        {app.salary && (
                          <div className="text-xs font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/80 truncate flex items-center space-x-1">
                            <Banknote className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{app.salary}</span>
                          </div>
                        )}

                        {/* Footer Controls & Move Buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                          <span>
                            {app.appliedAt
                              ? new Date(app.appliedAt).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'Queued'}
                          </span>

                          <div className="flex items-center space-x-1">
                            {hasPrev && (
                              <button
                                onClick={(e) => handleMoveStage(app, 'left', e)}
                                title="Move back stage"
                                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {hasNext && (
                              <button
                                onClick={(e) => handleMoveStage(app, 'right', e)}
                                title="Move forward stage"
                                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide-over Application Details Drawer */}
      <ApplicationDetailsDrawer
        application={selectedApp}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusChange={handleStatusChange}
        onDeleteApplication={handleDeleteApplication}
      />

      {/* Recruiter Email Sync Simulator Modal */}
      <InboundEmailSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onEmailProcessed={fetchApplications}
      />

      {/* Add External Application Modal */}
      <AddApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdded={fetchApplications}
      />
    </div>
  );
};

export default KanbanBoard;

