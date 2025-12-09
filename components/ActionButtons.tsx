
import React from 'react';

// --- Icon Components ---

const SoundIcon: React.FC<{ isMuted: boolean }> = ({ isMuted }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {isMuted ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      )}
    </svg>
  );

const SubtitlesIcon: React.FC<{ isVisible: boolean }> = ({ isVisible }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8m-8 3h4" />
        {!isVisible && <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l16 16" />}
    </svg>
);


interface ActionButtonsProps {
    onToggleChat: () => void;
    isMuted: boolean;
    onToggleMute: () => void;
    areSubtitlesVisible: boolean;
    onToggleSubtitles: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onToggleChat, isMuted, onToggleMute, areSubtitlesVisible, onToggleSubtitles }) => {
    return (
        <div className="flex items-center justify-end space-x-2 sm:space-x-3 z-30">
            {/* Subtitles Button */}
            <div className="relative group">
                <button
                    onClick={onToggleSubtitles}
                    className="bg-black/50 text-white/70 p-3 sm:p-3 rounded-full hover:bg-white hover:text-black transition-colors duration-300 min-w-[48px] min-h-[48px] flex items-center justify-center active:scale-95"
                    aria-label={areSubtitlesVisible ? 'Hide subtitles' : 'Show subtitles'}
                >
                    <SubtitlesIcon isVisible={areSubtitlesVisible} />
                </button>
                <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-max bg-black/80 text-white text-xs sm:text-sm rounded-md px-2 py-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                    {areSubtitlesVisible ? 'Hide subtitles' : 'Show subtitles'}
                </div>
            </div>
            {/* Mute Button */}
            <div className="relative group">
                <button
                    onClick={onToggleMute}
                    className="bg-black/50 text-white/70 p-3 sm:p-3 rounded-full hover:bg-white hover:text-black transition-colors duration-300 min-w-[48px] min-h-[48px] flex items-center justify-center active:scale-95"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                    <SoundIcon isMuted={isMuted} />
                </button>
                <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-max bg-black/80 text-white text-xs sm:text-sm rounded-md px-2 py-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                    {isMuted ? 'Unmute' : 'Mute'}
                </div>
            </div>
             {/* Chat Button */}
            <button
                onClick={onToggleChat}
                className="bg-black/50 text-white/70 px-5 py-2.5 sm:px-6 sm:py-3 rounded-md text-lg sm:text-xl tracking-wider hover:bg-white hover:text-black transition-colors duration-300 min-h-[48px] flex items-center justify-center active:scale-95"
                aria-label="Open chat"
            >
                CHAT
            </button>
        </div>
    );
};

export default ActionButtons;
