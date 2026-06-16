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
import type { QueueItem } from '../types';

const DRAG_ACTIVATION_DISTANCE = 6;
const DROP_ANIMATION_DURATION = 180;

function PinnedRow({ item, isDragOverlay = false }: { item: QueueItem; isDragOverlay?: boolean }) {
  const { addToQueue, togglePin } = useKaraokeStore();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.youtubeId });

  const rowStyle = { transform: CSS.Transform.toString(transform), transition };

  const rowClass = [
    'group flex items-center gap-1.5 border rounded-xl px-3 py-2 landscape:py-1.5 transition-colors select-none outline-none',
    isDragging
      ? 'opacity-0'
      : isDragOverlay
      ? 'bg-gray-700 border-yellow-400/40 shadow-xl shadow-black/40 cursor-grabbing'
      : 'bg-gray-800/50 hover:bg-gray-800 border-gray-700/50 cursor-grab active:cursor-grabbing',
  ].join(' ');

  return (
    <div ref={setNodeRef} style={rowStyle} {...attributes} {...listeners} className={rowClass}>
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
          onClick={() => addToQueue({ ...item, id: `${item.youtubeId}-${Date.now()}`, addedAt: Date.now() }, false)}
          className="p-1.5 text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 transition-colors rounded-lg"
          title="Add to queue"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={() => togglePin(item)}
          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors rounded-lg"
          title="Remove"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mobile always-visible actions */}
      <div
        className="md:hidden flex items-center gap-1"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => addToQueue({ ...item, id: `${item.youtubeId}-${Date.now()}`, addedAt: Date.now() }, false)}
          className="p-1.5 text-yellow-400 bg-yellow-400/10 active:bg-yellow-400/20 transition-colors rounded-lg"
          title="Add to queue"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={() => togglePin(item)}
          className="p-1.5 text-yellow-400 bg-yellow-400/15 active:bg-yellow-400/25 transition-colors rounded-lg"
          title="Unpin"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Pinned() {
  const { pinned, reorderPinned, setShowPinned } = useKaraokeStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })
  );

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const fromIndex = pinned.findIndex((p) => p.youtubeId === active.id);
      const toIndex = pinned.findIndex((p) => p.youtubeId === over.id);
      reorderPinned(fromIndex, toIndex);
    }
    setActiveId(null);
    (document.activeElement as HTMLElement)?.blur();
  }

  const activeItem = activeId ? pinned.find((p) => p.youtubeId === activeId) : null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 landscape:px-3 py-2.5 landscape:py-1 border-b border-gray-800">
        <h2 className="text-xs desk:text-sm landscape:text-xs font-bold text-white leading-tight">Pinned</h2>
        <button
          onClick={() => setShowPinned(false)}
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
        {pinned.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="text-5xl mb-3">📌</div>
            <p className="text-gray-400 font-medium">No pinned songs</p>
            <p className="text-gray-400 text-sm mt-1">Pin songs to save your favourites.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => { setActiveId(null); (document.activeElement as HTMLElement)?.blur(); }}
          >
            <SortableContext items={pinned.map((p) => p.youtubeId)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5 md:space-y-2 landscape:space-y-1">
                {pinned.map((item) => (
                  <PinnedRow key={item.youtubeId} item={item} />
                ))}
              </div>
            </SortableContext>

            <DragOverlay
              dropAnimation={{ duration: DROP_ANIMATION_DURATION, easing: 'cubic-bezier(0.18,0.67,0.6,1.22)' }}
            >
              {activeItem && <PinnedRow item={activeItem} isDragOverlay />}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}
