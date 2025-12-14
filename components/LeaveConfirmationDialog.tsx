import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { SupportedLanguage } from '../contexts/LanguageContext';

interface LeaveConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const translations: Record<SupportedLanguage, {
  confirmLeave: string;
  unsavedProgress: string;
  loseProgress: string;
  stay: string;
  leave: string;
}> = {
  en: {
    confirmLeave: 'Are you sure you want to leave?',
    unsavedProgress: 'You have unsaved progress in your conversation.',
    loseProgress: 'If you leave now, you will lose your progress.',
    stay: 'Stay',
    leave: 'Leave',
  },
  es: {
    confirmLeave: '¿Estás seguro de que quieres irte?',
    unsavedProgress: 'Tienes progreso sin guardar en tu conversación.',
    loseProgress: 'Si te vas ahora, perderás tu progreso.',
    stay: 'Quedarse',
    leave: 'Irse',
  },
  ko: {
    confirmLeave: '정말 떠나시겠습니까?',
    unsavedProgress: '대화에서 저장되지 않은 진행 상황이 있습니다.',
    loseProgress: '지금 떠나면 진행 상황을 잃게 됩니다.',
    stay: '머물기',
    leave: '떠나기',
  },
  ja: {
    confirmLeave: '本当に離れますか？',
    unsavedProgress: '会話に保存されていない進行状況があります。',
    loseProgress: '今離れると、進行状況を失います。',
    stay: '留まる',
    leave: '離れる',
  },
  zh: {
    confirmLeave: '你确定要离开吗？',
    unsavedProgress: '你的对话中有未保存的进度。',
    loseProgress: '如果你现在离开，你将失去你的进度。',
    stay: '留下',
    leave: '离开',
  },
};

const LeaveConfirmationDialog: React.FC<LeaveConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const { selectedLanguage } = useLanguage();
  const t = translations[selectedLanguage || 'en'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-sm w-full border border-gray-700 animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{t.confirmLeave}</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-3">
          <p className="text-gray-300">{t.unsavedProgress}</p>
          <p className="text-gray-400 text-sm">{t.loseProgress}</p>
        </div>

        {/* Footer - Buttons */}
        <div className="px-6 py-4 border-t border-gray-700 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors duration-200 min-h-[40px] flex items-center justify-center"
            aria-label={t.stay}
          >
            {t.stay}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors duration-200 min-h-[40px] flex items-center justify-center"
            aria-label={t.leave}
          >
            {t.leave}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveConfirmationDialog;

