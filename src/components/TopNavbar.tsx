import React from 'react';
import { Lock } from 'lucide-react';

export type AppView = 'setup' | 'exam' | 'result' | 'admin';

interface TopNavbarProps {
  schoolTitle: string;
  currentView: AppView;
  isExamLocked: boolean;
  onNavigateSetup: () => void;
  onNavigateAdmin: () => void;
  onScrollSection: (sectionId: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  schoolTitle,
  currentView,
  isExamLocked,
  onNavigateSetup,
  onNavigateAdmin,
  onScrollSection,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={onNavigateSetup}
          className="font-display text-lg font-bold tracking-tight text-slate-900 hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {schoolTitle || 'Nusantara CBT'}
        </button>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={onNavigateSetup}
            className={`inline-flex items-center gap-1.5 py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'setup'
                ? 'border-blue-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {isExamLocked && <Lock className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />}
            <span>Beranda Ujian</span>
          </button>

          <button
            type="button"
            onClick={() => onScrollSection('kurikulum-section')}
            className="py-1 border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Kurikulum
          </button>

          <button
            type="button"
            onClick={() => onScrollSection('metode-section')}
            className="py-1 border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Metode Belajar
          </button>

          <button
            type="button"
            onClick={() => onScrollSection('parameter-section')}
            className="py-1 border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Pengaturan Soal
          </button>
        </nav>

        {/* Zone 3: Single primary action button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onNavigateAdmin}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'admin'
                ? 'bg-slate-900 text-white'
                : 'bg-blue-900 text-white hover:bg-blue-800'
            }`}
          >
            Dashboard Admin
          </button>
        </div>
      </div>
    </header>
  );
};
