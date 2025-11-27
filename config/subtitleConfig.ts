import type { SupportedLanguage } from '../contexts/LanguageContext';

/**
 * Subtitle Reading Speed Configuration
 * 
 * This file contains the reading speed settings for subtitle synchronization.
 * Adjust these values to control how long each subtitle stays on screen.
 * 
 * HOW TO ADJUST:
 * - HIGHER number = FASTER subtitles (less time on screen)
 * - LOWER number = SLOWER subtitles (more time on screen)
 * 
 * FORMULA:
 * Display time (seconds) = sentence.length / READING_SPEED
 * 
 * EXAMPLES:
 * - 20 char sentence at speed 10 = 2 seconds on screen
 * - 20 char sentence at speed 20 = 1 second on screen
 * - 20 char sentence at speed 5 = 4 seconds on screen
 */

/**
 * Reading speed configuration for different languages (characters per second).
 * 
 * RESEARCH-BASED DEFAULTS:
 * - English/Spanish: ~14 chars/sec (based on 280 WPM, ~5 chars/word)
 * - Korean: ~10 chars/sec (denser characters, slightly faster reading)
 * - Japanese: ~8 chars/sec (Kanji-heavy, very information-dense)
 * - Chinese: ~8 chars/sec (Hanzi similar to Kanji in information density)
 * 
 * TUNING GUIDE:
 * If subtitles feel too fast (disappear before you finish reading):
 *   → DECREASE the number (e.g., 14 → 12 → 10)
 * 
 * If subtitles feel too slow (stay too long on screen):
 *   → INCREASE the number (e.g., 14 → 16 → 18)
 * 
 * RECOMMENDED RANGES:
 * - English/Spanish: 10-18 chars/sec
 * - Korean: 8-12 chars/sec
 * - Japanese: 6-10 chars/sec
 * - Chinese: 6-10 chars/sec
 */
export const SUBTITLE_READING_SPEEDS: Record<SupportedLanguage, number> = {
    es: 14,   // Spanish: 14 chars/sec
    en: 14,   // English: 14 chars/sec
    ko: 10,   // Korean: 10 chars/sec
    ja: 6.4,    // Japanese: 8 chars/sec
    zh: 8,    // Chinese: 8 chars/sec
};

/**
 * Get the reading speed for a specific language.
 * Falls back to English speed if language is not found.
 */
export const getReadingSpeed = (language: SupportedLanguage | null): number => {
    return language ? SUBTITLE_READING_SPEEDS[language] : SUBTITLE_READING_SPEEDS.en;
};

