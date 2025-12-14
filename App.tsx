
import React, { useState, useEffect } from 'react';
import WelcomeScreen from './screens/WelcomeScreen';
import MainScreen from './screens/MainScreen';
import LanguageSelectionScreen from './screens/LanguageSelectionScreen';
import LeaveConfirmationDialog from './components/LeaveConfirmationDialog';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import type { SupportedLanguage } from './contexts/LanguageContext';
import { useInitialBotMessage } from './hooks/useInitialBotMessage';

// Constants
const WELCOME_TRANSITION_DURATION_MS = 1000; // Matches WelcomeScreen.tsx animation duration

const AppContent: React.FC = () => {
  const { selectedLanguage, languageConfig, setLanguage } = useLanguage();
  const [showWelcome, setShowWelcome] = useState(true);
  const [isExitingWelcome, setIsExitingWelcome] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Mute state for the whole app
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [hasProgress, setHasProgress] = useState(false); // Track if user has made progress

  // Preload initial bot message and audio when language is selected
  const { initialMessage, initialAudio } = useInitialBotMessage(languageConfig);

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
    }, WELCOME_TRANSITION_DURATION_MS);
  };

  const handleToggleMute = () => {
    setIsMuted(prev => !prev);
  };

  // Handle browser beforeunload event
  useEffect(() => {
    if (!hasProgress || showWelcome) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      setShowLeaveConfirmation(true);
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasProgress, showWelcome]);

  // Handle mobile back button
  useEffect(() => {
    if (!hasProgress || showWelcome) return;

    const handlePopState = () => {
      // Push state back to prevent navigation
      window.history.pushState(null, '', window.location.href);
      setShowLeaveConfirmation(true);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, [hasProgress, showWelcome]);

  const handleConfirmLeave = () => {
    setShowLeaveConfirmation(false);
    // Allow the page to unload
    window.removeEventListener('beforeunload', () => {});
    window.location.href = '/';
  };

  const handleCancelLeave = () => {
    setShowLeaveConfirmation(false);
  };

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
          initialMessage={initialMessage}
          initialAudio={initialAudio}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onProgressChange={setHasProgress}
        />
      )}
      <LeaveConfirmationDialog
        isOpen={showLeaveConfirmation}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
      />
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
