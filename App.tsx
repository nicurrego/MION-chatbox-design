
import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import MainScreen from './components/MainScreen';

const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isExitingWelcome, setIsExitingWelcome] = useState(false);

  const handleContinue = () => {
    setIsExitingWelcome(true);
    // This timeout should match the transition duration in WelcomeScreen.tsx
    setTimeout(() => {
      setShowWelcome(false);
    }, 1000); 
  };

  return (
    <>
      {showWelcome && <WelcomeScreen onContinue={handleContinue} isExiting={isExitingWelcome} />}
      {!showWelcome && <MainScreen />}
    </>
  );
};

export default App;
