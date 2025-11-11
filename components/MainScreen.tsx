import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatMessage } from '../types';
import { sendMessageToBot, generateSpeech } from '../services/geminiService';
import { playAudio, stopAudio } from '../utils/audioUtils';
import CharacterSprite from './CharacterSprite';
import ChatBox from './ChatBox';
import InfoBox from './InfoBox';

// This new component will display the full-screen image.
const FullScreenImage: React.FC<{ isVisible: boolean; onClose: () => void }> = ({ isVisible, onClose }) => {
  // I've uploaded the image you provided to a hosting service.
  const imageUrl = "https://i.imgur.com/F542p7z.png"; 
  
  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm
        transition-opacity duration-300 ease-out
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Fullscreen image view"
      aria-hidden={!isVisible}
    >
      <div
         className={`
          transform-gpu transition-all duration-300 ease-out
          ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
         `}
      >
        <img
          src={imageUrl}
          alt="A serene Japanese style bathroom with a wooden tub."
          className="block max-w-[95vw] max-h-[95vh] object-contain rounded-md shadow-2xl shadow-cyan-400/20"
        />
      </div>
    </div>
  );
};


const MainScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentBotMessage, setCurrentBotMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageViewerOpen, setImageViewerOpen] = useState(false);
  
  // Audio state
  const [isAutoplayMuted, setAutoplayMuted] = useState(false);
  const [lastBotAudio, setLastBotAudio] = useState<string | null>(null);
  const [isAudioPlaying, setAudioPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const hasStartedConversation = useRef(false);
  const typingIntervalRef = useRef<number | null>(null);


  // This effect starts the conversation when the component mounts
  useEffect(() => {
    // The ref prevents this from running twice in React's Strict Mode
    if (!hasStartedConversation.current) {
        const startConversation = async () => {
            setIsLoading(true);
            const botResponseText = await sendMessageToBot("Hello");
            const audioData = await generateSpeech(botResponseText);
            setLastBotAudio(audioData);
            
            if (audioData && !isAutoplayMuted) {
              setAudioPlaying(true);
              playAudio(audioData, audioCtxRef, audioSourceRef, () => setAudioPlaying(false));
            }

            const newBotMessage: ChatMessage = { sender: 'bot', text: botResponseText };
            setMessages([newBotMessage]);
            setIsLoading(false);
        };
        startConversation();
        hasStartedConversation.current = true;
    }
  }, [isAutoplayMuted]);


  // This effect handles the "typing" animation for the bot's message.
  useEffect(() => {
    // Always clear any leftover interval from a previous render.
    // This is the key to fixing the race condition that corrupted the text.
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === 'bot') {
      setIsTyping(true);
      setCurrentBotMessage(''); // Reset before starting
      
      let charIndex = 0;
      const textToType = lastMessage.text;

      // Start a new interval and store its ID in the ref.
      typingIntervalRef.current = window.setInterval(() => {
        if (charIndex < textToType.length) {
          // Use slice for a more robust update than appending characters.
          setCurrentBotMessage(textToType.slice(0, charIndex + 1));
          charIndex++;
        } else {
          // Once done, clear the interval and the ref.
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          setIsTyping(false);
        }
      }, 50); // Typing speed
    }

    // The cleanup function is still important for when the component unmounts
    // or when the effect re-runs.
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [messages]);

  // Effect for keyboard controls to open/close the image viewer
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Open with Space, but not when the user is typing in the chat input
      if (event.code === 'Space' && (document.activeElement?.tagName !== 'INPUT')) {
        event.preventDefault();
        setImageViewerOpen(true);
      }
      // Close with Escape
      if (event.code === 'Escape' && isImageViewerOpen) {
        setImageViewerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isImageViewerOpen]);

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (isTyping || isLoading) return;
    
    // Stop any speaking from the previous turn
    stopAudio(audioSourceRef);
    setAudioPlaying(false);
    setLastBotAudio(null);

    setIsLoading(true);

    const botResponseText = await sendMessageToBot(userInput);
    const audioData = await generateSpeech(botResponseText);
    setLastBotAudio(audioData);

    if (audioData && !isAutoplayMuted) {
      setAudioPlaying(true);
      playAudio(audioData, audioCtxRef, audioSourceRef, () => setAudioPlaying(false));
    }

    const newBotMessage: ChatMessage = { sender: 'bot', text: botResponseText };
    setMessages(prev => [...prev, newBotMessage]);
    setIsLoading(false);
  }, [isTyping, isLoading, isAutoplayMuted]);

  const handleReadAloud = useCallback(() => {
    if (lastBotAudio && !isAudioPlaying) {
      setAudioPlaying(true);
      playAudio(lastBotAudio, audioCtxRef, audioSourceRef, () => setAudioPlaying(false));
    }
  }, [lastBotAudio, isAudioPlaying]);

  const handleStopAudio = useCallback(() => {
    stopAudio(audioSourceRef);
    setAudioPlaying(false);
  }, []);
  
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
      <video
        src="https://i.imgur.com/XV1EEY6.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
        tabIndex={-1}
      />
      
      {/* This div creates the semi-transparent, blurred overlay effect over the background */}
      <div className="absolute inset-0 bg-blue-600/30 backdrop-blur-sm backdrop-brightness-75"></div>
      
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
            isMuted={isAutoplayMuted}
            onToggleMute={() => setAutoplayMuted(prev => !prev)}
            onReadAloud={handleReadAloud}
            onStopAudio={handleStopAudio}
            isAudioPlaying={isAudioPlaying}
            canReadAloud={!!lastBotAudio && !isTyping}
          />
        </div>
      </div>

      <FullScreenImage 
        isVisible={isImageViewerOpen} 
        onClose={() => setImageViewerOpen(false)} 
      />
    </main>
  );
};

export default MainScreen;