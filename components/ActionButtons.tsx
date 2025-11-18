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

const MicrophoneIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);


interface ActionButtonsProps {
    onToggleChat: () => void;
    isMuted: boolean;
    onToggleMute: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onToggleChat, isMuted, onToggleMute }) => {
    return (
        <div className="absolute bottom-4 right-4 flex items-center space-x-3 z-30">
            {/* Mute Button */}
            <button
                onClick={onToggleMute}
                className="bg-black/50 text-white/70 p-3 rounded-full hover:bg-white hover:text-black transition-colors duration-300"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
                <SoundIcon isMuted={isMuted} />
            </button>
            {/* Microphone Button */}
            <button
                // onClick={} // Placeholder for future functionality
                className="bg-black/50 text-white/70 p-3 rounded-full hover:bg-white hover:text-black transition-colors duration-300"
                aria-label="Start voice input"
            >
                <MicrophoneIcon />
            </button>
             {/* Chat Button */}
            <button
                onClick={onToggleChat}
                className="bg-black/50 text-white/70 px-6 py-3 rounded-md text-xl tracking-wider hover:bg-white hover:text-black transition-colors duration-300"
                aria-label="Open chat"
            >
                CHAT
            </button>
        </div>
    );
};

export default ActionButtons;
