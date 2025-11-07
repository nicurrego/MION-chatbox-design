
import React, { useState, useRef } from 'react';

interface WelcomeScreenProps {
  onContinue: () => void;
  isExiting: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue, isExiting }) => {
  const [isStarted, setIsStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStart = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(error => {
        // Autoplay was prevented.
        console.error("Video play failed:", error);
      });
      setIsStarted(true);
    }
  };

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
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-in;
        }
        @keyframes pulse-slow {
          0%, 100% { box-shadow: 0 0 15px rgba(100, 220, 255, 0.4); }
          50% { box-shadow: 0 0 30px rgba(100, 220, 255, 0.8); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2.5s infinite;
        }
      `}</style>
      <video
        ref={videoRef}
        src="https://i.imgur.com/ZjUSgRK.mp4"
        playsInline
        onEnded={onContinue} // Transition when video finishes
        className="absolute top-1/2 left-1/2 w-auto h-auto min-w-full min-h-full object-cover transform -translate-x-1/2 -translate-y-1/2"
      />
      
      {!isStarted && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 animate-fadeIn">
          <div className="text-center">
            <h1 className="text-white text-5xl md:text-7xl mb-8" style={{ textShadow: '0 0 15px rgba(255, 255, 255, 0.7)' }}>Visual Novel AI Chat</h1>
            <button
              onClick={handleStart}
              className="
                px-8 py-3 bg-cyan-500/80 text-white text-3xl rounded-lg border-2 border-cyan-300
                hover:bg-cyan-400 hover:shadow-2xl hover:shadow-cyan-400/50
                focus:outline-none focus:ring-4 focus:ring-cyan-300
                transition-all duration-300 ease-in-out
                animate-pulse-slow
              "
              style={{
                textShadow: '0 0 8px rgba(255, 255, 255, 0.7)',
              }}
            >
              Click to Start
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;
