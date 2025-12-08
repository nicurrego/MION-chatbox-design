import { useState, useRef, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { sendMessageToBot, generateSpeech } from '../services';
import type { OnsenPreferences } from '../services';
import { useLanguage } from '../contexts/LanguageContext';
import { calculateSubtitleDuration } from '../config/subtitleConfig';

/**
 * Splits text into sentences, handling multiple languages including CJK (Chinese, Japanese, Korean).
 *
 * Sentence endings:
 * - English/Spanish: . ? !
 * - Japanese: 。？！
 * - Chinese: 。？！
 * - Korean: . ? ! (uses spaces like English)
 */
const splitIntoSentences = (text: string): string[] => {
    if (!text) return [];

    // Check if text contains CJK characters
    const hasCJK = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\uac00-\ud7af]/.test(text);

    if (hasCJK) {
        // For CJK languages: split by CJK punctuation (。？！) OR western punctuation followed by optional space
        // This handles mixed language text and pure CJK text
        const sentences = text.split(/([。？！.?!])/);
        const result: string[] = [];

        for (let i = 0; i < sentences.length; i += 2) {
            const sentence = sentences[i];
            const punctuation = sentences[i + 1] || '';
            const combined = (sentence + punctuation).trim();
            if (combined) {
                result.push(combined);
            }
        }

        return result.filter(Boolean);
    } else {
        // For non-CJK languages (English, Spanish): split by western punctuation followed by space
        return text.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(Boolean);
    }
};

export const useChatSession = () => {
    const { selectedLanguage } = useLanguage();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentBotMessage, setCurrentBotMessage] = useState('');
    const [currentSubtitle, setCurrentSubtitle] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [lastBotAudio, setLastBotAudio] = useState<string | null>(null);
    const [storedPreferences, setStoredPreferences] = useState<OnsenPreferences | null>(null);
    const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);

    const typingIntervalRef = useRef<number | null>(null);
    const subtitleTimeoutRefs = useRef<number[]>([]);

    const clearTimeouts = useCallback(() => {
        subtitleTimeoutRefs.current.forEach(window.clearTimeout);
        subtitleTimeoutRefs.current = [];
        if (typingIntervalRef.current) {
            window.clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
        }
    }, []);

    const runTypingEffect = useCallback((text: string) => {
        setIsTyping(true);
        setCurrentBotMessage('');
        clearTimeouts();

        // 1. Text Typing Effect
        let charIndex = 0;
        typingIntervalRef.current = window.setInterval(() => {
            if (charIndex < text.length) {
                setCurrentBotMessage(text.slice(0, charIndex + 1));
                charIndex++;
            } else {
                if (typingIntervalRef.current) {
                    clearInterval(typingIntervalRef.current);
                    typingIntervalRef.current = null;
                }
                setIsTyping(false);
                setMessages(prev => [...prev, { sender: 'bot', text }]);
            }
        }, 50);

        // 2. Subtitle Sync with Language-Specific Reading Speed & Length Modifiers
        const sentences = splitIntoSentences(text);
        let cumulativeDelay = 0;

        sentences.forEach(sentence => {
            // Calculate duration using advanced subtitle config (handles length modifiers)
            const duration = calculateSubtitleDuration(sentence, selectedLanguage);
            const timeoutId = window.setTimeout(() => setCurrentSubtitle(sentence), cumulativeDelay);
            subtitleTimeoutRefs.current.push(timeoutId);
            cumulativeDelay += duration;
        });

        const finalTimeoutId = window.setTimeout(() => setCurrentSubtitle(''), cumulativeDelay + 2000);
        subtitleTimeoutRefs.current.push(finalTimeoutId);
    }, [clearTimeouts, selectedLanguage]);

    const processUserMessage = useCallback(async (userInput: string, skipConfirmationCheck: boolean = false) => {
        if (isTyping || isLoading) return null;

        clearTimeouts();
        setCurrentSubtitle('');
        setLastBotAudio(null);

        console.log("💬 [CHAT] User sent message:", userInput);
        setMessages(prev => [...prev, { sender: 'user', text: userInput }]);
        setIsLoading(true);
        setCurrentBotMessage('');

        try {
            console.log("🤖 [CHAT] Sending message to bot...");
            const botResponseText = await sendMessageToBot(userInput);
            console.log("✅ [CHAT] Bot response received:", botResponseText.substring(0, 100) + "...");

            // Parse preferences from bot response (hidden format)
            const prefsRegex = /\[PREFERENCES_START\]([\s\S]*?)\[PREFERENCES_END\]/;
            const match = botResponseText.match(prefsRegex);

            if (match && match[1]) {
                console.log("📋 [PREFS] Found preferences in bot response, storing and waiting for confirmation...");
                try {
                    const prefsText = match[1].trim();
                    const lines = prefsText.split('\n').map(line => line.trim()).filter(line => line);

                    const prefs: any = {};
                    lines.forEach(line => {
                        const [key, ...valueParts] = line.split(':');
                        const value = valueParts.join(':').trim();
                        prefs[key.trim()] = value;
                    });

                    const preferences: OnsenPreferences = {
                        wellbeingProfile: {
                            skinType: prefs.skinType || '',
                            muscleSoreness: prefs.muscleSoreness || '',
                            stressLevel: prefs.stressLevel || '',
                            waterTemperature: prefs.waterTemperature || '',
                            healthGoals: prefs.healthGoals || ''
                        },
                        aestheticProfile: {
                            atmosphere: prefs.atmosphere || '',
                            colorPalette: prefs.colorPalette || '',
                            timeOfDay: prefs.timeOfDay || ''
                        }
                    };

                    setStoredPreferences(preferences);
                    setWaitingForConfirmation(true);
                    console.log("✅ [PREFS] Preferences stored, waiting for user confirmation:", preferences);
                } catch (e) {
                    console.error("❌ [PREFS] Failed to parse preferences:", e);
                }
            }

            // Remove the hidden preferences block from the displayed text
            const displayText = botResponseText.replace(prefsRegex, '').trim();

            console.log("🔊 [TTS] Generating speech for bot response...");
            const audioData = await generateSpeech(displayText);
            if (audioData) {
                console.log("✅ [TTS] Speech generated successfully");
            } else {
                console.log("ℹ️ [TTS] No speech generated (might be disabled or quota exceeded)");
            }

            setLastBotAudio(audioData);
            setIsLoading(false);

            // Return data for the UI to handle (playing audio, showing buttons)
            return {
                text: displayText,
                audio: audioData,
                showConfirmation: waitingForConfirmation
            };
        } catch (error) {
            setIsLoading(false);
            console.error("❌ [CHAT] Error processing message:", error);
            return null;
        }
    }, [isTyping, isLoading, clearTimeouts, waitingForConfirmation]);

    const confirmPreferences = useCallback(() => {
        console.log("✅ [CONFIRM] User confirmed preferences via button");
        setWaitingForConfirmation(false);
        return storedPreferences;
    }, [storedPreferences]);

    const rejectPreferences = useCallback(async () => {
        console.log("❌ [REJECT] User wants to change preferences");
        setWaitingForConfirmation(false);
        setStoredPreferences(null);

        // Ask what they want to change
        const rejectionMessage = "What would you like to change or add to your onsen preferences?";
        const audioData = await generateSpeech(rejectionMessage);

        return {
            text: rejectionMessage,
            audio: audioData
        };
    }, []);

    return {
        messages,
        currentBotMessage,
        currentSubtitle,
        isTyping,
        isLoading,
        lastBotAudio,
        waitingForConfirmation,
        storedPreferences,
        runTypingEffect,
        processUserMessage,
        confirmPreferences,
        rejectPreferences,
        clearTimeouts,
        setCurrentSubtitle
    };
};

