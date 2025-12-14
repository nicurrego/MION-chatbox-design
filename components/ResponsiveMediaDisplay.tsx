import React from 'react';

interface ResponsiveMediaDisplayProps {
  imageUrls?: string[] | null;
  videoUrl?: string | null;
  selectedImageUrl?: string | null;
  onImageSelect?: (url: string) => void;
  isGeneratingImage?: boolean;
  isGeneratingVideo?: boolean;
  className?: string;
}

/**
 * ResponsiveMediaDisplay Component
 * 
 * Displays images and videos with proper aspect ratios:
 * - Mobile (portrait): 16:9 aspect ratio
 * - Desktop (landscape): Full container
 * 
 * This ensures media looks good on all devices while maintaining
 * proper proportions on mobile devices.
 */
const ResponsiveMediaDisplay: React.FC<ResponsiveMediaDisplayProps> = ({
  imageUrls,
  videoUrl,
  selectedImageUrl,
  onImageSelect,
  isGeneratingImage = false,
  isGeneratingVideo = false,
  className = ''
}) => {
  // If video is available, show it
  if (videoUrl) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {/* Mobile: 16:9 aspect ratio container */}
        <div className="portrait:aspect-video portrait:w-full portrait:mx-auto portrait:flex portrait:items-center portrait:justify-center">
          <video
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover rounded-lg"
            aria-label="Generated onsen experience video"
          />
        </div>
        
        {/* Desktop: Full container */}
        <div className="hidden landscape:block landscape:w-full landscape:h-full">
          <video
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover rounded-lg"
            aria-label="Generated onsen experience video"
          />
        </div>
      </div>
    );
  }

  // If selected image is available, show it
  if (selectedImageUrl) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {/* Mobile: 16:9 aspect ratio container */}
        <div className="portrait:aspect-video portrait:w-full portrait:mx-auto portrait:flex portrait:items-center portrait:justify-center">
          <img
            src={selectedImageUrl}
            alt="Selected onsen concept"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        
        {/* Desktop: Full container */}
        <div className="hidden landscape:block landscape:w-full landscape:h-full">
          <img
            src={selectedImageUrl}
            alt="Selected onsen concept"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    );
  }

  // If images are available for selection, show them
  if (imageUrls && imageUrls.length > 0 && !isGeneratingImage) {
    return (
      <div className={`relative w-full h-full flex flex-col gap-2 ${className}`}>
        {imageUrls.map((url, index) => (
          <button
            key={index}
            onClick={() => onImageSelect?.(url)}
            className="relative flex-1 min-h-0 overflow-hidden rounded-lg group focus:outline-none focus:ring-2 focus:ring-cyan-400/80 focus:ring-offset-1 focus:ring-offset-slate-900 transition-all duration-300 hover:ring-2 hover:ring-cyan-400/50"
            aria-label={`Select onsen concept variation ${index + 1}`}
          >
            {/* Mobile: 16:9 aspect ratio */}
            <div className="portrait:aspect-video portrait:w-full portrait:flex portrait:items-center portrait:justify-center">
              <img
                src={url}
                alt={`Onsen concept variation ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              />
            </div>
            
            {/* Desktop: Full container */}
            <div className="hidden landscape:block landscape:w-full landscape:h-full">
              <img
                src={url}
                alt={`Onsen concept variation ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              />
            </div>
            
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <span className="text-white text-xs sm:text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 px-2 sm:px-3 py-1 rounded-full">
                Concept {index + 1}
              </span>
            </div>
          </button>
        ))}
      </div>
    );
  }

  // Loading state
  if (isGeneratingImage || isGeneratingVideo) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
        <div className="text-center text-cyan-200 animate-pulse">
          <p className="text-lg font-medium">
            {isGeneratingImage ? 'Generating images...' : 'Creating your experience...'}
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      <div className="text-center text-cyan-200/70">
        <p className="text-sm">Your onsen experience will appear here</p>
      </div>
    </div>
  );
};

export default ResponsiveMediaDisplay;

