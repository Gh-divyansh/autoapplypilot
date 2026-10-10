'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Code,
  Award,
  PhoneCall,
  Archive,
} from 'lucide-react';

interface InboundEmailSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailProcessed: () => void;
}

const PRESETS = [
  {
    id: 'cred-interview',
    label: 'CRED - Interview Invitation (Google Meet)',
    from: 'recruiter@cred.club',
    subject: 'Invitation to Interview - Senior Full Stack Engineer at CRED',
    body: 'Hi Divyansh,\n\nThank you for applying for the Senior Full Stack role. The engineering team was very impressed with your background in TypeScript and high-scale systems. We would love to invite you for a 45-minute technical architecture round on Google Meet this Thursday.\n\nPlease select your preferred time slot here: https://calendly.com/cred-interview/45min.\n\nBest regards,\nCRED Talent Acquisition',
  },
  {
    id: 'razorpay-oa',
    label: 'Razorpay - Technical Coding Assessment',
    from: 'careers@razorpay.com',
    subject: 'Next Steps: Razorpay Coding Assessment for Backend Engineer',
    body: 'Hello Divyansh,\n\nWe have reviewed your profile and would like to invite you to take our 90-minute technical evaluation on HackerRank. Please complete the coding challenge within 48 hours:\n\nhttps://hackerrank.com/tests/razorpay-eng-2026\n\nGood luck!\nRazorpay Engineering',
  },
  {
    id: 'stripe-offer',
    label: 'Stripe - Official Offer Package Discussion',
    from: 'talent@stripe.com',
    subject: 'Congratulations! Stripe Software Engineer - Offer Details',
    body: 'Hi Divyansh,\n\nFollowing your final round of interviews, the leadership team is thrilled to extend an official offer of employment for the Software Engineer role at Stripe.\n\nLet us schedule a call tomorrow to go over your compensation package (₹45-55 LPA) and stock options grant.\n\nWarm regards,\nStripe Talent Team',
  },
  {
    id: 'zomato-screen',
    label: 'Zomato - Recruiter Phone Screen',
    from: 'ta@zomato.com',
    subject: 'Zomato Engineering - Recruiter Call regarding Lead Frontend role',
    body: 'Dear Divyansh,\n\nThanks for applying on Naukri.com. Your experience in Jaipur and full stack background matches what we need for our consumer web team. Are you available for a 20-minute preliminary call tomorrow at 3 PM IST to discuss notice period and compensation expectations?\n\nRegards,\nZomato HR Team',
  },
  {
    id: 'netflix-archive',
    label: 'Netflix - Candidate Pool Status Update',
    from: 'recruiting@netflix.com',
    subject: 'Your application to Netflix',
    body: 'Hi Divyansh,\n\nThank you for applying to Netflix. While your skills in modern web architectures are very impressive, we have decided to pursue candidates whose experience more closely matches our immediate infrastructure needs. We will keep your profile in our talent network for upcoming openings.\n\nSincerely,\nNetflix Recruiting Team',
  },
];

export const InboundEmailSimulatorModal: React.FC<InboundEmailSimulatorModalProps> = ({
  isOpen,
  onClose,
  onEmailProcessed,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState(PRESETS[0].id);
  const [from, setFrom] = useState(PRESETS[0].from);
  const [subject, setSubject] = useState(PRESETS[0].subject);
  const [body, setBody] = useState(PRESETS[0].body);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = PRESETS.find((item) => item.id === presetId);
    if (p) {
      setFrom(p.from);
      setSubject(p.subject);
      setBody(p.body);
      setResult(null);
      setError(null);
    }
  };

  const handleSimulateEmail = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/webhooks/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, subject, body }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setResult(data);
        onEmailProcessed();
      } else {
        setError(data.error || 'Failed to classify inbound email');
      }
    } catch (err: any) {
      setError(err?.message || 'Error communicating with /api/webhooks/email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 border border-indigo-400/40 flex items-center justify-center font-bold text-white shadow-inner">
              <Mail className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold">Recruiter Email Sync Simulator</h3>
                <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full">
                  AI Classifier Active
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Simulate inbound recruiter emails to trigger automatic stage movements in the CRM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Preset Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Choose Recruiter Scenario
            </label>
            <select
              value={selectedPresetId}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Email Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Sender Email (From)
              </label>
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Email Body
              </label>
              <textarea
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-slate-200 text-slate-800 font-sans focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Result Banner */}
          {result && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-950 space-y-2 animate-in fade-in">
              <div className="flex items-center space-x-2 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Processed and Classified as{' '}
                  <strong className="text-emerald-700 uppercase">
                    {result.classification?.classification}
                  </strong>{' '}
                  ({result.classification?.confidence}% confidence)
                </span>
              </div>
              <p className="text-xs text-emerald-800">
                Company: <strong>{result.classification?.companyDetected}</strong> • Action:{' '}
                {result.classification?.keyActionRequired}
              </p>
              <div className="text-xs text-emerald-700 bg-white/70 p-2 rounded-lg border border-emerald-200">
                Status Updated to: <strong>{result.newStatus || 'Updated'}</strong>{' '}
                {result.matchedApplicationId && `• Application ID: ${result.matchedApplicationId}`}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Webhook Production Note */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong>Production Integration:</strong> In production, point your SendGrid, Postmark, or Gmail webhook filter to{' '}
              <code className="bg-slate-200 px-1 py-0.5 rounded text-indigo-700 font-mono text-[11px]">
                https://yourdomain.com/api/webhooks/email
              </code>{' '}
              to automatically process live recruiter emails.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSimulateEmail}
            disabled={isLoading}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Classifying & Syncing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run AI Classification & Sync</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InboundEmailSimulatorModal;

