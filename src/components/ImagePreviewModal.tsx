import React, { useEffect } from 'react';
import { Item, ItemStatus } from '../types';
import {
  X,
  MapPin,
  Box,
  Tag,
  Edit,
  ArrowRightLeft,
  QrCode,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertTriangle,
  ExternalLink,
  Camera
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  onEdit?: (item: Item) => void;
  onMove?: (item: Item) => void;
  onShowBoxLabel?: (containerName: string, roomName: string) => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  item,
  onEdit,
  onMove,
  onShowBoxLabel,
}) => {
  const { t, getCategoryName } = useLanguage();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {t.status.available}
          </span>
        );
      case 'in_use':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            {t.status.in_use}
          </span>
        );
      case 'loaned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            {t.status.loaned}
          </span>
        );
      case 'missing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            {t.status.missing}
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700 overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-3.5 h-3.5 rounded-full shrink-0"
              style={{ backgroundColor: item.colorTag || '#F59E0B' }}
            />
            <h2 className="text-base sm:text-lg font-bold text-slate-100 truncate">
              {item.name}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full border border-slate-700 shrink-0">
              {item.quantity} {t.itemCard.pcs}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {item.photoUrl && (
              <a
                href={item.photoUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors hidden sm:inline-flex"
                title="Open original image in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title={t.imagePreview.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Large Image and Details */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Main Large Image Container */}
          <div className="relative w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center min-h-[300px] max-h-[58vh]">
            {item.photoUrl ? (
              <img
                src={item.photoUrl}
                alt={item.name}
                className="w-full h-full max-h-[58vh] object-contain select-none"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                <Camera className="w-16 h-16 stroke-1 text-slate-600 mb-3" />
                <p className="text-sm font-medium">{t.itemCard.noPhoto}</p>
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEdit(item);
                    }}
                    className="mt-3 px-3.5 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors"
                  >
                    {t.gallery.addPhotoPrompt}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4">
            {/* Status & Category */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {getCategoryName(item.category)}
                </span>
                <span className="text-slate-600">•</span>
                {getStatusBadge(item.status)}
              </div>

              {item.status === 'loaned' && item.loanedTo && (
                <div className="text-xs text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{item.loanedTo}</span>
                </div>
              )}
            </div>

            {/* Location highlight */}
            <div className="p-3.5 bg-slate-900/90 border border-slate-700 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t.imagePreview.location}:</span>
                <strong className="text-white font-bold">{item.roomName}</strong>
                <span className="text-slate-500">›</span>
                <strong className="text-amber-400 font-bold">{item.container}</strong>
              </div>

              {item.subLocation && (
                <p className="text-xs text-slate-300 pl-6 italic">
                  {t.itemCard.exactPosition} <span className="text-amber-300">{item.subLocation}</span>
                </p>
              )}

              {item.containerCode && (
                <p className="text-xs font-mono text-slate-400 pl-6">
                  {t.itemCard.code} {item.containerCode}
                </p>
              )}
            </div>

            {/* Description & Notes */}
            {item.description && (
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>{item.description}</p>
              </div>
            )}

            {item.notes && (
              <div className="text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <strong className="text-slate-300 font-semibold">{t.imagePreview.notes}:</strong> {item.notes}
              </div>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {onShowBoxLabel && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onShowBoxLabel(item.container, item.roomName);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-xl transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                {t.imagePreview.boxAndQR}
              </button>
            )}

            {onMove && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onMove(item);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                {t.itemCard.move}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                {t.imagePreview.editItem}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {t.imagePreview.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
