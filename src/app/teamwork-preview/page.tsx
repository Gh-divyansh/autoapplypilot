'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import {
  Users,
  UserCheck,
  Share2,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Copy,
  ThumbsUp,
  Clock,
  Send,
  Plus,
  CheckSquare,
  Square,
  Check,
  Zap,
} from 'lucide-react';

interface JobKitPreview {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  coverLetter: string;
  authorization: string;
  noticePeriod: string;
}

const SAMPLE_KITS: JobKitPreview[] = [
  {
    id: 'cf-101',
    title: 'Senior Systems Engineer — Distributed Cloud Architecture',
    company: 'Cloudflare, Inc.',
    location: 'Remote',
    matchScore: 94,
    coverLetter: `Dear Cloudflare Engineering Team,\n\nI am writing to express my enthusiastic interest in the Senior Systems Engineer position. With extensive experience architecting high-throughput distributed microservices in TypeScript and Node.js with PostgreSQL persistence, my background aligns directly with your mission of building a secure, reliable global network.\n\nAt my previous positions, I optimized asynchronous API runtimes handling over 5M daily requests with <80ms p99 latency and implemented automated deployment verification pipelines. I look forward to contributing to Cloudflare's infrastructure goals.`,
    authorization: 'Authorized to work without sponsorship',
    noticePeriod: '30 days (notice buyout acceptable)',
  },
  {
    id: 'lev-202',
    title: 'Backend Software Engineer — Core Platform',
    company: 'Lever Tech',
    location: 'San Francisco, CA (Hybrid)',
    matchScore: 88,
    coverLetter: `Dear Lever Hiring Team,\n\nI am excited to apply for the Backend Software Engineer role. I bring proven experience engineering scalable REST and GraphQL data pipelines, tuning PostgreSQL query indexes, and containerizing distributed microservices with Docker.\n\nMy focus has consistently been on engineering reliable, type-safe backend systems with high test coverage and transparent error telemetry. I would love to bring these capabilities to Lever's core platform engineering team.`,
    authorization: 'Authorized to work without sponsorship',
    noticePeriod: 'Immediate to 15 days',
  },
];

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
}

interface ReferralItem {
  id: string;
  company: string;
  role: string;
  status: string;
  notes: string;
}

export default function TeamworkPreviewPage() {
  const [activeView, setActiveView] = useState<'candidate' | 'mentor' | 'referral'>('candidate');
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedKitIndex, setSelectedKitIndex] = useState(0);

  const [comments, setComments] = useState<string[]>([
    'Reviewer (Sarah): The microservices metrics in paragraph 2 align exceptionally well with Cloudflare’s tech stack.',
    'Mentor (David): Ensure you highlight the distributed SQL index optimization.',
  ]);
  const [newComment, setNewComment] = useState('');

  // Checklist states
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'chk-1',
      label: 'Factual Truthfulness',
      description: 'Every bullet matches actual accomplishments from candidate resume. Zero hallucinations.',
      checked: true,
    },
    {
      id: 'chk-2',
      label: 'Tone & Conciseness',
      description: 'Cover letter is between 150–250 words — optimal density preferred by technical hiring managers.',
      checked: true,
    },
    {
      id: 'chk-3',
      label: 'Compensation Alignment',
      description: 'Salary floor and requested compensation fit within company target budget bands.',
      checked: true,
    },
    {
      id: 'chk-4',
      label: 'Screening Answer Accuracy',
      description: 'Work authorization and notice period match candidate pre-verified answer bank.',
      checked: true,
    },
  ]);

  // Referral requests pipeline
  const [referrals, setReferrals] = useState<ReferralItem[]>([
    {
      id: 'ref-1',
      company: 'Cloudflare',
      role: 'Senior Systems Engineer',
      status: 'Alumni Matched (Awaiting Review)',
      notes: 'Referral request routed to 2 verified network alumni at Cloudflare',
    },
    {
      id: 'ref-2',
      company: 'Lever Tech',
      role: 'Backend Software Engineer',
      status: 'Referral Endorsement Confirmed',
      notes: 'Internal submission link verified by engineering lead',
    },
  ]);

  const [newRefCompany, setNewRefCompany] = useState('');
  const [newRefRole, setNewRefRole] = useState('');

  const currentKit = SAMPLE_KITS[selectedKitIndex] || SAMPLE_KITS[0];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://autoapplypilot.dev/review/kit-${currentKit.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments([...comments, `You: ${newComment.trim()}`]);
    setNewComment('');
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleAddReferral = () => {
    if (!newRefCompany.trim()) return;
    setReferrals([
      ...referrals,
      {
        id: `ref-${Date.now()}`,
        company: newRefCompany.trim(),
        role: newRefRole.trim() || 'Software Engineer',
        status: 'Request Dispatched',
        notes: 'Request broadcast to mutual engineering connections',
      },
    ]);
    setNewRefCompany('');
    setNewRefRole('');
  };

  const allChecksPassed = checklist.every((c) => c.checked);
  const checkedCount = checklist.filter((c) => c.checked).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>Teamwork & Mentorship Collaboration Hub</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Collaborative Application Reviews & Peer Referrals
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Don&apos;t apply into the void alone. Share your AI tailored application kits, verified answers, and cover letters with trusted mentors and peers before final submission.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedLink ? 'Review Link Copied!' : 'Copy Secure Review Invite Link'}</span>
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-5 py-3 rounded-xl border border-white/20 transition-colors"
              >
                <span>Back to Job Feed</span>
              </Link>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveView('candidate')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeView === 'candidate'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              1. Candidate Application Draft
            </button>
            <button
              onClick={() => setActiveView('mentor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeView === 'mentor'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              2. Mentor Review & Sign-Off ({checkedCount}/{checklist.length})
            </button>
            <button
              onClick={() => setActiveView('referral')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeView === 'referral'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              3. Peer Referral Network Pipeline ({referrals.length})
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive Teamwork Workspace Preview</span>
          </div>
        </div>

        {/* Tab 1: Candidate Draft View */}
        {activeView === 'candidate' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
              {/* Kit Switcher Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
                <span className="text-xs font-bold text-slate-700">Previewing Application Kit:</span>
                <div className="flex items-center space-x-2">
                  {SAMPLE_KITS.map((kit, idx) => (
                    <button
                      key={kit.id}
                      onClick={() => setSelectedKitIndex(idx)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        selectedKitIndex === idx
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {kit.company}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-indigo-600" />
                      Direct ATS Kit
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {currentKit.matchScore}% Compatibility
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">
                    {currentKit.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {currentKit.company} • {currentKit.location}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyLink}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'Copied' : 'Share Kit'}</span>
                  </button>
                </div>
              </div>

              {/* Cover Letter Draft */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  AI Tailored Cover Letter (Draft)
                </span>
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-800 leading-relaxed font-sans space-y-3 whitespace-pre-line">
                  {currentKit.coverLetter}
                </div>
              </div>

              {/* Pre-verified Screening Answers */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pre-Verified Answers
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-700 block mb-1">Work Authorization</span>
                    <span className="text-slate-600">{currentKit.authorization}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-700 block mb-1">Availability / Notice</span>
                    <span className="text-slate-600">{currentKit.noticePeriod}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Collaboration & Comments Sidebar */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-sm font-bold text-slate-900">Mentor Comments</h4>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                    {comments.length}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {comments.map((comment, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 leading-relaxed"
                    >
                      {comment}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Leave feedback or suggested edit..."
                    className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                  <button
                    onClick={handleAddComment}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Mentor Review & Sign-Off */}
        {activeView === 'mentor' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Reviewer Validation Checklist</h2>
                <p className="text-xs text-slate-500">
                  Verify each criterion before signing off on autonomous submission.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-700">Checklist Completion</div>
                  <div className="text-[11px] text-emerald-600 font-black">
                    {checkedCount} of {checklist.length} Verified
                  </div>
                </div>

                <button
                  disabled={!allChecksPassed}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-colors ${
                    allChecksPassed
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{allChecksPassed ? 'Application Kit Approved' : 'Complete All Checks to Approve'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                    item.checked
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="mt-0.5">
                    {item.checked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className={`text-xs font-bold block ${item.checked ? 'text-emerald-950' : 'text-slate-900'}`}>
                      {item.label}
                    </span>
                    <p className={`text-xs leading-relaxed ${item.checked ? 'text-emerald-800' : 'text-slate-500'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Referral Network Pipeline */}
        {activeView === 'referral' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Peer Referral Request Pipeline</h2>
                <p className="text-xs text-slate-500">
                  Request direct internal employee referrals for official ATS applications.
                </p>
              </div>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
                Referrals Yield 4.2x Interview Rate
              </span>
            </div>

            <div className="space-y-3">
              {referrals.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900">
                      {item.company} — {item.role}
                    </div>
                    <div className="text-[11px] text-slate-500">{item.notes}</div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 self-start sm:self-auto">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Add Referral Request Form */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={newRefCompany}
                onChange={(e) => setNewRefCompany(e.target.value)}
                placeholder="Target Company (e.g. Stripe, Uber)"
                className="w-full sm:flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
              />
              <input
                type="text"
                value={newRefRole}
                onChange={(e) => setNewRefRole(e.target.value)}
                placeholder="Target Position (e.g. Staff Full Stack Engineer)"
                className="w-full sm:flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
              />
              <button
                onClick={handleAddReferral}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Request Referral</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
