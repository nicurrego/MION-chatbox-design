
import React, { useState, useEffect } from 'react';

interface ChatBoxProps {
  characterName: string;
  message: string;
  isTyping: boolean;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const TypingIndicator: React.FC = () => (
  <span className="inline-block w-2 h-6 ml-1 bg-white animate-ping"></span>
);

const ChatBox: React.FC<ChatBoxProps> = ({ characterName, message, isTyping, isLoading, onSendMessage }) => {
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
      <div className="px-6 pt-3">
        <div className="bg-cyan-600/90 inline-block px-4 py-1 text-2xl text-white rounded-t-md border-t-2 border-l-2 border-r-2 border-cyan-300/60">
          {characterName}
        </div>
      </div>
      <div className="p-6 pt-4 text-white text-3xl min-h-[120px] md:min-h-[140px]">
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
