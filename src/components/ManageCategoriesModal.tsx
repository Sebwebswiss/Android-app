import React, { useState } from 'react';
import { CategoryDefinition, Item } from '../types';
import { X, Plus, Trash2, Edit2, Check, Tags, AlertCircle } from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';
import { useLanguage } from '../i18n/LanguageContext';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryDefinition[];
  items: Item[];
  onSaveCategory: (category: CategoryDefinition, previousName?: string) => void;
  onDeleteCategory: (categoryId: string, reassignToCategoryName?: string) => void;
}

const AVAILABLE_ICONS = [
  'Sparkles',
  'Hammer',
  'FileText',
  'Cpu',
  'Shirt',
  'Compass',
  'HeartPulse',
  'Gamepad2',
  'Brush',
  'Folder',
  'BookOpen',
  'Tag',
  'Coffee',
  'ShoppingBag',
  'Music',
  'Utensils',
  'Glasses',
  'Camera',
];

const PRESET_COLORS = [
  '#E11D48', // Rose
  '#EA580C', // Orange
  '#2563EB', // Blue
  '#7C3AED', // Purple
  '#DB2777', // Pink
  '#059669', // Emerald
  '#DC2626', // Red
  '#4F46E5', // Indigo
  '#0891B2', // Cyan
  '#65A30D', // Lime
  '#D97706', // Amber
  '#475569', // Slate
];

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  items,
  onSaveCategory,
  onDeleteCategory,
}) => {
  const { t, getCategoryName } = useLanguage();

  // Mode: list or edit/add
  const [editingCategory, setEditingCategory] = useState<CategoryDefinition | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [iconName, setIconName] = useState('Tag');
  const [color, setColor] = useState('#E11D48');
  const [error, setError] = useState('');

  // Delete reassign state
  const [deletingCategory, setDeletingCategory] = useState<CategoryDefinition | null>(null);
  const [reassignCategoryName, setReassignCategoryName] = useState<string>('');

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingCategory(null);
    setName('');
    setIconName('Tag');
    setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setError('');
    setIsAdding(true);
    setDeletingCategory(null);
  };

  const handleStartEdit = (cat: CategoryDefinition) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIconName(cat.iconName || 'Tag');
    setColor(cat.color || '#E11D48');
    setError('');
    setIsAdding(true);
    setDeletingCategory(null);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t.categoryModal.nameRequired);
      return;
    }

    if (editingCategory) {
      onSaveCategory(
        {
          id: editingCategory.id,
          name: name.trim(),
          iconName,
          color,
        },
        editingCategory.name
      );
    } else {
      const newId =
        name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

      onSaveCategory({
        id: newId,
        name: name.trim(),
        iconName,
        color,
      });
    }

    setIsAdding(false);
    setEditingCategory(null);
  };

  const handleStartDelete = (cat: CategoryDefinition) => {
    const itemsWithCategory = items.filter(
      (it) => it.category?.toLowerCase() === cat.name.toLowerCase()
    );

    if (itemsWithCategory.length > 0) {
      setDeletingCategory(cat);
      const otherCat = categories.find((c) => c.id !== cat.id);
      setReassignCategoryName(otherCat ? otherCat.name : '');
    } else {
      if (window.confirm(t.categoryModal.deleteConfirm)) {
        onDeleteCategory(cat.id);
      }
    }
  };

  const handleConfirmReassignDelete = (reassign: boolean) => {
    if (!deletingCategory) return;
    if (reassign && reassignCategoryName) {
      onDeleteCategory(deletingCategory.id, reassignCategoryName);
    } else {
      onDeleteCategory(deletingCategory.id);
    }
    setDeletingCategory(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isAdding
                  ? editingCategory
                    ? t.categoryModal.editTitle
                    : t.categoryModal.newTitle
                  : t.categoryModal.manageTitle}
              </h2>
              <p className="text-[11px] text-slate-500">
                {isAdding
                  ? ''
                  : `${categories.length} ${t.categoryModal.countItems}`}
              </p>
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

        {/* Content */}
        {deletingCategory ? (
          /* Delete Prompt with Reassign */
          <div className="p-6 space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 space-y-1">
                <p className="font-bold">
                  {items.filter((it) => it.category?.toLowerCase() === deletingCategory.name.toLowerCase()).length}{' '}
                  {t.categoryModal.itemsInCategoryWarning}
                </p>
                <p>{t.categoryModal.reassignToCategoryLabel}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.categoryModal.reassignToCategoryLabel}
              </label>
              <select
                value={reassignCategoryName}
                onChange={(e) => setReassignCategoryName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                {categories
                  .filter((c) => c.id !== deletingCategory.id)
                  .map((c) => (
                    <option key={c.id} value={c.name}>
                      {getCategoryName(c)}
                    </option>
                  ))}
              </select>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleConfirmReassignDelete(true)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-xs"
              >
                {t.roomModal.reassignAndSaveBtn}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmReassignDelete(false)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
              >
                {t.categoryModal.deleteBtn}
              </button>
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="w-full py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                {t.categoryModal.cancelBtn}
              </button>
            </div>
          </div>
        ) : isAdding ? (
          /* Add / Edit Category Form */
          <form onSubmit={handleSaveForm} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.categoryModal.nameLabel}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder={t.categoryModal.namePlaceholder}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 ${
                  error ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-amber-500'
                }`}
                autoFocus
              />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>

            {/* Icon picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                {t.categoryModal.iconLabel}
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
                {t.categoryModal.colorLabel}
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
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingCategory(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {t.categoryModal.cancelBtn}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
              >
                {t.categoryModal.saveBtn}
              </button>
            </div>
          </form>
        ) : (
          /* List of Categories */
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t.categoryModal.manageSubtitle}
              </span>
              <button
                type="button"
                onClick={handleStartAdd}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t.categoryModal.addCategoryBtn}
              </button>
            </div>

            <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
              {categories.map((cat) => {
                const count = items.filter(
                  (it) => it.category?.toLowerCase() === cat.name.toLowerCase()
                ).length;
                const localizedName = getCategoryName(cat);

                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-amber-300 bg-white hover:bg-amber-50/20 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        <DynamicIcon name={cat.iconName} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {localizedName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {count} {t.categoryModal.countItems}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title={t.itemCard.edit}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartDelete(cat)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title={t.itemCard.edit}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                {t.categoryModal.closeBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
