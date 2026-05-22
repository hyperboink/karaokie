import { useEffect } from 'react';
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
function AppHeader() {
  const { currentSong, isPlaying, setIsPlaying, skipCurrent, setShowAddModal } =
    useKaraokeStore();

  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-800 shrink-0 gap-3">
      <img src="/images/logo.png" alt="Karaokie" className="h-7 md:h-8 w-auto shrink-0" />

      {currentSong && (
        <div className="hidden wide:block flex-1 text-center min-w-0 px-2">
          <p className="text-white font-semibold text-sm truncate">{currentSong.title}</p>
          <p className="text-gray-400 text-xs truncate">
            {currentSong.artist} · Singing:{' '}
            <span className="text-yellow-400">{currentSong.singer}</span>
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        {currentSong ? (
          <>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white px-2.5 md:px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              {isPlaying ? (
                <>
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                  <span className="hidden md:inline">Pause</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="hidden md:inline">Play</span>
                </>
              )}
            </button>
            <button
              onClick={skipCurrent}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white px-2.5 md:px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
              </svg>
              <span className="hidden md:inline">Skip</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-200 text-black font-bold px-4 md:px-5 py-2 rounded-xl text-sm transition-colors glow-pulse"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Song</span>
          </button>
        )}
      </div>
    </div>
  );
}

function StatusBar() {
  const { currentSong, queue } = useKaraokeStore();

  if (!currentSong) return null;

  return (
    <div className="shrink-0 border-t border-gray-800 px-4 md:px-6 py-2.5 flex items-center gap-2 md:gap-3 min-w-0">
      {queue.length > 0 ? (
        <>
          <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold shrink-0">Up next</span>
          <span className="text-white text-xs md:text-sm font-medium truncate min-w-0">{queue[0].title}</span>
          <span className="text-gray-500 text-xs shrink-0">·</span>
          <span className="text-yellow-400/80 text-xs shrink-0">🎤<span className="hidden lg:inline"> {queue[0].singer}</span></span>
        </>
      ) : (
        <>
          <EqBars />
          <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold shrink-0">Now playing</span>
          <span className="text-white text-xs md:text-sm font-medium truncate">{currentSong.title}</span>
          <span className="hidden sm:inline text-gray-500 text-xs shrink-0">·</span>
          <span className="hidden sm:inline text-gray-400 text-xs truncate">{currentSong.artist}</span>
        </>
      )}
      <span className="text-gray-600 text-xs ml-auto shrink-0 hidden sm:inline">
        &copy; <a href="https://hyperboink.net/" className="hover:text-yellow-400 transition-colors">Hyperboink</a>. All Rights Reserved.
      </span>
    </div>
  );
}

function EmptyStage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <div className="text-7xl md:text-8xl mb-6 opacity-30">🎵</div>
      <p className="text-gray-500 text-lg md:text-xl font-medium">Nothing playing</p>
      <p className="text-gray-600 text-sm mt-2">Add songs to the queue to get started</p>
    </div>
  );
}

// Main component

export default function NowPlaying() {
  const { currentSong } = useKaraokeStore();

  useKeyboardShortcuts();

  return (
    <div className="flex flex-col h-full">
      <AppHeader />

      {currentSong ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="relative flex-1 w-full bg-black">
            <YouTubePlayer />
            {/* Song info overlay — visible below 980px, hidden at wide+ */}
            <div className="wide:hidden absolute top-0 inset-x-0 pointer-events-none">
              <div className="px-4 pt-3 pb-5 bg-black [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]">
                <p className="text-white font-semibold text-sm truncate drop-shadow">{currentSong.title}</p>
                <p className="text-gray-300 text-xs truncate mt-0.5 drop-shadow">
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
