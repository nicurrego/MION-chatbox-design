import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatMessage } from '../types';
import { generateOnsenImage, generateLoopingVideo, generateSpeech, generateOnsenDescription } from '../services';
import type { OnsenPreferences } from '../services';
import { urlToBase64 } from '../utils/imageUtils';
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

interface MainScreenProps {
  initialMessage: ChatMessage | null;
  initialAudio: string | null;
  isMuted: boolean;
  onToggleMute: () => void;
}

const MainScreen: React.FC<MainScreenProps> = ({ initialMessage, initialAudio, isMuted, onToggleMute }) => {
  // --- Language Context ---
  const { languageConfig } = useLanguage();

  // --- Custom Hooks ---
  const audioCtrl = useAudioController(isMuted);
  const voiceInput = useVoiceInput(languageConfig?.geminiLanguageCode || 'en-US');
  const chat = useChatSession();

  // --- Local State for Visuals (Onsen/Video) ---
  const [areSubtitlesVisible, setAreSubtitlesVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  // --- Effects ---

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
  }, [initialMessage, initialAudio, chat, audioCtrl]);

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

  // Keyboard event listener for Ctrl key to toggle voice recording
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Ctrl key is pressed (both left and right)
      if (e.key === 'Control' && !e.repeat) {
        // Don't trigger if chat is open or user is typing in an input field
        const target = e.target as HTMLElement;
        if (isChatOpen || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }

        voiceInput.startListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [voiceInput, isChatOpen]);

  // --- Handlers ---

  const handleGenerateImages = useCallback(async (prefs: OnsenPreferences) => {
    // Store preferences for later use
    setCurrentPreferences(prefs);

    setOnsenState(prev => ({ ...prev, isGeneratingImage: true, error: null }));
    try {
      console.log("🖼️ [IMAGE] Starting image generation...");
      console.log("📝 [DESCRIPTION] Starting description generation in parallel...");

      // Generate images and description in parallel
      const [base64Array, description] = await Promise.all([
        generateOnsenImage(prefs),
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
      const videoUrl = await generateLoopingVideo(base64, mimeType);

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

  // --- Render Helpers ---
  const backgroundKey = onsenState.videoUrl || onsenState.selectedConceptUrl || 'default';

  return (
    <main className="relative w-full h-screen overflow-hidden select-none bg-black animate-fadeInMain">
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
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover animate-fadeIn"
        />
      ) : onsenState.selectedConceptUrl ? (
         <div
            className="absolute inset-0 w-full h-full bg-cover bg-center animate-fadeIn"
            style={{ backgroundImage: `url(${onsenState.selectedConceptUrl})` }}
         ></div>
      ) : (
        <video
            src="videos/looping_ofuro.mp4"
            autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Main Grid Layout */}
      <div className="relative w-full h-full landscape:p-8 landscape:grid landscape:grid-cols-[minmax(0,_2fr)_minmax(0,_3fr)] landscape:gap-8">

        {/* Top Left: Info Box */}
        <div className="absolute top-0 left-0 right-0 h-[15vh] p-4 landscape:relative landscape:inset-auto landscape:h-full landscape:min-h-0 landscape:p-0 landscape:col-start-2 landscape:row-start-1">
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

        {/* Center: Character */}
        <div className="absolute inset-0 top-[15vh] p-4 landscape:relative landscape:inset-auto landscape:p-0 landscape:min-h-0 landscape:col-start-1 landscape:row-start-1 flex items-center justify-center">
          <MionCharacter
            imageUrl="/images/TheMION.png"
            analyser={audioCtrl.analyser}
            isPlaying={audioCtrl.isPlaying}
          />
        </div>

        {/* Bottom: Controls & Subtitles */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-center">
            <Subtitles
                currentSentence={chat.currentSubtitle}
                isVisible={areSubtitlesVisible}
            />
             <ActionButtons
                onToggleChat={() => setIsChatOpen(prev => !prev)}
                isMuted={isMuted}
                onToggleMute={onToggleMute}
                areSubtitlesVisible={areSubtitlesVisible}
                onToggleSubtitles={() => setAreSubtitlesVisible(prev => !prev)}
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