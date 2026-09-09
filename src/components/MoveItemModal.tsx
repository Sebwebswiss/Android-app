import React, { useState, useEffect } from 'react';
import { Item, Room } from '../types';
import { X, ArrowRight, MapPin, Check } from 'lucide-react';

interface MoveItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  rooms: Room[];
  onMove: (itemId: string, newRoomId: string, newRoomName: string, newContainer: string, newSubLocation?: string) => void;
}

export const MoveItemModal: React.FC<MoveItemModalProps> = ({
  isOpen,
  onClose,
  item,
  rooms,
  onMove,
}) => {
  const [targetRoomId, setTargetRoomId] = useState('');
  const [targetContainer, setTargetContainer] = useState('');
  const [targetSubLocation, setTargetSubLocation] = useState('');

  useEffect(() => {
    if (item) {
      setTargetRoomId(item.roomId);
      setTargetContainer(item.container);
      setTargetSubLocation(item.subLocation || '');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetContainer.trim()) return;

    const selectedRoom = rooms.find(r => r.id === targetRoomId);
    onMove(
      item.id,
      targetRoomId,
      selectedRoom ? selectedRoom.name : item.roomName,
      targetContainer.trim(),
      targetSubLocation.trim() || undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Premjesti spremljeni predmet</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <span className="text-xs text-slate-500">Predmet koji premještaš:</span>
            <p className="font-bold text-slate-800 text-base">{item.name}</p>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Trenutno: <strong>{item.roomName}</strong> → {item.container}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nova prostorija / lokacija
              </label>
              <select
                value={targetRoomId}
                onChange={(e) => setTargetRoomId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nova kutija / polica / spremnik *
              </label>
              <input
                type="text"
                required
                value={targetContainer}
                onChange={(e) => setTargetContainer(e.target.value)}
                placeholder="npr. Kutija #2, Ormar za robu, Ladica..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Točno mjesto u novoj sobi (neobavezno)
              </label>
              <input
                type="text"
                value={targetSubLocation}
                onChange={(e) => setTargetSubLocation(e.target.value)}
                placeholder="npr. Gornja polica, iza vrata..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Odustani
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
            >
              <Check className="w-4 h-4" />
              Premjesti ovdje
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
