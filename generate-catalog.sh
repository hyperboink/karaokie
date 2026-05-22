#!/usr/bin/env bash

set -e

ENV_FILE=".env"
OUTPUT="public/catalog.json"
TMPFILE="$(mktemp /tmp/karaokay-XXXXXX)"

# Load .env
set -a
source "$ENV_FILE"
set +a

if [ -z "$KARAOKE_SOURCES" ]; then
  echo "Error: KARAOKE_SOURCES not set in .env"
  exit 1
fi

> "$TMPFILE"

# Treat newlines as commas so the .env value can span multiple lines
KARAOKE_SOURCES="$(printf '%s' "$KARAOKE_SOURCES" | tr '\n' ',' | sed 's/,\{2,\}/,/g; s/^,//; s/,$//')"

IFS=',' read -ra SOURCES <<< "$KARAOKE_SOURCES"
for SOURCE in "${SOURCES[@]}"; do
  SOURCE="$(echo "$SOURCE" | xargs)"  # trim whitespace
  [ -z "$SOURCE" ] && continue
  printf "Fetching: %s … " "$SOURCE"
  BEFORE=$(wc -l < "$TMPFILE" | tr -d ' ')
  yt-dlp \
    --flat-playlist \
    --no-warnings \
    --print "%(id)s	%(title)s	%(duration)s" \
    "$SOURCE" \
    >> "$TMPFILE"
  AFTER=$(wc -l < "$TMPFILE" | tr -d ' ')
  COUNT_SRC=$((AFTER - BEFORE))
  echo "→ $COUNT_SRC videos"
done

COUNT=$(wc -l < "$TMPFILE" | tr -d ' ')
echo "Downloaded $COUNT entries. Parsing…"

python3 - "$TMPFILE" "$OUTPUT" "${VITE_CATALOG_ID_KEY:-0x5F}" <<'PYEOF'
import sys, json, re

KEY = int(sys.argv[3], 16)

def obfuscate(s):
    return ''.join(f'{ord(c) ^ KEY:02x}' for c in s)


tsv_path, out_path = sys.argv[1], sys.argv[2]

STRIP = re.compile(
    r'\s*[\(\[](karaoke version|karaoke|instrumental|with lyrics?|lyrics?|hd|4k|official)[^\)\]]*[\)\]]\s*',
    re.IGNORECASE,
)

def parse_title(raw: str):
    title = STRIP.sub('', raw).strip().rstrip('-').strip()
    if ' - ' in title:
        parts = title.split(' - ', 1)
        return parts[1].strip(), parts[0].strip()
    return title, 'Unknown'

seen = set()
catalog = []
with open(tsv_path, encoding='utf-8') as f:
    for line in f:
        line = line.rstrip('\n')
        parts = line.split('\t')
        if len(parts) < 3:
            continue
        vid_id, raw_title, dur_str = parts[0], parts[1], parts[2]
        if vid_id in seen:
            continue
        seen.add(vid_id)
        try:
            duration = int(float(dur_str))
        except ValueError:
            continue
        song_title, artist = parse_title(raw_title)
        catalog.append({
            'id': obfuscate(vid_id),
            'title': song_title,
            'artist': artist,
            'duration': duration,
        })

with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(catalog, f, ensure_ascii=False)

print(f"Written {len(catalog)} songs to {out_path}")
PYEOF

rm "$TMPFILE"
echo "Done."
