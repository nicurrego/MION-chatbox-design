
import React from 'react';
<<<<<<< HEAD
import { Translation } from '../utils/localization';
=======
import MenuButton from './MenuButton';
import { useLanguage } from '../contexts/LanguageContext';
import type { SupportedLanguage } from '../contexts/LanguageContext';
>>>>>>> hot

// --- Icon Components ---

const SoundIcon: React.FC<{ isMuted: boolean }> = ({ isMuted }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {isMuted ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      )}
    </svg>
  );

const SubtitlesIcon: React.FC<{ isVisible: boolean }> = ({ isVisible }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8m-8 3h4" />
        {!isVisible && <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l16 16" />}
    </svg>
);

// Translations for ActionButtons
const translations: Record<SupportedLanguage, {
  hideSubtitles: string;
  showSubtitles: string;
  mute: string;
  unmute: string;
  stopRecording: string;
  voiceInput: string;
}> = {
  en: {
    hideSubtitles: 'Hide subtitles',
    showSubtitles: 'Show subtitles',
    mute: 'Mute',
    unmute: 'Unmute',
    stopRecording: 'Stop recording (Ctrl)',
    voiceInput: 'Voice input (Ctrl)',
  },
  es: {
    hideSubtitles: 'Ocultar subtítulos',
    showSubtitles: 'Mostrar subtítulos',
    mute: 'Silenciar',
    unmute: 'Activar sonido',
    stopRecording: 'Detener grabación (Ctrl)',
    voiceInput: 'Entrada de voz (Ctrl)',
  },
  ja: {
    hideSubtitles: '字幕を非表示',
    showSubtitles: '字幕を表示',
    mute: 'ミュート',
    unmute: 'ミュート解除',
    stopRecording: '録音を停止 (Ctrl)',
    voiceInput: '音声入力 (Ctrl)',
  },
  ko: {
    hideSubtitles: '자막 숨기기',
    showSubtitles: '자막 표시',
    mute: '음소거',
    unmute: '음소거 해제',
    stopRecording: '녹음 중지 (Ctrl)',
    voiceInput: '음성 입력 (Ctrl)',
  },
  zh: {
    hideSubtitles: '隐藏字幕',
    showSubtitles: '显示字幕',
    mute: '静音',
    unmute: '取消静音',
    stopRecording: '停止录音 (Ctrl)',
    voiceInput: '语音输入 (Ctrl)',
  },
};

const MicrophoneIcon: React.FC<{ isRecording: boolean }> = ({ isRecording }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-7 w-7" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        {isRecording ? (
            /* Option A: When recording, show a "Stop" square (Standard UI pattern) */
            <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" 
            />
        ) : (
            /* Option B: Standard Microphone Icon */
            <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
            />
        )}
    </svg>
);


interface ActionButtonsProps {
    onToggleChat: () => void;
    isMuted: boolean;
    onToggleMute: () => void;
    areSubtitlesVisible: boolean;
    onToggleSubtitles: () => void;
<<<<<<< HEAD
    t: Translation;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onToggleChat, isMuted, onToggleMute, onStartVoiceInput, areSubtitlesVisible, onToggleSubtitles, t }) => {
=======
    onStartVoiceInput: () => void;
    isVoiceRecording: boolean;
    onDownload?: () => void;
    onReturnToLanguage?: () => void;
    onCloseMenu?: () => void;
    hasVideoGenerated?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
    onToggleChat,
    isMuted,
    onToggleMute,
    areSubtitlesVisible,
    onToggleSubtitles,
    onStartVoiceInput,
    isVoiceRecording,
    onDownload = () => {},
    onReturnToLanguage = () => {},
    onCloseMenu = () => {},
    hasVideoGenerated = false
}) => {
    const { selectedLanguage } = useLanguage();
    const t = translations[selectedLanguage || 'en'];

>>>>>>> hot
    return (
        <div className="flex items-center justify-end space-x-2 sm:space-x-3 z-30">
            {/* Subtitles Button */}
            <div className="relative group">
                <button
                    onClick={onToggleSubtitles}
<<<<<<< HEAD
                    className="bg-black/50 text-white/70 p-3 rounded-full hover:bg-white hover:text-black transition-colors duration-300"
                    aria-label={areSubtitlesVisible ? t.btn_subtitles_hide : t.btn_subtitles_show}
                >
                    <SubtitlesIcon isVisible={areSubtitlesVisible} />
                </button>
                <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-max bg-black/80 text-white text-sm rounded-md px-2 py-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                    {areSubtitlesVisible ? t.btn_subtitles_hide : t.btn_subtitles_show}
=======
                    className="bg-black/50 text-white/70 p-3 sm:p-3 rounded-full hover:bg-white hover:text-black transition-colors duration-300 min-w-[48px] min-h-[48px] flex items-center justify-center active:scale-95"
                    aria-label={areSubtitlesVisible ? t.hideSubtitles : t.showSubtitles}
                >
                    <SubtitlesIcon isVisible={areSubtitlesVisible} />
                </button>
                <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-max bg-black/80 text-white text-xs sm:text-sm rounded-md px-2 py-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                    {areSubtitlesVisible ? 'Hide subtitles' : 'Show subtitles'}
>>>>>>> hot
                </div>
            </div>
            {/* Mute Button */}
            <div className="relative group">
                <button
                    onClick={onToggleMute}
<<<<<<< HEAD
                    className="bg-black/50 text-white/70 p-3 rounded-full hover:bg-white hover:text-black transition-colors duration-300"
                    aria-label={isMuted ? t.btn_unmute : t.btn_mute}
                >
                    <SoundIcon isMuted={isMuted} />
                </button>
                <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-max bg-black/80 text-white text-sm rounded-md px-2 py-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                    {isMuted ? t.btn_unmute : t.btn_mute}
=======
                    className="bg-black/50 text-white/70 p-3 sm:p-3 rounded-full hover:bg-white hover:text-black transition-colors duration-300 min-w-[48px] min-h-[48px] flex items-center justify-center active:scale-95"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                    <SoundIcon isMuted={isMuted} />
                </button>
                <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-max bg-black/80 text-white text-xs sm:text-sm rounded-md px-2 py-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                    {isMuted ? t.unmute : t.mute}
>>>>>>> hot
                </div>
            </div>
            {/* Voice Input Button */}
            <div className="relative group">
                <button
                    onClick={onStartVoiceInput}
<<<<<<< HEAD
                    className="bg-black/50 text-white/70 p-3 rounded-full hover:bg-white hover:text-black transition-colors duration-300"
                    aria-label={t.btn_voice}
=======
                    className={`p-3 sm:p-3 rounded-full transition-colors duration-300 min-w-[48px] min-h-[48px] flex items-center justify-center active:scale-95 ${
                        isVoiceRecording
                            ? 'bg-red-600 text-white hover:bg-red-500 animate-pulse'
                            : 'bg-black/50 text-white/70 hover:bg-white hover:text-black'
                    }`}
                    aria-label={isVoiceRecording ? t.stopRecording : t.voiceInput}
>>>>>>> hot
                >
                    <MicrophoneIcon isRecording={isVoiceRecording} />
                </button>
<<<<<<< HEAD
                <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-max bg-black/80 text-white text-sm rounded-md px-2 py-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                    {t.btn_voice}
=======
                <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-max bg-black/80 text-white text-xs sm:text-sm rounded-md px-2 py-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                    {isVoiceRecording ? t.stopRecording : t.voiceInput}
>>>>>>> hot
                </div>
            </div>
            {/* Menu Button */}
            <MenuButton
                onDownload={onDownload}
                onReturnToLanguage={onReturnToLanguage}
                onClose={onCloseMenu}
                hasVideoGenerated={hasVideoGenerated}
            />

            {/* Chat Button */}
            <button
                onClick={onToggleChat}
                className="bg-black/50 text-white/70 px-5 py-2.5 sm:px-6 sm:py-3 rounded-md text-lg sm:text-xl tracking-wider hover:bg-white hover:text-black transition-colors duration-300 min-h-[48px] flex items-center justify-center active:scale-95"
                aria-label="Open chat"
            >
                {t.btn_chat}
            </button>
        </div>
    );
};

export default ActionButtons;
