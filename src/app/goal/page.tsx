'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import {
  Target,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Building2,
  DollarSign,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  Compass,
  CheckCircle,
  Filter,
  Check,
} from 'lucide-react';

interface DreamCompany {
  id: string;
  name: string;
  role: string;
  status: 'WISHLIST' | 'APPLIED' | 'INTERVIEW' | 'OFFER';
}

export default function GoalPage() {
  const [weeklyTarget, setWeeklyTarget] = useState(20);
  const [currentWeeklyCount, setCurrentWeeklyCount] = useState(14);
  const [targetCompensation, setTargetCompensation] = useState('18 LPA');
  const [minFloorCompensation, setMinFloorCompensation] = useState('14 LPA');
  const [targetTimelineDays, setTargetTimelineDays] = useState(30);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WISHLIST' | 'APPLIED' | 'INTERVIEW' | 'OFFER'>('ALL');

  const [dreamCompanies, setDreamCompanies] = useState<DreamCompany[]>([
    { id: 'dc-1', name: 'Cloudflare', role: 'Senior Systems Engineer', status: 'APPLIED' },
    { id: 'dc-2', name: 'Stripe', role: 'Backend Engineer', status: 'WISHLIST' },
    { id: 'dc-3', name: 'Razorpay', role: 'Full Stack Engineer', status: 'INTERVIEW' },
    { id: 'dc-4', name: 'Atlassian', role: 'Platform Engineer', status: 'WISHLIST' },
  ]);

  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyRole, setNewCompanyRole] = useState('');

  // Sync with candidate profile preferences if available
  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          if (data.profile.expectedSalary) setTargetCompensation(data.profile.expectedSalary);
          if (data.profile.minSalaryFloor) setMinFloorCompensation(data.profile.minSalaryFloor);
        }
      })
      .catch(() => {});
  }, []);

  const addDreamCompany = () => {
    if (!newCompanyName.trim()) return;
    setDreamCompanies([
      ...dreamCompanies,
      {
        id: `dc-${Date.now()}`,
        name: newCompanyName.trim(),
        role: newCompanyRole.trim() || 'Software Engineer',
        status: 'WISHLIST',
      },
    ]);
    setNewCompanyName('');
    setNewCompanyRole('');
  };

  const removeDreamCompany = (id: string) => {
    setDreamCompanies(dreamCompanies.filter((c) => c.id !== id));
  };

  const cycleCompanyStatus = (id: string) => {
    const cycleMap: Record<DreamCompany['status'], DreamCompany['status']> = {
      WISHLIST: 'APPLIED',
      APPLIED: 'INTERVIEW',
      INTERVIEW: 'OFFER',
      OFFER: 'WISHLIST',
    };

    setDreamCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: cycleMap[c.status] } : c))
    );
  };

  const handleIncrementWeeklyCount = () => {
    setCurrentWeeklyCount((prev) => Math.min(prev + 1, weeklyTarget * 2));
  };

  const handleDecrementWeeklyCount = () => {
    setCurrentWeeklyCount((prev) => Math.max(0, prev - 1));
  };

  const progressPercentage = Math.min(100, Math.round((currentWeeklyCount / weeklyTarget) * 100));

  const filteredCompanies = dreamCompanies.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <Target className="w-3.5 h-3.5" />
              <span>Career Trajectory & Goals Dashboard</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Target Milestones & Job Search Velocity
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Track your weekly application quota, compensation floors in LPA, dream company pipelines, and interview conversion milestones in one unified dashboard.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md transition-colors"
              >
                <span>Find Jobs Matching My Goals</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/profile"
                className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-5 py-3 rounded-xl border border-white/20 transition-colors"
              >
                <span>Update Profile Compensation Floor</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Milestone KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Weekly Quota
              </span>
              <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {progressPercentage}%
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-slate-900">
                {currentWeeklyCount} / {weeklyTarget}
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleDecrementWeeklyCount}
                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                  title="Decrement count"
                >
                  -
                </button>
                <button
                  onClick={handleIncrementWeeklyCount}
                  className="w-6 h-6 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                  title="Log completed application"
                >
                  +
                </button>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              {weeklyTarget > currentWeeklyCount ? (
                `${weeklyTarget - currentWeeklyCount} applications remaining to hit this week's quota.`
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Weekly application quota reached! Keep the momentum going.</span>
                </>
              )}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Target Compensation
            </div>
            <div className="text-3xl font-extrabold text-emerald-600">
              {targetCompensation}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Minimum Floor: <span className="font-bold text-slate-800">{minFloorCompensation}</span>
            </div>
            <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-100 font-semibold">
              Autonomous search filters out roles below {minFloorCompensation}.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Response Rate
            </div>
            <div className="text-3xl font-extrabold text-purple-600">
              38.9%
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Interview Conversion: <span className="font-bold text-slate-800">22.2%</span>
            </div>
            <p className="text-[11px] text-purple-700 bg-purple-50 p-2 rounded-xl border border-purple-100 font-semibold">
              Outperforming industry average benchmarks by 2.8x.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Search Horizon
            </div>
            <div className="text-3xl font-extrabold text-amber-600">
              {targetTimelineDays} Days
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Target Hire Window: <span className="font-bold text-slate-800">Next 4 Weeks</span>
            </div>
            <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-100 font-semibold">
              Balanced pacing active to maintain candidate quality.
            </p>
          </div>
        </div>

        {/* Goal Customizer & Dream Companies Wishlist */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wishlist */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Target Companies Wishlist</h2>
                <p className="text-xs text-slate-500">
                  Click any status pill to advance the company through your pipeline.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  All ({dreamCompanies.length})
                </button>
                <button
                  onClick={() => setStatusFilter('WISHLIST')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    statusFilter === 'WISHLIST' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Wishlist ({dreamCompanies.filter((c) => c.status === 'WISHLIST').length})
                </button>
                <button
                  onClick={() => setStatusFilter('APPLIED')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    statusFilter === 'APPLIED' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Applied ({dreamCompanies.filter((c) => c.status === 'APPLIED').length})
                </button>
                <button
                  onClick={() => setStatusFilter('INTERVIEW')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    statusFilter === 'INTERVIEW' ? 'bg-white text-purple-800 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Interview ({dreamCompanies.filter((c) => c.status === 'INTERVIEW').length})
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredCompanies.map((c) => (
                <div
                  key={c.id}
                  className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-500">{c.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => cycleCompanyStatus(c.id)}
                      title="Click to cycle status"
                      className={`text-[10px] uppercase font-black tracking-wider px-3 py-1 rounded-full cursor-pointer transition-transform hover:scale-105 ${
                        c.status === 'OFFER'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : c.status === 'INTERVIEW'
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : c.status === 'APPLIED'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-slate-200 text-slate-800 border border-slate-300'
                      }`}
                    >
                      {c.status} ↻
                    </button>
                    <button
                      onClick={() => removeDreamCompany(c.id)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                      title="Remove from target list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredCompanies.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No target employers currently in this status category.
                </div>
              )}
            </div>

            {/* Add Company Form */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Company Name (e.g. Vercel, Datadog)"
                className="w-full sm:flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
              />
              <input
                type="text"
                value={newCompanyRole}
                onChange={(e) => setNewCompanyRole(e.target.value)}
                placeholder="Target Role (e.g. Staff Engineer)"
                className="w-full sm:flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
              />
              <button
                onClick={addDreamCompany}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Target</span>
              </button>
            </div>
          </div>

          {/* Quota Settings Sidebar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">Search Strategy Preferences</h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Weekly Application Goal:
                </label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Compensation:
                </label>
                <input
                  type="text"
                  value={targetCompensation}
                  onChange={(e) => setTargetCompensation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Hard Minimum Salary Floor:
                </label>
                <input
                  type="text"
                  value={minFloorCompensation}
                  onChange={(e) => setMinFloorCompensation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Search Horizon (Days):
                </label>
                <input
                  type="number"
                  min={7}
                  max={180}
                  value={targetTimelineDays}
                  onChange={(e) => setTargetTimelineDays(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-emerald-950">Active Strategy Mode</span>
              <p className="text-emerald-800 leading-relaxed text-[11px]">
                High-relevance targeting active. Applications are automatically filtered to match your minimum floor of {minFloorCompensation}.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
