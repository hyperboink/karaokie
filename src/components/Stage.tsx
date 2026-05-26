import { useEffect, useRef, useState } from 'react';
import { useKaraokeStore } from '../store/useKaraokeStore';
import YouTubePlayer from './YouTubePlayer';
import EqBars from './EqBars';

// Keyboard shortcuts
// Spacebar - toggle play/pause (only when a song is active)
// Left arrow "→" - skip to the next song (only when a song is active)
function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target !== document.body) return;

      const { currentSong, isPlaying, setIsPlaying, skipCurrent } =
        useKaraokeStore.getState();

      if (!currentSong) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        skipCurrent();
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);
}

// Sub-components

function HelpTooltip() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-6 h-6 rounded-full bg-black/50 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 text-xs font-bold flex items-center justify-center transition-colors leading-none"
      >
        ?
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-64 bg-gray-900 border border-gray-700 rounded-xl p-3.5 shadow-2xl space-y-2.5">
          <p className="text-gray-300 text-xs">Use <kbd className="px-1 py-0.5 bg-gray-700 rounded text-[10px]">Ctrl</kbd> and <kbd className="px-1 py-0.5 bg-gray-700 rounded text-[10px]">+</kbd> / <kbd className="px-1 py-0.5 bg-gray-700 rounded text-[10px]">−</kbd> to zoom</p>
          <div className="space-y-1">
            <p className="text-gray-300 text-xs"><kbd className="px-1 py-0.5 bg-gray-700 rounded text-[10px]">Space</kbd> — Play / Pause</p>
            <p className="text-gray-300 text-xs"><kbd className="px-1 py-0.5 bg-gray-700 rounded text-[10px]">→</kbd> — Skip song</p>
          </div>
          <p className="text-gray-300 text-xs">
            Request a song{' '}
            <a
              href="https://forms.gle/TLfvZ2DdA8LPgxoF7"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 underline"
            >
              here
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}

function AppHeader() {
  const { currentSong, isPlaying, setIsPlaying, skipCurrent, setShowAddModal } =
    useKaraokeStore();

  return (
    <div className="flex items-center justify-between px-4 md:px-6 landscape:px-3 py-2.5 landscape:py-1 border-b border-gray-800 shrink-0 gap-3 landscape:gap-2">
      <img src="/images/logo.png" alt="Karaokie" className="h-6 md:h-7 landscape:h-5 w-auto shrink-0" />

      {currentSong && (
        <div className="hidden wide:block flex-1 text-center min-w-0 px-2">
          <p className="text-white font-medium text-xs md:text-sm landscape:text-[10px] truncate">{currentSong.title}</p>
          <p className="text-gray-400 text-[11px] landscape:text-[9px] truncate">
            {currentSong.artist} · Singing:{' '}
            <span className="text-yellow-400">{currentSong.singer}</span>
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-1.5 md:gap-2 landscape:gap-1 shrink-0">
        {currentSong ? (
          <>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white px-2.5 md:px-4 landscape:px-2 py-1.5 md:py-2 landscape:py-1 rounded-lg md:rounded-xl text-xs md:text-sm landscape:text-[10px] font-medium transition-colors"
            >
              {isPlaying ? (
                <>
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4 landscape:w-3 landscape:h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                  <span className="hidden md:inline landscape:hidden">Pause</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4 landscape:w-3 landscape:h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="hidden md:inline landscape:hidden">Play</span>
                </>
              )}
            </button>
            <button
              onClick={skipCurrent}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white px-2.5 md:px-4 landscape:px-2 py-1.5 md:py-2 landscape:py-1 rounded-lg md:rounded-xl text-xs md:text-sm landscape:text-[10px] font-medium transition-colors"
            >
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4 landscape:w-3 landscape:h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
              </svg>
              <span className="hidden md:inline landscape:hidden">Skip</span>
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function StatusBar() {
  const { currentSong, queue, setShowAddModal } = useKaraokeStore();

  if (!currentSong) return null;

  return (
    <div className="shrink-0 border-t border-b border-gray-800 px-4 md:px-6 landscape:px-3 py-2 md:py-2.5 landscape:py-1 flex flex-col sm:flex-row sm:items-center landscape:flex-row landscape:items-center gap-1 sm:gap-3 landscape:gap-2 min-w-0">
      {/* Song info row */}
      <div className="flex items-center justify-center md:justify-start landscape:justify-start gap-2 md:gap-3 landscape:gap-1.5 min-w-0 flex-1">
        {queue.length > 0 ? (
          <>
            <span className="text-gray-500 text-xs landscape:text-[9px] uppercase tracking-wider font-semibold shrink-0">Up next</span>
            <span className="text-white text-xs md:text-sm landscape:text-[10px] font-medium truncate min-w-0">{queue[0].title}</span>
            <span className="text-gray-500 text-xs landscape:text-[9px] shrink-0">·</span>
            <span className="text-yellow-400/80 text-xs landscape:text-[9px] shrink-0">🎤<span className="hidden lg:inline"> {queue[0].singer}</span></span>
          </>
        ) : (
          <>
            <EqBars />
            <span className="text-gray-500 text-xs landscape:text-[9px] uppercase tracking-wider font-semibold shrink-0">Now playing</span>
            <span className="text-white text-xs md:text-sm landscape:text-[10px] font-medium truncate">{currentSong.title}</span>
            <span className="hidden sm:inline text-gray-500 text-xs landscape:text-[9px] shrink-0">·</span>
            <span className="hidden sm:inline text-gray-400 text-xs landscape:text-[9px] truncate">{currentSong.artist}</span>
          </>
        )}
      </div>

      {/* Copyright */}
      <span className="text-gray-600 text-[10px] landscape:text-[8px] sm:text-xs shrink-0 text-center sm:text-right landscape:text-right sm:ml-auto landscape:ml-auto">
        &copy; <a href="https://hyperboink.net/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">Hyperboink</a>. All Rights Reserved.
      </span>
    </div>
  );
}

function EmptyStage() {
  const { setShowAddModal } = useKaraokeStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
      <div className="text-7xl md:text-8xl opacity-30">🎵</div>
      <div>
        <p className="text-gray-500 text-lg md:text-xl font-medium">Nothing playing</p>
        <p className="text-gray-600 text-sm mt-1">Add songs to the queue to get started</p>
      </div>
      <button
        onClick={() => setShowAddModal(true)}
        className="md:hidden flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-200 text-black font-bold px-6 py-2.5 rounded-xl text-sm transition-colors glow-pulse mt-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Add Song
      </button>
    </div>
  );
}

// Main component

export default function NowPlaying() {
  const { currentSong, setShowAddModal } = useKaraokeStore();

  useKeyboardShortcuts();

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <AppHeader />

      {currentSong ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="relative flex-1 w-full bg-black">
            <YouTubePlayer />
            {/* Help button — top-right corner of stage */}
            <div className="absolute top-2 right-2 z-10">
              <HelpTooltip />
            </div>

            {/* Song info overlay — visible below 980px, hidden at wide+ */}
            <div className="wide:hidden absolute top-0 inset-x-0 pointer-events-none">
              <div className="px-4 pt-3 pb-6 bg-black [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]">
                <p className="text-white font-semibold text-xs md:text-sm landscape:text-xs truncate drop-shadow">{currentSong.title}</p>
                <p className="text-gray-300 text-[10px] truncate drop-shadow">
                  {currentSong.artist} · Singing:{' '}
                  <span className="text-yellow-400">{currentSong.singer}</span>
                </p>
              </div>
            </div>

          </div>

          <StatusBar />
        </div>
      ) : (
        <EmptyStage />
      )}
    </div>
  );
}
