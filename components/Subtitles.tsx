import React from 'react';

interface SubtitlesProps {
  currentSentence: string;
  isVisible: boolean;
}

const Subtitles: React.FC<SubtitlesProps> = ({ currentSentence, isVisible }) => {
  if (!currentSentence || !isVisible) {
    return null;
  }

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 text-center pointer-events-none">
        <p className="inline-block bg-black/60 text-white text-3xl md:text-4xl tracking-wide leading-relaxed p-2 rounded-md shadow-lg"
           style={{ 
               textShadow: '0 0 8px rgba(0, 255, 255, 0.7)',
               display: '-webkit-box',
               WebkitLineClamp: 4,
               WebkitBoxOrient: 'vertical',
               overflow: 'hidden',
               textOverflow: 'ellipsis',
               textAlign: 'left',
            }}>
            {currentSentence}
        </p>
    </div>
  );
};

export default Subtitles;