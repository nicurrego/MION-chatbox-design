import React from 'react';
import { parseMarkdown } from '../utils/markdownParser';

interface SubtitlesProps {
  currentSentence: string;
  isVisible: boolean;
}

const Subtitles: React.FC<SubtitlesProps> = ({ currentSentence, isVisible }) => {
  if (!currentSentence || !isVisible) {
    return null;
  }

  // Detect if text contains CJK characters (Chinese, Japanese, Korean)
  const hasCJK = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\uac00-\ud7af]/.test(currentSentence);

  return (
    <div className="absolute z-30 bottom-16 sm:bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 w-full max-w-4xl px-3 sm:px-4 text-center pointer-events-none">
        <p className={`inline-block bg-black/70 text-white tracking-wide p-2 sm:p-3 rounded-md shadow-lg ${
            hasCJK ? 'text-xl sm:text-2xl md:text-3xl leading-snug' : 'text-2xl sm:text-3xl md:text-4xl leading-relaxed'
          }`}
           style={{
               textShadow: '0 0 8px rgba(0, 255, 255, 0.7)',
               display: '-webkit-box',
               WebkitLineClamp: 4,
               WebkitBoxOrient: 'vertical',
               overflow: 'hidden',
               textOverflow: 'ellipsis',
               textAlign: 'left',
               wordBreak: hasCJK ? 'keep-all' : 'normal',
               overflowWrap: 'break-word',
            }}>
            {parseMarkdown(currentSentence)}
        </p>
    </div>
  );
};

export default Subtitles;