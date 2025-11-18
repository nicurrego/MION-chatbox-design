import React, { useState, useEffect } from 'react';

interface InfoBoxProps {
  isGeneratingImage: boolean;
  generatedImageUrls: string[] | null;
}

const InfoBox: React.FC<InfoBoxProps> = ({ isGeneratingImage, generatedImageUrls }) => {
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

    if (generatedImageUrls && generatedImageUrls.length > 0) {
        return (
          <div className="w-full h-full flex flex-col">
            <h2 className="text-xl text-cyan-200 mb-2 text-center flex-shrink-0">Please select a concept:</h2>
            <div className="flex-grow w-full grid grid-cols-2 grid-rows-2 gap-2">
              {generatedImageUrls.map((url, index) => (
                <button 
                  key={index} 
                  className="relative w-full h-full overflow-hidden rounded-lg group focus:outline-none focus:ring-4 focus:ring-cyan-400/80 focus:ring-offset-2 focus:ring-offset-slate-900"
                  aria-label={`Select onsen concept variation ${index + 1}`}
                >
                  <img 
                    src={url} 
                    alt={`Onsen concept variation ${index + 1}`}
                    className="w-full h-full object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-300"></div>
                </button>
              ))}
            </div>
          </div>
        );
      }
    
    return (
      <>
        <div>
          <h2 className="text-3xl text-cyan-200 border-b-2 border-cyan-400/50 pb-2">SESSION INFO</h2>
          <p className="text-lg text-white/80 mt-2 italic">Your onsen profile will appear here once created.</p>
        </div>
        <div className="mt-auto text-right">
            <div className="text-5xl md:text-7xl" style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.7)' }}>
                {formattedTime}
            </div>
            <div className="text-2xl md:text-3xl text-cyan-200">
                ☀️ 27°
            </div>
        </div>
      </>
    );
  };


  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border-2 border-cyan-400/50 shadow-2xl shadow-cyan-400/20 p-6 flex flex-col text-white h-full transition-all duration-500">
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