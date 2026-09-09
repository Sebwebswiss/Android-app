import React, { useState } from 'react';
import { Item, Room, CategoryDefinition, ItemStatus } from '../types';
import { ItemCard } from './ItemCard';
import { Search, LayoutGrid, List, Plus } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface AllItemsViewProps {
  items: Item[];
  rooms: Room[];
  categories: CategoryDefinition[];
  onEditItem: (item: Item) => void;
  onMoveItem: (item: Item) => void;
  onStatusChange: (itemId: string, status: ItemStatus) => void;
  onShowBoxLabel: (containerName: string, roomName: string) => void;
  onAddNew: () => void;
}

export const AllItemsView: React.FC<AllItemsViewProps> = ({
  items,
  rooms,
  categories,
  onEditItem,
  onMoveItem,
  onStatusChange,
  onShowBoxLabel,
  onAddNew,
}) => {
  const { t, language, getRoomName, getCategoryName } = useLanguage();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'room' | 'updated' | 'quantity'>('updated');
  const [localSearch, setLocalSearch] = useState('');
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('grid');

  const filtered = items.filter(it => {
    if (filterCategory !== 'all' && it.category !== filterCategory) return false;
    if (filterRoom !== 'all' && it.roomId !== filterRoom) return false;
    if (filterStatus !== 'all' && it.status !== filterStatus) return false;
    if (localSearch.trim()) {
      const q = localSearch.toLowerCase();
      return (
        it.name.toLowerCase().includes(q) ||
        it.container.toLowerCase().includes(q) ||
        it.roomName.toLowerCase().includes(q) ||
        (it.tags && it.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name, language === 'hr' ? 'hr' : 'en');
    if (sortBy === 'room') return a.roomName.localeCompare(b.roomName, language === 'hr' ? 'hr' : 'en');
    if (sortBy === 'quantity') return b.quantity - a.quantity;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t.allItems.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.allItems.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setDisplayMode('grid')}
              className={`p-1.5 rounded-lg text-xs ${
                displayMode === 'grid' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
              title={t.allItems.gridView}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDisplayMode('table')}
              className={`p-1.5 rounded-lg text-xs ${
                displayMode === 'table' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
              title={t.allItems.tableView}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t.nav.addItem}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={t.allItems.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          {/* Room filter */}
          <div>
            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
            >
              <option value="all">{t.allItems.allRooms}</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{getRoomName(r)}</option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
            >
              <option value="all">{t.allItems.allCategories}</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{getCategoryName(c)}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
            >
              <option value="updated">{t.allItems.sortUpdated}</option>
              <option value="name">{t.allItems.sortName}</option>
              <option value="room">{t.allItems.sortRoom}</option>
              <option value="quantity">{t.allItems.sortQuantity}</option>
            </select>
          </div>
        </div>

        {/* Quick count indicator */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{t.finder.showingCount} <strong>{sorted.length}</strong> / {items.length} {t.totalSavedBadge}</span>
          {(filterCategory !== 'all' || filterRoom !== 'all' || filterStatus !== 'all' || localSearch) && (
            <button
              onClick={() => {
                setFilterCategory('all');
                setFilterRoom('all');
                setFilterStatus('all');
                setLocalSearch('');
              }}
              className="text-amber-700 hover:underline font-medium"
            >
              {t.allItems.clearSearch}
            </button>
          )}
        </div>
      </div>

      {/* Grid or Table Display */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
          <p className="text-sm font-semibold text-slate-700">{t.allItems.noItemsFound}</p>
          <p className="text-xs text-slate-500 mt-1">{t.allItems.tryChangingFilters}</p>
        </div>
      ) : displayMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={onEditItem}
              onMove={onMoveItem}
              onStatusChange={onStatusChange}
              onShowBoxLabel={onShowBoxLabel}
            />
          ))}
        </div>
      ) : (
        /* Table Mode */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">{t.allItems.columnItem}</th>
                  <th className="px-4 py-3">{t.allItems.columnRoomContainer}</th>
                  <th className="px-4 py-3">{t.allItems.columnCategory}</th>
                  <th className="px-4 py-3">{t.allItems.columnQty}</th>
                  <th className="px-4 py-3">{t.allItems.columnStatus}</th>
                  <th className="px-4 py-3 text-right">{t.allItems.columnActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map(item => (
                  <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{item.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{item.roomName}</div>
                      <div className="text-[11px] text-amber-900 font-medium">{item.container}</div>
                      {item.subLocation && (
                        <div className="text-[10px] text-slate-400 italic">{item.subLocation}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {getCategoryName(item.category)}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-700">
                      {item.quantity} {t.itemCard.pcs}
                    </td>
                    <td className="px-4 py-3">
                      {item.status === 'available' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                          {t.status.available}
                        </span>
                      ) : item.status === 'in_use' ? (
                        <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-medium">
                          {t.status.in_use}
                        </span>
                      ) : item.status === 'loaned' ? (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium">
                          {t.status.loaned}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-medium">
                          {t.status.missing}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => onMoveItem(item)}
                        className="text-amber-700 hover:text-amber-900 font-medium"
                      >
                        {t.itemCard.move}
                      </button>
                      <button
                        onClick={() => onEditItem(item)}
                        className="text-slate-600 hover:text-slate-900 font-medium"
                      >
                        {t.itemCard.edit}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
