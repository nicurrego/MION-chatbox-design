import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatMessage } from '../types';
import { sendMessageToBot, generateSpeech, generateOnsenImage, generateLoopingVideo } from '../services/geminiService';
import type { OnsenPreferences } from '../services/geminiService';
import { playAudio, stopAudio } from '../utils/audioUtils';
import { urlToBase64 } from '../utils/imageUtils';

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

const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white animate-fadeIn">
        <svg className="animate-spin h-12 w-12 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-2xl tracking-wider">{message}</p>
        <p className="text-lg text-cyan-200 mt-2">This may take a few moments...</p>
    </div>
);


interface MainScreenProps {
  initialMessage: ChatMessage | null;
  initialAudio: string | null;
  isMuted: boolean;
  onToggleMute: () => void;
}

const splitIntoSentences = (text: string): string[] => {
    if (!text) return [];
    const sentences = text.split(/(?<=[.?!])\s+/);
    return sentences.map(s => s.trim()).filter(Boolean);
};

const MainScreen: React.FC<MainScreenProps> = ({ initialMessage, initialAudio, isMuted, onToggleMute }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentBotMessage, setCurrentBotMessage] = useState('');
  const [persistentSubtitle, setPersistentSubtitle] = useState('');
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [areSubtitlesVisible, setAreSubtitlesVisible] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialMessage);
  
  const [lastBotAudio, setLastBotAudio] = useState<string | null>(null);
  const [isAudioPlaying, setAudioPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // --- Onsen Creation Flow State ---
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrls, setGeneratedImageUrls] = useState<string[] | null>(null);
  const [selectedOnsenConceptUrl, setSelectedOnsenConceptUrl] = useState<string | null>(null);
  
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoLoadingMessage, setVideoLoadingMessage] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);

  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const hasStartedConversation = useRef(false);
  const typingIntervalRef = useRef<number | null>(null);
  const subtitleTimeoutRefs = useRef<number[]>([]);

  // Check for Veo API key on mount
  useEffect(() => {
    const checkApiKey = async () => {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
        }
    };
    checkApiKey();
  }, []);

  const typeMessage = useCallback((text: string, audio: string | null) => {
    setIsTyping(true);
    setCurrentBotMessage('');
    setPersistentSubtitle('');

    if (audio) {
        setAudioPlaying(true);
        playAudio(audio, audioCtxRef, audioSourceRef, gainNodeRef, isMuted, () => setAudioPlaying(false));
    }

    let charIndex = 0;
    typingIntervalRef.current = window.setInterval(() => {
        if (charIndex < text.length) {
            setCurrentBotMessage(text.slice(0, charIndex + 1));
            charIndex++;
        } else {
            if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
            setIsTyping(false);
            setMessages(prev => [...prev, { sender: 'bot', text }]);
            setPersistentSubtitle(text);
        }
    }, 50);

    subtitleTimeoutRefs.current.forEach(clearTimeout);
    subtitleTimeoutRefs.current = [];
    const sentences = splitIntoSentences(text);
    let cumulativeDelay = 0;
    const WPM = 140;
    const AVG_WORD_LENGTH = 5; 
    const CHARS_PER_SECOND = (WPM * AVG_WORD_LENGTH) / 50;

    sentences.forEach(sentence => {
        const duration = (sentence.length / CHARS_PER_SECOND) * 1000;
        const timeoutId = window.setTimeout(() => setCurrentSubtitle(sentence), cumulativeDelay);
        subtitleTimeoutRefs.current.push(timeoutId);
        cumulativeDelay += duration;
    });

    const finalTimeoutId = window.setTimeout(() => setCurrentSubtitle(''), cumulativeDelay + 2000);
    subtitleTimeoutRefs.current.push(finalTimeoutId);
  }, [isMuted]);

  useEffect(() => {
    if (hasStartedConversation.current || !initialMessage) return;
    hasStartedConversation.current = true;
    setIsLoading(false);
    setLastBotAudio(initialAudio);
    typeMessage(initialMessage.text, initialAudio);
  }, [initialMessage, initialAudio, typeMessage]);

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : 1, audioCtxRef.current.currentTime);
    }
  }, [isMuted]);

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (isTyping || isLoading) return;
    
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
    setCurrentBotMessage('');

    const botResponseText = await sendMessageToBot(userInput);
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = botResponseText.match(jsonRegex);

    if (match && match[1]) {
        try {
            const preferences: OnsenPreferences = JSON.parse(match[1]);
            setIsGeneratingImage(true);
            const imageBase64Array = await generateOnsenImage(preferences);
            if (imageBase64Array && imageBase64Array.length > 0) {
                const imageUrls = imageBase64Array.map(base64 => `data:image/png;base64,${base64}`);
                setGeneratedImageUrls(imageUrls);
            }
        } catch (error) {
            console.error("Failed to parse preferences JSON or generate images:", error);
            setError("Sorry, there was an issue creating the onsen visuals.");
        } finally {
            setIsGeneratingImage(false);
        }
    }

    setIsLoading(false);
    const audioData = await generateSpeech(botResponseText);
    setLastBotAudio(audioData);
    typeMessage(botResponseText, audioData);
  }, [isTyping, isLoading, typeMessage]);

  const handleOnsenConceptSelect = useCallback(async (url: string) => {
    setSelectedOnsenConceptUrl(url); // Show the selected image as background immediately
    setIsGeneratingVideo(true);
    setVideoLoadingMessage("Preparing your onsen experience...");
    setError(null);

    try {
        const { base64, mimeType } = await urlToBase64(url);

        // API Key Check
        if (!apiKeySelected) {
            if (window.aistudio?.openSelectKey) {
                await window.aistudio.openSelectKey();
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeySelected(hasKey);
                if (!hasKey) {
                    throw new Error("An API key is required for video generation.");
                }
            } else {
                throw new Error("Could not find the API key selection utility.");
            }
        }
        
        // Generate Video
        const videoUrl = await generateLoopingVideo(base64, mimeType);
        setGeneratedVideoUrl(videoUrl);

    } catch (error: any) {
        console.error("Video generation process failed:", error);
        if (error.message.includes("Requested entity was not found")) {
            setError("Video generation failed. Your API key might be invalid. Please try selecting a different key.");
            setApiKeySelected(false);
        } else if (error.message.includes("API key is required")) {
            setError(error.message);
        } else {
            setError("Sorry, we couldn't create the video experience. Please try selecting a concept again.");
        }
    } finally {
        setIsGeneratingVideo(false);
    }
}, [apiKeySelected]);


  const handleReadAloud = useCallback(() => {
    if (lastBotAudio && !isAudioPlaying) {
      setAudioPlaying(true);
      playAudio(lastBotAudio, audioCtxRef, audioSourceRef, gainNodeRef, isMuted, () => setAudioPlaying(false));
    }
  }, [lastBotAudio, isAudioPlaying, isMuted]);

  const handleStopAudio = useCallback(() => {
    stopAudio(audioSourceRef);
    setAudioPlaying(false);
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
          @keyframes fadeInMain { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-fadeInMain { animation: fadeInMain 1s ease-in-out; }
          .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    
      {generatedVideoUrl ? (
        <video
            key={generatedVideoUrl}
            src={generatedVideoUrl}
            autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover animate-fadeIn"
        />
      ) : selectedOnsenConceptUrl ? (
         <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center animate-fadeIn"
            style={{ backgroundImage: `url(${selectedOnsenConceptUrl})` }}
         ></div>
      ) : (
        <video
            src="videos/looping_ofuro.mp4"
            autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      
      {/*
        FIX: Add a 'key' prop to the overlay divs. This forces React to re-mount them
        when the background source changes (from image to video). This resolves a potential
        rendering glitch where CSS filters like 'backdrop-blur' might not update to reflect
        the new background content, making it seem like the old background is still present.
      */}
      <div
        key={generatedVideoUrl || 'bg-overlay'}
        className="absolute inset-0 bg-blue-600/30 backdrop-blur-sm backdrop-brightness-75"
      ></div>
      <div 
        key={(generatedVideoUrl || 'bg-overlay') + '-scanlines'}
        className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)', backgroundSize: '100% 4px' }}
      ></div>
      
      <div className="relative w-full h-full landscape:p-8 landscape:grid landscape:grid-cols-[minmax(0,_2fr)_minmax(0,_3fr)] landscape:gap-8">
        
        <div className="absolute top-0 left-0 right-0 h-[15vh] p-4 landscape:relative landscape:inset-auto landscape:h-auto landscape:p-0 landscape:col-start-2 landscape:row-start-1">
          <InfoBox 
            isGeneratingImage={isGeneratingImage}
            generatedImageUrls={generatedImageUrls}
            onConceptSelect={handleOnsenConceptSelect}
            isConceptSelected={!!selectedOnsenConceptUrl}
            generatedVideoUrl={generatedVideoUrl}
          />
        </div>
        
        <div className="absolute inset-0 top-[15vh] p-4 landscape:relative landscape:inset-auto landscape:p-0 landscape:min-h-0 landscape:col-start-1 landscape:row-start-1">
          <CharacterSprite 
            imageUrl="/images/cute_duck.png"
            isThinking={isLoading || isGeneratingImage || isGeneratingVideo}
          />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-center">
            <Subtitles 
                currentSentence={currentSubtitle}
                isVisible={areSubtitlesVisible}
            />
             <ActionButtons 
                onToggleChat={() => setIsChatOpen(prev => !prev)}
                isMuted={isMuted}
                onToggleMute={onToggleMute}
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
            isLoading={isLoading || isGeneratingImage || isGeneratingVideo}
            onSendMessage={handleSendMessage}
            isMuted={isMuted}
            onToggleMute={onToggleMute}
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
    
      {isGeneratingVideo && (
        <LoadingOverlay message={videoLoadingMessage} />
      )}
       {error && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-red-800/90 text-white px-6 py-3 rounded-lg shadow-lg animate-fadeIn">
            <p>{error}</p>
            <button onClick={() => setError(null)} className="absolute top-1 right-1 text-white/70 hover:text-white">&times;</button>
        </div>
      )}

    </main>
  );
};

export default MainScreen;