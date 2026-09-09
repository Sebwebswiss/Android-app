import React from 'react';
import { Item, ItemStatus } from '../types';
import { MapPin, Box, Tag, ArrowRightLeft, Edit, Clock, UserCheck, AlertTriangle, CheckCircle2, QrCode } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onMove: (item: Item) => void;
  onStatusChange: (itemId: string, newStatus: ItemStatus) => void;
  onTagClick?: (tag: string) => void;
  onShowBoxLabel?: (containerName: string, roomName: string) => void;
  searchQuery?: string;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onEdit,
  onMove,
  onStatusChange,
  onTagClick,
  onShowBoxLabel,
}) => {
  const { t, getCategoryName } = useLanguage();

  const getStatusBadge = () => {
    switch (item.status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {t.status.available}
          </span>
        );
      case 'in_use':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200 rounded-md">
            <Clock className="w-3 h-3 text-sky-600" />
            {t.status.in_use}
          </span>
        );
      case 'loaned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
            <UserCheck className="w-3 h-3 text-amber-600" />
            {t.status.loaned}
          </span>
        );
      case 'missing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 rounded-md">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            {t.status.missing}
          </span>
        );
    }
  };

  const localizedCategory = getCategoryName(item.category);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* Top accent bar matching colorTag */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: item.colorTag || '#E2E8F0' }}
      />

      <div className="p-4 sm:p-5 flex-1">
        {/* Category & Status Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
            {localizedCategory}
          </span>
          <div className="shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Title and Quantity */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-amber-900 transition-colors">
            {item.name}
          </h3>
          <span className="shrink-0 text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
            {item.quantity} {t.itemCard.pcs}
          </span>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Highlighted Location Box */}
        <div className="my-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-amber-950 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="font-bold text-slate-900">{item.roomName}</span>
            <span className="text-amber-400">›</span>
            <span className="font-semibold text-amber-900 truncate">{item.container}</span>
          </div>

          {item.subLocation && (
            <p className="text-[11px] text-amber-800/90 pl-5 italic flex items-center gap-1">
              <span>{t.itemCard.exactPosition}</span>
              <span className="font-medium text-slate-800">{item.subLocation}</span>
            </p>
          )}

          {item.containerCode && (
            <div className="pl-5 pt-0.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>{t.itemCard.code} {item.containerCode}</span>
              {onShowBoxLabel && (
                <button
                  type="button"
                  onClick={() => onShowBoxLabel(item.container, item.roomName)}
                  className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-amber-700 hover:text-amber-900 hover:underline"
                >
                  <QrCode className="w-3 h-3" />
                  {t.itemCard.label}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Loaned warning if applicable */}
        {item.status === 'loaned' && item.loanedTo && (
          <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="font-medium truncate">{item.loanedTo}</span>
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {item.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagClick && onTagClick(tag)}
                className="text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 px-2 py-0.5 rounded-md transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {/* Quick status switch */}
          {item.status === 'available' ? (
            <button
              type="button"
              onClick={() => onStatusChange(item.id, 'in_use')}
              title={t.itemCard.takeItem}
              className="text-[11px] font-medium text-slate-600 hover:text-sky-700 hover:bg-sky-50 px-2 py-1 rounded-md transition-colors"
            >
              {t.itemCard.takeItem}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onStatusChange(item.id, 'available')}
              title={t.itemCard.putBack}
              className="text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-md transition-colors"
            >
              {t.itemCard.putBack}
            </button>
          )}

          <button
            type="button"
            onClick={() => onMove(item)}
            title={t.itemCard.move}
            className="text-[11px] font-medium text-slate-600 hover:text-amber-800 hover:bg-amber-50 px-2 py-1 rounded-md transition-colors inline-flex items-center gap-1"
          >
            <ArrowRightLeft className="w-3 h-3" />
            {t.itemCard.move}
          </button>
        </div>

        <button
          type="button"
          onClick={() => onEdit(item)}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          title={t.itemCard.edit}
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
