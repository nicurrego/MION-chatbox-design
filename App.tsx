
import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import WelcomeScreen from './components/WelcomeScreen';
import MainScreen from './components/MainScreen';
import { sendMessageToBot, generateSpeech, startNewChat } from './services/geminiService';
import type { ChatMessage } from './types';
import { translations, LanguageCode } from './utils/localization';
=======
import WelcomeScreen from './screens/WelcomeScreen';
import MainScreen from './screens/MainScreen';
import LanguageSelectionScreen from './screens/LanguageSelectionScreen';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ServiceModeProvider, useServiceMode } from './contexts/ServiceModeContext';
import type { SupportedLanguage } from './contexts/LanguageContext';
import { useInitialBotMessage } from './hooks/useInitialBotMessage';
import { setServiceModeGetter } from './services';
>>>>>>> hot

// Constants
const WELCOME_TRANSITION_DURATION_MS = 1000; // Matches WelcomeScreen.tsx animation duration

const AppContent: React.FC = () => {
  const { selectedLanguage, languageConfig, setLanguage } = useLanguage();
  const { useMockService } = useServiceMode();
  const [showWelcome, setShowWelcome] = useState(true);
  const [isExitingWelcome, setIsExitingWelcome] = useState(false);
<<<<<<< HEAD
  const [initialBotMessage, setInitialBotMessage] = useState<ChatMessage | null>(null);
  const [initialAudioData, setInitialAudioData] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true); 
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');

  // Effect to start the chat whenever language changes or app loads
  // Note: We only generate the initial message AFTER the user clicks "Continue" on the welcome screen
  // to avoid generating an English greeting then switching to Japanese.
  useEffect(() => {
    // Pre-init chat structure with selected language, but don't send message yet.
    startNewChat(translations[currentLanguage].ai_lang_name);
  }, [currentLanguage]);

  const handleContinue = async () => {
    if (isExitingWelcome) return;
    setIsExitingWelcome(true);

    // Initialize conversation now that we know the final language selection
    try {
      const botResponseText = await sendMessageToBot("Hello");
      let audioData = null;
      if (isTtsEnabled) {
        audioData = await generateSpeech(botResponseText);
      }
      setInitialBotMessage({ sender: 'bot', text: botResponseText });
      setInitialAudioData(audioData);
    } catch (e) {
      console.error("Failed to get initial greeting", e);
    }
    
=======
  const [isMuted, setIsMuted] = useState(true); // Mute state for the whole app
  const [hasProgress, setHasProgress] = useState(false); // Track if user has made progress

  // Set up the service mode getter
  useEffect(() => {
    setServiceModeGetter(() => useMockService);
  }, [useMockService]);

  // Preload initial bot message and audio when language is selected
  const { initialMessage, initialAudio } = useInitialBotMessage(languageConfig);

  const handleLanguageSelect = (lang: SupportedLanguage) => {
    setLanguage(lang);
  };

  const handleContinue = () => {
    if (isExitingWelcome) return;
    setIsExitingWelcome(true);
>>>>>>> hot
    setTimeout(() => {
      setShowWelcome(false);
    }, WELCOME_TRANSITION_DURATION_MS);
  };

  const handleToggleMute = () => {
    setIsMuted(prev => !prev);
  };

  // Handle browser beforeunload event - show browser's native alert
  useEffect(() => {
    if (!hasProgress || showWelcome) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return 'Are you sure you want to leave? Your progress will be lost.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasProgress, showWelcome]);

  // Handle mobile back button
  useEffect(() => {
    if (!hasProgress || showWelcome) return;

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, [hasProgress, showWelcome]);

  if (!selectedLanguage) {
    return <LanguageSelectionScreen onLanguageSelect={handleLanguageSelect} />;
  }

  const handleToggleTts = () => {
    setIsTtsEnabled(prev => !prev);
  }

  const handleLanguageChange = (lang: LanguageCode) => {
      setCurrentLanguage(lang);
  }

  return (
    <>
      {showWelcome && (
        <WelcomeScreen
          onContinue={handleContinue}
          isExiting={isExitingWelcome}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isTtsEnabled={isTtsEnabled}
          onToggleTts={handleToggleTts}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          t={translations[currentLanguage]}
        />
      )}
      {!showWelcome && (
<<<<<<< HEAD
        <MainScreen 
          initialMessage={initialBotMessage} 
          initialAudio={isTtsEnabled ? initialAudioData : null} 
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isTtsEnabled={isTtsEnabled}
          t={translations[currentLanguage]}
=======
        <MainScreen
          initialMessage={initialMessage}
          initialAudio={initialAudio}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onProgressChange={setHasProgress}
>>>>>>> hot
        />
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <ServiceModeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ServiceModeProvider>
  );
};

export default App;
