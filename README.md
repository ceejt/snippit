# Snippit

Smart video splitter for short-form clips (stories and reels). Automatically splits videos into optimal segments, avoiding awkwardly short clip continuations.

## Features

- Smart split algorithm (avoids segments < 10 seconds)
- Drag & drop video upload
- Real-time split preview
- Client-side processing (privacy-friendly)
- Export ready-to-upload segments

## Tech Stack

- HTML5
- Vanilla JavaScript
- Tailwind CSS
- FFmpeg.wasm (for video processing)

## Setup

```bash
# Install dependencies
npm install

# Run development mode (watches for changes)
npm run dev

# Build for production
npm run build
```

## Development

Open `src/index.html` in your browser (use Live Server or similar).

## License

MIT
