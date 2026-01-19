import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatMessage } from '../types';
import { generateOnsenImage, generateLoopingVideo, generateSpeech, generateOnsenDescription } from '../services';
import type { OnsenPreferences } from '../services';
import { urlToBase64 } from '../utils/imageUtils';
import { downloadAllContent } from '../utils/downloadUtils';
import { isMobileDevice, getVideoAspectRatio, getDefaultBackgroundVideo } from '../utils/deviceUtils';
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
  const [areSubtitlesVisible, setAreSubtitlesVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const [backgroundMusicTrack, setBackgroundMusicTrack] = useState<BackgroundMusicTrack>('whirlwind');

  // --- Onsen Image State ---
  const [imageState, setImageState] = useState({
    isGenerating: false,
    urls: null as string[] | null,
    selectedUrl: null as string | null,
    description: null as string | null
  });

  // --- Onsen Video State ---
  const [videoState, setVideoState] = useState({
    isGenerating: false,
    url: null as string | null,
    loadingMsg: ''
  });

  // --- Error State ---
  const [error, setError] = useState<string | null>(null);

  const hasStartedConversation = useRef(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // --- Background Music Hook ---
  useBackgroundMusic({ track: backgroundMusicTrack, isMuted, isTTSPlaying: audioCtrl.isPlaying });

  // --- Effects ---

  // Background Music Control based on app state
  useEffect(() => {
    if (videoState.url) {
      // Video is playing - stop background music (video has its own audio)
      setBackgroundMusicTrack('none');
    } else if (imageState.isGenerating || imageState.urls || videoState.isGenerating) {
      // User clicked "Create onsen" - play Rivulet
      setBackgroundMusicTrack('rivulet');
    } else {
      // Default state - play Whirlwind of Joy
      setBackgroundMusicTrack('whirlwind');
    }
  }, [videoState.url, imageState.isGenerating, imageState.urls, videoState.isGenerating]);

  // Initial Message Handling
  useEffect(() => {
    if (hasStartedConversation.current || !initialMessage) return;
    hasStartedConversation.current = true;

    if (initialAudio) {
      // Play initial audio once (don't loop)
      audioCtrl.play(initialAudio, false);
    }
    chat.runTypingEffect(initialMessage.text);
    setIsInitialLoading(false);
  }, [initialMessage, initialAudio, chat, audioCtrl]);

  // Track progress - notify parent when user has made progress
  useEffect(() => {
    const hasProgress = chat.messages.length > 0 || imageState.urls !== null || videoState.url !== null;
    onProgressChange?.(hasProgress);
  }, [chat.messages.length, imageState.urls, videoState.url, onProgressChange]);

  // Don't stop audio when typing finishes - let it play to completion
  // This applies to both real TTS and mock audio files
  // (removed the old logic that was stopping audio)

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
    setImageState(prev => ({ ...prev, isGenerating: true }));
    setError(null);
    try {
      const isMobile = isMobileDevice();

      // Generate images and description in parallel
      const [base64Array, description] = await Promise.all([
        generateOnsenImage(prefs, isMobile),
        generateOnsenDescription(prefs)
      ]);

      if (base64Array?.length) {
        const urls = base64Array.map(b64 => `data:image/png;base64,${b64}`);

        setImageState(prev => ({
          ...prev,
          urls,
          description
        }));
      }
    } catch (e) {
      console.error("Failed to generate images:", e);
      setError("Failed to generate images.");
    } finally {
      setImageState(prev => ({ ...prev, isGenerating: false }));
    }
  }, []);

  const handleSendMessage = useCallback(async (userInput: string) => {
    audioCtrl.stop();

    const result = await chat.processUserMessage(userInput);
    if (!result) return;

    // 1. Play Audio (play once, don't loop)
    if (result.audio) {
      audioCtrl.play(result.audio, false); // Don't loop - play once
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
      audioCtrl.play(result.audio, false); // Don't loop - play once
    }
    chat.runTypingEffect(result.text);
  }, [chat, audioCtrl]);

  const handleConceptSelect = useCallback(async (url: string) => {
    setImageState(prev => ({
      ...prev,
      selectedUrl: url
    }));
    setVideoState(prev => ({
      ...prev,
      isGenerating: true,
      loadingMsg: "Preparing your onsen experience..."
    }));
    setError(null);

    // Display the description in chat with TTS immediately after selection
    if (imageState.description) {
      const { generateSpeech: genSpeech } = await import('../services');
      const descriptionAudio = await genSpeech(imageState.description);

      if (descriptionAudio) {
        audioCtrl.play(descriptionAudio, false); // Don't loop - play once
      }

      chat.runTypingEffect(imageState.description);
    }

    try {
      // Start video generation
      const { base64, mimeType } = await urlToBase64(url);
      const aspectRatio = getVideoAspectRatio();
      const videoUrl = await generateLoopingVideo(base64, mimeType, aspectRatio);

      setVideoState(prev => ({
        ...prev,
        url: videoUrl
      }));
    } catch (error: any) {
      const msg = error.message?.includes("API_KEY")
        ? "API configuration error."
        : "Could not create video.";
      setError(msg);
    } finally {
      setVideoState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [imageState.description, audioCtrl, chat]);

  const handleVoiceSend = (msg: string) => {
    voiceInput.stopListening();
    handleSendMessage(msg);
  };

  const handleDownloadContent = useCallback(async () => {
    try {
      await downloadAllContent(imageState.urls, videoState.url);
    } catch (error) {
      setError('Failed to download content. Please try again.');
    }
  }, [imageState.urls, videoState.url]);

  const handleReturnToLanguageSelection = useCallback(() => {
    window.location.reload();
  }, []);

  const handleCloseMenu = useCallback(() => {
    // Menu closes automatically
  }, []);

  // --- Render Helpers ---
  const hasVideoGenerated = !!videoState.url;

  return (
    <main className="relative w-full h-dvh h-screen overflow-hidden select-none bg-black animate-fadeInMain">
      <style>{`
          @keyframes fadeInMain { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-fadeInMain { animation: fadeInMain 1s ease-in-out; }
          .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>

      {/* Background Layer */}
      {videoState.url ? (
        <video
          key={videoState.url}
          src={videoState.url}
          autoPlay loop muted={isMuted} playsInline
          className="absolute inset-0 w-full h-full object-cover animate-fadeIn"
        />
      ) : imageState.selectedUrl ? (
         <div
            className="absolute inset-0 w-full h-full bg-cover bg-center animate-fadeIn"
            style={{ backgroundImage: `url(${imageState.selectedUrl})` }}
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
            isGeneratingImage={imageState.isGenerating}
            generatedImageUrls={imageState.urls}
            onConceptSelect={handleConceptSelect}
            isConceptSelected={!!imageState.selectedUrl}
            generatedVideoUrl={videoState.url}
            isGeneratingVideo={videoState.isGenerating}
            onsenDescription={imageState.description}
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
            isLoading={isInitialLoading || chat.isLoading || imageState.isGenerating || videoState.isGenerating}
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
            isLoading={chat.isLoading || imageState.isGenerating || videoState.isGenerating}
            onSendMessage={handleSendMessage}
            isMuted={isMuted}
            onToggleMute={onToggleMute}
            onClose={() => setIsChatOpen(false)}
            showConfirmation={chat.waitingForConfirmation || false}
            onConfirm={handleConfirmPreferences}
            onReject={handleRejectPreferences}
            generatedImageUrls={imageState.urls}
            onConceptSelect={handleConceptSelect}
            isConceptSelected={!!imageState.selectedUrl}
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