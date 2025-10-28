
import React, { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import MainScreen from './components/MainScreen';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isExitingSplash, setIsExitingSplash] = useState(false);

  const handleContinue = () => {
    setIsExitingSplash(true);
    // This timeout should match the transition duration in SplashScreen.tsx
    setTimeout(() => {
      setShowSplash(false);
    }, 1000); 
  };

  return (
    <>
      {showSplash && <SplashScreen onContinue={handleContinue} isExiting={isExitingSplash} />}
      {!showSplash && <MainScreen />}
    </>
  );
};

export default App;
