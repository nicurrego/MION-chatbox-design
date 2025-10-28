
import React, { useState, useEffect, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { sendMessageToBot } from '../services/geminiService';
import CharacterSprite from './CharacterSprite';
import ChatBox from './ChatBox';
import InfoBox from './InfoBox';

const MainScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: 'Hey there! What are you curious about today?' }
  ]);
  const [currentBotMessage, setCurrentBotMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === 'bot') {
      setIsTyping(true);
      setCurrentBotMessage('');
      let charIndex = 0;
      const intervalId = setInterval(() => {
        if (charIndex < lastMessage.text.length) {
          setCurrentBotMessage((prev) => prev + lastMessage.text[charIndex]);
          charIndex++;
        } else {
          clearInterval(intervalId);
          setIsTyping(false);
        }
      }, 50); // Typing speed
      return () => clearInterval(intervalId);
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (isTyping || isLoading) return;

    const newUserMessage: ChatMessage = { sender: 'user', text: userInput };
    // We don't display user messages in the chatbox, but we need it for context
    // setMessages(prev => [...prev, newUserMessage]);
    
    setIsLoading(true);

    const botResponseText = await sendMessageToBot(userInput);
    const newBotMessage: ChatMessage = { sender: 'bot', text: botResponseText };
    
    setMessages(prev => [...prev, newBotMessage]);
    setIsLoading(false);
  }, [isTyping, isLoading]);
  
  return (
    <main className="relative w-full h-screen overflow-hidden select-none bg-black animate-fadeInMain">
      <style>{`
          @keyframes fadeInMain {
              from { opacity: 0; }
              to { opacity: 1; }
          }
          .animate-fadeInMain {
              animation: fadeInMain 1s ease-in-out;
          }
      `}</style>
    
      {/* Background Layer */}
      <img
        src="https://i.imgur.com/czEbWz9.png"
        alt="Background scene"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* This div creates the semi-transparent, blurred overlay effect over the background */}
      <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-sm backdrop-brightness-75"></div>
      
      {/* This div adds the scanline effect */}
      <div 
          className="absolute inset-0 opacity-20"
          style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
              backgroundSize: '100% 4px'
          }}
      ></div>
      
      {/* Layout container: Handles both mobile (absolute children) and desktop (grid) layouts */}
      <div className="relative w-full h-full p-4 md:p-8 md:grid md:grid-cols-[minmax(0,_2fr)_minmax(0,_3fr)] md:grid-rows-[auto_1fr] md:gap-8">
        
        {/* Character Container: Fills background on mobile, becomes left column on desktop */}
        <div className="absolute inset-0 pointer-events-none md:pointer-events-auto md:relative md:row-span-2">
          <CharacterSprite 
            imageUrl="https://i.imgur.com/wWoqIhN.jpeg"
            isThinking={isLoading}
          />
        </div>

        {/* InfoBox Container: Top-right corner on mobile, top-right grid cell on desktop */}
        <div className="absolute top-4 right-4 z-10 md:relative md:top-auto md:right-auto md:col-start-2 md:row-start-1 md:justify-self-end">
          <InfoBox />
        </div>
        
        {/* ChatBox Container: Bottom overlay on mobile, bottom-right grid cell on desktop */}
        <div className="absolute bottom-4 left-4 right-4 z-10 md:relative md:bottom-auto md:left-auto md:right-auto md:col-start-2 md:row-start-2 flex flex-col justify-end">
          <ChatBox
            characterName="Mion"
            message={currentBotMessage}
            isTyping={isTyping}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </main>
  );
};

export default MainScreen;
