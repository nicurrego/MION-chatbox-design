import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { SupportedLanguage } from '../contexts/LanguageContext';

interface ConfirmationButtonsProps {
  onConfirm: () => void;
  onReject: () => void;
  compact?: boolean; // For InfoBox widgets row
  mobile?: boolean; // For mobile InfoBox guidance text
}

// Translations for confirmation buttons
const translations: Record<SupportedLanguage, {
  confirmCreate: string;
  confirmYes: string;
  rejectChange: string;
  rejectNo: string;
}> = {
  en: {
    confirmCreate: '✓ Create',
    confirmYes: '✓ Yes, create my onsen',
    rejectChange: '✗ Change',
    rejectNo: '✗ No, I want to change something',
  },
  es: {
    confirmCreate: '✓ Crear',
    confirmYes: '✓ Sí, crear mi onsen',
    rejectChange: '✗ Cambiar',
    rejectNo: '✗ No, quiero cambiar algo',
  },
  ja: {
    confirmCreate: '✓ 作成',
    confirmYes: '✓ はい、温泉を作成してください',
    rejectChange: '✗ 変更',
    rejectNo: '✗ いいえ、何か変更したいです',
  },
  ko: {
    confirmCreate: '✓ 생성',
    confirmYes: '✓ 네, 온천을 만들어주세요',
    rejectChange: '✗ 변경',
    rejectNo: '✗ 아니요, 뭔가 바꾸고 싶습니다',
  },
  zh: {
    confirmCreate: '✓ 创建',
    confirmYes: '✓ 是的，创建我的温泉',
    rejectChange: '✗ 更改',
    rejectNo: '✗ 不，我想改变一些东西',
  },
};

const ConfirmationButtons: React.FC<ConfirmationButtonsProps> = ({ onConfirm, onReject, compact = false, mobile = false }) => {
  const { selectedLanguage } = useLanguage();
  const t = translations[selectedLanguage || 'en'];
  if (mobile) {
    // Mobile version for InfoBox guidance text (very compact)
    return (
      <div className="flex gap-1.5 items-center justify-center animate-fadeIn w-full">
        <button
          onClick={onConfirm}
          className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50 whitespace-nowrap"
        >
          {t.confirmCreate}
        </button>
        <button
          onClick={onReject}
          className="px-2.5 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs font-bold rounded transition-all duration-300 transform hover:scale-105 shadow-lg whitespace-nowrap"
        >
          {t.rejectChange}
        </button>
      </div>
    );
  }

  if (compact) {
    // Compact version for InfoBox widgets row
    return (
      <div className="flex gap-2 items-center animate-fadeIn">
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50"
        >
          {t.confirmCreate}
        </button>
        <button
          onClick={onReject}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          {t.rejectChange}
        </button>
      </div>
    );
  }

  // Full version for ChatBox
  return (
    <div className="flex gap-4 justify-center items-center py-4 animate-fadeIn">
      <button
        onClick={onConfirm}
        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50"
      >
        {t.confirmYes}
      </button>
      <button
        onClick={onReject}
        className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        {t.rejectNo}
      </button>
    </div>
  );
};

export default ConfirmationButtons;

