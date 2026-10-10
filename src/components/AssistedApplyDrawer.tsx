'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Zap,
  Compass,
  FileText,
  Printer,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { JobCardProps } from './JobCard';
import { TailoredResumeModal } from './TailoredResumeModal';
import { TailoredResumeResult } from '@/lib/ai/resume-tailor';
import { resolveDirectJobUrl } from '@/lib/direct-job-url';

interface AssistedApplyDrawerProps {
  job: JobCardProps | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (jobId: string, newStatus: string) => void;
  candidateName?: string;
}

export const AssistedApplyDrawer: React.FC<AssistedApplyDrawerProps> = ({
  job,
  isOpen,
  onClose,
  onStatusChange,
  candidateName,
}) => {
  const [activeTab, setActiveTab] = useState<'ANALYSIS' | 'RESUME' | 'COVER_LETTER' | 'QUESTIONS'>('ANALYSIS');
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedAnswerId, setCopiedAnswerId] = useState<string | null>(null);
  const [loadingKit, setLoadingKit] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>(job?.status || 'DISCOVERED');

  // ATS Resume state
  const [tailoredResume, setTailoredResume] = useState<TailoredResumeResult | null>(null);
  const [loadingResume, setLoadingResume] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  useEffect(() => {
    if (job) {
      setCurrentStatus(job.status);
      setLoadingKit(true);
      setLoadingResume(true);

      // Fetch or generate application kit
      fetch(`/api/applications/${job.id || 'temp'}/generate-kit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company,
          description: job.company + ' is hiring a ' + job.title,
          candidateName: candidateName,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.coverLetter) setCoverLetterText(data.coverLetter);
          if (data.answers) setQuestions(data.answers);
        })
        .catch(() => {})
        .finally(() => setLoadingKit(false));

      // Fetch or generate tailored ATS resume
      fetch(`/api/applications/${job.id || 'temp'}/tailor-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company,
          description: job.company + ' is hiring a ' + job.title,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.tailoredResume) setTailoredResume(data.tailoredResume);
        })
        .catch(() => {})
        .finally(() => setLoadingResume(false));
    }
  }, [job, candidateName]);

  if (!isOpen || !job) return null;

  const copyToClipboard = (text: string, isLetter = false, answerId?: string) => {
    navigator.clipboard.writeText(text);
    if (isLetter) {
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2000);
    }
    if (answerId) {
      setCopiedAnswerId(answerId);
      setTimeout(() => setCopiedAnswerId(null), 2000);
    }
  };

  const handleCopyResumeText = () => {
    if (!tailoredResume) return;
    const text = [
      tailoredResume.candidateInfo.fullName.toUpperCase(),
      `${tailoredResume.candidateInfo.email} | ${tailoredResume.candidateInfo.phone}`,
      '',
      'PROFESSIONAL SUMMARY',
      tailoredResume.professionalSummary,
      '',
      'CORE TECHNICAL COMPETENCIES',
      `Languages & Frameworks: ${tailoredResume.categorizedSkills.languagesAndFrameworks.join(', ')}`,
      `Cloud & Infra: ${tailoredResume.categorizedSkills.cloudAndInfrastructure.join(', ')}`,
      `Databases & Tools: ${tailoredResume.categorizedSkills.databasesAndTools.join(', ')}`,
      '',
      'EXPERIENCE',
      ...tailoredResume.experience.flatMap((exp) => [
        `${exp.role} - ${exp.company} (${exp.period})`,
        ...exp.bulletPoints.map((b) => `• ${b}`),
      ]),
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedResume(true);
    setTimeout(() => setCopiedResume(false), 2000);
  };

  const handleMarkApplied = async () => {
    const nextStatus = 'APPLIED';
    setCurrentStatus(nextStatus);
    if (job.id && onStatusChange) {
      onStatusChange(job.id, nextStatus);
    }

    try {
      await fetch(`/api/applications/${job.id || 'temp'}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          details: 'User marked application as submitted via Assisted Drawer.',
        }),
      });
    } catch (e) {}
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
        <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 inline-flex items-center gap-1.5">
                    {job.mode === 'AUTOMATIC' ? (
                      <>
                        <Zap className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Direct ATS Integration</span>
                      </>
                    ) : (
                      <>
                        <Compass className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Assisted Apply Mode</span>
                      </>
                    )}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {currentStatus}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{job.title}</h2>
                <p className="text-sm font-medium text-slate-600">
                  {job.company} • {job.location || 'Remote'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-2 mt-6 border-b border-slate-100 pb-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab('ANALYSIS')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shrink-0 ${
                  activeTab === 'ANALYSIS'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Fit Analysis ({job.score}%)
              </button>
              <button
                onClick={() => setActiveTab('RESUME')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shrink-0 inline-flex items-center gap-1.5 ${
                  activeTab === 'RESUME'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Tailored ATS Resume</span>
                {tailoredResume && (
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 font-semibold">
                    {tailoredResume.atsScore}%
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('COVER_LETTER')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shrink-0 ${
                  activeTab === 'COVER_LETTER'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tailored Cover Letter
              </button>
              <button
                onClick={() => setActiveTab('QUESTIONS')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shrink-0 ${
                  activeTab === 'QUESTIONS'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Screening Q&A Kit
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {activeTab === 'ANALYSIS' && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Relevance Score</div>
                    <div className="text-3xl font-extrabold text-slate-900 mt-0.5">{job.score}% Compatibility</div>
                  </div>
                  <div
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      job.score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {job.score >= 80 ? 'High Match' : 'Moderate Match'}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Matching Competencies</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(job.matchedSkills || ['TypeScript', 'React', 'Node.js']).map((s, idx) => (
                      <span
                        key={idx}
                        className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-2.5 py-1 rounded-md font-medium inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{s}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Missing / Secondary Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(job.missingSkills && job.missingSkills.length > 0 ? job.missingSkills : ['GraphQL']).map((s, idx) => (
                      <span
                        key={idx}
                        className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-2.5 py-1 rounded-md font-medium inline-flex items-center gap-1"
                      >
                        <X className="w-3 h-3 text-rose-600 shrink-0" />
                        <span>{s}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Pilot Recommendation
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Candidate profile demonstrates solid alignment with core stack requirements. Use the prefilled kit to apply.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'RESUME' && (
              <div className="space-y-4">
                {loadingResume ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-medium text-slate-600">Tailoring ATS resume for {job.company}...</p>
                  </div>
                ) : tailoredResume ? (
                  <div className="space-y-4">
                    {/* Resume Quick Stats Bar */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">ATS Score</div>
                        <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
                          <span>{tailoredResume.atsScore}%</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {tailoredResume.atsAnalysis.strengthLevel}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopyResumeText}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          {copiedResume ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedResume ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          onClick={() => setIsResumeModalOpen(true)}
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View & Print PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* Matched Keywords Chips */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ATS Matched Keywords</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tailoredResume.atsAnalysis.matchedKeywords.map((kw, i) => (
                          <span key={i} className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-2.5 py-0.5 rounded-md font-medium">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Targeted Summary Preview */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                      <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tailored Summary</div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {tailoredResume.professionalSummary}
                      </p>
                    </div>

                    {/* Categorized Skills */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                      <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Prioritized Skills Hierarchy</div>
                      <div className="text-xs space-y-1 text-slate-700">
                        <div>
                          <strong className="text-slate-900">Languages & Frameworks: </strong>
                          {tailoredResume.categorizedSkills.languagesAndFrameworks.join(', ')}
                        </div>
                        <div>
                          <strong className="text-slate-900">Cloud & Infra: </strong>
                          {tailoredResume.categorizedSkills.cloudAndInfrastructure.join(', ')}
                        </div>
                        <div>
                          <strong className="text-slate-900">Databases & Tools: </strong>
                          {tailoredResume.categorizedSkills.databasesAndTools.join(', ')}
                        </div>
                      </div>
                    </div>

                    {/* Experience Bullets Preview */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tailored Experience Highlights</div>
                      {tailoredResume.experience.slice(0, 2).map((exp, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-900">
                            <span>{exp.role} — {exp.company}</span>
                            <span className="text-slate-500 font-normal">{exp.period}</span>
                          </div>
                          <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5">
                            {exp.bulletPoints.slice(0, 2).map((bullet, bIdx) => (
                              <li key={bIdx}>{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Failed to tailor resume. Please try again.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'COVER_LETTER' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Factual, truthful letter generated from your verified candidate profile.
                  </span>
                  <button
                    onClick={() => copyToClipboard(coverLetterText, true)}
                    className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    {copiedLetter ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLetter ? 'Copied to Clipboard!' : 'Copy Letter'}</span>
                  </button>
                </div>

                <textarea
                  value={coverLetterText}
                  onChange={(e) => setCoverLetterText(e.target.value)}
                  rows={12}
                  className="w-full text-xs font-sans p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed text-slate-800"
                />
              </div>
            )}

            {activeTab === 'QUESTIONS' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Pre-verified answers to common screening questions. Click copy to paste into the application form.
                </p>

                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800">{q.question}</span>
                        <button
                          onClick={() => copyToClipboard(q.answer, false, q.questionId || String(idx))}
                          className="text-slate-500 hover:text-slate-900 p-1 rounded hover:bg-slate-200 transition-colors shrink-0"
                          title="Copy answer"
                        >
                          {copiedAnswerId === (q.questionId || String(idx)) ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-indigo-950 font-medium bg-white p-2.5 rounded-lg border border-slate-200/60">
                        {q.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
            <button
              onClick={handleMarkApplied}
              disabled={currentStatus === 'APPLIED'}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                currentStatus === 'APPLIED'
                  ? 'bg-emerald-100 text-emerald-800 cursor-default'
                  : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{currentStatus === 'APPLIED' ? 'Status: Applied' : 'Mark as Applied'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsResumeModalOpen(true)}
                className="flex items-center space-x-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>ATS Resume</span>
              </button>

              {(job.externalUrl || job.title) && (
                <a
                  href={resolveDirectJobUrl({
                    id: job.id,
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    sourceProvider: job.sourceProvider,
                    externalUrl: job.externalUrl,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Open direct job application on ${job.company}`}
                  className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  <span>Open Application on Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Printable ATS Resume Modal */}
      <TailoredResumeModal
        resume={tailoredResume}
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        isLoading={loadingResume}
      />
    </>
  );
};

export default AssistedApplyDrawer;
