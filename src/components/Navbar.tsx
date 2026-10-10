'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { RefreshCw, UserCheck, LayoutDashboard, Zap, LogIn, LogOut, User as UserIcon, BarChart3, Sparkles, Target, Users, Briefcase } from 'lucide-react';
import CompanionModal from './CompanionModal';

interface NavbarProps {
  onRefreshDiscovery?: () => void;
  isDiscovering?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefreshDiscovery,
  isDiscovering = false,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-indigo-700 transition-colors">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 leading-tight">
                AutoApplyPilot
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                AI Match & Autonomous Application Platform
              </div>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden sm:flex items-center space-x-1">
            <Link
              href="/dashboard"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Job Feed</span>
            </Link>

            <Link
              href="/applications"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/applications'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>CRM Pipeline</span>
            </Link>

            <Link
              href="/profile"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/profile'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Profile</span>
            </Link>

            <Link
              href="/boost"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/boost'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Boost</span>
            </Link>

            <Link
              href="/goal"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/goal'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span>Goals</span>
            </Link>

            <Link
              href="/teamwork-preview"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/teamwork-preview'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Teamwork</span>
            </Link>

            <Link
              href="/analytics"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/analytics'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </Link>
          </nav>
        </div>

        {/* Actions, User Auth & Status */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsCompanionOpen(true)}
            className="flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/90 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="Chrome Extension Companion for LinkedIn, Indeed, Naukri"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-600 fill-current" />
            <span className="hidden sm:inline">Chrome Companion</span>
            <span className="sm:hidden">Extension</span>
          </button>

          {onRefreshDiscovery && (
            <button
              onClick={onRefreshDiscovery}
              disabled={isDiscovering}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{isDiscovering ? 'Discovering...' : 'Scan Jobs'}</span>
            </button>
          )}

          {currentUser ? (
            <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.name || currentUser.email.split('@')[0]}
                </span>
                <span className="text-[10px] text-slate-500">{currentUser.email}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
              <Link
                href="/login"
                className="text-xs font-bold text-slate-700 hover:text-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg shadow-xs"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      <CompanionModal isOpen={isCompanionOpen} onClose={() => setIsCompanionOpen(false)} />
    </header>
  );
};

export default Navbar;
