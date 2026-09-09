import React, { useState, useEffect, useMemo } from 'react';
import { Item, Room, CategoryDefinition, ViewMode, ItemStatus } from './types';
import { INITIAL_ITEMS, INITIAL_ROOMS, INITIAL_CATEGORIES } from './data/initialData';
import { searchItems, cleanSearchQuery } from './utils/searchUtils';
import { Header } from './components/Header';
import { FinderHero } from './components/FinderHero';
import { ItemCard } from './components/ItemCard';
import { LocationsView } from './components/LocationsView';
import { ContainersView } from './components/ContainersView';
import { AllItemsView } from './components/AllItemsView';
import { ItemModal } from './components/ItemModal';
import { MoveItemModal } from './components/MoveItemModal';
import { BoxLabelModal } from './components/BoxLabelModal';
import { BackupModal } from './components/BackupModal';
import { DynamicIcon } from './components/DynamicIcon';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import {
  MapPin,
  Sparkles,
  Plus,
  Box,
  Compass,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

const STORAGE_KEYS = {
  ITEMS: 'spremljene_stvari_items_v2',
  ROOMS: 'spremljene_stvari_rooms_v2',
  CATEGORIES: 'spremljene_stvari_categories_v2',
};

function AppContent() {
  const { t, getRoomName } = useLanguage();

  // Load state from localStorage with fallback to initial data
  const [items, setItems] = useState<Item[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Greška pri učitavanju stavki iz lokalne pohrane:', e);
    }
    return INITIAL_ITEMS;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROOMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Greška pri učitavanju soba iz lokalne pohrane:', e);
    }
    return INITIAL_ROOMS;
  });

  const [categories, setCategories] = useState<CategoryDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Greška pri učitavanju kategorija iz lokalne pohrane:', e);
    }
    return INITIAL_CATEGORIES;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error('Greška pri spremanju stavki:', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    } catch (e) {
      console.error('Greška pri spremanju soba:', e);
    }
  }, [rooms]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Greška pri spremanju kategorija:', e);
    }
  }, [categories]);

  // Views & Filters
  const [currentView, setCurrentView] = useState<ViewMode>('finder');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [defaultRoomId, setDefaultRoomId] = useState<string | undefined>(undefined);
  const [defaultContainer, setDefaultContainer] = useState<string | undefined>(undefined);

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState<Item | null>(null);

  const [isBoxLabelModalOpen, setIsBoxLabelModalOpen] = useState(false);
  const [boxLabelContainer, setBoxLabelContainer] = useState('');
  const [boxLabelRoom, setBoxLabelRoom] = useState('');

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Search and Filter computation
  const filteredItems = useMemo(() => {
    let result = items;

    // Apply text search
    if (searchQuery.trim()) {
      result = searchItems(result, searchQuery);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((it) => it.status === statusFilter);
    }

    // Apply room filter
    if (selectedRoom !== 'all') {
      result = result.filter((it) => it.roomId === selectedRoom);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter((it) => it.category === selectedCategory);
    }

    return result;
  }, [items, searchQuery, statusFilter, selectedRoom, selectedCategory]);

  // Handlers for Items
  const handleSaveItem = (savedItem: Item) => {
    setItems((prev) => {
      const exists = prev.some((it) => it.id === savedItem.id);
      if (exists) {
        return prev.map((it) => (it.id === savedItem.id ? savedItem : it));
      } else {
        return [savedItem, ...prev];
      }
    });
  };

  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const handleStatusChange = (itemId: string, newStatus: ItemStatus) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          return {
            ...it,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return it;
      })
    );
  };

  const handleMoveItem = (
    itemId: string,
    newRoomId: string,
    newRoomName: string,
    newContainer: string,
    newSubLocation?: string
  ) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          return {
            ...it,
            roomId: newRoomId,
            roomName: newRoomName,
            container: newContainer,
            subLocation: newSubLocation,
            updatedAt: new Date().toISOString(),
          };
        }
        return it;
      })
    );
  };

  // Open modal helpers
  const handleOpenAddModal = (roomId?: string, container?: string) => {
    setItemToEdit(null);
    setDefaultRoomId(roomId);
    setDefaultContainer(container);
    setIsItemModalOpen(true);
  };

  const handleOpenEditModal = (item: Item) => {
    setItemToEdit(item);
    setIsItemModalOpen(true);
  };

  const handleOpenMoveModal = (item: Item) => {
    setItemToMove(item);
    setIsMoveModalOpen(true);
  };

  const handleOpenBoxLabel = (containerName: string, roomName: string) => {
    setBoxLabelContainer(containerName);
    setBoxLabelRoom(roomName);
    setIsBoxLabelModalOpen(true);
  };

  const handleResetToDemo = () => {
    setItems(INITIAL_ITEMS);
    setRooms(INITIAL_ROOMS);
    setCategories(INITIAL_CATEGORIES);
    setSearchQuery('');
    setStatusFilter('all');
  };

  const handleImportData = (
    importedItems: Item[],
    importedRooms?: Room[],
    importedCategories?: CategoryDefinition[]
  ) => {
    if (importedItems && Array.isArray(importedItems)) {
      setItems(importedItems);
    }
    if (importedRooms && Array.isArray(importedRooms)) {
      setRooms(importedRooms);
    }
    if (importedCategories && Array.isArray(importedCategories)) {
      setCategories(importedCategories);
    }
  };

  // Items for the open box label modal
  const boxItems = useMemo(() => {
    if (!boxLabelContainer) return [];
    return items.filter(
      (it) =>
        it.container.toLowerCase() === boxLabelContainer.toLowerCase() &&
        it.roomName.toLowerCase() === boxLabelRoom.toLowerCase()
    );
  }, [items, boxLabelContainer, boxLabelRoom]);

  // Direct hit answer card for conversational query
  const directHit = useMemo(() => {
    if (!searchQuery.trim() || filteredItems.length === 0) return null;
    return filteredItems[0];
  }, [searchQuery, filteredItems]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Application Bar */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onAddNew={() => handleOpenAddModal()}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        totalItems={items.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* VIEW 1: FINDER / WHERE IS MY...? */}
        {currentView === 'finder' && (
          <div className="space-y-8">
            <FinderHero
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              selectedRoom={selectedRoom}
              onSelectedRoomChange={setSelectedRoom}
              selectedCategory={selectedCategory}
              onSelectedCategoryChange={setSelectedCategory}
              onAddNew={() => handleOpenAddModal()}
              totalItemsCount={items.length}
              filteredCount={filteredItems.length}
            />

            {/* Direct Instant Answer Card (when query matches) */}
            {searchQuery.trim() && directHit && (
              <div className="p-4 sm:p-6 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-amber-700" />
                  {t.finder.bestMatch}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      {directHit.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-amber-950 font-medium mt-1">
                      <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>{t.finder.storedIn}</span>
                      <strong className="text-slate-900 underline decoration-amber-400 decoration-2">
                        {directHit.roomName}
                      </strong>
                      <span>›</span>
                      <strong className="text-amber-900 font-bold">{directHit.container}</strong>
                      {directHit.subLocation && (
                        <span className="text-xs text-slate-600 italic">
                          ({directHit.subLocation})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenBoxLabel(directHit.container, directHit.roomName)}
                      className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-300 rounded-xl transition-colors"
                    >
                      {t.finder.showBoxQR}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(directHit)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      {t.finder.openDetails}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Results Grid or Empty State */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 mx-auto mb-3">
                  <Box className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  {searchQuery ? `${t.finder.noResultsTitle} "${searchQuery}"` : t.finder.emptyListTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-5">
                  {searchQuery ? t.finder.noResultsDesc : t.finder.emptyListDesc}
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t.finder.saveItemPrompt}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    {searchQuery ? `${t.finder.searchResultsHeading} (${filteredItems.length})` : t.finder.allSavedHeading}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onEdit={handleOpenEditModal}
                      onMove={handleOpenMoveModal}
                      onStatusChange={handleStatusChange}
                      onTagClick={(tag) => setSearchQuery(tag)}
                      onShowBoxLabel={handleOpenBoxLabel}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Browse by Rooms Preview Section */}
            {!searchQuery && (
              <div className="pt-8 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{t.finder.browseRoomsTitle}</h2>
                    <p className="text-xs text-slate-500">
                      {t.finder.browseRoomsSubtitle}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentView('by-location')}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                  >
                    {t.finder.viewAllRooms}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {rooms.slice(0, 4).map((r) => {
                    const count = items.filter((it) => it.roomId === r.id).length;
                    return (
                      <div
                        key={r.id}
                        onClick={() => {
                          setSelectedRoom(r.id);
                          setCurrentView('by-location');
                        }}
                        className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 cursor-pointer shadow-xs transition-all flex items-center gap-3"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: r.color }}
                        >
                          <DynamicIcon name={r.iconName} className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{getRoomName(r)}</h4>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {count} {count === 1 ? t.finder.itemCountSingular : t.finder.itemCountPlural}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: ALL ITEMS VIEW */}
        {currentView === 'all-items' && (
          <AllItemsView
            items={items}
            rooms={rooms}
            categories={categories}
            onEditItem={handleOpenEditModal}
            onMoveItem={handleOpenMoveModal}
            onStatusChange={handleStatusChange}
            onShowBoxLabel={handleOpenBoxLabel}
            onAddNew={() => handleOpenAddModal()}
          />
        )}

        {/* VIEW 3: BY LOCATION & ROOMS */}
        {currentView === 'by-location' && (
          <LocationsView
            rooms={rooms}
            items={items}
            onEditItem={handleOpenEditModal}
            onMoveItem={handleOpenMoveModal}
            onStatusChange={handleStatusChange}
            onShowBoxLabel={handleOpenBoxLabel}
            onAddNewItemInRoom={(roomId, container) => handleOpenAddModal(roomId, container)}
          />
        )}

        {/* VIEW 4: CONTAINERS & QR CODE LABELS */}
        {currentView === 'containers' && (
          <ContainersView
            items={items}
            rooms={rooms}
            onSelectContainer={(containerName, roomName) => {
              const matchedRoom = rooms.find(
                (r) => r.name.toLowerCase() === roomName.toLowerCase()
              );
              if (matchedRoom) {
                setSelectedRoom(matchedRoom.id);
              }
              setSearchQuery(containerName);
              setCurrentView('finder');
            }}
            onShowBoxLabel={handleOpenBoxLabel}
          />
        )}
      </main>

      {/* MODALS */}

      {/* 1. Add / Edit Item Modal */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
        itemToEdit={itemToEdit}
        rooms={rooms}
        categories={categories}
        defaultRoomId={defaultRoomId}
        defaultContainer={defaultContainer}
      />

      {/* 2. Move Item Modal */}
      <MoveItemModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        item={itemToMove}
        rooms={rooms}
        onMove={handleMoveItem}
      />

      {/* 3. Printable Box Label & QR Code Modal */}
      <BoxLabelModal
        isOpen={isBoxLabelModalOpen}
        onClose={() => setIsBoxLabelModalOpen(false)}
        containerName={boxLabelContainer}
        roomName={boxLabelRoom}
        items={boxItems}
      />

      {/* 4. Backup & Import Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        items={items}
        rooms={rooms}
        categories={categories}
        onImportData={handleImportData}
        onResetToDemo={handleResetToDemo}
      />

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t.footer.tagline}</span>
          <span className="font-mono text-[11px] text-slate-400">
            {t.footer.storageNotice}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

