import React from 'react';
import { Bookmark, Trash2, MapPin } from 'lucide-react';

export default function SavedLocations({ favorites, onSelectLocation, onRemoveFavorite }) {
  if (!favorites || favorites.length === 0) return null;

  return (
    <div className="w-full bg-graphite/40 border border-white/10 rounded-2xl p-4 sm:p-6 mb-8 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 font-mono text-xs text-pale-iris uppercase tracking-mono-wide font-medium">
          <Bookmark className="w-4 h-4 fill-pale-iris" />
          <span>FAVORITE OBSERVATION STATIONS ({favorites.length})</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {favorites.map((loc) => (
          <div
            key={`${loc.latitude}-${loc.longitude}`}
            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-pure transition-all duration-200"
          >
            <button
              onClick={() => onSelectLocation(loc)}
              className="flex items-center gap-1.5 font-medium"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-signal" />
              <span>{loc.name}</span>
              {loc.country && <span className="text-fog text-[10px]">({loc.country})</span>}
            </button>

            <button
              onClick={() => onRemoveFavorite(loc)}
              className="p-1 text-fog hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity"
              title="Remove location"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
