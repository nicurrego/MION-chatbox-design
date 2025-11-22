import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatMessage } from '../types';
import { generateOnsenImage, generateLoopingVideo } from '../services/geminiService';
import type { OnsenPreferences } from '../services/geminiService';
import { urlToBase64 } from '../utils/imageUtils';

// Components
import { MionCharacter } from '../components/MionCharacter';
import ChatBox from '../components/ChatBox';
import InfoBox from '../components/InfoBox';
import Subtitles from '../components/Subtitles';
import ActionButtons from '../components/ActionButtons';
import VoiceInputUI from '../components/VoiceInputUI';
import LoadingOverlay from '../components/LoadingOverlay';

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
  // --- Custom Hooks ---
  const audioCtrl = useAudioController(isMuted);
  const voiceInput = useVoiceInput();
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
    error: null as string | null
  });

  const hasStartedConversation = useRef(false);

  // --- Effects ---

  // Initial Message Handling
  useEffect(() => {
    if (hasStartedConversation.current || !initialMessage) return;
    hasStartedConversation.current = true;

    if (initialAudio) {
      audioCtrl.play(initialAudio);
    }
    chat.runTypingEffect(initialMessage.text);
  }, [initialMessage, initialAudio, chat, audioCtrl]);

  // --- Handlers ---

  const handleSendMessage = useCallback(async (userInput: string) => {
    audioCtrl.stop();

    const result = await chat.processUserMessage(userInput);
    if (!result) return;

    // 1. Play Audio
    if (result.audio) {
      audioCtrl.play(result.audio);
    }

    // 2. Trigger Visual Typing
    chat.runTypingEffect(result.text);

    // 3. Handle Onsen Generation (if preferences found)
    if (result.preferences) {
      handleGenerateImages(result.preferences);
    }
  }, [chat, audioCtrl]);

  const handleGenerateImages = async (prefs: OnsenPreferences) => {
    setOnsenState(prev => ({ ...prev, isGeneratingImage: true, error: null }));
    try {
      console.log("🖼️ [IMAGE] Starting image generation...");
      const base64Array = await generateOnsenImage(prefs);
      if (base64Array?.length) {
        console.log(`✅ [IMAGE] Generated ${base64Array.length} images successfully`);
        const urls = base64Array.map(b64 => `data:image/png;base64,${b64}`);
        setOnsenState(prev => ({ ...prev, imageUrls: urls }));
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
  };

  const handleConceptSelect = useCallback(async (url: string) => {
    setOnsenState(prev => ({
      ...prev,
      selectedConceptUrl: url,
      isGeneratingVideo: true,
      videoLoadingMsg: "Preparing your onsen experience...",
      error: null
    }));

    try {
      const { base64, mimeType } = await urlToBase64(url);
      const videoUrl = await generateLoopingVideo(base64, mimeType);
      setOnsenState(prev => ({ ...prev, videoUrl }));
    } catch (error: any) {
      console.error("Video generation process failed:", error);
      const msg = error.message?.includes("API_KEY")
        ? "API configuration error."
        : "Could not create video.";
      setOnsenState(prev => ({ ...prev, error: msg }));
    } finally {
      setOnsenState(prev => ({ ...prev, isGeneratingVideo: false }));
    }
  }, []);

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

      <div key={`overlay-${backgroundKey}`} className="absolute inset-0 bg-blue-600/30 backdrop-blur-sm backdrop-brightness-75"></div>
      <div key={`scanlines-${backgroundKey}`} className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)', backgroundSize: '100% 4px' }}></div>

      {/* Main Grid Layout */}
      <div className="relative w-full h-full landscape:p-8 landscape:grid landscape:grid-cols-[minmax(0,_2fr)_minmax(0,_3fr)] landscape:gap-8">

        {/* Top Left: Info Box */}
        <div className="absolute top-0 left-0 right-0 h-[15vh] p-4 landscape:relative landscape:inset-auto landscape:h-auto landscape:p-0 landscape:col-start-2 landscape:row-start-1">
          <InfoBox
            isGeneratingImage={onsenState.isGeneratingImage}
            generatedImageUrls={onsenState.imageUrls}
            onConceptSelect={handleConceptSelect}
            isConceptSelected={!!onsenState.selectedConceptUrl}
            generatedVideoUrl={onsenState.videoUrl}
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
                onStartVoiceInput={voiceInput.startListening}
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
            onReadAloud={() => audioCtrl.play(chat.lastBotAudio!)}
            onStopAudio={audioCtrl.stop}
            isAudioPlaying={audioCtrl.isPlaying}
            canReadAloud={!!chat.lastBotAudio && !chat.isTyping}
            onClose={() => setIsChatOpen(false)}
          />
      )}

      {voiceInput.isActive && (
        <VoiceInputUI
            transcript={voiceInput.transcript}
            isRecording={voiceInput.isRecording}
            onSend={handleVoiceSend}
            onCancel={voiceInput.stopListening}
        />
      )}

      {onsenState.isGeneratingVideo && <LoadingOverlay message={onsenState.videoLoadingMsg} />}

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