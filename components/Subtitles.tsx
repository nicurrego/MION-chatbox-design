import React from 'react';

interface SubtitlesProps {
  message: string;
  isTyping: boolean;
}

const TypingIndicator: React.FC = () => (
    <span className="inline-block w-2 h-6 ml-1 bg-white animate-ping"></span>
);

const Subtitles: React.FC<SubtitlesProps> = ({ message, isTyping }) => {
  if (!message && !isTyping) {
    return null;
  }

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 text-center pointer-events-none">
        <p className="inline bg-black/60 text-white text-3xl md:text-4xl tracking-wide leading-relaxed p-2 rounded-md shadow-lg"
           style={{ textShadow: '0 0 8px rgba(0, 255, 255, 0.7)' }}>
            {message}
            {isTyping && <TypingIndicator />}
        </p>
    </div>
  );
};

export default Subtitles;
