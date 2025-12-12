import React from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../contexts/LanguageContext';

interface LanguageSelectionScreenProps {
  onLanguageSelect: (lang: SupportedLanguage) => void;
}

const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({ onLanguageSelect }) => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="text-center w-full max-w-3xl my-auto">
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-3 md:mb-4 tracking-wide">
          MION
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 md:mb-10 lg:mb-12 px-2">
          Select Your Language / Seleccione su idioma
        </p>

        {/* Language Options - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 max-w-2xl mx-auto px-2">
          {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageSelect(lang.code)}
              className="group relative bg-gradient-to-br from-gray-800 to-gray-900 hover:from-blue-600 hover:to-purple-600 active:from-blue-700 active:to-purple-700 text-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-2xl border border-gray-700 hover:border-transparent min-h-[70px] sm:min-h-[80px] md:min-h-[90px] flex flex-col items-center justify-center"
            >
              <div className="flex flex-col items-center justify-center space-y-0.5 sm:space-y-1 md:space-y-2 w-full">
                <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                  {lang.nativeName}
                </span>
                <span className="text-xs sm:text-xs md:text-sm lg:text-base text-gray-400 group-hover:text-gray-200 leading-tight">
                  {lang.name}
                </span>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/10 group-hover:to-purple-400/10 transition-all duration-300"></div>
            </button>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8 md:mt-10 lg:mt-12 px-2">
          MION will speak and respond in your selected language
        </p>
      </div>
    </div>
  );
};

export default LanguageSelectionScreen;

