import { useKaraokeStore } from '../store/useKaraokeStore';
import type { QueueItem } from '../types';

function HistoryRow({ item }: { item: QueueItem }) {
  const { addToQueue } = useKaraokeStore();

  const playedAt = new Date(item.addedAt);
  const timeStr = `${playedAt.getMonth() + 1}/${playedAt.getDate()}/${String(playedAt.getFullYear()).slice(2)}`;

  return (
    <div className="group flex items-center gap-1.5 border rounded-xl px-3 py-2 landscape:py-1.5 bg-gray-800/40 border-gray-700/40 transition-colors">
      <div className="flex-1 min-w-0 ml-1">
        <p className="text-white text-sm landscape:text-[11px] font-medium truncate">{item.title}</p>
        <p className="text-gray-400 text-xs landscape:text-[10px] truncate">
          {item.artist} · {item.singer}
        </p>
      </div>

      <span className="shrink-0 text-[10px] text-gray-500 tabular-nums">{timeStr}</span>

      <div
        className="hidden md:flex items-center gap-1 overflow-hidden max-w-0 group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-200"
      >
        <button
          onClick={() => addToQueue({ ...item, id: `${item.youtubeId}-${Date.now()}`, addedAt: Date.now() }, false)}
          className="p-1.5 text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 transition-colors rounded-lg"
          title="Add to queue again"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <button
        className="md:hidden p-1.5 text-yellow-400 bg-yellow-400/10 active:bg-yellow-400/20 transition-colors rounded-lg"
        onClick={() => addToQueue({ ...item, id: `${item.youtubeId}-${Date.now()}`, addedAt: Date.now() }, false)}
        title="Add to queue again"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}

export default function History() {
  const { history, setShowHistory } = useKaraokeStore();

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 landscape:px-3 py-2.5 landscape:py-1 border-b border-gray-800">
        <h2 className="text-xs desk:text-sm landscape:text-xs font-bold text-white leading-tight">History</h2>
        <button
          onClick={() => setShowHistory(false)}
          className="p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          title="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 md:px-4 landscape:px-2 py-3 landscape:py-2">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="text-5xl mb-3">🎵</div>
            <p className="text-gray-400 font-medium">No songs played yet</p>
            <p className="text-gray-400 text-sm mt-1">Songs will appear here after they finish.</p>
          </div>
        ) : (
          <div className="space-y-1.5 md:space-y-2 landscape:space-y-1">
            {history.map((item) => (
              <HistoryRow key={`${item.id}-${item.addedAt}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
