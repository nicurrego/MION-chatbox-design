
import React, { useState, useEffect } from 'react';
import WelcomeScreen from './screens/WelcomeScreen';
import MainScreen from './screens/MainScreen';
import LanguageSelectionScreen from './screens/LanguageSelectionScreen';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ServiceModeProvider, useServiceMode } from './contexts/ServiceModeContext';
import type { SupportedLanguage } from './contexts/LanguageContext';
import { useInitialBotMessage } from './hooks/useInitialBotMessage';
import { setServiceModeGetter } from './services';

// Constants
const WELCOME_TRANSITION_DURATION_MS = 1000; // Matches WelcomeScreen.tsx animation duration

const AppContent: React.FC = () => {
  const { selectedLanguage, languageConfig, setLanguage } = useLanguage();
  const { useMockService } = useServiceMode();
  const [showWelcome, setShowWelcome] = useState(true);
  const [isExitingWelcome, setIsExitingWelcome] = useState(false);
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
          initialMessage={initialMessage}
          initialAudio={initialAudio}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onProgressChange={setHasProgress}
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
