import { useKaraokeStore } from '../store/useKaraokeStore';
import type { QueueItem } from '../types';

function HistoryRow({ item }: { item: QueueItem }) {
  const { addToQueue, removeFromHistory } = useKaraokeStore();

  const playedAt = new Date(item.addedAt);
  const dateStr = `${playedAt.getMonth() + 1}/${playedAt.getDate()}/${String(playedAt.getFullYear()).slice(2)}`;

  function handleAdd() {
    addToQueue({ ...item, id: `${item.youtubeId}-${Date.now()}`, addedAt: Date.now() }, false);
  }

  return (
    <div className="group flex items-center gap-3 px-3 py-2.5 landscape:py-1.5 rounded-xl bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700/30 hover:border-gray-700/60 transition-all">
      {/* Song info */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm landscape:text-[11px] font-medium truncate">{item.title}</p>
        <p className="text-gray-400 text-xs landscape:text-[10px] truncate">{item.artist} · {item.singer}</p>
      </div>

      {/* Date + add button */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[9px] text-gray-600 tabular-nums hidden group-hover:hidden">{dateStr}</span>

        <button
          onClick={handleAdd}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-1.5 text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 active:bg-yellow-400/30 transition-colors rounded-lg"
          title="Add to queue"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={() => removeFromHistory(item.addedAt)}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700 active:bg-gray-700 transition-colors rounded-lg"
          title="Remove"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function History() {
  const { history, setShowHistory } = useKaraokeStore();

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 landscape:px-3 py-2.5 landscape:py-1.5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xs desk:text-sm landscape:text-xs font-bold text-white leading-tight">History</h2>
        </div>
        <button
          onClick={() => setShowHistory(false)}
          className="p-1 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          title="Close"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 md:px-4 landscape:px-2 py-3 landscape:py-2 space-y-1.5 landscape:space-y-1">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
            <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-sm font-medium">No history yet</p>
            <p className="text-gray-600 text-xs">Songs appear here when added to queue.</p>
          </div>
        ) : (
          history.map((item) => (
            <HistoryRow key={`${item.id}-${item.addedAt}`} item={item} />
          ))
        )}
      </div>
    </div>
  );
}
