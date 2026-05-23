import { useEffect, useRef, useState } from 'react';
import { useKaraokeStore } from '../store/useKaraokeStore';

interface YTPlayer {
  loadVideoById(videoId: string): void;
  playVideo(): void;
  pauseVideo(): void;
  setVolume(v: number): void;
  unMute(): void;
  destroy(): void;
  getCurrentTime(): number;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
}

interface YTPlayerOptions {
  videoId: string;
  width?: string | number;
  height?: string | number;
  playerVars?: Record<string, number | string>;
  events?: {
    onReady?: (e: { target: YTPlayer }) => void;
    onStateChange?: (e: { data: number }) => void;
    onError?: (e: { data: number }) => void;
  };
}

declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement, opts: YTPlayerOptions) => YTPlayer;
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

// YouTube API bootstrap

let apiScriptInjected = false;

function injectYouTubeApi() {
  if (apiScriptInjected || document.getElementById('yt-iframe-api')) {
    apiScriptInjected = true;
    return;
  }
  apiScriptInjected = true;
  const tag = document.createElement('script');
  tag.id = 'yt-iframe-api';
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

function whenYouTubeReady(cb: () => void) {
  if (window.YT?.Player) { cb(); return; }
  const prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => { prev?.(); cb(); };
}

const EMBEDDING_DISABLED_CODES = new Set([101, 150]);
const SKIP_DELAY_MS = 2500;

export default function YouTubePlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const isTransitioningRef = useRef(false);
  const [skipMessage, setSkipMessage] = useState<string | null>(null);

  const { currentSong, isPlaying, setIsPlaying, playNext, playbackTime, setPlaybackTime, showAddModal } = useKaraokeStore();
  const [isLoading, setIsLoading] = useState(true);

  const playNextRef = useRef(playNext);
  const setIsPlayingRef = useRef(setIsPlaying);
  const playbackTimeRef = useRef(playbackTime);
  const setPlaybackTimeRef = useRef(setPlaybackTime);
  useEffect(() => { playNextRef.current = playNext; }, [playNext]);
  useEffect(() => { setIsPlayingRef.current = setIsPlaying; }, [setIsPlaying]);
  useEffect(() => { playbackTimeRef.current = playbackTime; }, [playbackTime]);
  useEffect(() => { setPlaybackTimeRef.current = setPlaybackTime; }, [setPlaybackTime]);

  // Save position when the add-song modal opens
  useEffect(() => {
    if (!showAddModal) return;
    const t = playerRef.current?.getCurrentTime() ?? 0;
    if (t > 0) setPlaybackTime(t);
  }, [showAddModal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save position on page unload (refresh/close) so it can be restored
  useEffect(() => {
    const save = () => {
      const t = playerRef.current?.getCurrentTime() ?? 0;
      if (t > 0) setPlaybackTimeRef.current(t);
    };
    window.addEventListener('beforeunload', save);
    return () => window.removeEventListener('beforeunload', save);
  }, []);

  useEffect(() => { injectYouTubeApi(); }, []);

  // Load or swap to the current video whenever the YouTube ID changes
  useEffect(() => {
    const videoId = currentSong?.youtubeId;
    if (!videoId || !containerRef.current) return;

    setSkipMessage(null);
    setIsLoading(true);
    isTransitioningRef.current = true;

    function initPlayer() {
      if (!containerRef.current) return;

      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId!);
        return;
      }

      const el = document.createElement('div');
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(el);

      playerRef.current = new window.YT.Player(el, {
        videoId: videoId!,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          mute: 1, // start muted so the browser permits autoplay, then unmute immediately
          controls: 0,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          playsinline: 1,
        },
        events: {
          onReady(e) {
            // Play while still muted — browsers always allow muted autoplay.
            e.target.playVideo();
          },
          onStateChange(e) {
            const { ENDED, PLAYING, PAUSED } = window.YT.PlayerState;
            if (e.data === ENDED) {
              playNextRef.current();
            } else if (e.data === PLAYING) {
              if (isTransitioningRef.current) {
                const savedTime = playbackTimeRef.current;
                if (savedTime > 0) playerRef.current?.seekTo(savedTime, true);
                isTransitioningRef.current = false;
              }
              playerRef.current?.unMute();
              playerRef.current?.setVolume(100);
              setIsPlayingRef.current(true);
              setSkipMessage(null);
              setIsLoading(false);
            } else if (e.data === PAUSED && !isTransitioningRef.current) {
              setIsPlayingRef.current(false);
              const t = playerRef.current?.getCurrentTime() ?? 0;
              if (t > 0) setPlaybackTimeRef.current(t);
            }
          },
          onError(e) {
            isTransitioningRef.current = false;
            setIsLoading(false);
            const message = EMBEDDING_DISABLED_CODES.has(e.data)
              ? 'Embedding disabled — skipping…'
              : 'Video unavailable — skipping…';
            setSkipMessage(message);
            setTimeout(() => playNextRef.current(), SKIP_DELAY_MS);
          },
        },
      });
    }

    whenYouTubeReady(initPlayer);
  }, [currentSong?.youtubeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync play/pause from store to player (spacebar / button)
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !currentSong) return;
    try {
      if (isPlaying) player.playVideo();
      else if (!isTransitioningRef.current) player.pauseVideo();
    } catch { }
  }, [isPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentSong) return <div className="w-full h-full bg-black" />;

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={containerRef} className="w-full h-full" />

      {/* Transparent shield — prevents clicks/touches from reaching the iframe */}
      <div className="absolute inset-0" style={{ pointerEvents: 'all' }} />

      {/* Black cover while buffering — hides YouTube's own UI until playback starts */}
      {isLoading && !skipMessage && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-700 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      )}

      {/* Fully opaque error overlay — covers YouTube's own error screen */}
      {skipMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-3">
          <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <p className="text-gray-400 text-sm px-8 text-center">{skipMessage}</p>
        </div>
      )}
    </div>
  );
}
