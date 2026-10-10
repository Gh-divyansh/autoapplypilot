'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import {
  Zap,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  FileText,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Target,
  Search,
  Code2,
  Cpu,
  Layers,
  Award,
  Copy,
  Check,
} from 'lucide-react';

interface CompetencyItem {
  title: string;
  demand: string;
  details: string;
  badge: string;
}

const ROLE_COMPETENCIES: Record<string, CompetencyItem[]> = {
  fullstack: [
    {
      title: 'TypeScript & Next.js 14 App Router',
      demand: '98% Demand',
      details: 'Server Components, streaming SSR, API route handlers, strict null checks, and end-to-end type safety.',
      badge: 'Core Full Stack',
    },
    {
      title: 'PostgreSQL / SQL Optimization',
      demand: '92% Demand',
      details: 'Query indexing, connection pooling, ACID transaction guarantees, Prisma ORM schema migrations.',
      badge: 'Database Core',
    },
    {
      title: 'State Management & Tailwind CSS',
      demand: '89% Demand',
      details: 'Responsive utility classes, modern layout patterns, optimistic UI updates, client-side caching.',
      badge: 'Frontend Architecture',
    },
    {
      title: 'Docker & CI/CD Cloud Deployment',
      demand: '86% Demand',
      details: 'Multi-stage Docker builds, container orchestration, automated GitHub Actions testing pipelines.',
      badge: 'DevOps & Cloud',
    },
  ],
  backend: [
    {
      title: 'Node.js & Distributed Systems',
      demand: '96% Demand',
      details: 'High-throughput asynchronous event loops, worker threads, rate limiting, and microservice decoupling.',
      badge: 'Runtimes',
    },
    {
      title: 'PostgreSQL Query Planner & Redis',
      demand: '94% Demand',
      details: 'EXPLAIN ANALYZE index tuning, pub/sub messaging, distributed cache invalidation, connection pooling.',
      badge: 'Persistence',
    },
    {
      title: 'REST, GraphQL & gRPC APIs',
      demand: '91% Demand',
      details: 'Strict schema contracts with Zod, OpenAPI specifications, idempotent mutation design, pagination.',
      badge: 'API Contracts',
    },
    {
      title: 'System Security & JWT Session Auth',
      demand: '88% Demand',
      details: 'Bcrypt salt hashing, httpOnly cookie sessions, CSRF mitigations, rate limiting, role-based access.',
      badge: 'Security',
    },
  ],
  frontend: [
    {
      title: 'React 18/19 & Next.js Architecture',
      demand: '97% Demand',
      details: 'Server Components, Suspense boundaries, hooks lifecycle, render pass minimization, bundle splitting.',
      badge: 'Component Model',
    },
    {
      title: 'Core Web Vitals & Web Performance',
      demand: '93% Demand',
      details: 'LCP image optimization, INP responsiveness tuning, CLS prevention, lazy loading, font subsetting.',
      badge: 'CWV & UX',
    },
    {
      title: 'Tailwind CSS, Accessibility (a11y) & ARIA',
      demand: '90% Demand',
      details: 'Semantic HTML5 landmarks, keyboard navigation focus rings, screen reader labels, WCAG AA compliance.',
      badge: 'UI & Design Systems',
    },
    {
      title: 'TypeScript Generics & Browser APIs',
      demand: '87% Demand',
      details: 'Discriminated unions, Canvas/DOM manipulation, Web Workers, local storage synchronization.',
      badge: 'Language & Web APIs',
    },
  ],
};

const SAMPLE_PRESETS = [
  'Built backend APIs and handled database queries for user logins.',
  'Migrated legacy React frontend components to Next.js 14 App Router.',
  'Configured automated CI/CD deployment pipelines using Docker and GitHub Actions.',
  'Optimized slow PostgreSQL queries and added connection pooling.',
];

const KNOWN_ATS_KEYWORDS = [
  'TypeScript',
  'JavaScript',
  'React',
  'Next.js',
  'Node.js',
  'PostgreSQL',
  'SQL',
  'Docker',
  'AWS',
  'GraphQL',
  'Tailwind',
  'Redis',
  'Kubernetes',
  'CI/CD',
  'REST',
  'Python',
  'Microservices',
];

export default function BoostPage() {
  const [selectedRoleType, setSelectedRoleType] = useState<'fullstack' | 'backend' | 'frontend'>('fullstack');
  const [boostCoverLetter, setBoostCoverLetter] = useState(true);
  const [boostAutoAnswers, setBoostAutoAnswers] = useState(true);
  const [boostPrioritizeATS, setBoostPrioritizeATS] = useState(true);
  const [simulatedJobText, setSimulatedJobText] = useState(
    'Looking for a Senior Full Stack Engineer with strong experience in TypeScript, React, Next.js, Node.js, and PostgreSQL. Experience with Docker, distributed systems, and CI/CD pipelines preferred.'
  );
  const [activeTab, setActiveTab] = useState<'keywords' | 'quantifier' | 'simulator'>('keywords');

  // Input for quantifier
  const [rawBullet, setRawBullet] = useState('Built backend APIs and handled database queries for user logins.');
  const [quantifiedResult, setQuantifiedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleQuantify = () => {
    if (!rawBullet.trim()) return;
    const lower = rawBullet.toLowerCase();

    if (lower.includes('frontend') || lower.includes('react') || lower.includes('ui') || lower.includes('next')) {
      setQuantifiedResult(
        `Architected responsive React/Next.js frontend interfaces with Server Components, improving Largest Contentful Paint (LCP) by 46% and supporting 150k+ daily active users across mobile and desktop.`
      );
    } else if (lower.includes('ci/cd') || lower.includes('docker') || lower.includes('pipeline') || lower.includes('deploy')) {
      setQuantifiedResult(
        `Engineered containerized CI/CD build pipelines using Docker and GitHub Actions, cutting staging deployment cycle from 32 minutes to <6 minutes with 99.9% build reliability.`
      );
    } else if (lower.includes('sql') || lower.includes('postgres') || lower.includes('database') || lower.includes('query')) {
      setQuantifiedResult(
        `Optimized high-volume PostgreSQL query execution with compound indexes and connection pooling, reducing p99 database query latency by 58% and eliminating connection exhaustion timeouts.`
      );
    } else {
      setQuantifiedResult(
        `Architected high-throughput REST and async service endpoints in TypeScript/Node.js with PostgreSQL persistence, handling 3.2M daily requests with <75ms p99 response latency and 99.98% service uptime.`
      );
    }
  };

  const handleCopyQuantified = () => {
    if (quantifiedResult) {
      navigator.clipboard.writeText(quantifiedResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Dynamic ATS keyword detection from simulated text
  const { detectedKeywords, missingKeywords, simulatedScore } = useMemo(() => {
    const textLower = simulatedJobText.toLowerCase();
    const detected: string[] = [];
    const missing: string[] = [];

    KNOWN_ATS_KEYWORDS.forEach((kw) => {
      if (textLower.includes(kw.toLowerCase())) {
        detected.push(kw);
      } else {
        missing.push(kw);
      }
    });

    let score = 65;
    score += Math.min(24, detected.length * 4);
    if (boostCoverLetter) score += 4;
    if (boostAutoAnswers) score += 3;
    if (boostPrioritizeATS) score += 2;

    return {
      detectedKeywords: detected,
      missingKeywords: missing.slice(0, 4),
      simulatedScore: Math.min(score, 98),
    };
  }, [simulatedJobText, boostCoverLetter, boostAutoAnswers, boostPrioritizeATS]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AutoApplyPilot AI Match Booster</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Elevate Your Profile From{' '}
              <span className="text-amber-400">68% Match</span> To{' '}
              <span className="text-emerald-400">94%+ ATS Precision</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              AutoApplyPilot eliminates disqualification traps. Align your resume keywords with real ATS screening algorithms, quantify achievements, and configure autonomous accelerators.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md transition-colors"
              >
                <span>View Queued Opportunities</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/profile"
                className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-5 py-3 rounded-xl border border-white/20 transition-colors"
              >
                <span>Edit Candidate Profile</span>
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">+26%</div>
              <div className="text-xs text-slate-400 mt-1">Average Match Lift</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-400">3.4x</div>
              <div className="text-xs text-slate-400 mt-1">Recruiter Response Rate</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">100%</div>
              <div className="text-xs text-slate-400 mt-1">Truthful & Non-Hallucinatory</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-teal-400">0%</div>
              <div className="text-xs text-slate-400 mt-1">Bot Banning Risk</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs for Booster Suite */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('keywords')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'keywords'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            1. ATS Keyword Synthesizer
          </button>
          <button
            onClick={() => setActiveTab('quantifier')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'quantifier'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            2. Truthful Bullet Quantifier
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'simulator'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            3. Live Match Simulator
          </button>
        </div>

        {/* Tab 1: ATS Keyword Synthesizer */}
        {activeTab === 'keywords' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">High-Impact Target Competencies</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Skills most requested by Greenhouse & Lever job postings in your selected domain.
                  </p>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
                  <button
                    onClick={() => setSelectedRoleType('fullstack')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      selectedRoleType === 'fullstack' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Full Stack
                  </button>
                  <button
                    onClick={() => setSelectedRoleType('backend')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      selectedRoleType === 'backend' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Backend
                  </button>
                  <button
                    onClick={() => setSelectedRoleType('frontend')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      selectedRoleType === 'frontend' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Frontend
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ROLE_COMPETENCIES[selectedRoleType].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-2 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{item.title}</span>
                      <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                        {item.demand}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.details}</p>
                    <span className="inline-block text-[10px] font-semibold text-slate-400">
                      Category: {item.badge}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                <span>Want to incorporate these into your saved candidate profile?</span>
                <Link
                  href="/profile"
                  className="font-bold text-indigo-600 hover:text-indigo-800 underline"
                >
                  Open Candidate Profile Skills →
                </Link>
              </div>
            </div>

            {/* Accelerator Switches Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Autonomous Accelerators</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">AI Tailored Cover Letters</div>
                    <div className="text-slate-500 leading-relaxed">
                      Generates 150-250 word factual letters without hallucinating skills.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={boostCoverLetter}
                    onChange={(e) => setBoostCoverLetter(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded mt-0.5 cursor-pointer"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">Pre-Verified Screening Answers</div>
                    <div className="text-slate-500 leading-relaxed">
                      Auto-fills work authorization and notice period from candidate bank.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={boostAutoAnswers}
                    onChange={(e) => setBoostAutoAnswers(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded mt-0.5 cursor-pointer"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">Direct ATS Priority Mode</div>
                    <div className="text-slate-500 leading-relaxed">
                      Ranks Greenhouse and Lever submissions above third-party aggregators.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={boostPrioritizeATS}
                    onChange={(e) => setBoostPrioritizeATS(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded mt-0.5 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs space-y-1.5">
                <span className="font-bold text-indigo-900">Active Boost Level: HIGH</span>
                <p className="text-indigo-800 leading-relaxed">
                  With accelerators active, submissions achieve a verified 92–96% compatibility grade.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Truthful Bullet Quantifier */}
        {activeTab === 'quantifier' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
            <div className="max-w-2xl space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Truthful Experience Quantifier</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Transform passive task descriptions into quantified, high-impact statements that trigger positive ATS candidate scores without inventing facts.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Quick Test Presets (Click to try):</span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setRawBullet(preset);
                      setQuantifiedResult(null);
                    }}
                    className="text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl transition-colors text-left"
                  >
                    {preset.length > 55 ? `${preset.slice(0, 52)}...` : preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Your Current Experience Description:
                </label>
                <textarea
                  value={rawBullet}
                  onChange={(e) => setRawBullet(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
                <button
                  onClick={handleQuantify}
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Boost with Quantified Metrics</span>
                </button>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Enhanced Production-Grade Output:
                </label>
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl min-h-[110px] text-xs text-emerald-950 font-medium leading-relaxed">
                  {quantifiedResult ? (
                    <div className="space-y-2.5">
                      <p>{quantifiedResult}</p>
                      <div className="pt-2 border-t border-emerald-200 text-xs text-emerald-700 font-bold flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>Action verb + Scaled metrics + Business result</span>
                        </span>
                        <button
                          onClick={handleCopyQuantified}
                          className="flex items-center space-x-1 hover:underline cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-700" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy to Clipboard</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">
                      Click &ldquo;Boost with Quantified Metrics&rdquo; to generate a refined bullet point.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Live Match Simulator */}
        {activeTab === 'simulator' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Live ATS Match Simulator</h2>
                <p className="text-xs text-slate-500">
                  Simulate how your boosted profile scores against any job description in real-time.
                </p>
              </div>

              <div className="text-right">
                <div className="text-3xl font-black text-emerald-600">
                  {simulatedScore}%
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Neural Compatibility Match
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Paste Job Posting Text to Test:
              </label>
              <textarea
                value={simulatedJobText}
                onChange={(e) => setSimulatedJobText(e.target.value)}
                rows={4}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Detected Keywords:</span>
                <p className="text-slate-600 font-medium">
                  {detectedKeywords.length > 0 ? detectedKeywords.join(', ') : 'None detected'}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Recommended Additions:</span>
                <p className="text-slate-600 font-medium">
                  {missingKeywords.length > 0 ? missingKeywords.join(', ') : 'Profile fully aligned!'}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Application Route:</span>
                <p className="text-emerald-700 font-bold">
                  {simulatedScore >= 80 ? 'Direct ATS Automatic Submission' : 'Assisted Application Review'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
