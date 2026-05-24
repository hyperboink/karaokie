import { useEffect, useState } from 'react';
import NowPlaying from './components/Stage';
import Queue from './components/Queue';
import AddSongPanel from './components/AddSongModal';
import { useKaraokeStore } from './store/useKaraokeStore';

export default function App() {
  const { showAddModal, setShowAddModal, currentSong, queue, playNext } = useKaraokeStore();
  const [mobileTab, setMobileTab] = useState<'stage' | 'queue'>('stage');

  // Auto-start playback when a song enters the queue and nothing is playing
  useEffect(() => {
    if (!currentSong && queue.length > 0) playNext();
  }, [currentSong, queue.length]);


  return (
    <div className="flex flex-col landscape:flex-row desk:flex-row h-dvh bg-gray-950 text-white overflow-hidden">

      {/* Main stage */}
      <div className={`flex-1 min-h-0 flex-col min-w-0 overflow-hidden pb-8 desk:pb-0 landscape:pb-0 ${mobileTab === 'stage' && !showAddModal ? 'flex' : 'hidden landscape:flex desk:flex'}`}>
        <NowPlaying />
      </div>

      {/* Sidebar — queue or add-song panel */}
      <div className={`flex-col desk:flex desk:w-80 desk:shrink-0 landscape:flex landscape:w-64 landscape:shrink-0 landscape:border-l desk:border-l border-gray-800 bg-gray-900/50 ${mobileTab === 'queue' || showAddModal ? 'flex flex-1 min-h-0 desk:flex-none landscape:flex-none overflow-hidden' : 'hidden landscape:flex desk:flex'}`}>
        {showAddModal ? <AddSongPanel /> : <Queue />}
      </div>

      {/* Mobile bottom tab bar — hidden in landscape (side-by-side layout takes over) */}
      <nav className="desk:hidden landscape:hidden shrink-0 relative flex items-stretch border-t border-gray-800 bg-gray-900 pb-safe">
        {/* Stage tab */}
        <button
          onClick={() => setMobileTab('stage')}
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-medium transition-colors ${mobileTab === 'stage' ? 'text-yellow-400' : 'text-gray-500 active:text-gray-300'}`}
          style={mobileTab === 'stage' ? { backgroundColor: '#141b2b' } : undefined}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
          </svg>
          Stage
        </button>

        {/* Queue tab */}
        <button
          onClick={() => setMobileTab('queue')}
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-medium transition-colors ${mobileTab === 'queue' ? 'text-yellow-400' : 'text-gray-500 active:text-gray-300'}`}
          style={mobileTab === 'queue' ? { backgroundColor: '#141b2b' } : undefined}
        >
          <div className="relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h10" />
            </svg>
            {queue.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-yellow-400 text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {queue.length > 9 ? '9+' : queue.length}
              </span>
            )}
          </div>
          Queue
        </button>

        {/* Center FAB — absolutely positioned, floats above the border line without consuming flex space */}
        <button
          onClick={() => setShowAddModal(true)}
          className="absolute left-1/2 -translate-x-1/2 -top-6 w-12 h-12 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/30 glow-pulse transition-all hover:scale-110 active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </nav>

    </div>
  );
}
