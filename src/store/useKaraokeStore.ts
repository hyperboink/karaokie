import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QueueItem } from '../types';

interface KaraokeStore {
  queue: QueueItem[];
  currentSong: QueueItem | null;
  isPlaying: boolean;
  playbackTime: number;
  showAddModal: boolean;

  addToQueue: (item: QueueItem) => void;
  removeFromQueue: (id: string) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  playNext: () => void;
  skipCurrent: () => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackTime: (t: number) => void;
  setShowAddModal: (visible: boolean) => void;
  startSong: (song: QueueItem) => void;
}

export const useKaraokeStore = create<KaraokeStore>()(
  persist(
    (set, get) => ({
      queue: [],
      currentSong: null,
      isPlaying: false,
      playbackTime: 0,
      showAddModal: false,

      addToQueue: (item) =>
        set((s) => ({ queue: [...s.queue, item] })),

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

      // Alias for playNext — kept for semantic clarity at the call site
      skipCurrent: () => get().playNext(),

      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setPlaybackTime: (t) => set({ playbackTime: t }),
      setShowAddModal: (visible) => set({ showAddModal: visible }),
    }),
    {
      name: 'karaokie-queue',
      partialize: (s) => ({
        queue: s.queue,
        currentSong: s.currentSong,
        isPlaying: s.isPlaying,
        playbackTime: s.playbackTime,
      }),
    }
  )
);
