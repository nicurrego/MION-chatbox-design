
import React, { useState, useRef, useEffect } from 'react';
<<<<<<< HEAD:components/WelcomeScreen.tsx
import { LanguageCode, Translation } from '../utils/localization';
=======
import { useLanguage } from '../contexts/LanguageContext';
import type { SupportedLanguage } from '../contexts/LanguageContext';
>>>>>>> hot:screens/WelcomeScreen.tsx

interface WelcomeScreenProps {
  onContinue: () => void;
  isExiting: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  isTtsEnabled: boolean;
  onToggleTts: () => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  t: Translation;
}

// Detect if device is mobile
const isMobileDevice = (): boolean => {
  // Check if window is available (for SSR compatibility)
  if (typeof window === 'undefined') return false;

  // Check user agent for mobile devices
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

  // Also check screen size (mobile typically < 768px width)
  const isMobileSize = window.innerWidth < 768;

  return mobileRegex.test(userAgent.toLowerCase()) || isMobileSize;
};

// Background video configuration
const getBackgroundVideos = () => {
  const isMobile = isMobileDevice();

  return {
    loopVideo: isMobile ? 'videos/intro_loop_mobile.mp4' : 'videos/intro_loop.mp4',
    introVideo: isMobile ? 'videos/starting_video_mobile.mp4' : 'videos/starting_video4.mp4',
    isMobile
  };
};

// Translations for WelcomeScreen
const translations: Record<SupportedLanguage, {
  tapToStart: string;
  skipIntro: string;
  muteSound: string;
  unmuteSound: string;
}> = {
  en: {
    tapToStart: '- tap to start -',
    skipIntro: 'Skip intro video',
    muteSound: 'Mute sound',
    unmuteSound: 'Unmute sound',
  },
  es: {
    tapToStart: '- toca para comenzar -',
    skipIntro: 'Saltar video de introducción',
    muteSound: 'Silenciar sonido',
    unmuteSound: 'Activar sonido',
  },
  ja: {
    tapToStart: '- タップして開始 -',
    skipIntro: 'イントロビデオをスキップ',
    muteSound: '音声をミュート',
    unmuteSound: '音声をミュート解除',
  },
  ko: {
    tapToStart: '- 탭하여 시작 -',
    skipIntro: '인트로 비디오 건너뛰기',
    muteSound: '음소거',
    unmuteSound: '음소거 해제',
  },
  zh: {
    tapToStart: '- 点击开始 -',
    skipIntro: '跳过介绍视频',
    muteSound: '静音',
    unmuteSound: '取消静音',
  },
};

const SoundIcon: React.FC<{ isMuted: boolean }> = ({ isMuted }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {isMuted ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    )}
  </svg>
);


const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
    onContinue, isExiting, isMuted, onToggleMute, 
    isTtsEnabled, onToggleTts, currentLanguage, onLanguageChange, t 
}) => {
  const [screen, setScreen] = useState<'loop' | 'intro'>('loop');
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const { selectedLanguage } = useLanguage();
  const t = translations[selectedLanguage || 'en'];
  const loopVideoRef = useRef<HTMLVideoElement>(null);

  // Get appropriate background videos based on device type
  const backgroundVideos = getBackgroundVideos();

  const handleStartIntro = () => {
    setScreen('intro');
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleMute();
  };
  
  useEffect(() => {
    if (loopVideoRef.current) {
        loopVideoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (screen === 'intro' && introVideoRef.current) {
      introVideoRef.current.muted = isMuted;
      introVideoRef.current.play().catch(error => {
        console.error("Intro video play failed:", error);
      });
    }
  }, [screen, isMuted]);

  return (
    <div 
      className={`
        fixed inset-0 w-full h-full bg-black overflow-hidden
        transition-opacity duration-1000 ease-in-out z-50
        ${isExiting ? 'opacity-0' : 'opacity-100'}
      `}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 1.5s ease-in;
        }
        @keyframes gentleBob {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-4px, -2px); }
          50% { transform: translate(0px, 3px); }
          75% { transform: translate(4px, -1px); }
        }
        .animate-title-bob {
          animation: gentleBob 6s ease-in-out infinite;
        }
        .animate-subtitle-bob {
          animation: gentleBob 7s ease-in-out infinite;
        }
      `}</style>
      
      {screen === 'loop' && (
        <div
          className="w-full h-full cursor-pointer"
          onClick={handleStartIntro}
        >
            <video
                ref={loopVideoRef}
                src={backgroundVideos.loopVideo}
                autoPlay
                loop
                muted 
                playsInline
                className="absolute top-1/2 left-1/2 w-auto h-auto min-w-full min-h-full object-cover transform -translate-x-1/2 -translate-y-1/2"
            />
             <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 animate-fadeIn px-4">
                <div className="text-center max-w-4xl w-full">
                    <div className="mb-8">
<<<<<<< HEAD:components/WelcomeScreen.tsx
                    <h1 className="text-5xl md:text-7xl animate-title-bob" style={{ color: '#FFF8E1', textShadow: '0 0 20px rgba(255, 165, 0, 0.7)' }}>{t.welcome_title}</h1>
                    <h2 className="text-xl md:text-2xl tracking-widest uppercase animate-subtitle-bob" style={{ color: '#FFDAB9', textShadow: '0 0 10px rgba(239, 137, 61, 0.5)' }}>{t.welcome_subtitle}</h2>
                    </div>
                    <p className="mt-24 text-white/70 text-xl tracking-widest animate-pulse">{t.click_start}</p>
=======
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl animate-title-bob font-bold" style={{ color: '#FFF8E1', textShadow: '0 0 20px rgba(255, 165, 0, 0.7)' }}>TALK TO MION</h1>
                    <h2 className="text-lg sm:text-xl md:text-2xl tracking-widest uppercase animate-subtitle-bob mt-2" style={{ color: '#FFDAB9', textShadow: '0 0 10px rgba(239, 137, 61, 0.5)' }}>a MION experience</h2>
                    </div>
                    <p className="mt-16 sm:mt-24 text-white/70 text-lg sm:text-xl tracking-widest animate-pulse">{t.tapToStart}</p>
>>>>>>> hot:screens/WelcomeScreen.tsx
                </div>

                {/* Language Selector */}
                <div className="absolute top-4 right-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => onLanguageChange('en')} 
                        className={`px-2 py-1 rounded ${currentLanguage === 'en' ? 'bg-cyan-600 text-white' : 'bg-black/50 text-white/60'}`}>EN</button>
                    <button 
                        onClick={() => onLanguageChange('ja')} 
                        className={`px-2 py-1 rounded ${currentLanguage === 'ja' ? 'bg-cyan-600 text-white' : 'bg-black/50 text-white/60'}`}>JP</button>
                    <button 
                        onClick={() => onLanguageChange('es')} 
                        className={`px-2 py-1 rounded ${currentLanguage === 'es' ? 'bg-cyan-600 text-white' : 'bg-black/50 text-white/60'}`}>ES</button>
                    <button 
                        onClick={() => onLanguageChange('fr')} 
                        className={`px-2 py-1 rounded ${currentLanguage === 'fr' ? 'bg-cyan-600 text-white' : 'bg-black/50 text-white/60'}`}>FR</button>
                </div>

                <button
                    onClick={toggleSound}
<<<<<<< HEAD:components/WelcomeScreen.tsx
                    className="absolute bottom-4 right-4 z-20 bg-black/40 rounded-full p-3 text-white/70 hover:text-white hover:bg-black/60 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label={isMuted ? t.btn_unmute : t.btn_mute}
=======
                    className="absolute bottom-4 right-4 z-20 bg-black/40 rounded-full p-4 sm:p-3 text-white/70 hover:text-white hover:bg-black/60 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 min-w-[48px] min-h-[48px] flex items-center justify-center"
                    aria-label={isMuted ? t.unmuteSound : t.muteSound}
>>>>>>> hot:screens/WelcomeScreen.tsx
                >
                    <SoundIcon isMuted={isMuted} />
                </button>
             </div>
        </div>
      )}

      {screen === 'intro' && (
        <>
            <video
                ref={introVideoRef}
                src={backgroundVideos.introVideo}
                playsInline
                onEnded={onContinue}
                className="absolute top-1/2 left-1/2 w-auto h-auto min-w-full min-h-full object-cover transform -translate-x-1/2 -translate-y-1/2"
            />
<<<<<<< HEAD:components/WelcomeScreen.tsx
            <div className="absolute bottom-5 right-5 z-20 flex items-center gap-4 animate-fadeIn">
                <button
                    onClick={onToggleTts}
                    className={`
                        px-4 py-2 rounded-md text-lg tracking-wider transition-colors duration-300 border border-white/20
                        ${isTtsEnabled 
                            ? 'bg-black/50 text-white/70 hover:bg-white hover:text-black' 
                            : 'bg-red-900/60 text-white hover:bg-red-800/80'
                        }
                    `}
                    aria-label={isTtsEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech"}
                >
                    {isTtsEnabled ? t.voice_on : t.voice_off}
                </button>
                <button
                    onClick={onContinue}
                    className="bg-black/50 text-white/70 px-4 py-2 rounded-md text-lg tracking-wider hover:bg-white hover:text-black transition-colors duration-300 border border-transparent"
                    aria-label={t.skip}
                >
                    {t.skip}
                </button>
            </div>
=======
            <button
              onClick={onContinue}
              className="absolute bottom-5 right-5 z-20 bg-black/50 text-white/70 px-6 py-3 sm:px-4 sm:py-2 rounded-md text-lg tracking-wider hover:bg-white hover:text-black transition-colors duration-300 animate-fadeIn min-h-[48px] flex items-center justify-center"
              aria-label={t.skipIntro}
            >
              {t.skipIntro.toUpperCase()}
            </button>
>>>>>>> hot:screens/WelcomeScreen.tsx
        </>
      )}
    </div>
  );
};

export default WelcomeScreen;
