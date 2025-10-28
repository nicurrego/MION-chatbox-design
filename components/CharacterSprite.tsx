
import React from 'react';

interface CharacterSpriteProps {
  imageUrl: string;
  isThinking: boolean;
}

const CharacterSprite: React.FC<CharacterSpriteProps> = ({ imageUrl, isThinking }) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <img
        src={imageUrl}
        alt="Mion"
        className={`
          transition-all duration-500 ease-in-out
          w-full h-full object-contain
          ${isThinking ? 'transform scale-105 opacity-80' : 'transform scale-100 opacity-100'}
        `}
      />
    </div>
  );
};

export default CharacterSprite;
