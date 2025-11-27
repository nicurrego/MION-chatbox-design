# Configuration Files

This directory contains configuration files for MION's behavior.

## `subtitleConfig.ts` - Subtitle Reading Speed

This file controls how long subtitles stay on screen for each language.

### How It Works

The subtitle display time is calculated using this formula:

```
Display Time (seconds) = Sentence Length / Reading Speed
```

**Example:**
- A 20-character sentence with reading speed `10` = 2 seconds on screen
- A 20-character sentence with reading speed `20` = 1 second on screen
- A 20-character sentence with reading speed `5` = 4 seconds on screen

### Current Settings

```typescript
export const SUBTITLE_READING_SPEEDS: Record<SupportedLanguage, number> = {
    es: 14,   // Spanish: 14 chars/sec
    en: 14,   // English: 14 chars/sec
    ko: 10,   // Korean: 10 chars/sec
    ja: 8,    // Japanese: 8 chars/sec
    zh: 8,    // Chinese: 8 chars/sec
};
```

### How to Adjust

**If subtitles disappear too quickly (you can't finish reading):**
- **DECREASE** the number (e.g., `14` → `12` → `10`)
- This makes subtitles stay longer on screen

**If subtitles stay too long (feel sluggish):**
- **INCREASE** the number (e.g., `14` → `16` → `18`)
- This makes subtitles change faster

### Recommended Ranges

| Language | Recommended Range | Current | Notes |
|----------|------------------|---------|-------|
| **Spanish** | 10-18 chars/sec | 14 | Based on ~280 WPM reading speed |
| **English** | 10-18 chars/sec | 14 | Based on ~280 WPM reading speed |
| **Korean** | 8-12 chars/sec | 10 | Denser characters, slightly slower |
| **Japanese** | 6-10 chars/sec | 8 | Kanji-heavy, very information-dense |
| **Chinese** | 6-10 chars/sec | 8 | Hanzi similar to Kanji |

### Testing Your Changes

1. Open `config/subtitleConfig.ts`
2. Modify the number for the language you want to adjust
3. Save the file
4. Refresh the browser (the dev server will auto-reload)
5. Select the language and test the subtitle timing
6. Repeat until it feels comfortable

### Why Different Speeds?

Different languages have different information density:

- **English/Spanish**: Each character carries less information, words are longer
- **Japanese/Chinese**: Each character (Kanji/Hanzi) carries more meaning
- **Korean**: Uses Hangul syllable blocks, denser than Latin alphabet

This is why CJK languages can be read faster per character, but we still slow them down for comfortable subtitle reading.

### Examples

**Too Fast (uncomfortable):**
```typescript
ja: 15,  // Japanese subtitles disappear before you finish reading
```

**Too Slow (boring):**
```typescript
en: 5,   // English subtitles stay way too long on screen
```

**Just Right (current defaults):**
```typescript
es: 14,  // Spanish: comfortable reading pace
en: 14,  // English: comfortable reading pace
ko: 10,  // Korean: slightly slower for denser characters
ja: 8,   // Japanese: slower for Kanji comprehension
zh: 8,   // Chinese: slower for Hanzi comprehension
```

### Advanced: Per-User Customization

If you want to add user-adjustable subtitle speed in the future, you can:

1. Add a settings UI with sliders for each language
2. Store user preferences in localStorage
3. Modify `getReadingSpeed()` to check localStorage first
4. Fall back to these defaults if no user preference exists

This would allow each user to customize subtitle speed to their personal reading pace.

