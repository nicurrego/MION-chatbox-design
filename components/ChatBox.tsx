
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { parseMarkdown } from '../utils/markdownParser';
import ConfirmationButtons from './ConfirmationButtons';
import { useLanguage } from '../contexts/LanguageContext';
import type { SupportedLanguage } from '../contexts/LanguageContext';

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

// Translations for ChatBox UI
const translations: Record<SupportedLanguage, {
  conceptsCreated: string;
  whichSpeaksToYourSoul: string;
  tapButtonBelow: string;
  concept: string;
  selectConcept: string;
  mute: string;
  unmute: string;
  closeChat: string;
  mionIsThinking: string;
  typingPlaceholder: string;
  messageInputPlaceholder: string;
}> = {
  en: {
    conceptsCreated: "I've created two onsen concepts for you! Which one speaks to your soul?",
    whichSpeaksToYourSoul: "Which one speaks to your soul?",
    tapButtonBelow: "Tap a button below to select your favorite:",
    concept: "Concept",
    selectConcept: "Select Concept",
    mute: "Mute",
    unmute: "Unmute",
    closeChat: "Close chat",
    mionIsThinking: "Mion is thinking...",
    typingPlaceholder: "...",
    messageInputPlaceholder: "Type your message here...",
  },
  es: {
    conceptsCreated: "¡He creado dos conceptos de onsen para ti! ¿Cuál te habla al alma?",
    whichSpeaksToYourSoul: "¿Cuál te habla al alma?",
    tapButtonBelow: "Toca un botón a continuación para seleccionar tu favorito:",
    concept: "Concepto",
    selectConcept: "Seleccionar Concepto",
    mute: "Silenciar",
    unmute: "Activar sonido",
    closeChat: "Cerrar chat",
    mionIsThinking: "Mion está pensando...",
    typingPlaceholder: "...",
    messageInputPlaceholder: "Escribe tu mensaje aquí...",
  },
  ja: {
    conceptsCreated: "あなたのために2つの温泉コンセプトを作成しました！どれがあなたの心に響きますか？",
    whichSpeaksToYourSoul: "どれがあなたの心に響きますか？",
    tapButtonBelow: "下のボタンをタップしてお気に入りを選択してください：",
    concept: "コンセプト",
    selectConcept: "コンセプトを選択",
    mute: "ミュート",
    unmute: "ミュート解除",
    closeChat: "チャットを閉じる",
    mionIsThinking: "ミオンが考え中...",
    typingPlaceholder: "...",
    messageInputPlaceholder: "ここにメッセージを入力してください...",
  },
  ko: {
    conceptsCreated: "당신을 위해 두 가지 온천 컨셉을 만들었습니다! 어느 것이 당신의 마음에 와닿나요?",
    whichSpeaksToYourSoul: "어느 것이 당신의 마음에 와닿나요?",
    tapButtonBelow: "아래 버튼을 탭하여 선호하는 것을 선택하세요:",
    concept: "컨셉",
    selectConcept: "컨셉 선택",
    mute: "음소거",
    unmute: "음소거 해제",
    closeChat: "채팅 닫기",
    mionIsThinking: "미온이 생각 중입니다...",
    typingPlaceholder: "...",
    messageInputPlaceholder: "여기에 메시지를 입력하세요...",
  },
  zh: {
    conceptsCreated: "我为您创建了两个温泉概念！哪一个打动了您的心？",
    whichSpeaksToYourSoul: "哪一个打动了您的心？",
    tapButtonBelow: "点击下面的按钮选择您最喜欢的：",
    concept: "概念",
    selectConcept: "选择概念",
    mute: "静音",
    unmute: "取消静音",
    closeChat: "关闭聊天",
    mionIsThinking: "米翁在思考...",
    typingPlaceholder: "...",
    messageInputPlaceholder: "在此输入您的消息...",
  },
};

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
  const { selectedLanguage } = useLanguage();
  const t = translations[selectedLanguage || 'en'];

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
        /* CHANGED:
           1. items-center -> items-end sm:items-center (Fixes header being cut off)
           2. p-0 sm:p-4 -> p-3 sm:p-4 (Adds padding on mobile)
           3. Added portrait:p-3 for portrait mode on mobile
        */
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-3 sm:p-4 portrait:p-3 h-dvh"
        onClick={onClose}
    >
       <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            .animate-slideUp { animation: slideUp 0.3s ease-out; }
        `}</style>
      <div
        /* CHANGED:
           1. rounded-lg -> rounded-t-lg sm:rounded-lg (Looks better attached to bottom)
           2. h-[90vh] sm:h-3/4 md:h-5/6 lg:h-[85vh] (Responsive height: 90% mobile, 75% tablet, 85% desktop)
           3. w-full sm:w-11/12 -> w-full sm:w-11/12 (Responsive width with padding)
           4. max-w-4xl -> max-w-6xl (Larger max width for desktop)
        */
        className="w-full sm:w-11/12 max-w-6xl h-[90vh] sm:h-3/4 md:h-5/6 lg:h-[85vh] flex flex-col bg-slate-900/90 rounded-t-lg sm:rounded-lg border-2 border-cyan-400/50 shadow-2xl shadow-cyan-400/20 overflow-hidden animate-slideUp"
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
                      aria-label={isMuted ? t.unmute : t.mute}
                  >
                      <SoundIcon isMuted={isMuted} />
                  </button>
                  <div className="absolute top-full mt-2 right-1/2 translate-x-1/2 w-max bg-black/80 text-white text-xs sm:text-sm rounded-md px-2 py-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                    {isMuted ? t.unmute : t.mute}
                  </div>
              </div>

              {/* Close Button */}
              <div className="relative group">
                <button
                  onClick={onClose}
                  className="text-white/70 hover:text-white transition-colors duration-300 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
                  aria-label={t.closeChat}
                >
                  <CloseIcon />
                </button>
                <div className="absolute top-full mt-2 right-1/2 translate-x-1/2 w-max bg-black/80 text-white text-xs sm:text-sm rounded-md px-2 py-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                  {t.closeChat}
                </div>
              </div>
          </div>
        </div>
        <div ref={messageAreaRef} className="flex-grow p-3 sm:p-6 lg:p-8 text-white text-lg sm:text-xl md:text-2xl lg:text-2xl tracking-wide leading-relaxed overflow-y-auto flex flex-col space-y-3 sm:space-y-4 lg:space-y-5">
          {/* Render completed messages */}
          {history.map((msg, index) => (
              <div
                  key={`hist-${index}`}
                  className={`w-full flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                  <div className={`px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-3 rounded-xl max-w-[90%] sm:max-w-[85%] lg:max-w-[75%] ${msg.sender === 'user' ? 'bg-slate-700' : 'bg-cyan-900/80'}`}>
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
              <div className="w-full flex flex-col items-start gap-3">
                  <div className="px-3 sm:px-4 py-2 rounded-xl bg-cyan-900/80 max-w-[90%] sm:max-w-[85%]">
                      <p className="text-base sm:text-lg mb-2">{t.conceptsCreated}</p>
                      <p className="text-sm opacity-70">{t.tapButtonBelow}</p>
                  </div>

                  {/* Image Grid - Responsive for portrait mode */}
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {generatedImageUrls.map((url, index) => (
                          <div key={index} className="flex flex-col gap-2 w-full">
                              {/* Portrait-optimized image container */}
                              <div className="relative w-full rounded-lg overflow-hidden border-2 border-cyan-400/30 bg-black/30">
                                  <img
                                      src={url}
                                      alt={`${t.concept} ${index + 1}`}
                                      className="w-full h-auto object-contain max-h-[300px] sm:max-h-[400px]"
                                  />
                                  <div className="absolute top-2 left-2 bg-black/70 text-white text-sm font-bold px-2 py-1 rounded">
                                      {t.concept} {index + 1}
                                  </div>
                              </div>
                              <button
                                  onClick={() => {
                                      if (onConceptSelect) {
                                          onConceptSelect(url);
                                      }
                                  }}
                                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:from-cyan-700 active:to-blue-700 text-white font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 min-h-[44px] sm:min-h-[48px] flex items-center justify-center gap-2 text-sm sm:text-base"
                              >
                                  <span className="text-xl sm:text-2xl">{index + 1}</span>
                                  <span>{t.selectConcept} {index + 1}</span>
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="bg-black/30 p-2 sm:p-3 lg:p-4 flex items-center gap-2 lg:gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isLoading ? t.mionIsThinking : (isTyping ? t.typingPlaceholder : t.messageInputPlaceholder)}
            disabled={isLoading || isTyping}
            className="flex-1 bg-transparent text-white text-base sm:text-lg lg:text-xl placeholder-cyan-300/70 border-0 focus:ring-0 px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-3"
            autoComplete="off"
            autoFocus
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || isTyping}
            className="bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-full p-3 lg:p-4 min-w-[48px] min-h-[48px] lg:min-w-[56px] lg:min-h-[56px] flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
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
