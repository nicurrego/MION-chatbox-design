
import React, { useState, useEffect } from 'react';
import WelcomeScreen from './screens/WelcomeScreen';
import MainScreen from './screens/MainScreen';
import LanguageSelectionScreen from './screens/LanguageSelectionScreen';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import type { SupportedLanguage } from './contexts/LanguageContext';
import { sendMessageToBot, generateSpeech, setLanguageConfig } from './services';
import type { ChatMessage } from './types';

const AppContent: React.FC = () => {
  const { selectedLanguage, languageConfig, setLanguage } = useLanguage();
  const [showWelcome, setShowWelcome] = useState(true);
  const [isExitingWelcome, setIsExitingWelcome] = useState(false);
  const [initialBotMessage, setInitialBotMessage] = useState<ChatMessage | null>(null);
  const [initialAudioData, setInitialAudioData] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true); // Mute state for the whole app

  // Preload initial content ONLY after language is selected
  useEffect(() => {
    if (!selectedLanguage || !languageConfig) return;

    const preloadContent = async () => {
      console.log(`🌍 [LANGUAGE] Setting language to ${languageConfig.nativeName} (${languageConfig.geminiLanguageCode})`);

      // Configure the language for Gemini service
      setLanguageConfig(languageConfig.geminiLanguageCode, languageConfig.geminiVoice);

      // "Hello" is a dummy message to trigger the bot's predefined first response.
      const botResponseText = await sendMessageToBot("Hello");
      const audioData = await generateSpeech(botResponseText);

      setInitialBotMessage({ sender: 'bot', text: botResponseText });
      setInitialAudioData(audioData);
    };

    preloadContent();
  }, [selectedLanguage, languageConfig]); // Only run when language is selected

  const handleLanguageSelect = (lang: SupportedLanguage) => {
    setLanguage(lang);
  };

  const handleContinue = () => {
    // Prevent multiple calls
    if (isExitingWelcome) return;

    setIsExitingWelcome(true);

    // This timeout should match the transition duration in WelcomeScreen.tsx
    setTimeout(() => {
      setShowWelcome(false);
    }, 1000);
  };

  const handleToggleMute = () => {
    setIsMuted(prev => !prev);
  }

  // Show language selection screen first
  if (!selectedLanguage) {
    return <LanguageSelectionScreen onLanguageSelect={handleLanguageSelect} />;
  }

  return (
    <>
      {showWelcome && (
        <WelcomeScreen
          onContinue={handleContinue}
          isExiting={isExitingWelcome}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}
      {!showWelcome && (
        <MainScreen
          initialMessage={initialBotMessage}
          initialAudio={initialAudioData}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
