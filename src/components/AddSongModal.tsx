import { useState, useEffect, useRef } from 'react';

import { useKaraokeStore } from '../store/useKaraokeStore';
import { getCatalog, searchCatalog, formatDuration } from '../utils/catalog';
import type { CatalogEntry } from '../utils/catalog';

const PAGE_SIZE = 30;
const SEARCH_DEBOUNCE_MS = 150;

export default function AddSongPanel() {
  const { addToQueue, setShowAddModal } = useKaraokeStore();

  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [allResults, setAllResults] = useState<CatalogEntry[]>([]);
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { getCatalog().then(setCatalog); }, []);

  // Debounced search: re-run whenever query or catalog changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setAllResults(searchCatalog(catalog, query));
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, catalog]);

  const visible = allResults.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < allResults.length;

  // crypto.randomUUID() requires a secure context (HTTPS/localhost)
  // with fallback Math.random UUID.
  function generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function handleAdd(entry: CatalogEntry) {
    addToQueue({
      id: generateId(),
      title: entry.title,
      artist: entry.artist,
      singer: entry.artist,
      youtubeId: entry.id,
      addedAt: Date.now(),
    });
    setShowAddModal(false);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 landscape:px-3 py-2.5 landscape:py-1 md:py-[0.9rem] border-b border-gray-800 shrink-0">
        <h2 className="text-base landscape:text-sm font-bold text-white">Add Song</h2>
        <button
          onClick={() => setShowAddModal(false)}
          className="text-gray-400 hover:text-white active:text-white transition-colors p-1"
        >
          <svg className="w-5 h-5 landscape:w-3.5 landscape:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Search input */}
      <div className="px-4 landscape:px-3 pt-3 landscape:pt-1.5 pb-2 landscape:pb-1 shrink-0">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${catalog.length} songs…`}
            autoComplete="off"
            autoFocus
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 landscape:py-1 pr-9 text-white text-sm landscape:text-xs placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <svg className="w-4 h-4 landscape:w-3 landscape:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {allResults.length > 0 && (
          <p className="text-gray-600 text-xs landscape:text-[9px] mt-1 landscape:mt-0.5">
            {allResults.length} result{allResults.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-3 landscape:px-2 pb-3 landscape:pb-1">
        {query.trim() === '' ? (
          <p className="text-gray-600 text-sm landscape:text-xs text-center mt-6 landscape:mt-2">Type to search</p>
        ) : allResults.length === 0 ? (
          <p className="text-gray-600 text-sm landscape:text-xs text-center mt-6 landscape:mt-2">No songs found</p>
        ) : (
          <div className="space-y-0.5">
            {visible.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => handleAdd(entry)}
                className="w-full flex items-center gap-3 px-3 landscape:px-2 py-2 landscape:py-1 rounded-xl hover:bg-gray-800 active:bg-gray-800 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm landscape:text-[11px] font-medium truncate">{entry.title}</p>
                  <p className="text-gray-400 text-xs landscape:hidden truncate">{entry.artist}</p>
                </div>
                <span className="text-gray-600 text-xs landscape:text-[10px] shrink-0">{formatDuration(entry.duration)}</span>
              </button>
            ))}

            {hasMore && (
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="w-full py-2.5 landscape:py-1 text-yellow-400 hover:text-yellow-300 text-sm landscape:text-xs font-medium transition-colors"
              >
                Show more ({allResults.length - visible.length} remaining)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
