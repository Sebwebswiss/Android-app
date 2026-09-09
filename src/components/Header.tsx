import React from 'react';
import { ViewMode } from '../types';
import { Grid, MapPin, Box, Plus, Database, Compass, PackageCheck, Languages } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onAddNew: () => void;
  onOpenBackup: () => void;
  totalItems: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onAddNew,
  onOpenBackup,
  totalItems,
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Logo & Name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs shrink-0">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight leading-none truncate">
                  {t.appTitle}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-900 rounded-full shrink-0">
                  {totalItems} {t.totalSavedBadge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => onViewChange('finder')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'finder'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Compass className="w-4 h-4 text-amber-600" />
              {t.nav.finder}
            </button>

            <button
              onClick={() => onViewChange('all-items')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'all-items'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Grid className="w-4 h-4 text-slate-500" />
              {t.nav.allItems}
            </button>

            <button
              onClick={() => onViewChange('by-location')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'by-location'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <MapPin className="w-4 h-4 text-slate-500" />
              {t.nav.rooms}
            </button>

            <button
              onClick={() => onViewChange('containers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'containers'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Box className="w-4 h-4 text-slate-500" />
              {t.nav.containers}
            </button>
          </nav>

          {/* Action CTAs & Language Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Switcher Pill Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setLanguage('hr')}
                title="Hrvatski jezik"
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                  language === 'hr'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🇭🇷</span>
                <span className="hidden xs:inline">HR</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                title="English language"
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                  language === 'en'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🇬🇧</span>
                <span className="hidden xs:inline">EN</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenBackup}
              title={t.nav.backup}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Database className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">{t.nav.addItem}</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => onViewChange('finder')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${
              currentView === 'finder' ? 'text-amber-700 font-bold' : 'text-slate-500'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t.nav.search}</span>
          </button>
          <button
            onClick={() => onViewChange('all-items')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${
              currentView === 'all-items' ? 'text-amber-700 font-bold' : 'text-slate-500'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>{t.nav.allItems}</span>
          </button>
          <button
            onClick={() => onViewChange('by-location')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${
              currentView === 'by-location' ? 'text-amber-700 font-bold' : 'text-slate-500'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{t.nav.rooms}</span>
          </button>
          <button
            onClick={() => onViewChange('containers')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${
              currentView === 'containers' ? 'text-amber-700 font-bold' : 'text-slate-500'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>{t.nav.containers}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
