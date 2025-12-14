import React, { useState } from 'react';

interface MenuButtonProps {
  onDownload: () => void;
  onReturnToLanguage: () => void;
  onClose: () => void;
  hasVideoGenerated: boolean;
}

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
        aria-label="Open menu"
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
            aria-label="Download images and videos"
          >
            <span className="text-lg">⬇️</span>
            <span>Download</span>
          </button>

          <button
            onClick={handleReturnToLanguage}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left text-white hover:bg-cyan-500/20 transition-colors duration-200 border-b border-cyan-400/30 flex items-center gap-2"
            aria-label="Return to language selection"
          >
            <span className="text-lg">🌐</span>
            <span>Language</span>
          </button>

          <button
            onClick={handleClose}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left text-white hover:bg-cyan-500/20 transition-colors duration-200 flex items-center gap-2"
            aria-label="Close menu"
          >
            <span className="text-lg">✕</span>
            <span>Back</span>
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

