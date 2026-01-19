import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { SupportedLanguage } from '../contexts/LanguageContext';

interface LoadingOverlayProps {
    message: string;
}

// Translations for LoadingOverlay
const translations: Record<SupportedLanguage, {
  mayTakeMoments: string;
}> = {
  en: {
    mayTakeMoments: 'This may take a few moments...',
  },
  es: {
    mayTakeMoments: 'Esto puede tomar unos momentos...',
  },
  ja: {
    mayTakeMoments: 'これには数分かかる場合があります...',
  },
  ko: {
    mayTakeMoments: '몇 분이 걸릴 수 있습니다...',
  },
  zh: {
    mayTakeMoments: '这可能需要几分钟...',
  },
};

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  const { selectedLanguage } = useLanguage();
  const t = translations[selectedLanguage || 'en'];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white animate-fadeIn">
        <svg className="animate-spin h-12 w-12 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-2xl tracking-wider">{message}</p>
        <p className="text-lg text-cyan-200 mt-2">{t.mayTakeMoments}</p>
    </div>
  );
};

export default LoadingOverlay;

