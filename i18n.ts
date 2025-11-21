import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslation from './locales/en/translation.json';
import jaTranslation from './locales/ja/translation.json';
import esTranslation from './locales/es/translation.json';
import zhTranslation from './locales/zh/translation.json';

// Initialize i18next
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Translation resources
    resources: {
      en: { translation: enTranslation },
      ja: { translation: jaTranslation },
      es: { translation: esTranslation },
      zh: { translation: zhTranslation },
    },
    
    // Fallback language if translation is missing
    fallbackLng: 'en',
    
    // Default language
    lng: 'en',
    
    // Language detection options
    detection: {
      // Order of language detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      // Cache user language preference
      caches: ['localStorage'],
      
      // LocalStorage key name
      lookupLocalStorage: 'mion-language',
    },
    
    // Interpolation options
    interpolation: {
      // React already escapes values
      escapeValue: false,
    },
    
    // Debug mode (set to false in production)
    debug: false,
  });

export default i18n;

