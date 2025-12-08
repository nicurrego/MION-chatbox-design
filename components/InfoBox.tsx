import React, { useState, useEffect } from 'react';
import ConfirmationButtons from './ConfirmationButtons';
import type { OnsenPreferences } from '../services';

interface InfoBoxProps {
  isGeneratingImage: boolean;
  generatedImageUrls: string[] | null;
  onConceptSelect: (url: string) => void;
  isConceptSelected: boolean;
  generatedVideoUrl: string | null;
  isGeneratingVideo: boolean;
  onsenDescription: string | null;
  showConfirmation: boolean;
  onConfirm: () => void;
  onReject: () => void;
  userPreferences: OnsenPreferences | null;
}

const InfoBox: React.FC<InfoBoxProps> = ({
  isGeneratingImage,
  generatedImageUrls,
  onConceptSelect,
  isConceptSelected,
  generatedVideoUrl,
  isGeneratingVideo,
  onsenDescription,
  showConfirmation,
  onConfirm,
  onReject,
  userPreferences
}) => {
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
    // Priority 1: Show image generation loading
    if (isGeneratingImage) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-white animate-pulse">
            <div className="text-2xl">Crafting your onsen...</div>
            <div className="text-lg text-cyan-200 mt-2">Please wait a moment.</div>
        </div>
      );
    }

    // Priority 2: Show video generation loading with description
    if (isGeneratingVideo) {
      return (
        <div className="w-full h-full flex flex-col text-white overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-2xl text-cyan-200 border-b-2 border-cyan-400/50 pb-2 mb-3 animate-pulse">
              Creating Your Experience...
            </h2>
            {onsenDescription ? (
              <div className="text-base text-white/90 leading-relaxed space-y-3 animate-fadeIn">
                {onsenDescription.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-justify">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <div className="text-lg text-cyan-200 animate-pulse">
                Preparing your personalized onsen sanctuary...
              </div>
            )}
          </div>
        </div>
      );
    }

    // Priority 3: Show image selection
    if (generatedImageUrls && generatedImageUrls.length > 0 && !isConceptSelected) {
        return (
          <div className="w-full h-full flex flex-col min-h-0">
            <div className="flex-grow w-full flex flex-col gap-3 min-h-0">
              {generatedImageUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => onConceptSelect(url)}
                  className="relative w-full flex-1 min-h-0 overflow-hidden rounded-lg group focus:outline-none focus:ring-4 focus:ring-cyan-400/80 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 hover:ring-2 hover:ring-cyan-400/50"
                  aria-label={`Select onsen concept variation ${index + 1}`}
                >
                  <img
                    src={url}
                    alt={`Onsen concept variation ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
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

    // Priority 4: Show confirmation buttons if waiting for user decision
    if (showConfirmation && userPreferences) {
      return (
        <div className="w-full h-full flex flex-col text-white overflow-y-auto">
          {/* User Profile Display */}
          <div className="mb-4">
            <h2 className="text-2xl text-cyan-200 border-b-2 border-cyan-400/50 pb-2 mb-3">
              Your Onsen Profile
            </h2>

            {/* Well-being Profile */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-cyan-300 mb-2">Well-being Profile</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-cyan-200">Skin Type:</span> {userPreferences.wellbeingProfile.skinType}</p>
                <p><span className="text-cyan-200">Muscle Soreness:</span> {userPreferences.wellbeingProfile.muscleSoreness}</p>
                <p><span className="text-cyan-200">Stress Level:</span> {userPreferences.wellbeingProfile.stressLevel}</p>
                <p><span className="text-cyan-200">Water Temperature:</span> {userPreferences.wellbeingProfile.waterTemperature}</p>
                <p><span className="text-cyan-200">Health Goals:</span> {userPreferences.wellbeingProfile.healthGoals}</p>
              </div>
            </div>

            {/* Aesthetic Profile */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-cyan-300 mb-2">Aesthetic Profile</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-cyan-200">Atmosphere:</span> {userPreferences.aestheticProfile.atmosphere}</p>
                <p><span className="text-cyan-200">Color Palette:</span> {userPreferences.aestheticProfile.colorPalette}</p>
                <p><span className="text-cyan-200">Time of Day:</span> {userPreferences.aestheticProfile.timeOfDay}</p>
              </div>
            </div>
          </div>

          {/* Confirmation Buttons */}
          <div className="mt-auto">
            <ConfirmationButtons onConfirm={onConfirm} onReject={onReject} />
          </div>
        </div>
      );
    }

    // Priority 5: Show session info (default state)
    return (
      <>
        <div>
          <h2 className="text-3xl text-cyan-200 border-b-2 border-cyan-400/50 pb-2">SESSION INFO</h2>
          <p className="text-lg text-white/80 mt-2 italic">
            {generatedVideoUrl
              ? "Your unique onsen experience is ready. Enjoy the moment."
              : isConceptSelected
              ? "Finalizing your onsen experience..."
              : "Your onsen profile will appear here once created."
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
    <div className="bg-slate-900/30 backdrop-blur-sm rounded-lg border-2 border-cyan-400/50 shadow-2xl shadow-cyan-400/20 p-6 flex flex-col text-white h-full transition-all duration-500">
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