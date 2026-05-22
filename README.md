# Karaokie 🎤

A karaoke queue manager that plays YouTube videos. Add songs, manage the queue, and sing along. No signin required.

## Features

- Search YouTube and add songs to the queue
- Drag-and-drop queue reordering
- Auto-advances to the next song when the current one ends
- Skips videos that have embedding disabled
- Keyboard shortcuts: `Space` to pause/resume, `→` to skip
- Queue and playback state persist across page refreshes

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Environment
```
VITE_CATALOG_ID_KEY=
VITE_SECURITY_ENABLED=
KARAOKE_SOURCES=
```

### Run

```bash
npm run dev
```

### Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Generate songs
```bash
./generate-catalog.sh
```

And that's it! Enjoy the Karaokie!
