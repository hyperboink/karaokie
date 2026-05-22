import playdl from 'play-dl';

const cache = new Map();
const TTL = 5 * 60 * 60 * 1000; // 5 hours

export default async function handler(req, res) {
  const { videoId } = req.query;

  if (!videoId) return res.status(400).json({ error: 'Missing videoId' });

  const cached = cache.get(videoId);
  if (cached && cached.expires > Date.now()) {
    res.setHeader('Cache-Control', 'public, s-maxage=18000');
    return res.json({ url: cached.url });
  }

  try {
    const info = await playdl.video_info(`https://www.youtube.com/watch?v=${videoId}`);
    const formats = info.format ?? [];

    // Prefer combined video+audio mp4 (has width = video track, has audioQuality = audio track)
    const hasVideo = f => f.width && f.width > 0;
    const hasAudio = f => !!f.audioQuality;
    const fmt =
      formats.find(f => f.mimeType?.startsWith('video/mp4') && hasVideo(f) && hasAudio(f)) ||
      formats.find(f => f.mimeType?.startsWith('video/') && hasVideo(f) && hasAudio(f)) ||
      formats.find(f => hasVideo(f) && hasAudio(f)) ||
      formats.find(f => f.url);

    if (!fmt?.url) return res.status(404).json({ error: 'No suitable format found' });

    cache.set(videoId, { url: fmt.url, expires: Date.now() + TTL });
    res.setHeader('Cache-Control', 'public, s-maxage=18000');
    res.json({ url: fmt.url });
  } catch (err) {
    console.error('play-dl error:', err?.message ?? err);
    res.status(502).json({ error: 'Stream unavailable' });
  }
}
