import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { leaveConfirmationTranslations } from '../translations/leaveConfirmationTranslations';

interface LeaveConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LeaveConfirmationDialog: React.FC<LeaveConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const { selectedLanguage } = useLanguage();
  const t = leaveConfirmationTranslations[selectedLanguage || 'en'];

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

