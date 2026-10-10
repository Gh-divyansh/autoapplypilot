'use client';

import React from 'react';
import Link from 'next/link';
import {
  Zap,
  ShieldCheck,
  Sparkles,
  FileText,
  Mail,
  CheckCircle2,
  ArrowRight,
  Globe,
  Building2,
  Lock,
  BarChart3,
  ExternalLink,
  Check,
  X,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* 1. Header Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-indigo-700 transition-colors">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 leading-tight">
                AutoApplyPilot
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Compliant AI Job Automation
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              Core Pillars
            </a>
            <a href="#compliance" className="hover:text-indigo-600 transition-colors">
              Compliance Guarantee
            </a>
            <a href="#workflow" className="hover:text-indigo-600 transition-colors">
              How It Works
            </a>
            <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
              Live Queue
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex items-center space-x-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-xs transition-colors"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-6 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Compliance-First AI • Zero Bot Banning Risk</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            High-Impact Job Applications.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Powered by Truthful AI.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            AutoApplyPilot discovers real jobs across official ATS platforms, scores compatibility (0–100), extracts your PDF CV with Gemini, and generates tailored cover letters with 1-click Assisted Apply.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <span>Start Free with Your CV</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold px-6 py-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
            >
              <span>Explore Live Dashboard</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-500">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Official Greenhouse & Lever APIs</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No CAPTCHA / Bot Bypassing</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Direct PDF CV Ingestion</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tailored 150-300 Word Cover Letters</span>
            </span>
          </div>
        </div>
      </section>

      {/* 3. Live Product Preview Card */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 inline-flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  Direct ATS Mode
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  Fully Remote
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                Senior Systems Engineer — Distributed Cloud Architecture
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Cloudflare, Inc. • Enterprise Public Job Board
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-600 leading-none">94%</div>
                <div className="text-xs uppercase tracking-wider font-bold text-slate-400">Relevance Match</div>
              </div>
              <Link
                href="/dashboard"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-xs"
              >
                Launch Assisted Kit
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-xs">
                Competency Gap Analysis
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  TypeScript (5+ yrs)
                </span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  PostgreSQL / Distributed SQL
                </span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  Microservices & Edge APIs
                </span>
                <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1">
                  <X className="w-3 h-3 text-rose-600 shrink-0" />
                  GraphQL Subscriptions
                </span>
              </div>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed text-xs">
                Pilot Reasoning: Exceptional alignment with core backend stack and serverless runtime architectures. Candidate verified work authorization matches employer parameters.
              </p>
            </div>

            <div className="space-y-3">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-xs">
                Tailored Cover Letter Snippet
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 font-sans text-slate-700 leading-relaxed text-xs space-y-2">
                <p>
                  &ldquo;Dear Hiring Team at Cloudflare, I am writing to express my interest in the Senior Systems Engineer position. Having architected high-throughput microservices handling 5M daily requests on TypeScript and PostgreSQL, my experience aligns directly with your mission...&rdquo;
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 text-[10px] text-slate-400">
                  <span>184 words • Truthful & Non-hallucinatory</span>
                  <span className="text-indigo-600 font-bold">1-Click Clipboard Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Pillars */}
      <section id="features" className="bg-white py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest font-extrabold text-indigo-600 mb-2">
              Engineering Architecture
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Built Different: Quality, Transparency & Zero Spam
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Unlike generic bot clickers that spam 500 resumes and trigger blacklists, AutoApplyPilot operates with compliance, precision, and verified candidate data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">1. Compliance First</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strict adherence to platform terms. Automated API submissions for Greenhouse/Lever, and deep-link Assisted Kits for LinkedIn and Indeed.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">2. Hybrid AI Matcher</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deterministic pre-filters eliminate non-qualifying jobs instantly. Gemini evaluates remaining postings with XML boundary defense against prompt injection.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">3. Factual Cover Letters</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates concise, role-specific letters (150-300 words) using only verified facts from your uploaded PDF resume without inventing experience.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">4. Recruiter Intelligence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Incoming communications are classified by AI to detect interview requests, technical challenges, and rejections, keeping your funnel synchronized.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Metrics & Conversion */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-wrap items-center justify-between gap-8 shadow-xl">
            <div className="max-w-xl space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Stop Spamming. Start Interviewing.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Submitting 20 highly-aligned, truthful applications with verified answers delivers far higher response rates than 500 low-quality bot submissions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-center">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400">38.9%</div>
                <div className="text-xs text-slate-300 mt-0.5">Average Response Rate</div>
              </div>
              <div className="w-px h-12 bg-slate-700 hidden sm:block" />
              <div>
                <div className="text-3xl sm:text-4xl font-black text-indigo-400">22.2%</div>
                <div className="text-xs text-slate-300 mt-0.5">Interview Conversion</div>
              </div>
              <div className="w-px h-12 bg-slate-700 hidden sm:block" />
              <div>
                <div className="text-3xl sm:text-4xl font-black text-white">&ge; 70%</div>
                <div className="text-xs text-slate-300 mt-0.5">Quality Gate Threshold</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900">AutoApplyPilot</span>
            <span>• Compliance-First AI Automation Platform</span>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="hover:text-slate-900">
              Dashboard
            </Link>
            <Link href="/profile" className="hover:text-slate-900">
              Candidate Profile
            </Link>
            <Link href="/analytics" className="hover:text-slate-900">
              Funnel Analytics
            </Link>
            <Link href="/login" className="hover:text-slate-900">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

