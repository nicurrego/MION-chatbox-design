# Configuration Files

This directory contains configuration files for MION's behavior.

## `subtitleConfig.ts` - Advanced Subtitle Timing System

This file controls how long subtitles stay on screen based on **language** and **sentence length**.

### How It Works

The subtitle display time is calculated using this advanced formula:

```
Display Time = (sentence.length / baseSpeed) * lengthModifier + minDisplayTime
```

Then constrained between `MIN_DISPLAY_TIME` and `MAX_DISPLAY_TIME`.

**Example Calculations:**
- **Short (10 chars)**: `(10 / 14) * 1.5 + 1.0 = 2.07 seconds`
- **Medium (50 chars)**: `(50 / 14) * 1.0 + 1.0 = 4.57 seconds`
- **Long (100 chars)**: `(100 / 14) * 0.9 + 1.0 = 7.43 seconds`

### Configuration Sections

The config file has **6 adjustable sections**:

#### 1. Base Reading Speeds (chars/sec)

```typescript
export const BASE_READING_SPEEDS: Record<SupportedLanguage, number> = {
    es: 14,    // Spanish: 14 chars/sec
    en: 14,    // English: 14 chars/sec
    ko: 10,    // Korean: 10 chars/sec
    ja: 6.4,   // Japanese: 6.4 chars/sec
    zh: 8,     // Chinese: 8 chars/sec
};
```

**How to adjust:**
- **HIGHER** = faster subtitles (less time on screen)
- **LOWER** = slower subtitles (more time on screen)

#### 2. Length Thresholds (what counts as short/long)

```typescript
export const LENGTH_THRESHOLDS = {
    SHORT: 20,   // ≤20 characters = "short"
    LONG: 60,    // ≥60 characters = "long"
};
```

**How to adjust:**
- Want more sentences to be "short"? **INCREASE** `SHORT` threshold
- Want fewer sentences to be "long"? **INCREASE** `LONG` threshold

#### 3. Length Multipliers (time adjustments)

```typescript
export const LENGTH_MULTIPLIERS = {
    SHORT: 1.5,    // Short sentences get 50% MORE time
    MEDIUM: 1.0,   // Medium sentences use base speed
    LONG: 0.9,     // Long sentences get 10% LESS time
};
```

**How to adjust:**
- `SHORT > 1.0`: Short sentences stay **longer** (easier to read)
- `SHORT < 1.0`: Short sentences stay **shorter**
- `LONG < 1.0`: Long sentences are **compressed** (don't drag)
- `LONG > 1.0`: Long sentences stay **longer**

#### 4. Minimum Display Time

```typescript
export const MIN_DISPLAY_TIME = 1.0;  // seconds
```

**How to adjust:**
- **INCREASE**: Even very short subtitles stay longer
- **DECREASE**: Very short subtitles can disappear faster
- **Recommended**: 1.0-2.0 seconds

#### 5. Maximum Display Time

```typescript
export const MAX_DISPLAY_TIME = 8.0;  // seconds
```

**How to adjust:**
- **INCREASE**: Very long subtitles can stay longer
- **DECREASE**: Long subtitles are forced to disappear faster
- **Recommended**: 6.0-10.0 seconds

### Quick Adjustment Guide

**Problem: All subtitles disappear too fast**
→ **DECREASE** `BASE_READING_SPEEDS` for that language

**Problem: All subtitles stay too long**
→ **INCREASE** `BASE_READING_SPEEDS` for that language

**Problem: Short sentences disappear too fast**
→ **INCREASE** `LENGTH_MULTIPLIERS.SHORT` (e.g., 1.5 → 1.8)

**Problem: Long sentences stay too long**
→ **DECREASE** `LENGTH_MULTIPLIERS.LONG` (e.g., 0.9 → 0.8)

**Problem: Very short subtitles are unreadable**
→ **INCREASE** `MIN_DISPLAY_TIME` (e.g., 1.0 → 1.5)

**Problem: Very long subtitles drag on forever**
→ **DECREASE** `MAX_DISPLAY_TIME` (e.g., 8.0 → 6.0)

### Recommended Ranges

| Setting | Recommended Range | Current Default |
|---------|------------------|-----------------|
| **Spanish Speed** | 10-18 chars/sec | 14 |
| **English Speed** | 10-18 chars/sec | 14 |
| **Korean Speed** | 8-12 chars/sec | 10 |
| **Japanese Speed** | 6-10 chars/sec | 6.4 |
| **Chinese Speed** | 6-10 chars/sec | 8 |
| **Short Multiplier** | 1.2-2.0 | 1.5 |
| **Long Multiplier** | 0.7-1.0 | 0.9 |
| **Min Display Time** | 1.0-2.0 sec | 1.0 |
| **Max Display Time** | 6.0-10.0 sec | 8.0 |

### Testing Your Changes

1. Open `config/subtitleConfig.ts`
2. Modify the values you want to adjust (see sections above)
3. Save the file
4. The dev server will auto-reload
5. Test in the browser with different sentence lengths
6. Repeat until it feels comfortable

**Testing Tips:**
- Test with **short sentences** (< 20 chars)
- Test with **medium sentences** (20-60 chars)
- Test with **long sentences** (> 60 chars)
- Make sure each feels comfortable to read

### Why Different Speeds?

Different languages have different information density:

- **English/Spanish**: Each character carries less information, words are longer
- **Japanese/Chinese**: Each character (Kanji/Hanzi) carries more meaning
- **Korean**: Uses Hangul syllable blocks, denser than Latin alphabet

This is why CJK languages can be read faster per character, but we still slow them down for comfortable subtitle reading.

### Real-World Examples

**Example 1: Short Japanese Sentence (10 chars)**
```
Text: "こんにちは。" (10 characters)
Calculation: (10 / 6.4) * 1.5 + 1.0 = 3.34 seconds
Result: Stays on screen for 3.34 seconds
```

**Example 2: Medium English Sentence (45 chars)**
```
Text: "Welcome to MION, your onsen concierge!" (45 characters)
Calculation: (45 / 14) * 1.0 + 1.0 = 4.21 seconds
Result: Stays on screen for 4.21 seconds
```

**Example 3: Long Chinese Sentence (80 chars)**
```
Text: "我们为您提供最好的温泉体验，包括传统日式温泉和现代设施..." (80 characters)
Calculation: (80 / 8) * 0.9 + 1.0 = 10.0 seconds
Capped at MAX: 8.0 seconds
Result: Stays on screen for 8.0 seconds (max limit)
```

### Adjustment Examples

**Scenario 1: Japanese subtitles feel too fast**
```typescript
// Before
ja: 6.4,

// After (slower)
ja: 5.0,

// Result: 10-char sentence now stays 4.0 seconds instead of 3.34
```

**Scenario 2: Short sentences disappear too quickly**
```typescript
// Before
SHORT: 1.5,

// After (stay longer)
SHORT: 2.0,

// Result: 10-char sentences get 100% more time instead of 50%
```

**Scenario 3: Long sentences drag on too long**
```typescript
// Before
LONG: 0.9,

// After (more compressed)
LONG: 0.7,

// Result: 100-char sentences stay 6.0 seconds instead of 7.4
```

### Advanced: Per-User Customization

If you want to add user-adjustable subtitle speed in the future, you can:

1. Add a settings UI with sliders for:
   - Base reading speed per language
   - Short/long multipliers
   - Min/max display times
2. Store user preferences in localStorage
3. Modify `calculateSubtitleDuration()` to check localStorage first
4. Fall back to these defaults if no user preference exists

This would allow each user to customize subtitle speed to their personal reading pace.

### Summary

The new system gives you **6 adjustment points**:
1. **Base Speed** - Overall speed per language
2. **Short Threshold** - What counts as "short"
3. **Long Threshold** - What counts as "long"
4. **Short Multiplier** - Extra time for short sentences
5. **Long Multiplier** - Compression for long sentences
6. **Min/Max Times** - Hard limits on display duration

This provides fine-grained control over subtitle timing for all languages and sentence lengths! 🎯

