import type { SupportedLanguage } from '../contexts/LanguageContext';

/**
 * ============================================================================
 * SUBTITLE READING SPEED CONFIGURATION
 * ============================================================================
 *
 * This file controls how long subtitles stay on screen based on:
 * 1. Base reading speed (characters per second)
 * 2. Sentence length (short/medium/long modifiers)
 *
 * FORMULA:
 * Display Time = (sentence.length / baseSpeed) * lengthModifier + minDisplayTime
 *
 * EXAMPLES:
 * - 10 char sentence: (10 / 14) * 1.5 + 1.0 = 2.07 seconds
 * - 50 char sentence: (50 / 14) * 1.0 + 1.0 = 4.57 seconds
 * - 100 char sentence: (100 / 14) * 0.9 + 1.0 = 7.43 seconds
 */

// ============================================================================
// 1. BASE READING SPEEDS (characters per second)
// ============================================================================

/**
 * Base reading speed for each language (characters per second).
 *
 * HOW TO ADJUST:
 * - HIGHER number = FASTER subtitles (less time on screen)
 * - LOWER number = SLOWER subtitles (more time on screen)
 *
 * RECOMMENDED RANGES:
 * - English/Spanish: 10-18 chars/sec
 * - Korean: 8-12 chars/sec
 * - Japanese: 6-10 chars/sec
 * - Chinese: 6-10 chars/sec
 */
export const BASE_READING_SPEEDS: Record<SupportedLanguage, number> = {
    es: 14,    // Spanish: 14 chars/sec (280 WPM ≈ 5 chars/word)
    en: 14,    // English: 14 chars/sec (280 WPM ≈ 5 chars/word)
    ko: 10,    // Korean: 10 chars/sec (denser characters)
    ja: 6.4,   // Japanese: 6.4 chars/sec (Kanji-heavy, information-dense)
    zh: 8,     // Chinese: 8 chars/sec (Hanzi similar to Kanji)
};

// ============================================================================
// 2. SENTENCE LENGTH THRESHOLDS
// ============================================================================

/**
 * Character count thresholds to determine if a sentence is short/medium/long.
 *
 * HOW TO ADJUST:
 * - Change these numbers to redefine what counts as "short" or "long"
 * - Example: If you want more sentences to be "short", increase SHORT_THRESHOLD
 */
export const LENGTH_THRESHOLDS = {
    SHORT: 20,   // Sentences with ≤20 characters are "short"
    LONG: 60,    // Sentences with ≥60 characters are "long"
    // Medium is anything between SHORT and LONG
};

// ============================================================================
// 3. LENGTH MULTIPLIERS
// ============================================================================

/**
 * Multipliers applied based on sentence length.
 *
 * HOW TO ADJUST:
 * - SHORT > 1.0: Short sentences stay LONGER (easier to read)
 * - SHORT < 1.0: Short sentences stay SHORTER
 * - LONG < 1.0: Long sentences are COMPRESSED (don't stay too long)
 * - LONG > 1.0: Long sentences stay LONGER
 *
 * EXAMPLES:
 * - SHORT: 1.5 means short sentences get 50% more time
 * - LONG: 0.9 means long sentences get 10% less time (compressed)
 */
export const LENGTH_MULTIPLIERS = {
    SHORT: 1.5,    // Short sentences get 50% more time (easier to read quickly)
    MEDIUM: 1.0,   // Medium sentences use base speed (no adjustment)
    LONG: 0.9,     // Long sentences get 10% less time (compressed, avoid dragging)
};

// ============================================================================
// 4. MINIMUM DISPLAY TIME
// ============================================================================

/**
 * Minimum time (in seconds) that any subtitle must stay on screen.
 *
 * HOW TO ADJUST:
 * - INCREASE: Ensures even very short subtitles are readable
 * - DECREASE: Allows very short subtitles to disappear faster
 *
 * RECOMMENDED: 1.0-2.0 seconds
 */
export const MIN_DISPLAY_TIME = 1.0;  // seconds

// ============================================================================
// 5. MAXIMUM DISPLAY TIME
// ============================================================================

/**
 * Maximum time (in seconds) that any subtitle can stay on screen.
 *
 * HOW TO ADJUST:
 * - INCREASE: Allows very long subtitles to stay longer
 * - DECREASE: Forces long subtitles to disappear faster
 *
 * RECOMMENDED: 6.0-10.0 seconds
 */
export const MAX_DISPLAY_TIME = 8.0;  // seconds

// ============================================================================
// 6. MAIN FUNCTION: Calculate Display Time
// ============================================================================

/**
 * Calculate how long a subtitle should stay on screen.
 *
 * @param text - The subtitle text
 * @param language - The current language
 * @returns Display time in milliseconds
 */
export const calculateSubtitleDuration = (
    text: string,
    language: SupportedLanguage | null
): number => {
    const length = text.length;
    const baseSpeed = language ? BASE_READING_SPEEDS[language] : BASE_READING_SPEEDS.en;

    // Determine length category and get multiplier
    let multiplier: number;
    if (length <= LENGTH_THRESHOLDS.SHORT) {
        multiplier = LENGTH_MULTIPLIERS.SHORT;
    } else if (length >= LENGTH_THRESHOLDS.LONG) {
        multiplier = LENGTH_MULTIPLIERS.LONG;
    } else {
        multiplier = LENGTH_MULTIPLIERS.MEDIUM;
    }

    // Calculate base duration
    const baseDuration = (length / baseSpeed) * multiplier;

    // Apply min/max constraints
    const duration = Math.max(
        MIN_DISPLAY_TIME,
        Math.min(MAX_DISPLAY_TIME, baseDuration)
    );

    // Convert to milliseconds
    return duration * 1000;
};

