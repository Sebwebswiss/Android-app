import React, { useState } from 'react';
import { Room, Item } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { Box, MapPin, ChevronRight, Plus, QrCode, ArrowLeft } from 'lucide-react';
import { ItemCard } from './ItemCard';

interface LocationsViewProps {
  rooms: Room[];
  items: Item[];
  onEditItem: (item: Item) => void;
  onMoveItem: (item: Item) => void;
  onStatusChange: (itemId: string, status: any) => void;
  onShowBoxLabel: (containerName: string, roomName: string) => void;
  onAddNewItemInRoom: (roomId: string, container?: string) => void;
}

export const LocationsView: React.FC<LocationsViewProps> = ({
  rooms,
  items,
  onEditItem,
  onMoveItem,
  onStatusChange,
  onShowBoxLabel,
  onAddNewItemInRoom,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);

  const activeRoom = rooms.find(r => r.id === selectedRoomId);

  // Group items by container in selected room
  const itemsInRoom = selectedRoomId
    ? items.filter(it => it.roomId === selectedRoomId)
    : [];

  const containersInRoom = Array.from(new Set(itemsInRoom.map(it => it.container)));

  const itemsInSelectedContainer = selectedContainer
    ? itemsInRoom.filter(it => it.container === selectedContainer)
    : itemsInRoom;

  if (selectedRoomId && activeRoom) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb Navigation Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <button
              onClick={() => {
                setSelectedRoomId(null);
                setSelectedContainer(null);
              }}
              className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-amber-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Sve prostorije
            </button>
            <span>/</span>
            <span className="font-bold text-slate-900">{activeRoom.name}</span>
            {selectedContainer && (
              <>
                <span>/</span>
                <span className="font-medium text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {selectedContainer}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedContainer && (
              <button
                onClick={() => onShowBoxLabel(selectedContainer, activeRoom.name)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-slate-700" />
                Naljepnica kutije & QR
              </button>
            )}
            <button
              onClick={() => onAddNewItemInRoom(activeRoom.id, selectedContainer || undefined)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Dodaj stvar ovdje
            </button>
          </div>
        </div>

        {/* Containers/Boxes Filter Tabs inside Room */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kutije i spremišta u prostoriji ({containersInRoom.length}):
            </h3>
            {selectedContainer && (
              <button
                onClick={() => setSelectedContainer(null)}
                className="text-xs text-amber-700 hover:underline font-medium"
              >
                Prikaži sve kutije
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedContainer(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedContainer === null
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sve u {activeRoom.name} ({itemsInRoom.length})
            </button>

            {containersInRoom.map(c => {
              const count = itemsInRoom.filter(it => it.container === c).length;
              const isSelected = selectedContainer === c;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedContainer(c)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 hover:border-amber-400'
                  }`}
                >
                  <Box className="w-3.5 h-3.5 opacity-70" />
                  <span>{c}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Items List */}
        {itemsInSelectedContainer.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
            <Box className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-700 text-sm">Ovdje još nema spremljenih stvari</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Zabilježi što si stavio u ovu prostoriju ili kutiju.
            </p>
            <button
              onClick={() => onAddNewItemInRoom(activeRoom.id, selectedContainer || undefined)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" />
              Spremi prvu stvar ovdje
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {itemsInSelectedContainer.map(item => (
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
        )}
      </div>
    );
  }

  // All Rooms Grid
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pregled po prostorijama i lokacijama</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Odaberi sobu ili ostavu za pregled svih kutija i spremljenih predmeta
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rooms.map(room => {
          const roomItems = items.filter(it => it.roomId === room.id);
          const uniqueContainers = new Set(roomItems.map(it => it.container)).size;

          return (
            <div
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              className="group cursor-pointer bg-white rounded-2xl border border-slate-200 hover:border-amber-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: room.color }}
                  >
                    <DynamicIcon name={room.iconName} className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                </div>

                <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-900 transition-colors">
                  {room.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {room.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-slate-900">
                  {roomItems.length} {roomItems.length === 1 ? 'predmet' : 'predmeta'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {uniqueContainers} {uniqueContainers === 1 ? 'kutija/polica' : 'kutija/polica'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
