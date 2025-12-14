import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { SupportedLanguage } from '../contexts/LanguageContext';

// Icons
const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);


interface VoiceInputUIProps {
  transcript: string;
  isRecording: boolean;
  onSend: (message: string) => void;
  onCancel: () => void;
  onTranscriptChange?: (transcript: string) => void;
}

// Translations for VoiceInputUI
const translations: Record<SupportedLanguage, {
  listening: string;
  pressCtrlToRecord: string;
}> = {
  en: {
    listening: 'Listening...',
    pressCtrlToRecord: 'Press Ctrl to record, or type here...',
  },
  es: {
    listening: 'Escuchando...',
    pressCtrlToRecord: 'Presiona Ctrl para grabar, o escribe aquí...',
  },
  ja: {
    listening: '聞いています...',
    pressCtrlToRecord: 'Ctrlキーを押して録音するか、ここに入力してください...',
  },
  ko: {
    listening: '듣는 중...',
    pressCtrlToRecord: 'Ctrl을 눌러 녹음하거나 여기에 입력하세요...',
  },
  zh: {
    listening: '正在听...',
    pressCtrlToRecord: '按 Ctrl 录音，或在此输入...',
  },
};

const VoiceInputUI: React.FC<VoiceInputUIProps> = ({ transcript, isRecording, onSend, onCancel, onTranscriptChange }) => {
  const [editedTranscript, setEditedTranscript] = useState(transcript);
  const [isEditing, setIsEditing] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedLanguage } = useLanguage();
  const t = translations[selectedLanguage || 'en'];

  useEffect(() => {
    // Always update the edited transcript when the transcript prop changes
    setEditedTranscript(transcript);
  }, [transcript]);

  useEffect(() => {
    if (textAreaRef.current) {
        textAreaRef.current.focus();
        // Move cursor to the end
        textAreaRef.current.setSelectionRange(textAreaRef.current.value.length, textAreaRef.current.value.length);
    }
  }, [editedTranscript]);

  const handleSend = () => {
    if (editedTranscript.trim()) {
      onSend(editedTranscript);
    }
  };

  const handleTextClick = () => {
      setIsEditing(true);
  }

  const handleBlur = () => {
      setIsEditing(false);
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setEditedTranscript(newValue);
    if (onTranscriptChange) {
      onTranscriptChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
      }
      if(e.key === 'Escape') {
          e.preventDefault();
          setIsEditing(false);
          onCancel();
      }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-2 sm:p-4 pb-[80px] sm:pb-[60px] landscape:pb-safe flex justify-center items-end animate-slideUp">
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(255, 82, 82, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 82, 82, 0); }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
        .pulse-ring-animation {
            animation: pulse-ring 2s infinite;
        }
      `}</style>
      <div className="relative w-full max-w-2xl bg-slate-900/95 backdrop-blur-md rounded-lg border-2 border-cyan-400/50 shadow-2xl shadow-cyan-400/20 p-3 sm:p-4 flex items-center space-x-2 sm:space-x-4">
        {isRecording && (
          <div className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white pulse-ring-animation"></div>
        )}
        <div className="flex-grow text-white text-base sm:text-lg md:text-xl">
            <textarea
                ref={textAreaRef}
                value={editedTranscript}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={isRecording ? t.listening : t.pressCtrlToRecord}
                className="w-full bg-slate-800/50 border-0 focus:ring-1 focus:ring-cyan-400 rounded-md p-2 sm:p-3 resize-none text-white placeholder-white/50 text-base sm:text-lg"
                rows={3}
            />
        </div>
        <button
            onClick={handleSend}
            disabled={!editedTranscript.trim()}
            className="bg-cyan-600 text-white p-3 sm:p-3 rounded-full hover:bg-cyan-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed self-end min-w-[48px] min-h-[48px] flex items-center justify-center active:scale-95"
            aria-label="Send message"
        >
            <SendIcon />
        </button>
        <button
            onClick={onCancel}
            className="absolute -top-3 -right-3 bg-slate-800 text-white p-2 rounded-full hover:bg-red-500 transition-colors duration-300 min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-95"
            aria-label="Cancel voice input"
        >
            <CloseIcon />
        </button>
      </div>
    </div>
  );
};

export default VoiceInputUI;