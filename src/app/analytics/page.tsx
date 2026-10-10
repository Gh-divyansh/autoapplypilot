'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Calendar,
  Briefcase,
  Target,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export default function AnalyticsPage() {
  const funnelStages = [
    { name: 'Discovered Opportunities', count: 52, percentage: 100, color: 'bg-indigo-500' },
    { name: 'Passed Quality Filter (Score ≥ 70%)', count: 31, percentage: 59.6, color: 'bg-blue-500' },
    { name: 'Applications Submitted', count: 18, percentage: 34.6, color: 'bg-sky-500' },
    { name: 'Recruiter Responses Received', count: 7, percentage: 13.5, color: 'bg-amber-500' },
    { name: 'Interviews Scheduled', count: 4, percentage: 7.7, color: 'bg-emerald-500' },
  ];

  const providerStats = [
    {
      provider: 'Greenhouse ATS',
      mode: 'AUTOMATIC',
      applied: 8,
      responses: 3,
      interviews: 2,
      responseRate: '37.5%',
      interviewRate: '25.0%',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      provider: 'Lever ATS',
      mode: 'AUTOMATIC',
      applied: 6,
      responses: 2,
      interviews: 1,
      responseRate: '33.3%',
      interviewRate: '16.7%',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    },
    {
      provider: 'LinkedIn (Assisted Kit)',
      mode: 'ASSISTED',
      applied: 3,
      responses: 1,
      interviews: 1,
      responseRate: '33.3%',
      interviewRate: '33.3%',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      provider: 'Indeed (Assisted Kit)',
      mode: 'ASSISTED',
      applied: 1,
      responses: 1,
      interviews: 0,
      responseRate: '100%',
      interviewRate: '0.0%',
      badgeColor: 'bg-slate-50 text-slate-800 border-slate-200',
    },
  ];

  const topSkillsDemand = [
    { skill: 'TypeScript', demand: 92 },
    { skill: 'React / Next.js', demand: 86 },
    { skill: 'PostgreSQL', demand: 78 },
    { skill: 'Node.js', demand: 72 },
    { skill: 'Docker', demand: 56 },
    { skill: 'GraphQL', demand: 44 },
    { skill: 'Kubernetes', demand: 32 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Application Funnel & Performance Analytics
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time conversion metrics, response tracking, and provider conversion effectiveness
          </p>
        </div>

        {/* 1. Top Headline KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Submitted
              </span>
              <Briefcase className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-slate-900">18</div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Score ≥ 70%
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Response Rate
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-emerald-600">38.9%</div>
              <span className="text-xs font-semibold text-slate-500">7 Replies</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Interviews Secured
              </span>
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-indigo-600">4</div>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                22.2% Conversion
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Average Match Score
              </span>
              <Target className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-amber-600">87.4%</div>
              <span className="text-xs font-semibold text-slate-500">Quality Gated</span>
            </div>
          </div>
        </section>

        {/* 2. Visual Funnel Conversion Progression */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Application Funnel Drop-off</h2>
              <p className="text-xs text-slate-500">
                Tracking candidate progression from initial crawler discovery to secured interviews
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              ● 22.2% Interview Win Rate
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {funnelStages.map((stage, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{stage.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-900 font-bold">{stage.count}</span>
                    <span className="text-slate-400">({stage.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${stage.color} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Provider Conversion Comparison Table */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Provider Source Performance</h2>
          <p className="text-xs text-slate-500">
            Comparing interview outcomes across direct ATS endpoints and assisted deep-link platforms
          </p>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Applied</th>
                  <th className="py-3 px-4">Responses</th>
                  <th className="py-3 px-4">Interviews</th>
                  <th className="py-3 px-4">Response Rate</th>
                  <th className="py-3 px-4">Interview Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {providerStats.map((stat, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{stat.provider}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${stat.badgeColor}`}>
                        {stat.mode}
                      </span>
                    </td>
                    <td className="py-3 px-4">{stat.applied}</td>
                    <td className="py-3 px-4">{stat.responses}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{stat.interviews}</td>
                    <td className="py-3 px-4">{stat.responseRate}</td>
                    <td className="py-3 px-4 font-bold text-indigo-600">{stat.interviewRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Skills Demand & Relevance Gap */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">High-Relevance Skill Demand Analysis</h2>
          </div>
          <p className="text-xs text-slate-500">
            Frequency of technical requirements observed across all analyzed job descriptions
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {topSkillsDemand.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{item.skill}</span>
                  <span className="text-indigo-600">{item.demand}% of jobs</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.demand}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
