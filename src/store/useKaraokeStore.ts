import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QueueItem } from '../types';

interface KaraokeStore {
  queue: QueueItem[];
  currentSong: QueueItem | null;
  isPlaying: boolean;
  playbackTime: number;
  showAddModal: boolean;
  showHistory: boolean;
  showPinned: boolean;
  history: QueueItem[];
  pinned: QueueItem[];
  toast: string | null;

  addToQueue: (item: QueueItem, log?: boolean) => void;
  removeFromQueue: (id: string) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  playNext: () => void;
  skipCurrent: () => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackTime: (t: number) => void;
  setShowAddModal: (visible: boolean) => void;
  setShowHistory: (visible: boolean) => void;
  setShowPinned: (visible: boolean) => void;
  clearHistory: () => void;
  setToast: (msg: string | null) => void;
  startSong: (song: QueueItem) => void;
  togglePin: (item: QueueItem) => void;
  reorderPinned: (fromIndex: number, toIndex: number) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useKaraokeStore = create<KaraokeStore>()(
  persist(
    (set, get) => ({
      queue: [],
      currentSong: null,
      isPlaying: false,
      playbackTime: 0,
      showAddModal: false,
      showHistory: false,
      showPinned: false,
      history: [],
      pinned: [],
      toast: null,

      addToQueue: (item, log = true) => {
        if (toastTimer) clearTimeout(toastTimer);
        set((s) => ({
          queue: [...s.queue, item],
          history: log
            ? [{ ...item, addedAt: Date.now() }, ...s.history].slice(0, 500)
            : s.history,
          toast: `Added "${item.title}" to queue`,
        }));
        toastTimer = setTimeout(() => set({ toast: null }), 3000);
      },

      removeFromQueue: (id) =>
        set((s) => ({ queue: s.queue.filter((q) => q.id !== id) })),

      reorderQueue: (fromIndex, toIndex) =>
        set((s) => {
          if (fromIndex === toIndex) return s;
          const q = [...s.queue];
          const [item] = q.splice(fromIndex, 1);
          q.splice(toIndex, 0, item);
          return { queue: q };
        }),

      moveUp: (id) =>
        set((s) => {
          const idx = s.queue.findIndex((q) => q.id === id);
          if (idx <= 0) return s;
          const q = [...s.queue];
          [q[idx - 1], q[idx]] = [q[idx], q[idx - 1]];
          return { queue: q };
        }),

      moveDown: (id) =>
        set((s) => {
          const idx = s.queue.findIndex((q) => q.id === id);
          if (idx < 0 || idx >= s.queue.length - 1) return s;
          const q = [...s.queue];
          [q[idx], q[idx + 1]] = [q[idx + 1], q[idx]];
          return { queue: q };
        }),

      startSong: (song) =>
        set({ currentSong: song, isPlaying: true, playbackTime: 0 }),

      playNext: () => {
        const { queue } = get();
        if (!queue.length) {
          set({ currentSong: null, isPlaying: false, playbackTime: 0 });
          return;
        }
        const [next, ...rest] = queue;
        set({ currentSong: next, queue: rest, isPlaying: true, playbackTime: 0 });
      },

      skipCurrent: () => get().playNext(),

      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setPlaybackTime: (t) => set({ playbackTime: t }),
      setShowAddModal: (visible) => set({ showAddModal: visible }),
      setShowHistory: (visible) => set({ showHistory: visible }),
      setShowPinned: (visible) => set({ showPinned: visible }),
      clearHistory: () => set({ history: [] }),
      setToast: (msg) => set({ toast: msg }),

      togglePin: (item) =>
        set((s) => {
          const exists = s.pinned.some((p) => p.youtubeId === item.youtubeId);
          return {
            pinned: exists
              ? s.pinned.filter((p) => p.youtubeId !== item.youtubeId)
              : [...s.pinned, { ...item, addedAt: Date.now() }],
          };
        }),

      reorderPinned: (fromIndex, toIndex) =>
        set((s) => {
          if (fromIndex === toIndex) return s;
          const p = [...s.pinned];
          const [item] = p.splice(fromIndex, 1);
          p.splice(toIndex, 0, item);
          return { pinned: p };
        }),
    }),
    {
      name: 'karaokie-queue',
      partialize: (s) => ({
        queue: s.queue,
        currentSong: s.currentSong,
        isPlaying: s.isPlaying,
        playbackTime: s.playbackTime,
        history: s.history,
        pinned: s.pinned,
      }),
    }
  )
);
