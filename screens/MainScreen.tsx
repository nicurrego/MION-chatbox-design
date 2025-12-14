import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatMessage } from '../types';
import { generateOnsenImage, generateLoopingVideo, generateSpeech, generateOnsenDescription } from '../services';
import type { OnsenPreferences } from '../services';
import { urlToBase64 } from '../utils/imageUtils';
import { downloadAllContent } from '../utils/downloadUtils';
import { useLanguage } from '../contexts/LanguageContext';

// Components
import { MionCharacter } from '../components/MionCharacter';
import ChatBox from '../components/ChatBox';
import InfoBox from '../components/InfoBox';
import Subtitles from '../components/Subtitles';
import ActionButtons from '../components/ActionButtons';
import VoiceInputUI from '../components/VoiceInputUI';

// Custom Hooks
import { useAudioController } from '../hooks/useAudioController';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useChatSession } from '../hooks/useChatSession';
import { useBackgroundMusic, type BackgroundMusicTrack } from '../hooks/useBackgroundMusic';

// Detect if device is mobile
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isMobileSize = window.innerWidth < 768;
  return mobileRegex.test(userAgent.toLowerCase()) || isMobileSize;
};

// Get background video based on device type
const getDefaultBackgroundVideo = (): string => {
  const isMobile = isMobileDevice();
  return isMobile ? 'videos/looping_ofuro_mobile.mp4' : 'videos/looping_ofuro.mp4';
};

// Detect if device is in portrait orientation
const isPortraitOrientation = (): boolean => {
  if (typeof window === 'undefined') return true;
  return window.innerHeight > window.innerWidth;
};

// Get video aspect ratio based on device orientation
const getVideoAspectRatio = (): '9:16' | '16:9' => {
  return isPortraitOrientation() ? '9:16' : '16:9';
};

interface MainScreenProps {
  initialMessage: ChatMessage | null;
  initialAudio: string | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onProgressChange?: (hasProgress: boolean) => void;
}

const MainScreen: React.FC<MainScreenProps> = ({ initialMessage, initialAudio, isMuted, onToggleMute, onProgressChange }) => {
  // --- Language Context ---
  const { languageConfig } = useLanguage();

  // --- Custom Hooks ---
  const audioCtrl = useAudioController(isMuted);
  const voiceInput = useVoiceInput(languageConfig?.geminiLanguageCode || 'en-US');
  const chat = useChatSession();

  // --- Local State for Visuals (Onsen/Video) ---
  const [areSubtitlesVisible, setAreSubtitlesVisible] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const [backgroundMusicTrack, setBackgroundMusicTrack] = useState<BackgroundMusicTrack>('whirlwind');

  const [onsenState, setOnsenState] = useState({
    isGeneratingImage: false,
    imageUrls: null as string[] | null,
    selectedConceptUrl: null as string | null,
    isGeneratingVideo: false,
    videoUrl: null as string | null,
    videoLoadingMsg: '',
    onsenDescription: null as string | null,
    error: null as string | null
  });

  const [currentPreferences, setCurrentPreferences] = useState<OnsenPreferences | null>(null);
  const hasStartedConversation = useRef(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // --- Background Music Hook ---
  useBackgroundMusic({ track: backgroundMusicTrack, isMuted, isTTSPlaying: audioCtrl.isPlaying });

  // --- Effects ---

  // Background Music Control based on app state
  useEffect(() => {
    if (onsenState.videoUrl) {
      // Video is playing - stop background music (video has its own audio)
      setBackgroundMusicTrack('none');
    } else if (onsenState.isGeneratingImage || onsenState.imageUrls || onsenState.isGeneratingVideo) {
      // User clicked "Create onsen" - play Rivulet
      setBackgroundMusicTrack('rivulet');
    } else {
      // Default state - play Whirlwind of Joy
      setBackgroundMusicTrack('whirlwind');
    }
  }, [onsenState.videoUrl, onsenState.isGeneratingImage, onsenState.imageUrls, onsenState.isGeneratingVideo]);

  // Initial Message Handling
  useEffect(() => {
    if (hasStartedConversation.current || !initialMessage) return;
    hasStartedConversation.current = true;

    if (initialAudio) {
      // Check if this is mock audio (should loop)
      const shouldLoop = initialAudio.startsWith('MOCK_MP3:');
      audioCtrl.play(initialAudio, shouldLoop);
    }
    chat.runTypingEffect(initialMessage.text);
    setIsInitialLoading(false);
  }, [initialMessage, initialAudio, chat, audioCtrl]);

  // Track progress - notify parent when user has made progress
  useEffect(() => {
    const hasProgress = chat.messages.length > 0 || onsenState.imageUrls !== null || onsenState.videoUrl !== null;
    onProgressChange?.(hasProgress);
  }, [chat.messages.length, onsenState.imageUrls, onsenState.videoUrl, onProgressChange]);

  // Stop audio when typing finishes (only for mock audio that loops)
  useEffect(() => {
    // When typing finishes and audio is playing, check if it's mock audio
    if (!chat.isTyping && audioCtrl.isPlaying) {
      // Check if the currently playing audio is mock audio (from lastBotAudio or initialAudio)
      const currentAudio = chat.lastBotAudio || initialAudio;
      if (currentAudio?.startsWith('MOCK_MP3:')) {
        // Stop looping audio immediately when typing finishes
        audioCtrl.stop();
      }
    }
    // For real TTS audio, let it play completely without interruption
  }, [chat.isTyping, audioCtrl, chat.lastBotAudio, initialAudio]);

  // Keyboard event listener for keyboard shortcuts
  // 'c' - toggle subtitles, 't' - open chat, 'm' - mute/unmute, 'v' - voice input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // 'c' key - toggle subtitles
      if ((e.key === 'c' || e.key === 'C') && !isInputField) {
        e.preventDefault();
        setAreSubtitlesVisible(prev => !prev);
        return;
      }

      // 't' key - open chat and focus input
      if ((e.key === 't' || e.key === 'T') && !isInputField) {
        e.preventDefault();
        setIsChatOpen(true);
        // Focus the input after a short delay to ensure the chat is rendered
        setTimeout(() => {
          const inputElement = document.querySelector('input[placeholder*="message"]') as HTMLInputElement;
          if (inputElement) {
            inputElement.focus();
            inputElement.select();
          }
        }, 0);
        return;
      }

      // 'm' key - toggle mute/unmute
      if ((e.key === 'm' || e.key === 'M') && !isInputField) {
        e.preventDefault();
        onToggleMute();
        return;
      }

      // 'v' key - start voice input
      if ((e.key === 'v' || e.key === 'V') && !isInputField) {
        e.preventDefault();
        // Don't trigger if chat is open
        if (isChatOpen) {
          return;
        }
        voiceInput.startListening();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [voiceInput, isChatOpen, onToggleMute]);

  // --- Handlers ---

  const handleGenerateImages = useCallback(async (prefs: OnsenPreferences) => {
    // Store preferences for later use
    setCurrentPreferences(prefs);

    setOnsenState(prev => ({ ...prev, isGeneratingImage: true, error: null }));
    try {
      const isMobile = isMobileDevice();
      console.log("🖼️ [IMAGE] Starting image generation...");
      console.log(`📝 [DESCRIPTION] Starting description generation in parallel... (isMobile: ${isMobile})`);

      // Generate images and description in parallel
      const [base64Array, description] = await Promise.all([
        generateOnsenImage(prefs, isMobile),
        generateOnsenDescription(prefs)
      ]);

      if (base64Array?.length) {
        console.log(`✅ [IMAGE] Generated ${base64Array.length} images successfully`);
        const urls = base64Array.map(b64 => `data:image/png;base64,${b64}`);

        if (description) {
          console.log("✅ [DESCRIPTION] Onsen description generated successfully");
        }

        setOnsenState(prev => ({
          ...prev,
          imageUrls: urls,
          onsenDescription: description
        }));
      } else {
        console.warn("⚠️ [IMAGE] No images were generated");
      }
    } catch (e) {
      console.error("❌ [IMAGE] Failed to generate images:", e);
      setOnsenState(prev => ({ ...prev, error: "Failed to generate images." }));
    } finally {
      setOnsenState(prev => ({ ...prev, isGeneratingImage: false }));
      console.log("🏁 [IMAGE] Image generation process ended");
    }
  }, []);

  const handleSendMessage = useCallback(async (userInput: string) => {
    audioCtrl.stop();

    const result = await chat.processUserMessage(userInput);
    if (!result) return;

    // 1. Play Audio (with looping for mock audio)
    if (result.audio) {
      const shouldLoop = result.audio.startsWith('MOCK_MP3:');
      audioCtrl.play(result.audio, shouldLoop);
    }

    // 2. Trigger Visual Typing
    chat.runTypingEffect(result.text);

    // Note: Image generation is now triggered by confirmation button, not automatically
  }, [chat, audioCtrl]);

  const handleConfirmPreferences = useCallback(async () => {
    const preferences = chat.confirmPreferences();
    if (preferences) {
      handleGenerateImages(preferences);
    }
  }, [chat, handleGenerateImages]);

  const handleRejectPreferences = useCallback(async () => {
    const result = await chat.rejectPreferences();
    if (!result) return;

    // Play audio and show typing effect for rejection message
    if (result.audio) {
      const shouldLoop = result.audio.startsWith('MOCK_MP3:');
      audioCtrl.play(result.audio, shouldLoop);
    }
    chat.runTypingEffect(result.text);
  }, [chat, audioCtrl]);

  const handleConceptSelect = useCallback(async (url: string) => {
    setOnsenState(prev => ({
      ...prev,
      selectedConceptUrl: url,
      isGeneratingVideo: true,
      videoLoadingMsg: "Preparing your onsen experience...",
      error: null
    }));

    // Display the description in chat with TTS immediately after selection
    if (onsenState.onsenDescription) {
      console.log("📝 [DESCRIPTION] Displaying onsen description in chat...");
      console.log("🔊 [TTS] Generating speech for description...");

      const { generateSpeech: genSpeech } = await import('../services');
      const descriptionAudio = await genSpeech(onsenState.onsenDescription);

      if (descriptionAudio) {
        console.log("✅ [TTS] Description audio generated successfully");
        const shouldLoop = descriptionAudio.startsWith('MOCK_MP3:');
        audioCtrl.play(descriptionAudio, shouldLoop);
      }

      chat.runTypingEffect(onsenState.onsenDescription);
    }

    try {
      // Start video generation
      const { base64, mimeType } = await urlToBase64(url);
      const aspectRatio = getVideoAspectRatio();
      console.log(`🎬 [VIDEO] Generating video with aspect ratio: ${aspectRatio}`);
      const videoUrl = await generateLoopingVideo(base64, mimeType, aspectRatio);

      console.log("✅ [VIDEO] Video generated successfully");

      setOnsenState(prev => ({
        ...prev,
        videoUrl
      }));
    } catch (error: any) {
      console.error("Video generation process failed:", error);
      const msg = error.message?.includes("API_KEY")
        ? "API configuration error."
        : "Could not create video.";
      setOnsenState(prev => ({ ...prev, error: msg }));
    } finally {
      setOnsenState(prev => ({ ...prev, isGeneratingVideo: false }));
    }
  }, [onsenState.onsenDescription, audioCtrl, chat]);

  const handleVoiceSend = (msg: string) => {
    voiceInput.stopListening();
    handleSendMessage(msg);
  };

  const handleDownloadContent = useCallback(async () => {
    try {
      await downloadAllContent(onsenState.imageUrls, onsenState.videoUrl);
    } catch (error) {
      console.error('Download failed:', error);
      setOnsenState(prev => ({
        ...prev,
        error: 'Failed to download content. Please try again.'
      }));
    }
  }, [onsenState.imageUrls, onsenState.videoUrl]);

  const handleReturnToLanguageSelection = useCallback(() => {
    // Reload the page to return to language selection
    window.location.reload();
  }, []);

  const handleCloseMenu = useCallback(() => {
    // Menu closes automatically, but this can be used for additional cleanup if needed
  }, []);

  // --- Render Helpers ---
  const hasVideoGenerated = !!onsenState.videoUrl;

  return (
    <main className="relative w-full h-dvh h-screen overflow-hidden select-none bg-black animate-fadeInMain">
      <style>{`
          @keyframes fadeInMain { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-fadeInMain { animation: fadeInMain 1s ease-in-out; }
          .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>

      {/* Background Layer */}
      {onsenState.videoUrl ? (
        <video
          key={onsenState.videoUrl}
          src={onsenState.videoUrl}
          autoPlay loop muted={isMuted} playsInline
          className="absolute inset-0 w-full h-full object-cover animate-fadeIn"
        />
      ) : onsenState.selectedConceptUrl ? (
         <div
            className="absolute inset-0 w-full h-full bg-cover bg-center animate-fadeIn"
            style={{ backgroundImage: `url(${onsenState.selectedConceptUrl})` }}
         ></div>
      ) : (
        <video
            src={getDefaultBackgroundVideo()}
            autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Main Grid Layout */}
      <div className="relative w-full h-full p-2 sm:p-4 landscape:p-4 landscape:md:p-8 landscape:grid landscape:grid-cols-[minmax(0,_2fr)_minmax(0,_3fr)] landscape:gap-4 landscape:md:gap-8 flex flex-col portrait:flex-col portrait:pb-[140px] sm:portrait:pb-[100px]">

        {/* Top: Info Box (Portrait) / Right (Landscape) */}
        <div className="w-full flex-shrink-0 h-[20dvh] h-[20vh] portrait:h-[20dvh] portrait:h-[20vh] landscape:h-full landscape:col-start-2 landscape:row-start-1 mb-2 landscape:mb-0 z-10 overflow-hidden">
          <InfoBox
            isGeneratingImage={onsenState.isGeneratingImage}
            generatedImageUrls={onsenState.imageUrls}
            onConceptSelect={handleConceptSelect}
            isConceptSelected={!!onsenState.selectedConceptUrl}
            generatedVideoUrl={onsenState.videoUrl}
            isGeneratingVideo={onsenState.isGeneratingVideo}
            onsenDescription={onsenState.onsenDescription}
            showConfirmation={chat.waitingForConfirmation || false}
            onConfirm={handleConfirmPreferences}
            onReject={handleRejectPreferences}
            userPreferences={chat.storedPreferences}
          />
        </div>

        {/* Center: Character (Portrait) / Left (Landscape) - Takes all remaining space */}
        <div className="absolute inset-0 top-[calc(20dvh+0.5rem)] top-[calc(20vh+0.5rem)] bottom-0 p-2 sm:p-4 landscape:relative landscape:inset-auto landscape:top-auto landscape:bottom-auto landscape:col-start-1 landscape:row-start-1 landscape:h-full flex items-center justify-center z-0">
          <MionCharacter
            imageUrl="/images/TheMION.png"
            analyser={audioCtrl.analyser}
            isPlaying={audioCtrl.isPlaying}
            isLoading={isInitialLoading || chat.isLoading || onsenState.isGeneratingImage || onsenState.isGeneratingVideo}
          />
        </div>

        {/* Subtitles - Overlay on top of character */}
        <div className="absolute bottom-[100px] sm:bottom-[90px] left-0 right-0 z-40 pointer-events-none landscape:bottom-[72px] landscape:sm:bottom-[80px] portrait:bottom-[120px]">
          <Subtitles
            currentSentence={chat.currentSubtitle}
            isVisible={areSubtitlesVisible}
          />
        </div>

        {/* Action Buttons - Overlay always visible at bottom */}
        {/* CHANGED: 
            1. 'absolute' -> 'fixed' to ignore container height quirks 
            2. Added 'mb-[env(...)]' for iPhone Home Bar safety
            3. Increased z-index to 50 just to be safe
        */}
        <div className="fixed bottom-2 sm:bottom-4 right-2 sm:right-4 z-50
                        mb-[env(safe-area-inset-bottom)]
                        landscape:bottom-2 landscape:sm:bottom-4 landscape:right-2 landscape:sm:right-4">
          <ActionButtons
            onToggleChat={() => setIsChatOpen(prev => !prev)}
            isMuted={isMuted}
            onToggleMute={onToggleMute}
            areSubtitlesVisible={areSubtitlesVisible}
            onToggleSubtitles={() => setAreSubtitlesVisible(prev => !prev)}
            onStartVoiceInput={() => voiceInput.startListening()}
            isVoiceRecording={voiceInput.isRecording}
            onDownload={handleDownloadContent}
            onReturnToLanguage={handleReturnToLanguageSelection}
            onCloseMenu={handleCloseMenu}
            hasVideoGenerated={hasVideoGenerated}
          />
        </div>
      </div>

      {/* Overlays */}
      {isChatOpen && (
         <ChatBox
            characterName="Mion"
            history={chat.messages}
            currentBotMessage={chat.currentBotMessage}
            isTyping={chat.isTyping}
            isLoading={chat.isLoading || onsenState.isGeneratingImage || onsenState.isGeneratingVideo}
            onSendMessage={handleSendMessage}
            isMuted={isMuted}
            onToggleMute={onToggleMute}
            onClose={() => setIsChatOpen(false)}
            showConfirmation={chat.waitingForConfirmation || false}
            onConfirm={handleConfirmPreferences}
            onReject={handleRejectPreferences}
            generatedImageUrls={onsenState.imageUrls}
            onConceptSelect={handleConceptSelect}
            isConceptSelected={!!onsenState.selectedConceptUrl}
          />
      )}

      {voiceInput.isActive && (
        <VoiceInputUI
            transcript={voiceInput.transcript}
            isRecording={voiceInput.isRecording}
            onSend={handleVoiceSend}
            onCancel={voiceInput.stopListening}
            onTranscriptChange={voiceInput.updateTranscript}
        />
      )}

      {onsenState.error && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-red-800/90 text-white px-6 py-3 rounded-lg shadow-lg animate-fadeIn">
            <p>{onsenState.error}</p>
            <button onClick={() => setOnsenState(prev => ({...prev, error: null}))} className="absolute top-1 right-1 text-white/70 hover:text-white">&times;</button>
        </div>
      )}

    </main>
  );
};

export default MainScreen;