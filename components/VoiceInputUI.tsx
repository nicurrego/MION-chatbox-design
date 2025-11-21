
import React, { useState, useEffect, useRef } from 'react';
import { Translation } from '../utils/localization';

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
  t: Translation;
}

const VoiceInputUI: React.FC<VoiceInputUIProps> = ({ transcript, isRecording, onSend, onCancel, t }) => {
  const [editedTranscript, setEditedTranscript] = useState(transcript);
  const [isEditing, setIsEditing] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditing) {
        setEditedTranscript(transcript);
    }
  }, [transcript, isEditing]);

  useEffect(() => {
    if (isEditing && textAreaRef.current) {
        textAreaRef.current.focus();
        textAreaRef.current.setSelectionRange(textAreaRef.current.value.length, textAreaRef.current.value.length);
    }
  }, [isEditing]);

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
    <div className="fixed inset-x-0 bottom-0 z-40 p-4 flex justify-center items-end animate-slideUp">
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
      <div className="relative w-full max-w-2xl bg-slate-900/90 backdrop-blur-md rounded-lg border-2 border-cyan-400/50 shadow-2xl shadow-cyan-400/20 p-4 flex items-center space-x-4">
        {isRecording && (
          <div className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white pulse-ring-animation"></div>
        )}
        <div className="flex-grow text-white text-xl" onClick={handleTextClick}>
            {isEditing ? (
                <textarea
                    ref={textAreaRef}
                    value={editedTranscript}
                    onChange={(e) => setEditedTranscript(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-slate-800/50 border-0 focus:ring-1 focus:ring-cyan-400 rounded-md p-2 resize-none"
                    rows={3}
                />
            ) : (
                <p className="min-h-[4rem] p-2 cursor-text rounded-md hover:bg-white/10 transition-colors">
                    {editedTranscript || <span className="text-white/50">{isRecording ? t.voice_listening : t.voice_hint}</span>}
                </p>
            )}
        </div>
        <button
            onClick={handleSend}
            disabled={!editedTranscript.trim()}
            className="bg-cyan-600 text-white p-3 rounded-full hover:bg-cyan-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed self-end"
            aria-label="Send message"
        >
            <SendIcon />
        </button>
        <button
            onClick={onCancel}
            className="absolute -top-3 -right-3 bg-slate-800 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors duration-300"
            aria-label="Cancel voice input"
        >
            <CloseIcon />
        </button>
      </div>
    </div>
  );
};

export default VoiceInputUI;
