import React, { useState } from 'react';
import { Item, Room } from '../types';
import { Box, QrCode, MapPin, Search, ArrowRight, PackageOpen } from 'lucide-react';

interface ContainersViewProps {
  items: Item[];
  rooms: Room[];
  onSelectContainer: (containerName: string, roomName: string) => void;
  onShowBoxLabel: (containerName: string, roomName: string) => void;
}

export const ContainersView: React.FC<ContainersViewProps> = ({
  items,
  rooms,
  onSelectContainer,
  onShowBoxLabel,
}) => {
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract all unique containers with room info
  const containerMap = new Map<string, { container: string; roomId: string; roomName: string; items: Item[]; code?: string }>();

  items.forEach(item => {
    const key = `${item.roomId}:::${item.container}`;
    if (!containerMap.has(key)) {
      containerMap.set(key, {
        container: item.container,
        roomId: item.roomId,
        roomName: item.roomName,
        items: [],
        code: item.containerCode,
      });
    }
    const entry = containerMap.get(key)!;
    entry.items.push(item);
    if (!entry.code && item.containerCode) {
      entry.code = item.containerCode;
    }
  });

  const containers = Array.from(containerMap.values());

  const filteredContainers = containers.filter(c => {
    if (filterRoom !== 'all' && c.roomId !== filterRoom) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.container.toLowerCase().includes(q) ||
        c.roomName.toLowerCase().includes(q) ||
        (c.code && c.code.toLowerCase().includes(q)) ||
        c.items.some(it => it.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kutije, police i spremnici</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Popis svih fizičkih kutija i ladica u kući. Ispiši QR naljepnice za lakše prepoznavanje.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pretraži po nazivu kutije, kodu ili sadržaju..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
          />
        </div>

        <select
          value={filterRoom}
          onChange={(e) => setFilterRoom(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
        >
          <option value="all">Sve prostorije ({rooms.length})</option>
          {rooms.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* Grid of containers */}
      {filteredContainers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
          <PackageOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Nema pronađenih kutija</p>
          <p className="text-xs text-slate-500 mt-1">Pokušaj promijeniti filter ili pretragu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContainers.map(c => {
            const roomObj = rooms.find(r => r.id === c.roomId);

            return (
              <div
                key={`${c.roomId}-${c.container}`}
                className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md text-white"
                      style={{ backgroundColor: roomObj?.color || '#475569' }}
                    >
                      {c.roomName}
                    </span>

                    {c.code && (
                      <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {c.code}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-900 mb-1 leading-snug">
                    {c.container}
                  </h3>

                  <div className="mt-3 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      U ovoj kutiji ({c.items.length}):
                    </span>
                    <ul className="space-y-1 mt-1">
                      {c.items.slice(0, 3).map(it => (
                        <li key={it.id} className="text-xs text-slate-700 truncate flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span className="truncate">{it.name}</span>
                        </li>
                      ))}
                      {c.items.length > 3 && (
                        <li className="text-[11px] text-slate-400 italic">
                          + još {c.items.length - 3} predmeta...
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onShowBoxLabel(c.container, c.roomName)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    QR Naljepnica
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectContainer(c.container, c.roomName)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    Otvori kutiju
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
