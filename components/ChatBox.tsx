import React, { useState, useEffect } from 'react';

interface ChatBoxProps {
  characterName: string;
  message: string;
  isTyping: boolean;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  isMuted: boolean; // Now controls autoplay
  onToggleMute: () => void;
  onReadAloud: () => void;
  onStopAudio: () => void;
  isAudioPlaying: boolean;
  canReadAloud: boolean;
}

const TypingIndicator: React.FC = () => (
  <span className="inline-block w-2 h-6 ml-1 bg-white animate-ping"></span>
);

// --- Icon Components ---

const SoundIcon: React.FC<{ isMuted: boolean }> = ({ isMuted }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {isMuted ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    )}
  </svg>
);

const PlayIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const StopIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
    </svg>
);


const ChatBox: React.FC<ChatBoxProps> = ({ 
    characterName, message, isTyping, isLoading, onSendMessage, 
    isMuted, onToggleMute, onReadAloud, onStopAudio, isAudioPlaying, canReadAloud 
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="w-full bg-slate-900/80 backdrop-blur-sm rounded-lg border-2 border-cyan-400/50 shadow-2xl shadow-cyan-400/20 overflow-hidden">
      <div className="px-6 pt-3 flex justify-between items-end">
        <div className="bg-cyan-600/90 inline-block px-4 py-1 text-2xl text-white rounded-t-md border-t-2 border-l-2 border-r-2 border-cyan-300/60">
          {characterName}
        </div>
        <div className="flex items-center space-x-2 mb-1">
            {isAudioPlaying ? (
                 <button
                    onClick={onStopAudio}
                    className="text-white/70 hover:text-white transition-colors duration-300 p-1"
                    aria-label="Stop audio"
                >
                    <StopIcon />
                </button>
            ) : (
                <button
                    onClick={onReadAloud}
                    disabled={!canReadAloud}
                    className="text-white/70 hover:text-white transition-colors duration-300 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Read message aloud"
                >
                    <PlayIcon />
                </button>
            )}

            <button
                onClick={onToggleMute}
                className="text-white/70 hover:text-white transition-colors duration-300 p-1"
                aria-label={isMuted ? 'Enable autoplay' : 'Disable autoplay'}
            >
                <SoundIcon isMuted={isMuted} />
            </button>
        </div>
      </div>
      <div className="p-6 pt-4 text-white text-3xl min-h-[120px] md:min-h-[140px] tracking-wide leading-relaxed">
        <p>
          {message}
          {isTyping && <TypingIndicator />}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="bg-black/30 p-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isLoading ? "Mion is thinking..." : "Type your message here..."}
          disabled={isLoading || isTyping}
          className="w-full bg-transparent text-white text-2xl placeholder-cyan-300/70 border-0 focus:ring-0 px-4 py-2"
          autoComplete="off"
        />
      </form>
    </div>
  );
};

export default ChatBox;