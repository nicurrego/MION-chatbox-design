import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { SupportedLanguage } from '../contexts/LanguageContext';

interface MenuButtonProps {
  onDownload: () => void;
  onReturnToLanguage: () => void;
  onClose: () => void;
  hasVideoGenerated: boolean;
}

// Translations for MenuButton
const translations: Record<SupportedLanguage, {
  openMenu: string;
  download: string;
  changeLanguage: string;
  close: string;
}> = {
  en: {
    openMenu: 'Open menu',
    download: 'Download',
    changeLanguage: 'Change language',
    close: 'Close',
  },
  es: {
    openMenu: 'Abrir menú',
    download: 'Descargar',
    changeLanguage: 'Cambiar idioma',
    close: 'Cerrar',
  },
  ja: {
    openMenu: 'メニューを開く',
    download: 'ダウンロード',
    changeLanguage: '言語を変更',
    close: '閉じる',
  },
  ko: {
    openMenu: '메뉴 열기',
    download: '다운로드',
    changeLanguage: '언어 변경',
    close: '닫기',
  },
  zh: {
    openMenu: '打开菜单',
    download: '下载',
    changeLanguage: '更改语言',
    close: '关闭',
  },
};

// Hamburger Menu Icon
const HamburgerIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-7 w-7"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const MenuButton: React.FC<MenuButtonProps> = ({ onDownload, onReturnToLanguage, onClose, hasVideoGenerated }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { selectedLanguage } = useLanguage();
  const t = translations[selectedLanguage || 'en'];

  const handleDownload = () => {
    onDownload();
    setIsMenuOpen(false);
  };

  const handleReturnToLanguage = () => {
    onReturnToLanguage();
    setIsMenuOpen(false);
  };

  const handleClose = () => {
    onClose();
    setIsMenuOpen(false);
  };

  // Only render if video has been generated
  if (!hasVideoGenerated) {
    return null;
  }

  return (
    <div className="relative">
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="bg-black/50 text-white/70 p-3 sm:p-3 rounded-full hover:bg-white hover:text-black transition-colors duration-300 min-w-[48px] min-h-[48px] flex items-center justify-center active:scale-95"
        aria-label={t.openMenu}
      >
        <HamburgerIcon />
      </button>

      {/* Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute bottom-full mb-2 right-0 bg-slate-900/95 backdrop-blur-sm border-2 border-cyan-400/50 rounded-lg shadow-2xl shadow-cyan-400/20 overflow-hidden z-50 min-w-[200px] sm:min-w-[250px]">
          {/* Menu Items */}
          <button
            onClick={handleDownload}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left text-white hover:bg-cyan-500/20 transition-colors duration-200 border-b border-cyan-400/30 flex items-center gap-2"
            aria-label={t.download}
          >
            <span className="text-lg">⬇️</span>
            <span>{t.download}</span>
          </button>

          <button
            onClick={handleReturnToLanguage}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left text-white hover:bg-cyan-500/20 transition-colors duration-200 border-b border-cyan-400/30 flex items-center gap-2"
            aria-label={t.changeLanguage}
          >
            <span className="text-lg">🌐</span>
            <span>{t.changeLanguage}</span>
          </button>

          <button
            onClick={handleClose}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left text-white hover:bg-cyan-500/20 transition-colors duration-200 flex items-center gap-2"
            aria-label={t.close}
          >
            <span className="text-lg">✕</span>
            <span>{t.close}</span>
          </button>
        </div>
      )}

      {/* Overlay to close menu when clicking outside */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default MenuButton;

