import React from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../contexts/LanguageContext';

interface LanguageSelectionScreenProps {
  onLanguageSelect: (lang: SupportedLanguage) => void;
}

const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({ onLanguageSelect }) => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center px-8 max-w-2xl w-full">
        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-wide">
          MION
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12">
          Select Your Language / Seleccione su idioma
        </p>

        {/* Language Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
          {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageSelect(lang.code)}
              className="group relative bg-gradient-to-br from-gray-800 to-gray-900 hover:from-blue-600 hover:to-purple-600 text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-gray-700 hover:border-transparent"
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <span className="text-3xl md:text-4xl font-bold">
                  {lang.nativeName}
                </span>
                <span className="text-sm md:text-base text-gray-400 group-hover:text-gray-200">
                  {lang.name}
                </span>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/10 group-hover:to-purple-400/10 transition-all duration-300"></div>
            </button>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-sm text-gray-500 mt-12">
          MION will speak and respond in your selected language
        </p>
      </div>
    </div>
  );
};

export default LanguageSelectionScreen;

