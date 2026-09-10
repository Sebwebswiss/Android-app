import React, { useState, useEffect } from 'react';
import { Room } from '../types';
import { X, Trash2, Check, AlertTriangle, Home } from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';
import { useLanguage } from '../i18n/LanguageContext';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomToEdit?: Room | null;
  onSave: (room: Room) => void;
  onDelete?: (roomId: string, reassignToRoomId?: string) => void;
  itemsCountInRoom: number;
  availableRoomsForReassign: Room[];
}

const AVAILABLE_ICONS = [
  'Warehouse',
  'Boxes',
  'Wrench',
  'PackageOpen',
  'BedDouble',
  'Laptop',
  'Tv',
  'DoorOpen',
  'Home',
  'Archive',
  'Car',
  'Building',
  'Refrigerator',
  'Bath',
  'Sparkles',
  'Layers',
  'Folder',
  'BookOpen',
];

const PRESET_COLORS = [
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#64748B', // Slate
  '#EF4444', // Red
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#84CC16', // Lime
];

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  roomToEdit,
  onSave,
  onDelete,
  itemsCountInRoom,
  availableRoomsForReassign,
}) => {
  const { t, getRoomName } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('Home');
  const [color, setColor] = useState('#8B5CF6');
  const [error, setError] = useState('');

  // Deletion prompt state
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [reassignRoomId, setReassignRoomId] = useState<string>('');

  useEffect(() => {
    if (roomToEdit) {
      setName(roomToEdit.name);
      setDescription(roomToEdit.description || '');
      setIconName(roomToEdit.iconName || 'Home');
      setColor(roomToEdit.color || '#8B5CF6');
    } else {
      setName('');
      setDescription('');
      setIconName('Home');
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    }
    setError('');
    setIsConfirmingDelete(false);
    if (availableRoomsForReassign.length > 0) {
      setReassignRoomId(availableRoomsForReassign[0].id);
    }
  }, [roomToEdit, isOpen, availableRoomsForReassign]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t.roomModal.nameRequired);
      return;
    }

    const slug =
      name
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-') || 'soba';
    const roomId = roomToEdit ? roomToEdit.id : `${slug}-${Date.now().toString(36)}`;

    onSave({
      id: roomId,
      name: name.trim(),
      description: description.trim(),
      iconName,
      color,
    });
    onClose();
  };

  const handleDeleteClick = () => {
    if (itemsCountInRoom > 0) {
      setIsConfirmingDelete(true);
    } else {
      if (window.confirm(t.roomModal.deleteConfirm)) {
        if (roomToEdit && onDelete) {
          onDelete(roomToEdit.id);
          onClose();
        }
      }
    }
  };

  const handleConfirmReassignDelete = (reassign: boolean) => {
    if (!roomToEdit || !onDelete) return;
    if (reassign) {
      onDelete(roomToEdit.id, reassignRoomId);
    } else {
      onDelete(roomToEdit.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: color }}
            >
              <DynamicIcon name={iconName} className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {roomToEdit ? t.roomModal.editTitle : t.roomModal.newTitle}
              </h2>
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

        {/* Delete with items prompt */}
        {isConfirmingDelete && roomToEdit ? (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 space-y-1">
                <p className="font-bold">
                  {t.roomModal.itemsInRoomWarning} <strong>{itemsCountInRoom}</strong> {t.allItems.columnItem.toLowerCase()}.
                </p>
                <p>
                  {availableRoomsForReassign.length > 0
                    ? t.roomModal.reassignToRoomLabel
                    : t.roomModal.deleteConfirm}
                </p>
              </div>
            </div>

            {availableRoomsForReassign.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.roomModal.reassignToRoomLabel}
                </label>
                <select
                  value={reassignRoomId}
                  onChange={(e) => setReassignRoomId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  {availableRoomsForReassign.map((r) => (
                    <option key={r.id} value={r.id}>
                      {getRoomName(r)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              {availableRoomsForReassign.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleConfirmReassignDelete(true)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-xs"
                >
                  {t.roomModal.reassignAndSaveBtn}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleConfirmReassignDelete(false)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
              >
                {t.roomModal.deleteRoomWithItemsBtn}
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="w-full py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                {t.roomModal.cancelBtn}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Room Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.roomModal.nameLabel}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder={t.roomModal.namePlaceholder}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 ${
                  error ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-amber-500'
                }`}
                autoFocus
              />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.roomModal.descLabel}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.roomModal.descPlaceholder}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            {/* Icon picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                {t.roomModal.iconLabel}
              </label>
              <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                {AVAILABLE_ICONS.map((icon) => {
                  const isSelected = iconName === icon;
                  return (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setIconName(icon)}
                      className={`h-10 rounded-xl flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-amber-600 text-white shadow-xs scale-105 ring-2 ring-amber-400'
                          : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                      }`}
                      title={icon}
                    >
                      <DynamicIcon name={icon} className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                {t.roomModal.colorLabel}
              </label>
              <div className="flex flex-wrap gap-2.5 items-center">
                {PRESET_COLORS.map((c) => {
                  const isSelected = color.toLowerCase() === c.toLowerCase();
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-full transition-transform flex items-center justify-center relative hover:scale-110 shadow-2xs"
                      style={{ backgroundColor: c }}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white drop-shadow-xs" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
              {roomToEdit && onDelete ? (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t.roomModal.deleteBtn}</span>
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
                  {t.roomModal.cancelBtn}
                </button>
                <button
                  type="submit"
                  onClick={(e) => handleSubmit(e)}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {t.roomModal.saveBtn}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
