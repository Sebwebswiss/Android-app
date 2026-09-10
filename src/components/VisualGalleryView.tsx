import React, { useState, useMemo } from 'react';
import { Item, Room, CategoryDefinition, ItemStatus } from '../types';
import {
  Search,
  X,
  Camera,
  MapPin,
  Box,
  Maximize2,
  Edit,
  ArrowRightLeft,
  QrCode,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertTriangle,
  Plus,
  Image as ImageIcon
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { searchItems } from '../utils/searchUtils';

interface VisualGalleryViewProps {
  items: Item[];
  rooms: Room[];
  categories: CategoryDefinition[];
  onOpenImagePreview: (item: Item) => void;
  onEditItem: (item: Item) => void;
  onMoveItem: (item: Item) => void;
  onStatusChange: (itemId: string, newStatus: ItemStatus) => void;
  onShowBoxLabel: (containerName: string, roomName: string) => void;
  onAddNew: () => void;
}

export const VisualGalleryView: React.FC<VisualGalleryViewProps> = ({
  items,
  rooms,
  categories,
  onOpenImagePreview,
  onEditItem,
  onMoveItem,
  onStatusChange,
  onShowBoxLabel,
  onAddNew,
}) => {
  const { t, getRoomName, getCategoryName } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyWithPhotos, setOnlyWithPhotos] = useState(false);

  // Total items with photo
  const itemsWithPhotosCount = useMemo(() => {
    return items.filter((it) => !!it.photoUrl).length;
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = items;

    if (onlyWithPhotos) {
      result = result.filter((it) => !!it.photoUrl);
    }

    if (searchQuery.trim()) {
      result = searchItems(result, searchQuery);
    }

    if (selectedRoom !== 'all') {
      result = result.filter((it) => it.roomId === selectedRoom);
    }

    if (selectedCategory !== 'all') {
      result = result.filter((it) => it.category === selectedCategory);
    }

    return result;
  }, [items, searchQuery, selectedRoom, selectedCategory, onlyWithPhotos]);

  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {t.status.available}
          </span>
        );
      case 'in_use':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 rounded-md">
            <Clock className="w-3 h-3 text-sky-600" />
            {t.status.in_use}
          </span>
        );
      case 'loaned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
            <UserCheck className="w-3 h-3 text-amber-600" />
            {t.status.loaned}
          </span>
        );
      case 'missing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-md">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            {t.status.missing}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
            {t.gallery.title}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {t.gallery.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            {t.gallery.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center">
            <span className="block text-lg font-black text-amber-600">
              {itemsWithPhotosCount} / {items.length}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {t.gallery.itemsWithPhotoCount}
            </span>
          </div>

          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-2xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.finder.saveNewItem}
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Search row */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.gallery.searchPlaceholder}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* Room filter */}
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="all">{t.gallery.allRoomsFilter}</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {getRoomName(r)}
                </option>
              ))}
            </select>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="all">{t.gallery.allCategoriesFilter}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {getCategoryName(c.name)}
                </option>
              ))}
            </select>

            {/* Only with photos toggle button */}
            <button
              type="button"
              onClick={() => setOnlyWithPhotos(!onlyWithPhotos)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                onlyWithPhotos
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              {t.gallery.onlyWithPhotosFilter}
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            {t.finder.showingCount} <strong>{filteredItems.length}</strong> / <strong>{items.length}</strong>
          </div>
        </div>
      </div>

      {/* Grid of Visual Cards */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 mx-auto mb-3">
            <Camera className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {t.gallery.noPhotosFound}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-5">
            {t.gallery.noPhotosDesc}
          </p>
          <div className="flex items-center justify-center gap-3">
            {onlyWithPhotos && (
              <button
                type="button"
                onClick={() => setOnlyWithPhotos(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Prikaži sve predmete
              </button>
            )}
            <button
              type="button"
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t.finder.saveNewItem}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const hasPhoto = !!item.photoUrl;

            return (
              <div
                key={item.id}
                className="group relative bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg hover:border-amber-400 transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                {/* Visual Image Preview Area */}
                <div
                  onClick={() => onOpenImagePreview(item)}
                  className="relative w-full h-48 bg-slate-100 cursor-pointer overflow-hidden flex items-center justify-center"
                >
                  {hasPhoto ? (
                    <>
                      <img
                        src={item.photoUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Zoom Overlay on Hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2">
                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-full mb-1">
                          <Maximize2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-semibold tracking-wide">
                          {t.gallery.clickToEnlarge}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                      <Camera className="w-10 h-10 stroke-1 text-slate-400 mb-1.5" />
                      <span className="text-[11px] font-medium text-slate-500">
                        {t.itemCard.noPhoto}
                      </span>
                      <span className="text-[10px] text-amber-700 font-semibold mt-1 underline">
                        {t.gallery.addPhotoPrompt}
                      </span>
                    </div>
                  )}

                  {/* Status Badge in corner */}
                  <div className="absolute top-2.5 right-2.5 z-10 shadow-xs">
                    {getStatusBadge(item.status)}
                  </div>

                  {/* Quantity Tag in top left */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-900/80 text-white backdrop-blur-xs rounded-md shadow-xs">
                      {item.quantity} {t.itemCard.pcs}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category */}
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      {getCategoryName(item.category)}
                    </span>

                    {/* Title */}
                    <h3
                      onClick={() => onOpenImagePreview(item)}
                      className="text-sm font-bold text-slate-900 leading-snug group-hover:text-amber-800 transition-colors cursor-pointer line-clamp-2"
                      title={item.name}
                    >
                      {item.name}
                    </h3>

                    {/* Location Badge */}
                    <div className="mt-2.5 p-2 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-amber-950 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="font-bold text-slate-900 truncate">{item.roomName}</span>
                        <span className="text-amber-400">›</span>
                        <span className="font-semibold text-amber-900 truncate">{item.container}</span>
                      </div>

                      {item.subLocation && (
                        <p className="text-[10px] text-amber-800 pl-5 italic truncate">
                          {item.subLocation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => onOpenImagePreview(item)}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1"
                    >
                      <Maximize2 className="w-3 h-3" />
                      {t.itemCard.viewBigPhoto}
                    </button>

                    <div className="flex items-center gap-1">
                      {item.container && (
                        <button
                          type="button"
                          onClick={() => onShowBoxLabel(item.container, item.roomName)}
                          className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          title={t.itemCard.label}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onMoveItem(item)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title={t.itemCard.move}
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditItem(item)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title={t.itemCard.edit}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
