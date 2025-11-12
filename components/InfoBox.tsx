import React, { useState, useEffect } from 'react';

interface InfoBoxProps {
  isGeneratingImage: boolean;
  generatedImageUrl: string | null;
}

const InfoBox: React.FC<InfoBoxProps> = ({ isGeneratingImage, generatedImageUrl }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const renderContent = () => {
    if (isGeneratingImage) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-white animate-pulse">
            <div className="text-2xl">Crafting your onsen...</div>
            <div className="text-lg text-cyan-200 mt-2">Please wait a moment.</div>
        </div>
      );
    }

    if (generatedImageUrl) {
      return (
        <img 
            src={generatedImageUrl} 
            alt="Your personalized onsen concept"
            className="w-full h-full object-cover rounded-lg transition-opacity duration-1000 opacity-0 animate-fadeInImage"
        />
      );
    }
    
    return (
        <div className="text-right">
            <div className="text-5xl md:text-7xl" style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.7)' }}>
                {formattedTime}
            </div>
            <div className="text-2xl md:text-3xl text-cyan-200">
                ☀️ 27°
            </div>
        </div>
    );
  };


  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border-2 border-cyan-400/50 shadow-2xl shadow-cyan-400/20 p-4 flex items-center justify-end text-white h-full transition-all duration-500">
      <style>{`
        @keyframes fadeInImage {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeInImage {
            animation: fadeInImage 1s ease-in-out forwards;
        }
      `}</style>
      {renderContent()}
    </div>
  );
};

export default InfoBox;
