import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useKaraokeStore } from '../store/useKaraokeStore';
import EqBars from './EqBars';
import type { QueueItem } from '../types';

interface QueueRowProps {
  item: QueueItem;
  idx: number;
  isDragOverlay?: boolean;
}

function QueueRow({ item, idx, isDragOverlay = false }: QueueRowProps) {
  const { removeFromQueue, currentSong, startSong, togglePin, pinned } =
    useKaraokeStore();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const rowStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const rowClass = [
    'group flex items-center gap-1.5 border rounded-xl px-3 py-2 landscape:py-1.5 transition-colors select-none outline-none',
    isDragging
      ? 'opacity-0'
      : isDragOverlay
      ? 'bg-gray-700 border-yellow-400/40 shadow-xl shadow-black/40 cursor-grabbing'
      : 'bg-gray-800/50 hover:bg-gray-800 border-gray-700/50 cursor-grab active:cursor-grabbing',
  ].join(' ');

  function handlePlayNow() {
    startSong(item);
    removeFromQueue(item.id);
  }

  return (
    <div ref={setNodeRef} style={rowStyle} {...attributes} {...listeners} className={rowClass}>
      {/* Position number */}
      <span className="shrink-0 text-xs landscape:text-[10px] font-semibold text-gray-500 tabular-nums leading-none">
        {idx + 1}
      </span>

      {/* Divider */}
      <span className="w-px h-4 landscape:h-3 bg-gray-700 shrink-0" />

      {/* Song info */}
      <div className="flex-1 min-w-0 ml-1">
        <p className="text-white text-sm landscape:text-[11px] font-medium truncate">{item.title}</p>
        <p className="text-gray-400 text-xs landscape:text-[10px] truncate">{item.artist}</p>
      </div>

      {/* Desktop hover actions */}
      <div
        className="hidden md:flex items-center gap-1 overflow-hidden max-w-0 group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-200"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => togglePin(item)}
          className={`p-1.5 transition-colors rounded-lg hover:bg-gray-700 ${pinned.some((p) => p.youtubeId === item.youtubeId) ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-yellow-400'}`}
          title={pinned.some((p) => p.youtubeId === item.youtubeId) ? 'Unpin' : 'Pin'}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z" />
          </svg>
        </button>

        {!currentSong && idx === 0 && (
          <button
            onClick={handlePlayNow}
            className="p-1.5 text-yellow-400 hover:text-yellow-300 transition-colors rounded-lg hover:bg-gray-700"
            title="Play now"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}

        <button
          onClick={() => removeFromQueue(item.id)}
          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-700"
          title="Remove"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mobile + landscape — always-visible remove button */}
      <button
        className="md:hidden landscape:flex p-2 landscape:p-1 text-gray-400 active:text-red-400 transition-colors rounded-lg"
        onClick={() => removeFromQueue(item.id)}
        onPointerDown={(e) => e.stopPropagation()}
        title="Remove"
      >
        <svg className="w-4 h-4 landscape:w-3 landscape:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function NowPlayingCard() {
  const { currentSong } = useKaraokeStore();
  if (!currentSong) return null;

  return (
    <div className="mx-3 md:mx-4 landscape:mx-2 my-2 md:my-3 landscape:my-1 bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-3 landscape:px-2 py-2.5 landscape:py-1.5">
      <div className="flex items-center gap-2 mb-1 landscape:mb-0.5">
        <EqBars />
        <span className="text-yellow-400 text-xs landscape:text-[9px] font-semibold uppercase tracking-wider">Now Playing</span>
      </div>
      <p className="text-white font-semibold text-sm landscape:text-[11px] truncate">{currentSong.title}</p>
      <p className="text-gray-400 text-xs landscape:hidden truncate">
        {currentSong.artist} · {currentSong.singer}
      </p>
    </div>
  );
}

// Empty state

function EmptyQueue({ onAddSong }: { onAddSong: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center">
      <div className="text-5xl mb-3">🎤</div>
      <p className="text-gray-400 font-medium">Queue is empty</p>
      <p className="text-gray-400 text-sm mt-1">Add songs to get the party started!</p>
      <button
        onClick={onAddSong}
        className="mt-4 text-yellow-400 hover:text-yellow-300 text-sm font-semibold transition-colors"
      >
        + Add song
      </button>
    </div>
  );
}

// Main component

const DRAG_ACTIVATION_DISTANCE = 6; // px before a pointer move becomes a drag
const DROP_ANIMATION_DURATION = 180; // ms

export default function Queue() {
  const { queue, reorderQueue, setShowAddModal, setShowHistory, setShowPinned } = useKaraokeStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    // Mouse only — drag starts after moving 6px (desktop)
    useSensor(MouseSensor, { activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE } }),
    // Touch only — drag starts after holding 250ms, letting normal scroll work freely
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })
  );

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const fromIndex = queue.findIndex((q) => q.id === active.id);
      const toIndex = queue.findIndex((q) => q.id === over.id);
      reorderQueue(fromIndex, toIndex);
    }
    setActiveId(null);
    // dnd-kit leaves focus on the dragged row via tabIndex; blur it so
    // keyboard shortcuts (Space = play/pause, ArrowRight = skip) keep working.
    (document.activeElement as HTMLElement)?.blur();
  }

  const activeItem = activeId ? queue.find((q) => q.id === activeId) : null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 landscape:px-3 py-2.5 landscape:py-1 border-b border-gray-800">
        <div className="relative inline-flex items-start">
          <h2 className="text-xs desk:text-sm landscape:text-xs font-bold text-white leading-tight">Queue</h2>
          {queue.length > 0 && (
            <span className="absolute -top-1.5 -right-4 bg-yellow-400 text-black text-[9px] font-bold min-w-[1.1rem] h-[1.1rem] px-0.5 rounded-full flex items-center justify-center leading-none">
              {queue.length > 99 ? '99+' : queue.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="hidden desk:flex landscape:flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black font-bold text-xs md:text-sm landscape:text-[10px] px-3 md:px-4 landscape:px-2 py-1.5 md:py-2 landscape:py-1 rounded-lg md:rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-yellow-400/40 hover:shadow-md"
        >
          <svg className="w-4 h-4 landscape:w-3 landscape:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Song
        </button>
      </div>

      <NowPlayingCard />

      {/* Queue list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 md:px-4 landscape:px-2 pb-3 landscape:pb-2">
        {queue.length === 0 ? (
          <EmptyQueue onAddSong={() => setShowAddModal(true)} />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => { setActiveId(null); (document.activeElement as HTMLElement)?.blur(); }}
          >
            <SortableContext items={queue.map((q) => q.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5 md:space-y-2 landscape:space-y-1">
                {queue.map((item, idx) => (
                  <QueueRow key={item.id} item={item} idx={idx} />
                ))}
              </div>
            </SortableContext>

            {/* Floating overlay that follows the pointer during drag */}
            <DragOverlay
              dropAnimation={{
                duration: DROP_ANIMATION_DURATION,
                easing: 'cubic-bezier(0.18,0.67,0.6,1.22)',
              }}
            >
              {activeItem && (
                <QueueRow
                  item={activeItem}
                  idx={queue.findIndex((q) => q.id === activeId)}
                  isDragOverlay
                />
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* History + Pinned buttons — bottom of sidebar */}
      <div className="shrink-0 px-3 md:px-4 landscape:px-2 pt-2.5 landscape:pt-1.5 border-t border-gray-800 flex gap-1">
        <button
          onClick={() => setShowHistory(true)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 landscape:py-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-xs font-medium"
        >
          <svg className="w-4 h-4 landscape:w-3 landscape:h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>History</span>
        </button>
        <button
          onClick={() => setShowPinned(true)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 landscape:py-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-xs font-medium"
        >
          <svg className="w-4 h-4 landscape:w-3 landscape:h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z" />
          </svg>
          <span>Pinned</span>
        </button>
      </div>

      {/* Donation section */}
      <div className="shrink-0 px-3 md:px-4 landscape:px-2 pb-3 landscape:pb-2 pt-2">
        <div className="rounded-xl bg-gray-800/50 border border-gray-700/40 px-3 py-2.5 landscape:py-1.5 text-center">
          <p className="text-gray-400 text-[10px] landscape:text-[9px] mb-1.5 landscape:mb-1">Enjoying Karaokie? Buy us a coffee ☕</p>
          <a
            href="https://ko-fi.com/hyperboink"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black text-[10px] landscape:text-[9px] font-bold px-3 py-1.5 landscape:py-1 rounded-lg transition-all hover:scale-105 active:scale-95"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            Donate
          </a>
        </div>
      </div>
    </div>
  );
}
