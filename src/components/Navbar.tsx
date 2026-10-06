import React from 'react';
import { User, LogOut, Code } from 'lucide-react';

interface NavbarProps {
  currentUser: { name: string; email: string; role: string } | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onSignOut: () => void;
  onOpenModelDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onSignOut,
  onOpenModelDocs
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#090D16]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <a href="/" className="text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap">
          Veritas
        </a>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <a href="#detector" className="hover:text-slate-100 transition-colors whitespace-nowrap">
            Detector
          </a>
          <a href="#sample-library" className="hover:text-slate-100 transition-colors whitespace-nowrap">
            Samples
          </a>
          <a href="#methodology" className="hover:text-slate-100 transition-colors whitespace-nowrap">
            Methodology
          </a>
          <button
            type="button"
            onClick={onOpenModelDocs}
            className="hover:text-slate-100 transition-colors whitespace-nowrap cursor-pointer"
          >
            API Integration
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-xs flex items-center justify-center font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-semibold text-slate-200 text-xs truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                    {currentUser.role}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
