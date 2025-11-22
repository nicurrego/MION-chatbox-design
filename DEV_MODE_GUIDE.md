# 🦆 Development Mode Guide

This guide explains how to use the development mode feature in MION to test the UI without consuming Gemini API quota.

## Overview

Development mode allows you to:
- Test the UI/UX without making API calls
- Work offline
- Avoid API quota limits during development
- Use pre-defined mock responses and assets

## Quick Start

### Enable Development Mode

1. Open your `.env` file (or create `.env.local`)
2. Add or update this line:
   ```bash
   VITE_DEV_MODE=true
   ```
3. Restart your development server:
   ```bash
   npm run dev
   ```

### Verify Development Mode is Active

When you start the server, check the browser console. You should see:
```
🦆 [DEV MODE] Using mock service with static assets
```

## What Changes in Development Mode?

| Feature | Production | Development |
|---------|-----------|-------------|
| **Chat** | Gemini AI responses | Pre-scripted conversation flow |
| **TTS** | Gemini TTS (Kore voice) | `duck_sound.mp3` (loops while subtitles display) |
| **Images** | AI-generated onsen images | `cp_purple_green_bath.png` & `cp_sunlight.png` |
| **Videos** | Veo 3.1 generated videos | `cp_pg_video.mp4` & `cp_sunlight_video.mp4` |

## Mock Conversation Flow

The mock service provides a pre-scripted conversation that simulates the full onsen interview:

1. **Greeting**: MION introduces herself
2. **Well-being Questions**: Asks about skin type, muscle soreness, stress level, water temperature
3. **Aesthetic Questions**: Asks about atmosphere, color palette, time of day
4. **JSON Output**: Provides mock preferences in JSON format
5. **Image Generation**: Returns two pre-generated images
6. **Video Generation**: Returns corresponding videos based on selected image

## Mock Assets

All mock assets are located in the `public/` directory:

```
public/
├── audio/
│   └── duck_sound.mp3          # Plays when MION "speaks"
├── images/
│   ├── cp_purple_green_bath.png  # Mock onsen image option 1
│   └── cp_sunlight.png           # Mock onsen image option 2
└── videos/
    ├── cp_pg_video.mp4           # Video for purple/green bath
    └── cp_sunlight_video.mp4     # Video for sunlight onsen
```

### Customizing Mock Assets

You can replace these files with your own assets for testing:

1. **Audio**: Replace `duck_sound.mp3` with any MP3 file
2. **Images**: Replace the PNG files (keep the same filenames)
3. **Videos**: Replace the MP4 files (keep the same filenames)

**Note**: After replacing files, you may need to hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R).

## Customizing Mock Responses

To modify the conversation flow, edit `services/mockService.ts`:

```typescript
const MOCK_RESPONSES = [
  "Your custom greeting...",
  "Your custom question 1...",
  // Add more responses
];
```

## Switching Back to Production Mode

1. Open your `.env` file
2. Change the value to `false` or remove the line:
   ```bash
   VITE_DEV_MODE=false
   ```
3. Restart the development server

## Testing Checklist

When testing in development mode, verify:

- [ ] Welcome screen loads correctly
- [ ] MION character appears and animates
- [ ] Chat opens when clicking the chat button
- [ ] Mock responses appear with typing animation
- [ ] Duck sound plays when MION speaks (if unmuted)
- [ ] Subtitles display correctly
- [ ] After completing the interview, two images appear
- [ ] Clicking an image shows it as background
- [ ] Video generation completes and plays the corresponding video
- [ ] All UI controls work (mute, voice input, etc.)

## Troubleshooting

### "🦆 [DEV MODE]" message not appearing

- Make sure `VITE_DEV_MODE=true` is in your `.env` file
- Restart the dev server completely (kill and restart)
- Check browser console for any errors

### Audio not playing or sounds like noise

- Check browser console for errors
- Verify `duck_sound.mp3` exists in `public/audio/`
- Make sure the app is not muted (check mute button)
- Some browsers require user interaction before playing audio
- In development mode, the audio should loop while subtitles are displaying
- The audio will automatically stop 2 seconds after typing finishes

### Images not showing

- Verify the image files exist in `public/images/`
- Check browser console for 404 errors
- Try hard refresh (Ctrl+Shift+R)

### Videos not playing

- Verify the video files exist in `public/videos/`
- Check that videos are in MP4 format
- Some browsers have autoplay restrictions

## Architecture

The development mode uses a service selector pattern:

```
services/
├── geminiService.ts   # Real Gemini API calls
├── mockService.ts     # Mock data and responses
└── index.ts           # Selects service based on VITE_DEV_MODE
```

All components import from `services/index.ts`, which automatically provides the correct implementation based on the environment variable.

## Tips

- Use development mode for UI/UX work to save API quota
- Switch to production mode when testing actual AI responses
- Keep mock assets updated to match your design requirements
- Use development mode for demos without internet connection

