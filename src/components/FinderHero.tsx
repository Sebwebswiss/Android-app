import React from 'react';
import { Search, X, Plus, Compass, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface FinderHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  selectedRoom: string;
  onSelectedRoomChange: (roomId: string) => void;
  selectedCategory: string;
  onSelectedCategoryChange: (category: string) => void;
  onAddNew: () => void;
  onOpenGallery?: () => void;
  totalItemsCount: number;
  filteredCount: number;
}

export const FinderHero: React.FC<FinderHeroProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onAddNew,
  onOpenGallery,
  totalItemsCount,
  filteredCount,
}) => {
  const { t } = useLanguage();

  const statusOptions = [
    { id: 'all', label: t.finder.statusAll },
    { id: 'available', label: t.finder.statusAvailable },
    { id: 'in_use', label: t.finder.statusInUse },
    { id: 'loaned', label: t.finder.statusLoaned },
    { id: 'missing', label: t.finder.statusMissing },
  ];

  return (
    <div className="relative bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent pt-8 pb-6 px-4 sm:px-6 rounded-3xl border border-amber-200/50 mb-8">
      <div className="max-w-3xl mx-auto text-center">
        {/* Title */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100/80 text-amber-900 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
          <Compass className="w-3.5 h-3.5 text-amber-700" />
          {t.finder.heroTag}
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
          {t.finder.heroTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mb-6">
          {t.finder.heroSubtitle}
        </p>

        {/* Big Search Input */}
        <div className="relative shadow-lg rounded-2xl bg-white border-2 border-amber-400 focus-within:border-amber-600 focus-within:ring-4 focus-within:ring-amber-500/20 transition-all">
          <div className="flex items-center px-4 py-3 sm:py-3.5 gap-3">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.finder.searchPlaceholder}
              className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                title={t.finder.clearSearch}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="mt-3 flex items-center justify-center flex-wrap gap-1.5 text-xs text-slate-500">
          <span className="font-medium text-slate-600 mr-1">{t.finder.quickExamplesLabel}</span>
          {t.finder.examples.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => onSearchChange(term)}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                searchQuery.toLowerCase() === term.toLowerCase()
                  ? 'bg-amber-600 text-white border-amber-600 font-semibold shadow-xs'
                  : 'bg-white/80 hover:bg-amber-50 text-slate-700 border-slate-200 hover:border-amber-300'
              }`}
            >
              {term}
            </button>
          ))}
        </div>

        {/* Status Filter Chips and Add Button */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-amber-200/50">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium mr-1">{t.finder.statusLabel}</span>
            {statusOptions.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onStatusFilterChange(f.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  statusFilter === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              {t.finder.showingCount} <strong>{filteredCount}</strong> / <strong>{totalItemsCount}</strong>
            </span>

            {onOpenGallery && (
              <button
                type="button"
                onClick={onOpenGallery}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100/90 hover:bg-amber-200 border border-amber-300/80 rounded-xl shadow-2xs transition-colors"
                title={t.finder.viewGallery}
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                <span>{t.finder.viewGallery}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.finder.saveNewItem}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
