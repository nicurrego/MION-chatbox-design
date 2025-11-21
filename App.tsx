
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import WelcomeScreen from './components/WelcomeScreen';
import MainScreen from './components/MainScreen';
import { sendMessageToBot, generateSpeech } from './services/geminiService';
import type { ChatMessage } from './types';

const App: React.FC = () => {
  const { i18n } = useTranslation();
  const [showWelcome, setShowWelcome] = useState(true);
  const [isExitingWelcome, setIsExitingWelcome] = useState(false);
  const [initialBotMessage, setInitialBotMessage] = useState<ChatMessage | null>(null);
  const [initialAudioData, setInitialAudioData] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true); // Mute state for the whole app

  // Preload initial content when language changes or app mounts
  useEffect(() => {
    const preloadContent = async () => {
      console.log("🌍 [APP] Preloading content in language:", i18n.language);
      // "Hello" is a dummy message to trigger the bot's predefined first response.
      const botResponseText = await sendMessageToBot("Hello", i18n.language);
      const audioData = await generateSpeech(botResponseText);

      setInitialBotMessage({ sender: 'bot', text: botResponseText });
      setInitialAudioData(audioData);
    };

    preloadContent();
  }, [i18n.language]); // Re-run when language changes

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

export default App;
