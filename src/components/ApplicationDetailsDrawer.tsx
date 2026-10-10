'use client';

import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Calendar,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Zap,
} from 'lucide-react';
import { ApplicationItem } from '@/lib/types/applications';

interface ApplicationDetailsDrawerProps {
  application: ApplicationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (appId: string, newStatus: string) => Promise<void>;
  onDeleteApplication: (appId: string) => Promise<void>;
}

const STAGES = [
  { key: 'DISCOVERED', label: 'Wishlist' },
  { key: 'QUEUED', label: 'Queued' },
  { key: 'APPLIED', label: 'Applied' },
  { key: 'NEEDS_REVIEW', label: 'Assessment' },
  { key: 'INTERVIEW', label: 'Interview' },
  { key: 'OFFER', label: 'Offer' },
  { key: 'REJECTED', label: 'Archived' },
];

export const ApplicationDetailsDrawer: React.FC<ApplicationDetailsDrawerProps> = ({
  application,
  isOpen,
  onClose,
  onStatusChange,
  onDeleteApplication,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !application) return null;

  const handleStageSelect = async (newStatus: string) => {
    if (newStatus === application.status) return;
    setIsUpdating(true);
    try {
      await onStatusChange(application.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Remove application for ${application.title} at ${application.company} from CRM?`)) {
      setIsDeleting(true);
      try {
        await onDeleteApplication(application.id);
        onClose();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-md">
                  {application.platform.toUpperCase()}
                </span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-xs font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <Zap className="w-3 h-3 text-emerald-300 fill-current" />
                  <span>{application.matchScore}% Match</span>
                </span>
              </div>
              <h2 className="text-xl font-bold leading-snug">{application.title}</h2>
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-white">{application.company}</span>
                <span>•</span>
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{application.location || 'Remote'}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Actions */}
            <div className="flex items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Current Stage
                </span>
                <span className="text-sm font-extrabold text-indigo-700">
                  {STAGES.find((s) => s.key === application.status)?.label || application.status}
                </span>
              </div>

              {application.externalUrl && (
                <a
                  href={application.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                >
                  <span>Open Job Listing</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Stage Transition Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Update Pipeline Stage
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STAGES.map((stage) => {
                  const isActive = application.status === stage.key;
                  return (
                    <button
                      key={stage.key}
                      onClick={() => handleStageSelect(stage.key)}
                      disabled={isUpdating}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border text-center ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {stage.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Compensation & Workplace */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <span className="text-xs font-bold text-slate-500 uppercase block">Compensation</span>
                <span className="text-xs font-bold text-slate-900 mt-1 block">
                  {application.salary || 'Competitive (Market Rate)'}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <span className="text-xs font-bold text-slate-500 uppercase block">Location / Model</span>
                <span className="text-xs font-bold text-slate-900 mt-1 block">
                  {application.location || 'Remote'}
                </span>
              </div>
            </div>

            {/* Activity Logs Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Activity Audit Log</span>
                </h4>
                <span className="text-xs text-slate-500">
                  {application.appliedAt ? `Applied ${new Date(application.appliedAt).toLocaleDateString()}` : 'Not submitted yet'}
                </span>
              </div>

              <div className="space-y-3 border-l-2 border-indigo-200 ml-3 pl-4">
                {application.logs && application.logs.length > 0 ? (
                  application.logs.map((log, idx) => (
                    <div key={log.id || idx} className="relative group">
                      <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-200" />
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            {log.step.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(log.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{log.details}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 italic">No activity recorded yet.</div>
                )}
              </div>
            </div>

            {/* Cover Letter Snapshot */}
            {application.notes && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Notes & Tailored Submission</span>
                </h4>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-700 whitespace-pre-line font-mono leading-relaxed max-h-44 overflow-y-auto">
                  {application.notes}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove from CRM</span>
            </button>

            <button
              onClick={onClose}
              className="text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsDrawer;

