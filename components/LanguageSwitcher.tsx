import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Language Icon
const LanguageIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
  </svg>
);

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (langCode: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from bubbling to parent
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from bubbling to parent
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Language Button */}
      <button
        onClick={toggleDropdown}
        className="bg-black/50 text-white/70 p-3 rounded-full hover:bg-white hover:text-black transition-colors duration-300 flex items-center space-x-2"
        aria-label="Change language"
      >
        <LanguageIcon />
        <span className="text-2xl">{currentLanguage.flag}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
          />

          {/* Language Options - Centered */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 backdrop-blur-md rounded-lg border-2 border-cyan-400/50 shadow-2xl shadow-cyan-400/20 overflow-hidden z-50 min-w-[250px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={(e) => handleLanguageChange(lang.code, e)}
                className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors duration-200 ${
                  i18n.language === lang.code
                    ? 'bg-cyan-600/80 text-white'
                    : 'text-white/80 hover:bg-cyan-600/40 hover:text-white'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-lg">{lang.name}</span>
                {i18n.language === lang.code && (
                  <span className="ml-auto text-cyan-200">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;

