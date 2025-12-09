
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { parseMarkdown } from '../utils/markdownParser';
import ConfirmationButtons from './ConfirmationButtons';

interface ChatBoxProps {
  characterName: string;
  history: ChatMessage[];
  currentBotMessage: string;
  isTyping: boolean;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onClose: () => void;
  showConfirmation: boolean;
  onConfirm: () => void;
  onReject: () => void;
  generatedImageUrls?: string[] | null;
  onConceptSelect?: (url: string) => void;
  isConceptSelected?: boolean;
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

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);


const ChatBox: React.FC<ChatBoxProps> = ({
    characterName, history, currentBotMessage, isTyping, isLoading, onSendMessage,
    isMuted, onToggleMute, onClose,
    showConfirmation, onConfirm, onReject,
    generatedImageUrls, onConceptSelect, isConceptSelected
}) => {
  const [inputValue, setInputValue] = useState('');
  const messageAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageAreaRef.current) {
        messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [history, currentBotMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading && !isTyping) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-2 sm:p-4"
        onClick={onClose}
    >
       <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            .animate-slideUp { animation: slideUp 0.3s ease-out; }
        `}</style>
      <div
        className="w-full sm:w-11/12 max-w-4xl h-full sm:h-4/5 flex flex-col bg-slate-900/90 rounded-lg border-2 border-cyan-400/50 shadow-2xl shadow-cyan-400/20 overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-3 sm:px-6 pt-2 sm:pt-3 pb-2 sm:pb-3 flex justify-between items-center border-b-2 border-cyan-400/50">
          <div className="bg-cyan-600/90 inline-block px-3 sm:px-4 py-1 text-xl sm:text-2xl text-white rounded-t-md border-t-2 border-l-2 border-r-2 border-cyan-300/60">
            {characterName}
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mute Button */}
              <div className="relative group">
                  <button
                      onClick={onToggleMute}
                      className="text-white/70 hover:text-white transition-colors duration-300 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                      <SoundIcon isMuted={isMuted} />
                  </button>
                  <div className="absolute top-full mt-2 right-1/2 translate-x-1/2 w-max bg-black/80 text-white text-xs sm:text-sm rounded-md px-2 py-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                    {isMuted ? 'Unmute' : 'Mute'}
                  </div>
              </div>

              {/* Close Button */}
              <div className="relative group">
                <button
                  onClick={onClose}
                  className="text-white/70 hover:text-white transition-colors duration-300 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
                  aria-label="Close chat"
                >
                  <CloseIcon />
                </button>
                <div className="absolute top-full mt-2 right-1/2 translate-x-1/2 w-max bg-black/80 text-white text-xs sm:text-sm rounded-md px-2 py-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                  Close chat
                </div>
              </div>
          </div>
        </div>
        <div ref={messageAreaRef} className="flex-grow p-3 sm:p-6 text-white text-xl sm:text-2xl md:text-3xl tracking-wide leading-relaxed overflow-y-auto flex flex-col space-y-3 sm:space-y-4">
          {/* Render completed messages */}
          {history.map((msg, index) => (
              <div
                  key={`hist-${index}`}
                  className={`w-full flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                  <div className={`px-3 sm:px-4 py-2 rounded-xl max-w-[90%] sm:max-w-[85%] ${msg.sender === 'user' ? 'bg-slate-700' : 'bg-cyan-900/80'}`}>
                      {msg.sender === 'user' ? msg.text : parseMarkdown(msg.text)}
                  </div>
              </div>
          ))}
          {/* Render the bot message that is currently being typed in the main screen */}
          {currentBotMessage && isTyping && (
              <div className="w-full flex justify-start">
                  <div className="px-3 sm:px-4 py-2 rounded-xl max-w-[90%] sm:max-w-[85%] bg-cyan-900/80">
                      {parseMarkdown(currentBotMessage)}
                      <TypingIndicator />
                  </div>
              </div>
          )}
          {/* Render a placeholder while the bot is "thinking" */}
          {isLoading && !isTyping && (
              <div className="w-full flex justify-start">
                  <p className="px-3 sm:px-4 py-2 rounded-xl bg-cyan-900/80 animate-pulse">
                      ...
                  </p>
              </div>
          )}
          {/* Show confirmation buttons after summary */}
          {showConfirmation && !isTyping && !isLoading && (
              <div className="w-full flex justify-center">
                  <ConfirmationButtons onConfirm={onConfirm} onReject={onReject} />
              </div>
          )}

          {/* Show image selection if images are available */}
          {generatedImageUrls && generatedImageUrls.length > 0 && !isConceptSelected && !isTyping && !isLoading && (
              <div className="w-full flex flex-col items-start">
                  <div className="px-3 sm:px-4 py-2 rounded-xl bg-cyan-900/80 max-w-[90%] sm:max-w-[85%] mb-3">
                      <p className="text-base sm:text-lg mb-2">I've created two onsen concepts for you! Which one speaks to your soul?</p>
                      <p className="text-sm opacity-70">Tap a button below to select your favorite:</p>
                  </div>

                  {/* Image Grid */}
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3">
                      {generatedImageUrls.map((url, index) => (
                          <div key={index} className="flex flex-col gap-2">
                              <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-cyan-400/30">
                                  <img
                                      src={url}
                                      alt={`Onsen concept ${index + 1}`}
                                      className="w-full h-full object-cover"
                                  />
                                  <div className="absolute top-2 left-2 bg-black/70 text-white text-sm font-bold px-2 py-1 rounded">
                                      Concept {index + 1}
                                  </div>
                              </div>
                              <button
                                  onClick={() => {
                                      if (onConceptSelect) {
                                          onConceptSelect(url);
                                      }
                                  }}
                                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:from-cyan-700 active:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 min-h-[48px] flex items-center justify-center gap-2"
                              >
                                  <span className="text-2xl">{index + 1}</span>
                                  <span className="text-base">Select Concept {index + 1}</span>
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="bg-black/30 p-2 sm:p-3 flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isLoading ? "Mion is thinking..." : (isTyping ? "..." : "Type your message here...")}
            disabled={isLoading || isTyping}
            className="flex-1 bg-transparent text-white text-lg sm:text-xl md:text-2xl placeholder-cyan-300/70 border-0 focus:ring-0 px-3 sm:px-4 py-2 sm:py-3"
            autoComplete="off"
            autoFocus
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || isTyping}
            className="bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-full p-3 min-w-[48px] min-h-[48px] flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
