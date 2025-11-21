import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface InfoBoxProps {
  isGeneratingImage: boolean;
  generatedImageUrls: string[] | null;
  onConceptSelect: (url: string) => void;
  isConceptSelected: boolean;
  generatedVideoUrl: string | null;
}

const InfoBox: React.FC<InfoBoxProps> = ({ isGeneratingImage, generatedImageUrls, onConceptSelect, isConceptSelected, generatedVideoUrl }) => {
  const { t } = useTranslation();
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

    if (generatedImageUrls && generatedImageUrls.length > 0 && !isConceptSelected) {
        return (
          <div className="w-full h-full flex flex-col overflow-hidden">
            <h2 className="text-xl text-cyan-200 mb-3 text-center flex-shrink-0">Please select a concept:</h2>
            <div className="flex-1 w-full flex flex-col gap-3 overflow-y-auto min-h-0">
              {generatedImageUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => onConceptSelect(url)}
                  className="relative w-full flex-shrink-0 h-[calc((100%-0.75rem)/2)] overflow-hidden rounded-lg group focus:outline-none focus:ring-4 focus:ring-cyan-400/80 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 hover:ring-2 hover:ring-cyan-400/50"
                  aria-label={`Select onsen concept variation ${index + 1}`}
                >
                  <img
                    src={url}
                    alt={`Onsen concept variation ${index + 1}`}
                    className="w-full h-full object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 px-4 py-2 rounded-full">
                      Concept {index + 1}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      }
    
    return (
      <>
        <div>
          <h2 className="text-3xl text-cyan-200 border-b-2 border-cyan-400/50 pb-2">{t('infoBox.title')}</h2>
          <p className="text-lg text-white/80 mt-2 italic">
            {generatedVideoUrl
              ? t('infoBox.ready')
              : isConceptSelected
              ? t('infoBox.finalizing')
              : t('infoBox.waiting')
            }
          </p>
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
    <div className="backdrop-blur-sm rounded-lg border-2 border-cyan-400/30 shadow-2xl shadow-cyan-400/10 p-6 flex flex-col text-white h-full transition-all duration-500">
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