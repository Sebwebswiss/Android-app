import React, { useState, useEffect, useRef } from 'react';
import { Item, Room, CategoryDefinition, ItemStatus } from '../types';
import { X, Plus, Trash2, Camera, MapPin, Box, Tag, AlertCircle, Check, Info } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Item) => void;
  onDelete?: (itemId: string) => void;
  itemToEdit?: Item | null;
  rooms: Room[];
  categories: CategoryDefinition[];
  defaultRoomId?: string;
  defaultContainer?: string;
  onOpenAddRoom?: () => void;
  onOpenManageCategories?: () => void;
  onQuickAddCategory?: (categoryName: string) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  itemToEdit,
  rooms,
  categories,
  defaultRoomId,
  defaultContainer,
  onOpenAddRoom,
  onOpenManageCategories,
  onQuickAddCategory,
}) => {
  const { t, getRoomName, getCategoryName } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [roomId, setRoomId] = useState('');
  const [container, setContainer] = useState('');
  const [containerCode, setContainerCode] = useState('');
  const [subLocation, setSubLocation] = useState('');
  const [category, setCategory] = useState('');
  const [tagsString, setTagsString] = useState('');
  const [colorTag, setColorTag] = useState('#3B82F6');
  const [status, setStatus] = useState<ItemStatus>('available');
  const [loanedTo, setLoanedTo] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Quick category inline adder state
  const [isQuickAddingCategory, setIsQuickAddingCategory] = useState(false);
  const [quickCategoryName, setQuickCategoryName] = useState('');

  // Refs to track modal lifecycle and prevent wiping form inputs when categories or rooms change
  const prevIsOpenRef = useRef(false);
  const prevItemToEditIdRef = useRef<string | null | undefined>(undefined);
  const prevCategoriesRef = useRef<CategoryDefinition[]>(categories);
  const prevRoomsRef = useRef<Room[]>(rooms);

  useEffect(() => {
    const wasJustOpened = isOpen && !prevIsOpenRef.current;
    const itemChanged = itemToEdit?.id !== prevItemToEditIdRef.current;

    // Only reset/initialize form when the modal is freshly opened or a different item is selected for edit
    if (isOpen && (wasJustOpened || itemChanged)) {
      if (itemToEdit) {
        setName(itemToEdit.name);
        setDescription(itemToEdit.description || '');
        setQuantity(itemToEdit.quantity || 1);
        setRoomId(itemToEdit.roomId);
        setContainer(itemToEdit.container || '');
        setContainerCode(itemToEdit.containerCode || '');
        setSubLocation(itemToEdit.subLocation || '');
        setCategory(itemToEdit.category || categories[0]?.name || '');
        setTagsString((itemToEdit.tags || []).join(', '));
        setColorTag(itemToEdit.colorTag || '#3B82F6');
        setStatus(itemToEdit.status || 'available');
        setLoanedTo(itemToEdit.loanedTo || '');
        setNotes(itemToEdit.notes || '');
        setPhotoUrl(itemToEdit.photoUrl);
      } else {
        setName('');
        setDescription('');
        setQuantity(1);
        setRoomId(defaultRoomId || rooms[0]?.id || 'tavan');
        setContainer(defaultContainer || '');
        setContainerCode('');
        setSubLocation('');
        setCategory(categories[0]?.name || 'Alati & Radionica');
        setTagsString('');
        setColorTag('#3B82F6');
        setStatus('available');
        setLoanedTo('');
        setNotes('');
        setPhotoUrl(undefined);
      }
      setIsQuickAddingCategory(false);
      setQuickCategoryName('');
      setErrors({});
    } else if (isOpen) {
      // If modal was already open and a new category was added, auto-select it!
      if (categories.length > prevCategoriesRef.current.length) {
        const newlyAddedCategory = categories.find(
          (c) => !prevCategoriesRef.current.some((pc) => pc.id === c.id)
        );
        if (newlyAddedCategory) {
          setCategory(newlyAddedCategory.name);
        }
      }

      // If a new room was added while open, auto-select it!
      if (rooms.length > prevRoomsRef.current.length) {
        const newlyAddedRoom = rooms.find(
          (r) => !prevRoomsRef.current.some((pr) => pr.id === r.id)
        );
        if (newlyAddedRoom) {
          setRoomId(newlyAddedRoom.id);
        }
      }
    }

    prevIsOpenRef.current = isOpen;
    prevItemToEditIdRef.current = itemToEdit?.id;
    prevCategoriesRef.current = categories;
    prevRoomsRef.current = rooms;
  }, [isOpen, itemToEdit, defaultRoomId, defaultContainer, rooms, categories]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max ~3MB)
    if (file.size > 3 * 1024 * 1024) {
      alert(t.itemModal.photoSizeWarning);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t.itemModal.nameRequired;
    }
    if (!roomId) {
      newErrors.roomId = t.moveModal.newRoomLabel;
    }
    if (!container.trim()) {
      newErrors.container = t.itemModal.containerRequired;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedRoom = rooms.find(r => r.id === roomId);
    const parsedTags = tagsString
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const now = new Date().toISOString();

    const savedItem: Item = {
      id: itemToEdit ? itemToEdit.id : `item-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      quantity: Math.max(1, Number(quantity) || 1),
      roomId: roomId,
      roomName: selectedRoom ? selectedRoom.name : 'Ostava',
      container: container.trim(),
      containerCode: containerCode.trim() || undefined,
      subLocation: subLocation.trim() || undefined,
      category: category || 'Ostalo',
      tags: parsedTags,
      colorTag,
      status,
      loanedTo: status === 'loaned' ? loanedTo.trim() : undefined,
      notes: notes.trim() || undefined,
      photoUrl,
      createdAt: itemToEdit ? itemToEdit.createdAt : now,
      updatedAt: now,
      lastCheckedDate: new Date().toISOString().split('T')[0],
    };

    onSave(savedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {itemToEdit ? t.itemModal.editTitle : t.itemModal.newTitle}
            </h2>
            <p className="text-xs text-slate-500">
              {t.itemModal.subLocationHint}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Item Name & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.itemModal.nameLabel}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.itemModal.namePlaceholder}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 ${
                  errors.name ? 'border-red-500 bg-red-50/30' : 'border-slate-300 focus:border-amber-500'
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.itemModal.quantityLabel}
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Location details: Room & Container */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/70 space-y-3.5">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-amber-700" />
              {t.allItems.filterRoom}:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    {t.itemModal.roomLabel}
                  </label>
                  {onOpenAddRoom && (
                    <button
                      type="button"
                      onClick={onOpenAddRoom}
                      className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 hover:underline"
                    >
                      + {t.locations.addRoomBtn}
                    </button>
                  )}
                </div>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                >
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {getRoomName(room)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.itemModal.containerLabel}
                </label>
                <input
                  type="text"
                  value={container}
                  onChange={(e) => setContainer(e.target.value)}
                  placeholder={t.itemModal.containerPlaceholder}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 ${
                    errors.container ? 'border-red-500 bg-red-50/30' : 'border-slate-300 focus:border-amber-500'
                  }`}
                />
                {errors.container && <p className="text-xs text-red-500 mt-1">{errors.container}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.itemModal.subLocationLabel}
                </label>
                <input
                  type="text"
                  value={subLocation}
                  onChange={(e) => setSubLocation(e.target.value)}
                  placeholder={t.itemModal.subLocationPlaceholder}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.itemModal.codeLabel}
                </label>
                <input
                  type="text"
                  value={containerCode}
                  onChange={(e) => setContainerCode(e.target.value.toUpperCase())}
                  placeholder={t.itemModal.codePlaceholder}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {t.itemModal.categoryLabel}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickAddingCategory(!isQuickAddingCategory);
                      setQuickCategoryName('');
                    }}
                    className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                  >
                    {isQuickAddingCategory ? `✕ ${t.itemModal.cancelBtn}` : `+ ${t.categoryModal.addCategoryBtn}`}
                  </button>
                  {onOpenManageCategories && (
                    <button
                      type="button"
                      onClick={onOpenManageCategories}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                      title={t.categoryModal.manageTitle}
                    >
                      ⚙️
                    </button>
                  )}
                </div>
              </div>

              {isQuickAddingCategory ? (
                <div className="flex items-center gap-1.5 animate-in fade-in">
                  <input
                    type="text"
                    value={quickCategoryName}
                    onChange={(e) => setQuickCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const trimmed = quickCategoryName.trim();
                        if (trimmed) {
                          if (onQuickAddCategory) {
                            onQuickAddCategory(trimmed);
                          }
                          setCategory(trimmed);
                          setIsQuickAddingCategory(false);
                          setQuickCategoryName('');
                        }
                      }
                    }}
                    placeholder={t.categoryModal.namePlaceholder}
                    autoFocus
                    className="flex-1 px-3 py-2 text-xs border border-amber-300 rounded-xl bg-amber-50/20 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = quickCategoryName.trim();
                      if (trimmed) {
                        if (onQuickAddCategory) {
                          onQuickAddCategory(trimmed);
                        }
                        setCategory(trimmed);
                        setIsQuickAddingCategory(false);
                        setQuickCategoryName('');
                      }
                    }}
                    className="px-3 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shrink-0 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {getCategoryName(c.name)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.itemModal.statusLabel}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ItemStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              >
                <option value="available">{t.status.available}</option>
                <option value="in_use">{t.status.in_use}</option>
                <option value="loaned">{t.status.loaned}</option>
                <option value="missing">{t.status.missing}</option>
              </select>
            </div>
          </div>

          {/* If loaned, show whom */}
          {status === 'loaned' && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl">
              <label className="block text-xs font-semibold text-amber-900 mb-1">
                {t.itemModal.loanedToLabel}
              </label>
              <input
                type="text"
                value={loanedTo}
                onChange={(e) => setLoanedTo(e.target.value)}
                placeholder={t.itemModal.loanedToPlaceholder}
                className="w-full px-3 py-2 rounded-lg border border-amber-300 text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          {/* Tags & Color */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.itemModal.tagsLabel}
              </label>
              <input
                type="text"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                placeholder={t.itemModal.tagsPlaceholder}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.itemModal.colorLabel}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={colorTag}
                  onChange={(e) => setColorTag(e.target.value)}
                  className="w-10 h-9 p-0.5 rounded-lg border border-slate-300 cursor-pointer bg-white"
                />
                <span className="text-xs font-mono text-slate-600 uppercase">{colorTag}</span>
              </div>
            </div>
          </div>

          {/* Description & Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {t.itemModal.descLabel}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.itemModal.descPlaceholder}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {t.itemModal.notesLabel}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.itemModal.notesPlaceholder}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          {/* Photo upload / preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {t.itemModal.photoLabel}
            </label>
            <div className="flex items-center gap-4">
              {photoUrl ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-xs shrink-0">
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl(undefined)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-xs"
                    title={t.itemModal.removePhotoBtn}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-24 h-20 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-amber-500 hover:bg-amber-50/30 transition-colors">
                  <Camera className="w-6 h-6 text-slate-400" />
                  <span className="text-[10px] text-slate-500 mt-1 font-medium">{t.itemModal.uploadPhotoBtn}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {itemToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`${t.itemModal.deleteConfirm} "${itemToEdit.name}"?`)) {
                    onDelete(itemToEdit.id);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {t.itemModal.deleteBtn}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                {t.itemModal.cancelBtn}
              </button>
              <button
                type="submit"
                onClick={(e) => handleSubmit(e)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                {t.itemModal.saveBtn}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
