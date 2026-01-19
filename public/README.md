# Public Assets Folder

This folder contains **static assets** for the MION chatbot application.

## Current Structure

```
public/
├── audio/
│   └── duck_sound.mp3          # Mock TTS audio for development mode
├── images/
│   ├── TheMION.png             # MION character sprite
│   ├── base_ofuro.png          # Base onsen image for AI generation
│   ├── favicon.png             # Browser favicon
│   ├── cp_purple_green_bath.png # Mock generated image 1 (dev mode)
│   └── cp_sunlight.png         # Mock generated image 2 (dev mode)
└── videos/
    ├── intro_loop.mp4          # Welcome screen loop video
    ├── starting_video.mp4      # Welcome screen intro video
    ├── looping_ofuro.mp4       # Default background video
    ├── cp_pg_video.mp4         # Mock generated video 1 (dev mode)
    └── cp_sunlight_video.mp4   # Mock generated video 2 (dev mode)
```

## How to Reference Assets

Files in the `public` folder are served from the root URL `/`:

```tsx
// ✅ Correct way to reference public files
<img src="/images/TheMION.png" alt="MION" />
<video src="/videos/looping_ofuro.mp4" />
<audio src="/audio/duck_sound.mp3" />

// ❌ Don't include "public" in the path
<img src="/public/images/TheMION.png" /> // Wrong!
```

## Development vs Production

- **Development Mode** (`VITE_DEV_MODE=true`): Uses mock assets (audio, images, videos) to avoid API calls
- **Production Mode** (`VITE_DEV_MODE=false`): Uses Gemini API for real-time generation

See `DEV_MODE_GUIDE.md` for more details.

