
import React, { useState, useEffect } from 'react';
import WelcomeScreen from './screens/WelcomeScreen';
import MainScreen from './screens/MainScreen';
import LanguageSelectionScreen from './screens/LanguageSelectionScreen';
import LeaveConfirmationDialog from './components/LeaveConfirmationDialog';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import type { SupportedLanguage } from './contexts/LanguageContext';
import { sendMessageToBot, generateSpeech, setLanguageConfig } from './services';
import type { ChatMessage } from './types';
import { useBeforeUnload } from './hooks/useBeforeUnload';

const AppContent: React.FC = () => {
  const { selectedLanguage, languageConfig, setLanguage } = useLanguage();
  const [showWelcome, setShowWelcome] = useState(true);
  const [isExitingWelcome, setIsExitingWelcome] = useState(false);
  const [initialBotMessage, setInitialBotMessage] = useState<ChatMessage | null>(null);
  const [initialAudioData, setInitialAudioData] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true); // Mute state for the whole app
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [hasProgress, setHasProgress] = useState(false); // Track if user has made progress

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
  };

  // Use the beforeunload hook to show confirmation when user tries to leave
  useBeforeUnload({
    isDirty: hasProgress && !showWelcome, // Only show confirmation if user has progress and is past welcome screen
  });

  // Handle browser beforeunload event
  useEffect(() => {
    if (!hasProgress || showWelcome) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
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
          initialMessage={initialBotMessage}
          initialAudio={initialAudioData}
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
