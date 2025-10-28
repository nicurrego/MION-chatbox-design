
import React, { useState, useRef, useEffect } from 'react';

interface SplashScreenProps {
  onContinue: () => void;
  isExiting: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue, isExiting }) => {
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Muting the video is necessary for autoplay to work in most modern browsers
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0;
    }
  }, []);

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
        autoPlay
        playsInline
        muted
        onEnded={() => setVideoEnded(true)}
        className="absolute top-1/2 left-1/2 w-auto h-auto min-w-full min-h-full object-cover transform -translate-x-1/2 -translate-y-1/2"
      />
      
      {videoEnded && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-fadeIn">
          <button
            onClick={onContinue}
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
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default SplashScreen;
