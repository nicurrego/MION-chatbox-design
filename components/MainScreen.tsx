import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatMessage } from '../types';
import { sendMessageToBot, generateSpeech, generateOnsenImage } from '../services/geminiService';
import type { OnsenPreferences } from '../services/geminiService';
import { playAudio, stopAudio } from '../utils/audioUtils';
import CharacterSprite from './CharacterSprite';
import ChatBox from './ChatBox';
import InfoBox from './InfoBox';
import Subtitles from './Subtitles';
import ActionButtons from './ActionButtons';

const FullScreenImage: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
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
  const [isLoading, setIsLoading] = useState(!initialMessage);
  const [isImageViewerOpen, setImageViewerOpen] = useState(false);
  
  const [isAutoplayMuted, setAutoplayMuted] = useState(false);
  const [lastBotAudio, setLastBotAudio] = useState<string | null>(null);
  const [isAudioPlaying, setAudioPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  
  const [isChatOpen, setIsChatOpen] = useState(false);

  const hasStartedConversation = useRef(false);
  const typingIntervalRef = useRef<number | null>(null);

  const typeMessage = useCallback((text: string, audio: string | null) => {
    setIsTyping(true);
    setCurrentBotMessage('');

    if (audio && !isAutoplayMuted) {
        setAudioPlaying(true);
        playAudio(audio, audioCtxRef, audioSourceRef, () => setAudioPlaying(false));
    }

    let charIndex = 0;
    typingIntervalRef.current = window.setInterval(() => {
        if (charIndex < text.length) {
            setCurrentBotMessage(text.slice(0, charIndex + 1));
            charIndex++;
        } else {
            if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current);
                typingIntervalRef.current = null;
            }
            setIsTyping(false);
            // Add final message to history. The currentBotMessage will clear after a delay.
            setMessages(prev => [...prev, { sender: 'bot', text }]);
        }
    }, 50);
  }, [isAutoplayMuted]);


  useEffect(() => {
    if (hasStartedConversation.current || !initialMessage) return;

    hasStartedConversation.current = true;
    setIsLoading(false);
    setLastBotAudio(initialAudio);
    
    typeMessage(initialMessage.text, initialAudio);

  }, [initialMessage, initialAudio, typeMessage]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && (document.activeElement?.tagName !== 'INPUT')) {
        event.preventDefault();
        setImageViewerOpen(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
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
  }, []);

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (isTyping || isLoading) return;
    
    stopAudio(audioSourceRef);
    setAudioPlaying(false);
    setLastBotAudio(null);

    const userMessage: ChatMessage = { sender: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);
    setCurrentBotMessage(''); // Ensure temp message is clear

    const botResponseText = await sendMessageToBot(userInput);

    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = botResponseText.match(jsonRegex);

    if (match && match[1]) {
        try {
            const preferences: OnsenPreferences = JSON.parse(match[1]);
            setIsGeneratingImage(true);
            const imageBase64 = await generateOnsenImage(preferences);
            if (imageBase64) {
                const imageUrl = `data:image/png;base64,${imageBase64}`;
                setGeneratedImageUrl(imageUrl);
            }
        } catch (error) {
            console.error("Failed to parse preferences JSON or generate image:", error);
        } finally {
            setIsGeneratingImage(false);
        }
    }

    setIsLoading(false); // Finished thinking, about to start typing

    const audioData = await generateSpeech(botResponseText);
    setLastBotAudio(audioData);

    typeMessage(botResponseText, audioData);

  }, [isTyping, isLoading, typeMessage]);

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
      
      <div className="absolute inset-0 bg-blue-600/30 backdrop-blur-sm backdrop-brightness-75"></div>
      
      <div 
          className="absolute inset-0 opacity-20"
          style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
              backgroundSize: '100% 4px'
          }}
      ></div>
      
      <div className="relative w-full h-full landscape:p-8 landscape:grid landscape:grid-cols-[minmax(0,_2fr)_minmax(0,_3fr)] landscape:grid-rows-[auto_1fr] landscape:gap-8">
        
        <div className="absolute top-0 left-0 right-0 h-[15vh] p-4 landscape:relative landscape:inset-auto landscape:h-auto landscape:p-0 landscape:col-start-2 landscape:row-start-1">
          <InfoBox 
            isGeneratingImage={isGeneratingImage}
            generatedImageUrl={generatedImageUrl}
          />
        </div>
        
        <div className="absolute inset-0 top-[15vh] p-4 landscape:relative landscape:inset-auto landscape:p-0 landscape:min-h-0 landscape:col-start-1 landscape:row-start-1 landscape:row-span-2">
          <CharacterSprite 
            imageUrl="https://i.imgur.com/wWoqIhN.jpeg"
            isThinking={isLoading || isGeneratingImage}
          />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-center">
            <Subtitles 
                message={currentBotMessage}
                isTyping={isTyping}
            />
             <ActionButtons 
                onToggleChat={() => setIsChatOpen(prev => !prev)}
                isMuted={isAutoplayMuted}
                onToggleMute={() => setAutoplayMuted(prev => !prev)}
            />
        </div>
      </div>
        
      {isChatOpen && (
         <ChatBox
            characterName="Mion"
            history={messages}
            currentBotMessage={currentBotMessage}
            isTyping={isTyping}
            isLoading={isLoading || isGeneratingImage}
            onSendMessage={handleSendMessage}
            isMuted={isAutoplayMuted}
            onToggleMute={() => setAutoplayMuted(prev => !prev)}
            onReadAloud={handleReadAloud}
            onStopAudio={handleStopAudio}
            isAudioPlaying={isAudioPlaying}
            canReadAloud={!!lastBotAudio && !isTyping}
            onClose={() => setIsChatOpen(false)}
          />
      )}

      <FullScreenImage 
        isVisible={isImageViewerOpen} 
      />
    </main>
  );
};

export default MainScreen;