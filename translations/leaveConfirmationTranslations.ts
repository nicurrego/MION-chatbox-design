import type { SupportedLanguage } from '../contexts/LanguageContext';

/**
 * Translations for the Leave Confirmation Dialog
 * Used when user attempts to leave the application with unsaved progress
 */
export const leaveConfirmationTranslations: Record<SupportedLanguage, {
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

