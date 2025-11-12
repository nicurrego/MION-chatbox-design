import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatMessage } from '../types';
import { sendMessageToBot, generateSpeech } from '../services/geminiService';
import { playAudio, stopAudio } from '../utils/audioUtils';
import CharacterSprite from './CharacterSprite';
import ChatBox from './ChatBox';
import InfoBox from './InfoBox';

// This new component will display the full-screen image.
const FullScreenImage: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  // New image URL provided by the user
  const imageUrl = "https://i.imgur.com/iJZb5Cz.jpeg"; 
  
  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm
        transition-opacity duration-300 ease-out
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
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
          alt="An illustration of a serene outdoor onsen at night, surrounded by nature and illuminated by lanterns."
          className="block max-w-[95vw] max-h-[95vh] object-contain rounded-md shadow-2xl shadow-cyan-400/20"
        />
      </div>
    </div>
  );
};

interface MainScreenProps {
  initialMessage: ChatMessage | null;
  initialAudio: string | null;
}

const MainScreen: React.FC<MainScreenProps> = ({ initialMessage, initialAudio }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentBotMessage, setCurrentBotMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // Set initial loading state if the message isn't ready when the component mounts.
  const [isLoading, setIsLoading] = useState(!initialMessage);
  const [isImageViewerOpen, setImageViewerOpen] = useState(false);
  
  // Audio state
  const [isAutoplayMuted, setAutoplayMuted] = useState(false);
  const [lastBotAudio, setLastBotAudio] = useState<string | null>(null);
  const [isAudioPlaying, setAudioPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const hasStartedConversation = useRef(false);
  const typingIntervalRef = useRef<number | null>(null);


  // This effect starts the conversation when the component mounts using preloaded data
  useEffect(() => {
    // This effect should only run once the initial preloaded data arrives.
    if (hasStartedConversation.current || !initialMessage) return;

    // The ref prevents this from running twice in React's Strict Mode
    hasStartedConversation.current = true;

    // Set state from props
    setLastBotAudio(initialAudio);
    
    if (initialAudio && !isAutoplayMuted) {
      setAudioPlaying(true);
      playAudio(initialAudio, audioCtxRef, audioSourceRef, () => setAudioPlaying(false));
    }

    setMessages([initialMessage]);
    setIsLoading(false); // The initial load is complete.

  }, [initialMessage, initialAudio, isAutoplayMuted]);


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

  // Effect for keyboard controls to show image while spacebar is held
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show on Space press, but not when the user is typing in the chat input
      if (event.code === 'Space' && (document.activeElement?.tagName !== 'INPUT')) {
        event.preventDefault();
        setImageViewerOpen(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Hide on Space release
      if (event.code === 'Space') {
        event.preventDefault();
        setImageViewerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []); // Empty dependency array is correct.

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
  
  // Determine if we're in the special initial loading state.
  const isInitialLoading = isLoading && messages.length === 0;

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
      
      {/* Layout container: Switches from absolute positioning on portrait to a grid on landscape */}
      <div className="relative w-full h-full landscape:p-8 landscape:grid landscape:grid-cols-[minmax(0,_2fr)_minmax(0,_3fr)] landscape:grid-rows-[auto_1fr] landscape:gap-8">
        
        {/* InfoBox Container: Top on portrait, top-right on landscape */}
        <div className="absolute top-0 left-0 right-0 h-[15vh] p-4 landscape:relative landscape:inset-auto landscape:h-auto landscape:p-0 landscape:col-start-2 landscape:row-start-1">
          <InfoBox />
        </div>
        
        {/* Character Container: Fills middle on portrait (behind chat), left on landscape */}
        <div className="absolute inset-0 top-[15vh] p-4 landscape:relative landscape:inset-auto landscape:p-0 landscape:min-h-0 landscape:col-start-1 landscape:row-start-1 landscape:row-span-2">
          <CharacterSprite 
            imageUrl="https://i.imgur.com/wWoqIhN.jpeg"
            isThinking={isLoading}
          />
        </div>
        
        {/* ChatBox Container: Bottom on portrait, bottom-right on landscape */}
        <div className="absolute bottom-0 left-0 right-0 h-[35vh] p-4 landscape:relative landscape:inset-auto landscape:h-auto landscape:p-0 landscape:min-h-0 landscape:col-start-2 landscape:row-start-2">
          <ChatBox
            characterName="Mion"
            message={isInitialLoading ? "Mion is waking up..." : currentBotMessage}
            isTyping={isInitialLoading ? false : isTyping}
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
      />
    </main>
  );
};

export default MainScreen;