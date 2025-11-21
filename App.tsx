
import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import MainScreen from './components/MainScreen';
import { sendMessageToBot, generateSpeech, startNewChat } from './services/geminiService';
import type { ChatMessage } from './types';
import { translations, LanguageCode } from './utils/localization';

const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isExitingWelcome, setIsExitingWelcome] = useState(false);
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
    
    setTimeout(() => {
      setShowWelcome(false);
    }, 1000); 
  };
  
  const handleToggleMute = () => {
    setIsMuted(prev => !prev);
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
        <MainScreen 
          initialMessage={initialBotMessage} 
          initialAudio={isTtsEnabled ? initialAudioData : null} 
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isTtsEnabled={isTtsEnabled}
          t={translations[currentLanguage]}
        />
      )}
    </>
  );
};

export default App;
