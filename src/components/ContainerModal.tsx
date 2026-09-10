import React, { useState, useEffect } from 'react';
import { Room, Item } from '../types';
import { X, Box, Trash2, ArrowRightLeft, Check, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export type ContainerModalMode = 'new' | 'edit' | 'move';

interface ContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ContainerModalMode;
  initialRoomId?: string;
  initialContainerName?: string;
  initialCode?: string;
  rooms: Room[];
  itemsInContainer?: Item[];
  onSaveNew: (roomId: string, containerName: string, containerCode?: string) => void;
  onRename: (roomId: string, oldContainerName: string, newContainerName: string, newCode?: string) => void;
  onMoveContainer: (oldRoomId: string, containerName: string, targetRoomId: string) => void;
  onDeleteContainer?: (roomId: string, containerName: string, deleteItems: boolean) => void;
}

export const ContainerModal: React.FC<ContainerModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialRoomId,
  initialContainerName = '',
  initialCode = '',
  rooms,
  itemsInContainer = [],
  onSaveNew,
  onRename,
  onMoveContainer,
  onDeleteContainer,
}) => {
  const { t, getRoomName } = useLanguage();

  const [containerName, setContainerName] = useState('');
  const [containerCode, setContainerCode] = useState('');
  const [roomId, setRoomId] = useState('');
  const [targetRoomId, setTargetRoomId] = useState('');
  const [error, setError] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setContainerName(initialContainerName);
    setContainerCode(initialCode);
    const validRoomId = initialRoomId || rooms[0]?.id || '';
    setRoomId(validRoomId);

    // Default target room for move
    const otherRoom = rooms.find((r) => r.id !== validRoomId);
    setTargetRoomId(otherRoom ? otherRoom.id : validRoomId);

    setError('');
    setIsConfirmingDelete(false);
  }, [isOpen, mode, initialRoomId, initialContainerName, initialCode, rooms]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!containerName.trim()) {
      setError(t.containerModal.nameRequired);
      return;
    }

    if (mode === 'new') {
      onSaveNew(roomId, containerName.trim(), containerCode.trim() || undefined);
    } else if (mode === 'edit') {
      onRename(roomId, initialContainerName, containerName.trim(), containerCode.trim() || undefined);
    } else if (mode === 'move') {
      onMoveContainer(roomId, initialContainerName, targetRoomId);
    }

    onClose();
  };

  const handleDelete = (deleteItems: boolean) => {
    if (onDeleteContainer) {
      onDeleteContainer(roomId, initialContainerName, deleteItems);
    }
    onClose();
  };

  const getTitle = () => {
    if (mode === 'move') return t.containerModal.moveTitle;
    if (mode === 'edit') return t.containerModal.editTitle;
    return t.containerModal.newTitle;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
              {mode === 'move' ? <ArrowRightLeft className="w-5 h-5" /> : <Box className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{getTitle()}</h2>
              {initialContainerName && mode !== 'new' && (
                <p className="text-[11px] text-slate-500 truncate font-mono">
                  {initialContainerName} • {itemsInContainer.length} {t.containerModal.countItemsInside}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delete Confirmation State */}
        {isConfirmingDelete ? (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 space-y-1">
                <p className="font-bold">
                  {t.containerModal.deleteConfirm}
                </p>
                <p>
                  {itemsInContainer.length} {t.containerModal.countItemsInside}.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleDelete(false)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-xs"
              >
                Ukloni samo oznaku kutije (ostavi predmete)
              </button>
              <button
                type="button"
                onClick={() => handleDelete(true)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
              >
                Obriši kutiju i sve predmete unutra
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="w-full py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                {t.containerModal.cancelBtn}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Mode: Move Box */}
            {mode === 'move' ? (
              <>
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/70 text-xs text-amber-900">
                  <p className="font-semibold">{t.containerModal.moveSubtitle}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t.containerModal.newRoomLabel}
                  </label>
                  <select
                    value={targetRoomId}
                    onChange={(e) => setTargetRoomId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {getRoomName(r)}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                {/* Mode: New or Edit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t.containerModal.nameLabel}
                  </label>
                  <input
                    type="text"
                    value={containerName}
                    onChange={(e) => {
                      setContainerName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder={t.containerModal.namePlaceholder}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 ${
                      error ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-amber-500'
                    }`}
                    autoFocus
                  />
                  {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>

                {mode === 'new' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t.containerModal.roomLabel}
                    </label>
                    <select
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    >
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {getRoomName(r)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t.containerModal.codeLabel}
                  </label>
                  <input
                    type="text"
                    value={containerCode}
                    onChange={(e) => setContainerCode(e.target.value.toUpperCase())}
                    placeholder={t.containerModal.codePlaceholder}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>
              </>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
              {mode === 'edit' && onDeleteContainer ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t.containerModal.deleteBtn}</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  {t.containerModal.cancelBtn}
                </button>
                <button
                  type="submit"
                  onClick={(e) => handleSubmit(e)}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {mode === 'move' ? t.containerModal.moveBtn : t.containerModal.saveBtn}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
