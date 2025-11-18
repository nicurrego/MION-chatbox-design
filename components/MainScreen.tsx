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
import VoiceInputUI from './VoiceInputUI';

// Fix: Add interfaces for the Web Speech API to fix TypeScript errors.
// These are not included in standard DOM typings.
interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}
  
interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}
  
interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}
  
interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}
  
interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onstart: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
}

const FullScreenImage: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const imageUrl = "images/base_ofuro.png"; 
  
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

const splitIntoSentences = (text: string): string[] => {
    if (!text) return [];
    // Use a positive lookbehind to split after sentence-ending punctuation, keeping the punctuation.
    const sentences = text.split(/(?<=[.?!])\s+/);
    return sentences.map(s => s.trim()).filter(Boolean);
};

const MainScreen: React.FC<MainScreenProps> = ({ initialMessage, initialAudio }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentBotMessage, setCurrentBotMessage] = useState('');
  const [persistentSubtitle, setPersistentSubtitle] = useState('');
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [areSubtitlesVisible, setAreSubtitlesVisible] = useState(true);
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

  // Voice Input State
  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const hasStartedConversation = useRef(false);
  const typingIntervalRef = useRef<number | null>(null);
  const subtitleTimeoutRefs = useRef<number[]>([]);

  const typeMessage = useCallback((text: string, audio: string | null) => {
    // --- Standard typing animation for the chat box ---
    setIsTyping(true);
    setCurrentBotMessage('');
    setPersistentSubtitle(''); // Clear previous persistent subtitle

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
            setMessages(prev => [...prev, { sender: 'bot', text }]);
            setPersistentSubtitle(text); // Set the persistent subtitle for chatbox history
        }
    }, 50);

    // --- New sentence-by-sentence subtitle logic ---
    subtitleTimeoutRefs.current.forEach(clearTimeout);
    subtitleTimeoutRefs.current = [];
    
    const sentences = splitIntoSentences(text);
    let cumulativeDelay = 0;
    // Estimated reading/speaking speed
    const WPM = 140; // Words per minute
    const AVG_WORD_LENGTH = 5; 
    const CHARS_PER_SECOND = (WPM * AVG_WORD_LENGTH) / 50; // ~15 characters per second

    sentences.forEach(sentence => {
        const duration = (sentence.length / CHARS_PER_SECOND) * 1000;
        
        const timeoutId = window.setTimeout(() => {
            setCurrentSubtitle(sentence);
        }, cumulativeDelay);

        subtitleTimeoutRefs.current.push(timeoutId);
        cumulativeDelay += duration;
    });

    // Add a final timeout to clear the subtitle after the full message has been displayed.
    const finalTimeoutId = window.setTimeout(() => {
        setCurrentSubtitle('');
    }, cumulativeDelay + 2000); // 2-second buffer
    subtitleTimeoutRefs.current.push(finalTimeoutId);

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
      // Cleanup timeouts on unmount
      subtitleTimeoutRefs.current.forEach(clearTimeout);
      if(typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, []);

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (isTyping || isLoading) return;
    
    // Clear subtitles and stop audio on new message
    setPersistentSubtitle('');
    setCurrentSubtitle('');
    subtitleTimeoutRefs.current.forEach(clearTimeout);
    subtitleTimeoutRefs.current = [];

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
    // Also stop the subtitles
    subtitleTimeoutRefs.current.forEach(clearTimeout);
    subtitleTimeoutRefs.current = [];
    setCurrentSubtitle('');
  }, []);

  const handleStartVoiceInput = useCallback(() => {
    setPersistentSubtitle(''); // Clear subtitle on voice input
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Sorry, your browser doesn't support speech recognition.");
        return;
    }
    
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => setIsRecording(true);
    
    recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        setTranscript(finalTranscript + interimTranscript);
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
    };
    
    recognition.onend = () => setIsRecording(false);
    
    recognition.start();
    recognitionRef.current = recognition;
    setIsVoiceInputActive(true);
    setTranscript('');
}, []);

const handleCancelVoiceInput = useCallback(() => {
    if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
    }
    setIsVoiceInputActive(false);
    setIsRecording(false);
    setTranscript('');
}, []);

const handleSendVoiceMessage = useCallback((message: string) => {
    handleCancelVoiceInput();
    handleSendMessage(message);
}, [handleCancelVoiceInput, handleSendMessage]);
  
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
        src="videos\looping_ofuro.mp4"
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
            imageUrl="images\cute_duck.png"
            isThinking={isLoading || isGeneratingImage}
          />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-center">
            <Subtitles 
                currentSentence={currentSubtitle}
                isVisible={areSubtitlesVisible}
            />
             <ActionButtons 
                onToggleChat={() => setIsChatOpen(prev => !prev)}
                isMuted={isAutoplayMuted}
                onToggleMute={() => setAutoplayMuted(prev => !prev)}
                onStartVoiceInput={handleStartVoiceInput}
                areSubtitlesVisible={areSubtitlesVisible}
                onToggleSubtitles={() => setAreSubtitlesVisible(prev => !prev)}
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

      {isVoiceInputActive && (
        <VoiceInputUI 
            transcript={transcript}
            isRecording={isRecording}
            onSend={handleSendVoiceMessage}
            onCancel={handleCancelVoiceInput}
        />
      )}

      <FullScreenImage 
        isVisible={isImageViewerOpen} 
      />
    </main>
  );
};

export default MainScreen;