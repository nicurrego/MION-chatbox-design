import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SupportedLanguage = 'es' | 'en' | 'ko' | 'ja' | 'zh';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  geminiVoice: string;
  geminiLanguageCode: string;
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    geminiVoice: 'Kore',
    geminiLanguageCode: 'es-ES',
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    geminiVoice: 'Kore',
    geminiLanguageCode: 'en-US',
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    geminiVoice: 'Kore',
    geminiLanguageCode: 'ko-KR',
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    geminiVoice: 'Kore',
    geminiLanguageCode: 'ja-JP',
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    geminiVoice: 'Kore',
    geminiLanguageCode: 'zh-CN',
  },
};

interface LanguageContextType {
  selectedLanguage: SupportedLanguage | null;
  languageConfig: LanguageConfig | null;
  setLanguage: (lang: SupportedLanguage) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage | null>(null);

  const setLanguage = (lang: SupportedLanguage) => {
    setSelectedLanguage(lang);
  };

  const languageConfig = selectedLanguage ? SUPPORTED_LANGUAGES[selectedLanguage] : null;

  return (
    <LanguageContext.Provider value={{ selectedLanguage, languageConfig, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

