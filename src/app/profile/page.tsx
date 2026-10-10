'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  FileText,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Loader2,
  Globe,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  GraduationCap,
  Award,
  Compass,
  DollarSign,
  ShieldAlert,
  Search,
  ExternalLink,
} from 'lucide-react';

interface WorkExpItem {
  title: string;
  company: string;
  duration: string;
  location?: string;
  highlights: string[];
}

interface EduItem {
  degree: string;
  institution: string;
  year: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading & Feedback States
  const [loading, setLoading] = useState(false);
  const [searchingJobs, setSearchingJobs] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [showRawText, setShowRawText] = useState(false);

  // 9. Account Deletion Modal & Security States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // 1. Raw Text & Resume
  const [cvText, setCvText] = useState('');

  // 2. Personal & Contact Information
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentLocation, setCurrentLocation] = useState('Jaipur, Rajasthan, India');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // 3. Job Target & Geo Preferences
  const [targetJobTitles, setTargetJobTitles] = useState<string[]>([]);
  const [newTargetTitle, setNewTargetTitle] = useState('');
  const [targetCountry, setTargetCountry] = useState('India');
  const [targetCities, setTargetCities] = useState<string[]>(['Jaipur', 'Remote']);
  const [newTargetCity, setNewTargetCity] = useState('');
  const [preferredWorkplace, setPreferredWorkplace] = useState<'REMOTE' | 'HYBRID' | 'ON_SITE' | 'ANY'>('REMOTE');

  // 4. Compensation & Currency
  const [preferredCurrency, setPreferredCurrency] = useState('INR');
  const [compensationFormat, setCompensationFormat] = useState('LPA');
  const [expectedSalary, setExpectedSalary] = useState('18 LPA');
  const [minSalaryFloor, setMinSalaryFloor] = useState('14 LPA');
  const [openToEquity, setOpenToEquity] = useState(true);

  // 5. Work Model & Availability
  const [timezonePreference, setTimezonePreference] = useState('IST');
  const [relocationPreference, setRelocationPreference] = useState('NO_RELOCATION');
  const [seniorityLevel, setSeniorityLevel] = useState('SENIOR');
  const [noticePeriod, setNoticePeriod] = useState('30 days');
  const [noticePeriodBuyout, setNoticePeriodBuyout] = useState(false);
  const [workAuthorization, setWorkAuthorization] = useState('Citizen of India / Authorized to work without sponsorship');
  const [excludedCompanies, setExcludedCompanies] = useState<string[]>([]);
  const [newExcludedCompany, setNewExcludedCompany] = useState('');

  // 6. Skills Bank
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  // 7. Work Experience History
  const [experience, setExperience] = useState<WorkExpItem[]>([]);
  const [editingExpIndex, setEditingExpIndex] = useState<number | null>(null);

  // 8. Education & Certifications
  const [education, setEducation] = useState<EduItem[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCert, setNewCert] = useState('');

  // Fetch initial profile
  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          const p = data.profile;
          if (p.rawCvText) setCvText(p.rawCvText);
          if (p.fullName) setFullName(p.fullName);
          if (p.phone) setPhone(p.phone);
          if (p.currentLocation) setCurrentLocation(p.currentLocation);
          if (p.portfolioUrl) setPortfolioUrl(p.portfolioUrl);
          if (p.githubUrl) setGithubUrl(p.githubUrl);
          if (p.linkedinUrl) setLinkedinUrl(p.linkedinUrl);
          if (p.targetCountry) setTargetCountry(p.targetCountry);
          if (Array.isArray(p.targetCities)) setTargetCities(p.targetCities);
          if (Array.isArray(p.targetJobTitles)) setTargetJobTitles(p.targetJobTitles);
          if (p.preferredWorkplace) setPreferredWorkplace(p.preferredWorkplace);
          if (p.preferredCurrency) setPreferredCurrency(p.preferredCurrency);
          if (p.compensationFormat) setCompensationFormat(p.compensationFormat);
          if (p.expectedSalary) setExpectedSalary(p.expectedSalary);
          if (p.minSalaryFloor) setMinSalaryFloor(p.minSalaryFloor);
          if (p.openToEquity !== undefined) setOpenToEquity(p.openToEquity);
          if (p.timezonePreference) setTimezonePreference(p.timezonePreference);
          if (p.relocationPreference) setRelocationPreference(p.relocationPreference);
          if (p.seniorityLevel) setSeniorityLevel(p.seniorityLevel);
          if (p.noticePeriod) setNoticePeriod(p.noticePeriod);
          if (p.noticePeriodBuyout !== undefined) setNoticePeriodBuyout(p.noticePeriodBuyout);
          if (p.workAuthorization) setWorkAuthorization(p.workAuthorization);
          if (Array.isArray(p.excludedCompanies)) setExcludedCompanies(p.excludedCompanies);
          if (Array.isArray(p.extractedSkills)) setSkills(p.extractedSkills);
          if (Array.isArray(p.workExperience)) setExperience(p.workExperience);
          if (Array.isArray(p.education)) setEducation(p.education);
          if (Array.isArray(p.certifications)) setCertifications(p.certifications);
        }
      })
      .catch(() => {});
  }, []);

  // PDF Upload & Smart Auto-Fill
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage('Please upload a valid PDF document (.pdf)');
      return;
    }

    setErrorMessage(null);
    setUploadingPdf(true);
    setUploadedFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/profile/upload-cv', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse PDF document');
      }

      if (data.rawCvText) setCvText(data.rawCvText);
      if (data.pageCount) setPageCount(data.pageCount);

      const ex = data.extracted;
      if (ex) {
        if (ex.fullName) setFullName(ex.fullName);
        if (ex.email) setEmail(ex.email);
        if (ex.phone) setPhone(ex.phone);
        if (ex.currentLocation) setCurrentLocation(ex.currentLocation);
        if (ex.portfolioUrl) setPortfolioUrl(ex.portfolioUrl);
        if (ex.githubUrl) setGithubUrl(ex.githubUrl);
        if (ex.linkedinUrl) setLinkedinUrl(ex.linkedinUrl);
        if (ex.targetJobTitles && ex.targetJobTitles.length > 0) setTargetJobTitles(ex.targetJobTitles);
        if (ex.skills && ex.skills.length > 0) setSkills(ex.skills);
        if (ex.workExperience && ex.workExperience.length > 0) setExperience(ex.workExperience);
        if (ex.education && ex.education.length > 0) setEducation(ex.education);
        if (ex.certifications && ex.certifications.length > 0) setCertifications(ex.certifications);
        if (ex.expectedSalary) setExpectedSalary(ex.expectedSalary);
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing PDF');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSaveProfile = async (silent = false): Promise<boolean> => {
    setLoading(true);
    setSavedSuccess(false);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawCvText: cvText,
          fullName,
          phone,
          currentLocation,
          portfolioUrl,
          githubUrl,
          linkedinUrl,
          targetCountry,
          targetCities,
          targetJobTitles,
          preferredWorkplace,
          preferredCurrency,
          compensationFormat,
          expectedSalary,
          minSalaryFloor,
          openToEquity,
          timezonePreference,
          relocationPreference,
          seniorityLevel,
          noticePeriod,
          noticePeriodBuyout,
          workAuthorization,
          excludedCompanies,
          skills,
          workExperience: experience,
          education,
          certifications,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save candidate profile');
      }

      if (!silent) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }
      return true;
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Save & Search Matching Jobs
  const handleSaveAndSearchJobs = async () => {
    setSearchingJobs(true);
    setErrorMessage(null);
    try {
      const saved = await handleSaveProfile(true);
      if (!saved) throw new Error('Could not save profile before search');

      // Trigger targeted pipeline run with candidate's actual preferences
      await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: targetJobTitles.length > 0 ? targetJobTitles : ['Full Stack Developer', 'Backend Engineer'],
          maxJobsToScore: 10,
        }),
      });

      router.push('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error triggering profile job search');
    } finally {
      setSearchingJobs(false);
    }
  };

  const handleResetForm = () => {
    setCvText('');
    setFullName('');
    setEmail('');
    setPhone('');
    setCurrentLocation('Jaipur, Rajasthan, India');
    setPortfolioUrl('');
    setGithubUrl('');
    setLinkedinUrl('');
    setTargetJobTitles([]);
    setSkills([]);
    setExperience([]);
    setEducation([]);
    setCertifications([]);
    setExcludedCompanies([]);
    setUploadedFileName(null);
    setPageCount(null);
    setErrorMessage(null);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE in capital letters to confirm.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmation: deleteConfirmText,
          password: deletePassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      setShowDeleteModal(false);
      // Redirect to signup page with query flag indicating account deletion
      router.push('/signup?deleted=true');
      router.refresh();
    } catch (err: any) {
      setDeleteError(err.message || 'Error deleting account');
    } finally {
      setIsDeleting(false);
    }
  };

  // Tag helper functions
  const addTargetTitle = () => {
    if (newTargetTitle.trim() && !targetJobTitles.includes(newTargetTitle.trim())) {
      setTargetJobTitles([...targetJobTitles, newTargetTitle.trim()]);
      setNewTargetTitle('');
    }
  };

  const removeTargetTitle = (t: string) => {
    setTargetJobTitles(targetJobTitles.filter((item) => item !== t));
  };

  const addTargetCity = () => {
    if (newTargetCity.trim() && !targetCities.includes(newTargetCity.trim())) {
      setTargetCities([...targetCities, newTargetCity.trim()]);
      setNewTargetCity('');
    }
  };

  const removeTargetCity = (c: string) => {
    setTargetCities(targetCities.filter((item) => item !== c));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (s: string) => {
    setSkills(skills.filter((item) => item !== s));
  };

  const addExcludedCompany = () => {
    if (newExcludedCompany.trim() && !excludedCompanies.includes(newExcludedCompany.trim())) {
      setExcludedCompanies([...excludedCompanies, newExcludedCompany.trim()]);
      setNewExcludedCompany('');
    }
  };

  const removeExcludedCompany = (c: string) => {
    setExcludedCompanies(excludedCompanies.filter((item) => item !== c));
  };

  const addCertification = () => {
    if (newCert.trim() && !certifications.includes(newCert.trim())) {
      setCertifications([...certifications, newCert.trim()]);
      setNewCert('');
    }
  };

  const removeCertification = (cert: string) => {
    setCertifications(certifications.filter((item) => item !== cert));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                  Candidate Profile & Career Preferences
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Geo-Targeted
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Upload your PDF resume to auto-fill or customize your target country, salary in LPA, and verified answer bank.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleResetForm}
              disabled={loading || uploadingPdf || searchingJobs}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            >
              Clear Form
            </button>

            <button
              onClick={() => handleSaveProfile(false)}
              disabled={loading || uploadingPdf || searchingJobs}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl font-medium text-xs shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving...' : 'Save Profile'}</span>
            </button>

            <button
              onClick={handleSaveAndSearchJobs}
              disabled={loading || uploadingPdf || searchingJobs}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm shadow-indigo-500/20 transition-all disabled:opacity-50"
            >
              {searchingJobs ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching Jobs...</span>
                </>
              ) : (
                <>
                  <Compass className="w-3.5 h-3.5" />
                  <span>Save & Search Matching Jobs</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center space-x-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs sm:text-sm font-semibold">
              Profile updated! Extracted competencies, location preferences, and verified screening facts saved successfully.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-2xl flex items-center space-x-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-xs sm:text-sm font-semibold">{errorMessage}</p>
          </div>
        )}

        {/* 1. PDF Upload & Instant Auto-Populator */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Upload PDF Resume / CV</h2>
                <p className="text-xs text-slate-500">
                  Auto-populates contact details, skills, employment history, and education directly from your resume.
                </p>
              </div>
            </div>
            {cvText && (
              <button
                onClick={() => setShowRawText(!showRawText)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
              >
                <span>{showRawText ? 'Hide Raw CV Text' : 'View Extracted Text'}</span>
              </button>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,application/pdf"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-2xl p-7 sm:p-9 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3"
          >
            {uploadingPdf ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-sm font-bold text-slate-900">Parsing PDF & Extracting Profile...</p>
                <p className="text-xs text-indigo-600">Extracting contact info, skills, and work timeline</p>
              </div>
            ) : uploadedFileName ? (
              <div className="flex flex-col items-center space-y-2">
                <FileCheck className="w-8 h-8 text-emerald-600" />
                <p className="text-sm font-bold text-slate-900">{uploadedFileName}</p>
                <span className="text-xs text-emerald-700 bg-emerald-100 px-3 py-0.5 rounded-full font-medium">
                  {pageCount ? `${pageCount} pages parsed successfully` : 'Resume Parsed & Populated'}
                </span>
                <p className="text-xs text-slate-500 pt-1">Click to upload a new resume file</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100/70 flex items-center justify-center text-indigo-600">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Click to browse or drop your PDF Resume here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Supports modern PDF format (e.g. resume.pdf)</p>
                </div>
              </>
            )}
          </div>

          {showRawText && cvText && (
            <div className="pt-2 space-y-2 animate-in fade-in">
              <div className="text-xs font-bold text-slate-700">Raw Extracted Resume Text:</div>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                rows={6}
                className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </section>

        {/* 2. Personal & Contact Information */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Personal & Contact Information</h2>
              <p className="text-xs text-slate-500">Contact details and portfolio links used in your applications.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Divyanshu Tailor"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. divyansh.tailort20@gmail.com"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 7232881150"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Residence / Location</label>
              <input
                type="text"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                placeholder="e.g. Jaipur, Rajasthan, India"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Portfolio Website</label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://divyanshu-portfolio-eta.vercel.app/"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Profile</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/Gh-divyansh"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/divyanshu-tailor-106570266/"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </section>

        {/* 3. Job Target, Currency & Geo-Preferences */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Job Target, Currency & Geo-Preferences</h2>
              <p className="text-xs text-slate-500">
                Filters job boards specifically by your country, target job titles, and salary in LPA.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {/* Target Job Titles */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Job Titles (AutoApplyPilot searches these specifically)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {targetJobTitles.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs px-3 py-1 rounded-full font-medium"
                  >
                    <span>{t}</span>
                    <button onClick={() => removeTargetTitle(t)} className="hover:text-rose-600">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-2 max-w-md">
                <input
                  type="text"
                  value={newTargetTitle}
                  onChange={(e) => setNewTargetTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTargetTitle()}
                  placeholder="Add target title (e.g. Next.js Developer, Backend Engineer)"
                  className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                />
                <button
                  onClick={addTargetTitle}
                  className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-xl text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Target Country & Target Cities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Country</label>
                <select
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none font-semibold text-slate-800"
                >
                  <option value="India">India (Local & India-Remote)</option>
                  <option value="Worldwide Remote">Worldwide Remote (Global / Any Country)</option>
                  <option value="United States">United States (US Remote / Sponsorship)</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany / European Union</option>
                  <option value="Singapore">Singapore / APAC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Workplace Model</label>
                <select
                  value={preferredWorkplace}
                  onChange={(e) => setPreferredWorkplace(e.target.value as any)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none font-semibold text-slate-800"
                >
                  <option value="REMOTE">Remote Only</option>
                  <option value="HYBRID">Hybrid Preferred</option>
                  <option value="ON_SITE">In-House / On-Site Only</option>
                  <option value="ANY">Open to Any (Remote, Hybrid, On-site)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Timezone Overlap (For Remote)</label>
                <select
                  value={timezonePreference}
                  onChange={(e) => setTimezonePreference(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none font-semibold text-slate-800"
                >
                  <option value="IST">IST (Indian Daytime Hours)</option>
                  <option value="US Overlap">US Overlap (4+ hrs EST/PST night/eve)</option>
                  <option value="EU Overlap">EU / UK Overlap (GMT/CET afternoon)</option>
                  <option value="Async">Fully Flexible / Async</option>
                </select>
              </div>
            </div>

            {/* Target Cities */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Cities / Hubs
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {targetCities.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-3 py-1 rounded-full font-medium"
                  >
                    <span>{c}</span>
                    <button onClick={() => removeTargetCity(c)} className="hover:text-rose-600">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-2 max-w-md">
                <input
                  type="text"
                  value={newTargetCity}
                  onChange={(e) => setNewTargetCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTargetCity()}
                  placeholder="Add target city (e.g. Jaipur, Bengaluru, Delhi NCR)"
                  className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                />
                <button
                  onClick={addTargetCity}
                  className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-xl text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Currency & Compensation */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Currency</label>
                <select
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-900"
                >
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="AED">AED (AED - UAE Dirham)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Format</label>
                <select
                  value={compensationFormat}
                  onChange={(e) => setCompensationFormat(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-900"
                >
                  <option value="LPA">LPA (Lakhs Per Annum)</option>
                  <option value="Annual">Annual (Total / Year)</option>
                  <option value="Hourly">Hourly ($/hr)</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expected Compensation</label>
                <input
                  type="text"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                  placeholder="e.g. 18 LPA or $120,000 / yr"
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Floor (Cut-off)</label>
                <input
                  type="text"
                  value={minSalaryFloor}
                  onChange={(e) => setMinSalaryFloor(e.target.value)}
                  placeholder="e.g. 14 LPA"
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Notice Period & Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notice Period / Availability</label>
                <select
                  value={noticePeriod}
                  onChange={(e) => setNoticePeriod(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none font-semibold text-slate-800"
                >
                  <option value="Immediate / Serving Notice">Immediate / Serving Notice</option>
                  <option value="15 days">15 Days</option>
                  <option value="30 days">30 Days (1 Month)</option>
                  <option value="60 days">60 Days (2 Months)</option>
                  <option value="90 days">90 Days (3 Months)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notice Buyout Possible?</label>
                <select
                  value={noticePeriodBuyout ? 'yes' : 'no'}
                  onChange={(e) => setNoticePeriodBuyout(e.target.value === 'yes')}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none font-semibold text-slate-800"
                >
                  <option value="yes">Yes (New employer can buy out notice)</option>
                  <option value="no">No (Must serve full notice period)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Relocation Willingness</label>
                <select
                  value={relocationPreference}
                  onChange={(e) => setRelocationPreference(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none font-semibold text-slate-800"
                >
                  <option value="NO_RELOCATION">No (Strictly Local or Remote)</option>
                  <option value="DOMESTIC">Open to Domestic Relocation (Within India)</option>
                  <option value="INTERNATIONAL">Open to International Relocation (with Visa)</option>
                </select>
              </div>
            </div>

            {/* Excluded Companies */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Company Blacklist (Never apply to these companies)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {excludedCompanies.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center space-x-1.5 bg-rose-50 text-rose-800 border border-rose-200 text-xs px-3 py-1 rounded-full font-medium"
                  >
                    <span>{c}</span>
                    <button onClick={() => removeExcludedCompany(c)} className="hover:text-rose-900">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-2 max-w-md">
                <input
                  type="text"
                  value={newExcludedCompany}
                  onChange={(e) => setNewExcludedCompany(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addExcludedCompany()}
                  placeholder="e.g. Current Employer, Unwanted Consultancy"
                  className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                />
                <button
                  onClick={addExcludedCompany}
                  className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-xl text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Technical Skills Bank */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Verified Technical Skills Bank</h2>
              <p className="text-xs text-slate-500">
                Skills matched against job postings to calculate your 0–100 relevance score.
              </p>
            </div>
          </div>

          {skills.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              No skills added yet. Upload your PDF resume above to extract skills automatically or add them below.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs px-3 py-1.5 rounded-full font-medium"
                >
                  <span>{skill}</span>
                  <button onClick={() => removeSkill(skill)} className="hover:text-rose-600">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-2 max-w-sm pt-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              placeholder="Add skill (e.g. Docker, Laravel, Redis)"
              className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
            />
            <button
              onClick={addSkill}
              className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-xl text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 5. Work Experience Timeline Manager */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Work Experience Timeline</h2>
                <p className="text-xs text-slate-500">
                  Extracted employment history used to factualize tailored cover letters and application answers.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setExperience([
                  ...experience,
                  {
                    title: 'Senior Software Engineer',
                    company: 'Company Name',
                    duration: '2023 - Present',
                    location: 'Remote',
                    highlights: ['Engineered scalable microservices and APIs.'],
                  },
                ]);
              }}
              className="flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Position</span>
            </button>
          </div>

          {experience.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              No work experience recorded yet. Upload your PDF resume above to parse your timeline automatically.
            </p>
          ) : (
            <div className="space-y-4 pt-1">
              {experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/50 space-y-3 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 mr-4">
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx].title = e.target.value;
                          setExperience(updated);
                        }}
                        placeholder="Job Title"
                        className="text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx].company = e.target.value;
                          setExperience(updated);
                        }}
                        placeholder="Company Name"
                        className="text-xs font-semibold p-2 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx].duration = e.target.value;
                          setExperience(updated);
                        }}
                        placeholder="e.g. Jan 2025 - Present"
                        className="text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                    <button
                      onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Remove experience"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Key Highlights / Bullet Points (One per line)
                    </label>
                    <textarea
                      value={exp.highlights.join('\n')}
                      onChange={(e) => {
                        const updated = [...experience];
                        updated[idx].highlights = e.target.value.split('\n');
                        setExperience(updated);
                      }}
                      rows={3}
                      placeholder="Bullet point achievements..."
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 6. Education & Certifications */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Education & Certifications</h2>
              <p className="text-xs text-slate-500">Degrees, academic achievements, and industry credentials.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            {/* Education List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Degrees & Academics</span>
                <button
                  onClick={() => {
                    setEducation([
                      ...education,
                      { degree: 'B.S. in Computer Science', institution: 'University', year: '2021' },
                    ]);
                  }}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                >
                  + Add Degree
                </button>
              </div>

              {education.map((edu, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[idx].degree = e.target.value;
                        setEducation(updated);
                      }}
                      className="text-xs font-bold bg-white p-1.5 border border-slate-200 rounded-lg flex-1 mr-2"
                      placeholder="Degree"
                    />
                    <button
                      onClick={() => setEducation(education.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[idx].institution = e.target.value;
                        setEducation(updated);
                      }}
                      className="text-xs bg-white p-1.5 border border-slate-200 rounded-lg"
                      placeholder="Institution"
                    />
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[idx].year = e.target.value;
                        setEducation(updated);
                      }}
                      className="text-xs bg-white p-1.5 border border-slate-200 rounded-lg"
                      placeholder="Year (e.g. 2022-2024)"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700">Certifications & Achievements</span>
              <div className="flex flex-wrap gap-2 mb-2">
                {certifications.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center space-x-1.5 bg-teal-50 text-teal-800 border border-teal-200 text-xs px-3 py-1 rounded-full font-medium"
                  >
                    <span>{c}</span>
                    <button onClick={() => removeCertification(c)} className="hover:text-rose-600">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCertification()}
                  placeholder="e.g. Google Analytics 4, Cisco Data Science"
                  className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <button
                  onClick={addCertification}
                  className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-xl text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Pre-Verified Screening Answer Bank */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Pre-Verified Screening Answer Bank</h2>
              <p className="text-xs text-slate-500">
                Safety Gate: AutoApplyPilot only fills screening questions using answers you have explicitly approved here.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Work Authorization Statement
              </label>
              <input
                type="text"
                value={workAuthorization}
                onChange={(e) => setWorkAuthorization(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Notice Period Statement
              </label>
              <input
                type="text"
                value={noticePeriod}
                onChange={(e) => setNoticePeriod(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
              />
            </div>
          </div>
        </section>

        {/* 8. Danger Zone: Permanent Account Deletion */}
        <section className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-rose-950">Danger Zone: Permanent Account Deletion</h2>
                <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                  Permanently erase your candidate profile, uploaded PDF CV, extracted technical skills, application history, and logs. This action is irreversible.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setDeleteConfirmText('');
                setDeletePassword('');
                setDeleteError(null);
                setShowDeleteModal(true);
              }}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Delete Account</span>
            </button>
          </div>
        </section>
      </main>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Confirm Account Deletion</h3>
                <p className="text-xs text-rose-600 font-semibold">Irreversible Action</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/60 border border-rose-200/80 p-3.5 rounded-xl">
              Are you sure you want to delete your account? All data including your CV, work history, target jobs, ATS applications, and logs will be permanently deleted from the database.
            </p>

            {deleteError && (
              <div className="bg-rose-100/70 border border-rose-300 text-rose-900 text-xs p-3 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Type <span className="font-mono font-black text-rose-600">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password (optional confirmation)
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
                className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

