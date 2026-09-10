import React, { useState } from 'react';
import { Item, Room, CategoryDefinition } from '../types';
import { Download, Upload, X, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  rooms: Room[];
  categories: CategoryDefinition[];
  onImportData: (importedItems: Item[], importedRooms?: Room[], importedCategories?: CategoryDefinition[]) => void;
  onResetToDemo: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  items,
  rooms,
  categories,
  onImportData,
  onResetToDemo,
}) => {
  const { t } = useLanguage();
  const [importError, setImportError] = useState('');

  if (!isOpen) return null;

  const handleExportJson = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      items,
      rooms,
      categories,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storage-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && Array.isArray(json.items)) {
          onImportData(json.items, json.rooms, json.categories);
          alert(`${t.backupModal.importSuccess}: ${json.items.length} ${t.locations.itemsCountUnit}`);
          onClose();
        } else if (Array.isArray(json)) {
          // Direct array of items
          onImportData(json);
          alert(`${t.backupModal.importSuccess}: ${json.length} ${t.locations.itemsCountUnit}`);
          onClose();
        } else {
          setImportError(t.backupModal.importError);
        }
      } catch (err) {
        setImportError(t.backupModal.importError);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">{t.backupModal.title}</h3>
            <p className="text-xs text-slate-500">{t.backupModal.subtitle}</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Export card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs uppercase tracking-wider text-slate-700">
                {t.backupModal.exportTitle}
              </span>
              <span className="text-xs text-slate-500">{items.length} {t.locations.itemsCountUnit}</span>
            </div>
            <p className="text-xs text-slate-500">
              {t.backupModal.exportDesc}
            </p>
            <button
              type="button"
              onClick={handleExportJson}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {t.backupModal.exportBtn}
            </button>
          </div>

          {/* Import card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <span className="block font-semibold text-xs uppercase tracking-wider text-slate-700">
              {t.backupModal.importTitle}
            </span>
            <p className="text-xs text-slate-500">
              {t.backupModal.importDesc}
            </p>
            <label className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-slate-500" />
              {t.backupModal.importBtn}
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
            {importError && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {importError}
              </p>
            )}
          </div>

          {/* Reset card */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-700">{t.backupModal.resetTitle}</p>
              <p className="text-[11px] text-slate-400">{t.backupModal.resetDesc}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm(t.backupModal.resetConfirm)) {
                  onResetToDemo();
                  onClose();
                }
              }}
              className="text-xs text-amber-700 hover:text-amber-800 font-medium px-2.5 py-1.5 rounded-lg hover:bg-amber-50 cursor-pointer"
            >
              {t.backupModal.resetBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
