# MION Multi-Language System Guide

## Overview

MION now supports 5 languages with full text and voice support:
- 🇪🇸 **Spanish** (Español)
- 🇺🇸 **English** (English)
- 🇰🇷 **Korean** (한국어)
- 🇯🇵 **Japanese** (日本語)
- 🇨🇳 **Chinese** (中文)

## How It Works

### 1. Language Selection Screen

When the app starts, users are presented with a **black screen** showing all available languages. The app **does not make any API calls** until a language is selected, preventing unnecessary API usage.

### 2. Language Configuration

Once a language is selected:
- The Gemini API is configured to respond in that language
- The TTS (Text-to-Speech) is configured with the appropriate voice and language code
- The system instruction is updated to enforce responses in the selected language
- Initial bot greeting is loaded in the selected language

### 3. Production Mode (VITE_DEV_MODE=false)

In production mode:
- **Chat**: Gemini API responds in the selected language based on system instructions
- **TTS**: Gemini TTS generates speech in the selected language with appropriate voice
- **Audio Playback**: Audio plays completely without interruption (fixed issue where audio was cut off)

### 4. Development Mode (VITE_DEV_MODE=true)

In development mode:
- **Chat**: Mock service provides pre-scripted responses in the selected language
- **TTS**: Uses `duck_sound.mp3` audio file (loops during subtitle display)
- **Audio Playback**: Looping audio stops 2 seconds after typing finishes

## Technical Implementation

### Files Created

1. **`contexts/LanguageContext.tsx`**
   - React Context for managing language state
   - Defines `SupportedLanguage` type: `'es' | 'en' | 'ko' | 'ja' | 'zh'`
   - Stores language configuration (code, name, native name, Gemini voice, language code)

2. **`screens/LanguageSelectionScreen.tsx`**
   - Black screen with language selection buttons
   - Beautiful gradient hover effects
   - Displays language names in native scripts

### Files Modified

1. **`services/geminiService.ts`**
   - Added `setLanguageConfig()` function to configure language and voice
   - Modified `getMionSystemInstruction()` to include language-specific instructions
   - Updated `generateSpeech()` to use configured voice and language code
   - Chat is reset when language changes

2. **`services/mockService.ts`**
   - Added `MOCK_RESPONSES_BY_LANGUAGE` with responses in Spanish and English
   - Added `setMockLanguage()` function to switch mock language
   - Response index resets when language changes

3. **`services/index.ts`**
   - Exported `setLanguageConfig()` function
   - In dev mode: calls `setMockLanguage()`
   - In production mode: calls `geminiService.setLanguageConfig()`

4. **`App.tsx`**
   - Wrapped app in `LanguageProvider`
   - Shows `LanguageSelectionScreen` first (before WelcomeScreen)
   - Preloads content only after language is selected
   - Calls `setLanguageConfig()` before making API calls

5. **`screens/MainScreen.tsx`**
   - Fixed TTS audio playback issue
   - Audio stops only for looping mock audio (dev mode)
   - Real TTS audio plays completely without interruption (production mode)

## Language Configuration

Each language has the following configuration:

```typescript
{
  code: 'es',                    // Language code
  name: 'Spanish',               // English name
  nativeName: 'Español',         // Native name
  geminiVoice: 'Kore',          // Gemini TTS voice
  geminiLanguageCode: 'es-ES',  // Gemini language code
}
```

## System Instructions

The system instruction now includes language-specific enforcement:

- **Spanish**: "IMPORTANTE: Debes responder SIEMPRE en español..."
- **English**: "IMPORTANT: You must ALWAYS respond in English..."
- **Korean**: "중요: 항상 한국어로 응답해야 합니다..."
- **Japanese**: "重要：常に日本語で応答する必要があります..."
- **Chinese**: "重要：您必须始终用中文回复..."

## Audio Playback Fix

### Previous Issue
TTS audio was being cut off because it stopped 2 seconds after the typing effect finished, but the actual audio duration could be longer.

### Solution
- **Mock audio (dev mode)**: Loops during subtitle display, stops 2 seconds after typing finishes
- **Real TTS audio (production mode)**: Plays completely without interruption, no forced stop

## Testing

1. Start the dev server: `npm run dev`
2. Open `http://localhost:3000/`
3. Select a language from the black screen
4. Verify the bot responds in the selected language
5. Verify audio plays correctly (loops in dev mode, plays fully in production mode)

## Adding New Languages

To add a new language:

1. Add the language code to `SupportedLanguage` type in `contexts/LanguageContext.tsx`
2. Add language configuration to `SUPPORTED_LANGUAGES` object
3. Add system instruction translation to `getMionSystemInstruction()` in `services/geminiService.ts`
4. (Optional) Add mock responses to `MOCK_RESPONSES_BY_LANGUAGE` in `services/mockService.ts`

## Notes

- The app prevents API calls until a language is selected
- Language selection is required before accessing the welcome screen
- All UI text in the language selection screen is bilingual (English/Spanish)
- The Gemini voice 'Kore' is currently used for all languages (can be customized per language)

