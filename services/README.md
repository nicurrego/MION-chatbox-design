# MION Gemini Services

This directory contains clean, organized service files for interacting with Google's Gemini AI API.

## 📁 File Structure

```
services/
├── index.ts                    # 🎯 Service selector (CHANGE MODE HERE)
├── geminiService.mock.ts       # Mock mode (no API calls)
├── geminiService.dev.ts        # Development mode (hybrid)
├── geminiService.prod.ts       # Production mode (full API)
├── geminiService.ts            # Legacy file with console logs
└── geminiService2.ts           # Legacy refactored file
```

## 🚀 Quick Start

### 1. Choose Your Mode

Open `services/index.ts` and change the `MODE` constant:

```typescript
const MODE: ServiceMode = 'prod';  // Change this!
```

### 2. Import in Your Components

```typescript
import { 
  sendMessageToBot, 
  generateOnsenImage, 
  generateSpeech,
  generateLoopingVideo 
} from '../services';
```

That's it! The service will automatically use the selected mode.

## 🎯 Available Modes

### 🧪 Mock Mode (`'mock'`)

**File:** `geminiService.mock.ts`

**Features:**
- ✅ No API calls (zero quota usage)
- ✅ Instant responses
- ✅ Returns base_ofuro.png for images
- ✅ No TTS or video generation

**Best for:**
- Fast UI testing
- Offline development
- Testing without API key
- Rapid iteration on layout/styling

**Example output:**
```
Turn 1: "Hi, whats your medical condition?"
Turn 2: "whats your visual preference?"
Turn 3: Returns mock JSON with preferences
```

---

### ⚡ Development Mode (`'dev'`)

**File:** `geminiService.dev.ts`

**Features:**
- ✅ Mock chat for first 2 turns (fast)
- ✅ Real API for JSON generation (turn 3+)
- ✅ Real image generation (4 variations)
- ✅ Real TTS generation
- ✅ Real video generation

**Best for:**
- Testing image generation quickly
- Saving API quota on repetitive chat testing
- Iterating on visual features
- Balanced development workflow

**API Usage:**
- Chat: Minimal (only after turn 2)
- Images: Full (4 images per generation)
- TTS: Full
- Video: Full

---

### 🚀 Production Mode (`'prod'`)

**File:** `geminiService.prod.ts`

**Features:**
- ✅ Full conversation with MION AI
- ✅ Real-time text-to-speech
- ✅ AI-powered image generation
- ✅ Video generation (AI Studio only)

**Best for:**
- Final testing before deployment
- Production environment
- Full user experience testing
- Demo presentations

**API Usage:**
- Chat: Full (every message)
- Images: Full (4 images per generation)
- TTS: Full (every bot response)
- Video: Full

---

## 📊 Comparison Table

| Feature | Mock | Dev | Prod |
|---------|------|-----|------|
| **Chat API** | ❌ Mock | ⚡ Hybrid | ✅ Full |
| **Image Generation** | ❌ Static | ✅ Real | ✅ Real |
| **Text-to-Speech** | ❌ None | ✅ Real | ✅ Real |
| **Video Generation** | ❌ Error | ✅ Real | ✅ Real |
| **Speed** | ⚡⚡⚡ Instant | ⚡⚡ Fast | ⚡ Normal |
| **API Quota Usage** | 0% | ~30% | 100% |
| **Best For** | UI Testing | Feature Dev | Production |

---

## 🔧 Implementation Details

### All Files Include:

1. **Type Definitions**
   ```typescript
   export interface WellbeingProfile { ... }
   export interface AestheticProfile { ... }
   export interface OnsenPreferences { ... }
   ```

2. **Core Functions**
   ```typescript
   sendMessageToBot(message: string): Promise<string>
   generateSpeech(text: string): Promise<string | null>
   generateOnsenImage(preferences: OnsenPreferences): Promise<string[] | null>
   generateLoopingVideo(base64Image: string, mimeType: string): Promise<string>
   ```

3. **Clean Code**
   - No console logs (clean production code)
   - Clear documentation
   - Simple, focused functions
   - Easy to understand flow

---

## 💡 Tips

### Switching Modes During Development

1. **Start with Mock** - Test UI and layout
2. **Move to Dev** - Test image generation
3. **Finish with Prod** - Final testing

### Saving API Quota

- Use **Mock** for 90% of UI work
- Use **Dev** when testing images
- Use **Prod** only for final checks

### Debugging

If you need detailed logging, use the legacy files:
- `geminiService.ts` - Original with console logs
- `geminiService2.ts` - Refactored with console logs

---

## 🎨 Example Usage

```typescript
// In your component
import { sendMessageToBot, generateOnsenImage } from '../services';

// Send a message
const response = await sendMessageToBot("I prefer hot water");

// Generate images
const images = await generateOnsenImage({
  wellbeingProfile: {
    skinType: "dry",
    muscleSoreness: "shoulders",
    stressLevel: "high",
    waterTemperature: "hot",
    healthGoals: "relaxation"
  },
  aestheticProfile: {
    atmosphere: "traditional cedar wood",
    colorPalette: "warm autumn tones",
    timeOfDay: "starry night"
  }
});
```

---

## 📝 Notes

- All files are production-ready
- No console logs in new files
- Clean, maintainable code
- Easy to extend and modify
- Type-safe with TypeScript

---

**Made with ❤️ for MION Onsen Concierge**

