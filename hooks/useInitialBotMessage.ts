import { useState, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { sendMessageToBot, generateSpeech, setLanguageConfig } from '../services';
import type { LanguageConfig } from '../contexts/LanguageContext';

/**
 * Custom hook to handle initial bot message preloading
 * Fetches the initial greeting message and audio when language is selected
 * @param languageConfig - The selected language configuration
 * @returns Object containing initialMessage and initialAudio
 */
export const useInitialBotMessage = (languageConfig: LanguageConfig | null) => {
  const [initialMessage, setInitialMessage] = useState<ChatMessage | null>(null);
  const [initialAudio, setInitialAudio] = useState<string | null>(null);

  useEffect(() => {
    if (!languageConfig) return;

    const preloadContent = async () => {
      console.log(`🌍 [LANGUAGE] Setting language to ${languageConfig.nativeName} (${languageConfig.geminiLanguageCode})`);

      // Configure the language for Gemini service
      setLanguageConfig(languageConfig.geminiLanguageCode, languageConfig.geminiVoice);

      // "Hello" is a dummy message to trigger the bot's predefined first response.
      const botResponseText = await sendMessageToBot("Hello");
      const audioData = await generateSpeech(botResponseText);

      setInitialMessage({ sender: 'bot', text: botResponseText });
      setInitialAudio(audioData);
    };

    preloadContent();
  }, [languageConfig]);

  return { initialMessage, initialAudio };
};

