
import React, { useState, useRef, useEffect } from 'react';

interface WelcomeScreenProps {
  onContinue: () => void;
  isExiting: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

const SoundIcon: React.FC<{ isMuted: boolean }> = ({ isMuted }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {isMuted ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    )}
  </svg>
);


const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue, isExiting, isMuted, onToggleMute }) => {
  const [screen, setScreen] = useState<'loop' | 'intro'>('loop');
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const loopVideoRef = useRef<HTMLVideoElement>(null);

  const handleStartIntro = () => {
    setScreen('intro');
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleMute();
  };
  
  // Sync loop video mute state with global prop
  useEffect(() => {
    if (loopVideoRef.current) {
        loopVideoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Sync intro video mute state when it becomes active
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
                src="videos\intro_loop.mp4"
                autoPlay
                loop
                muted // Start muted, will be synced by useEffect
                playsInline
                className="absolute top-1/2 left-1/2 w-auto h-auto min-w-full min-h-full object-cover transform -translate-x-1/2 -translate-y-1/2"
            />
             <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 animate-fadeIn">
                <div className="text-center">
                    <div className="mb-8">
                    <h1 className="text-5xl md:text-7xl animate-title-bob" style={{ color: '#FFF8E1', textShadow: '0 0 20px rgba(255, 165, 0, 0.7)' }}>TALK TO MION</h1>
                    <h2 className="text-xl md:text-2xl tracking-widest uppercase animate-subtitle-bob" style={{ color: '#FFDAB9', textShadow: '0 0 10px rgba(239, 137, 61, 0.5)' }}>a MION experience</h2>
                    </div>
                    <p className="mt-24 text-white/70 text-xl tracking-widest animate-pulse">- click to start -</p>
                </div>
                <button
                    onClick={toggleSound}
                    className="absolute bottom-4 right-4 z-20 bg-black/40 rounded-full p-3 text-white/70 hover:text-white hover:bg-black/60 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
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
                src="videos/starting_video.mp4"
                playsInline
                onEnded={onContinue}
                className="absolute top-1/2 left-1/2 w-auto h-auto min-w-full min-h-full object-cover transform -translate-x-1/2 -translate-y-1/2"
            />
            <button
              onClick={onContinue}
              className="absolute bottom-5 right-5 z-20 bg-black/50 text-white/70 px-4 py-2 rounded-md text-lg tracking-wider hover:bg-white hover:text-black transition-colors duration-300 animate-fadeIn"
              aria-label="Skip intro video"
            >
              SKIP
            </button>
        </>
      )}
    </div>
  );
};

export default WelcomeScreen;
