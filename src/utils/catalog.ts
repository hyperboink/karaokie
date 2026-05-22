export interface CatalogEntry {
  id: string;
  title: string;
  artist: string;
  duration: number;
}

let cachedCatalog: CatalogEntry[] | null = null;

const CATALOG_ID_KEY = parseInt(import.meta.env.VITE_CATALOG_ID_KEY, 16);

function decodeId(encoded: string): string {
  let decoded = '';
  for (let i = 0; i < encoded.length; i += 2) {
    decoded += String.fromCharCode(parseInt(encoded.slice(i, i + 2), 16) ^ CATALOG_ID_KEY);
  }
  return decoded;
}

// Fetches and decodes the song catalog (result is cached after first call).
export async function getCatalog(): Promise<CatalogEntry[]> {
  if (cachedCatalog) return cachedCatalog;
  const res = await fetch('/catalog.json');
  const raw: CatalogEntry[] = await res.json();
  cachedCatalog = raw.map((entry) => ({ ...entry, id: decodeId(entry.id) }));
  return cachedCatalog;
}

// Returns catalog entries whose title or artist contains `query` (case-insensitive)
export function searchCatalog(catalog: CatalogEntry[], query: string): CatalogEntry[] {
  const normalised = query.toLowerCase().trim();
  if (!normalised) return [];
  return catalog.filter(
    (entry) =>
      entry.title.toLowerCase().includes(normalised) ||
      entry.artist.toLowerCase().includes(normalised)
  );
}

// Formats a duration in seconds as m:ss.
export function formatDuration(secs: number): string {
  const minutes = Math.floor(secs / 60);
  const seconds = secs % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
