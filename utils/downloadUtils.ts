/**
 * Utility functions for downloading images and videos
 */

/**
 * Download a single image from a URL
 */
export const downloadImage = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    throw error;
  }
};

/**
 * Download a video from a URL
 */
export const downloadVideo = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    throw error;
  }
};

/**
 * Download multiple images
 */
export const downloadImages = async (urls: string[]): Promise<void> => {
  try {
    for (let i = 0; i < urls.length; i++) {
      const filename = `onsen-concept-${i + 1}.png`;
      await downloadImage(urls[i], filename);
      // Add a small delay between downloads to avoid overwhelming the browser
      if (i < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Download all generated content (images and video)
 */
export const downloadAllContent = async (
  imageUrls: string[] | null,
  videoUrl: string | null
): Promise<void> => {
  try {
    // Download images first
    if (imageUrls && imageUrls.length > 0) {
      await downloadImages(imageUrls);
    }

    // Then download video
    if (videoUrl) {
      await downloadVideo(videoUrl, 'onsen-experience.mp4');
    }
  } catch (error) {
    throw error;
  }
};

