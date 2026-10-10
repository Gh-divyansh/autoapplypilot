'use client';

import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { TailoredResumeResult } from '@/lib/ai/resume-tailor';

interface TailoredResumeModalProps {
  resume: TailoredResumeResult | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export const TailoredResumeModal: React.FC<TailoredResumeModalProps> = ({
  resume,
  isOpen,
  onClose,
  isLoading = false,
}) => {
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyPlaintext = () => {
    if (!resume) return;

    const lines: string[] = [
      resume.candidateInfo.fullName.toUpperCase(),
      `${resume.candidateInfo.email} | ${resume.candidateInfo.phone} | ${resume.candidateInfo.location}`,
      resume.candidateInfo.links.map((l) => `${l.label}: ${l.url}`).join(' | '),
      '',
      'PROFESSIONAL SUMMARY',
      resume.professionalSummary,
      '',
      'CORE TECHNICAL COMPETENCIES',
      `Languages & Frameworks: ${resume.categorizedSkills.languagesAndFrameworks.join(', ')}`,
      `Cloud & Infrastructure: ${resume.categorizedSkills.cloudAndInfrastructure.join(', ')}`,
      `Databases & Tools: ${resume.categorizedSkills.databasesAndTools.join(', ')}`,
      '',
      'PROFESSIONAL EXPERIENCE',
      ...resume.experience.flatMap((exp) => [
        `${exp.role.toUpperCase()} | ${exp.company} (${exp.period}) - ${exp.location}`,
        ...exp.bulletPoints.map((b) => `• ${b}`),
        '',
      ]),
      'EDUCATION',
      ...resume.education.map((edu) => `${edu.degree} - ${edu.institution} (${edu.year})`),
    ];

    if (resume.certifications.length > 0) {
      lines.push('', 'CERTIFICATIONS', ...resume.certifications.map((c) => `• ${c}`));
    }

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      {/* Print Stylesheet injection for native single-page print */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ats-resume-printable-area, #ats-resume-printable-area * {
            visibility: visible;
          }
          #ats-resume-printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 18mm 14mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
            font-size: 10.5pt !important;
            line-height: 1.35 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Header (Hidden during print) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Dynamic ATS Resume Customizer</h3>
                {resume && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                    resume.atsScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    <span>{resume.atsScore}% ATS Match</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Tailored for {resume?.targetRole || 'Engineering Role'} at {resume?.targetCompany || 'Target Firm'} • Single-column ATS format
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPlaintext}
              disabled={isLoading || !resume}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={isLoading || !resume}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ATS Keywords & Insights Bar (Hidden during print) */}
        {resume && !isLoading && (
          <div className="bg-indigo-50/60 border-b border-indigo-100 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-indigo-900 inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Keyword Synergy:
              </span>
              {resume.atsAnalysis.matchedKeywords.slice(0, 6).map((kw, i) => (
                <span key={i} className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1">
                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                  <span>{kw}</span>
                </span>
              ))}
              {resume.atsAnalysis.missingKeywords.length > 0 && (
                <span className="text-slate-500">
                  Missing in job text: {resume.atsAnalysis.missingKeywords.slice(0, 3).join(', ')}
                </span>
              )}
            </div>

            <span className="text-slate-500 text-xs font-medium">
              Verified 1-Page Layout
            </span>
          </div>
        )}

        {/* Resume Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100 print:bg-white print:p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium text-slate-600">Analyzing job posting and tailoring resume...</p>
            </div>
          ) : !resume ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              No tailored resume data available. Select a job opportunity to generate.
            </div>
          ) : (
            /* ATS Standard Document Sheet */
            <div
              id="ats-resume-printable-area"
              className="bg-white max-w-3xl mx-auto p-8 sm:p-10 shadow-sm border border-slate-200 text-slate-900 font-sans space-y-5 print:shadow-none print:border-none print:p-0 print:max-w-none"
            >
              {/* Header / Contact Info */}
              <div className="text-center border-b border-slate-300 pb-4 space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
                  {resume.candidateInfo.fullName}
                </h1>
                <div className="text-xs text-slate-700 flex flex-wrap justify-center items-center gap-x-2 gap-y-1">
                  <span>{resume.candidateInfo.location}</span>
                  <span>•</span>
                  <span>{resume.candidateInfo.phone}</span>
                  <span>•</span>
                  <a href={`mailto:${resume.candidateInfo.email}`} className="text-indigo-700 hover:underline">
                    {resume.candidateInfo.email}
                  </a>
                  {resume.candidateInfo.links.map((link, idx) => (
                    <React.Fragment key={idx}>
                      <span>•</span>
                      <a href={link.url} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline">
                        {link.label}
                      </a>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Professional Summary */}
              <div className="space-y-1.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Professional Summary
                </h2>
                <p className="text-xs text-slate-800 leading-relaxed text-justify">
                  {resume.professionalSummary}
                </p>
              </div>

              {/* Core Competencies / Skills */}
              <div className="space-y-1.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Technical Skills
                </h2>
                <div className="text-xs space-y-1 text-slate-800">
                  <div>
                    <span className="font-semibold text-slate-900">Languages & Frameworks: </span>
                    <span>{resume.categorizedSkills.languagesAndFrameworks.join(', ')}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Cloud & Infrastructure: </span>
                    <span>{resume.categorizedSkills.cloudAndInfrastructure.join(', ')}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Databases & Tools: </span>
                    <span>{resume.categorizedSkills.databasesAndTools.join(', ')}</span>
                  </div>
                  {resume.categorizedSkills.otherCompetencies.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-900">Methodologies & Concepts: </span>
                      <span>{resume.categorizedSkills.otherCompetencies.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Work Experience */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Professional Experience
                </h2>
                <div className="space-y-3.5">
                  {resume.experience.map((exp, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{exp.role}</span>
                          <span className="text-slate-600"> — {exp.company}</span>
                        </div>
                        <div className="text-slate-600 font-medium text-right shrink-0">
                          {exp.period} | {exp.location}
                        </div>
                      </div>
                      <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-slate-800 leading-relaxed">
                        {exp.bulletPoints.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="space-y-1.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Education
                </h2>
                <div className="space-y-1 text-xs">
                  {resume.education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between items-baseline">
                      <div>
                        <span className="font-bold text-slate-900">{edu.degree}</span>
                        <span className="text-slate-700">, {edu.institution}</span>
                      </div>
                      <span className="text-slate-600 font-medium shrink-0">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications (if any) */}
              {resume.certifications.length > 0 && (
                <div className="space-y-1.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                    Certifications
                  </h2>
                  <div className="text-xs text-slate-800">
                    {resume.certifications.join(' • ')}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

