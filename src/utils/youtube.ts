export interface VideoResult {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: number;
}

export async function searchKaraokeVideos(artist: string, title: string): Promise<VideoResult[]> {
  const q = encodeURIComponent(`${artist} ${title} karaoke`);
  try {
    const res = await fetch(
      `/api/yt-search?q=${q}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return [];
    const data: any[] = await res.json();
    return data.slice(0, 6).map((v) => ({
      id: v.videoId,
      title: v.title,
      channel: v.author,
      duration: v.lengthSeconds ?? 0,
      thumbnail: `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`,
    }));
  } catch {
    return [];
  }
}

export function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
