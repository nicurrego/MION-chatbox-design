/**
 * ============================================================================
 * MION Onsen Concierge - Mock Service (Development Mode)
 * ============================================================================
 *
 * This service provides mock data for development without using the Gemini API:
 * - Pre-scripted conversation responses
 * - Static audio file (duck_sound.mp3)
 * - Pre-generated images (cp_purple_green_bath.png, cp_sunlight.png)
 * - Pre-generated videos (cp_pg_video.mp4, cp_sunlight_video.mp4)
 */

import type { OnsenPreferences } from './geminiService';

// ============================================================================
// MOCK DATA
// ============================================================================

// Store mapping of image base64 to video URL
const imageToVideoMap = new Map<string, string>();

const MOCK_RESPONSES = [
  "Konnichiwa, welcome. I am MION, your personal onsen concierge. My purpose is to help you create the perfect hot spring experience to soothe your body and mind.",
  "To create your personalized onsen experience, I need to understand your needs. Let's begin with your well-being profile. First, could you tell me about your skin type? Is it dry, oily, sensitive, or combination?",
  "Thank you. Now, do you have any muscle soreness or tension? If so, where do you feel it most?",
  "I understand. What is your current stress level? Would you say it's low, moderate, or high?",
  "Perfect. What water temperature do you prefer? Hot, warm, or moderate?",
  "Excellent. Now for the aesthetic profile. What kind of atmosphere appeals to you? For example, serene and secluded, traditional cedar wood, modern minimalist, or natural outdoor setting?",
  "Wonderful choice. What color palette would you like for your onsen scene? For example, warm autumn tones, cool blues and greens, earthy browns, or vibrant sunset colors?",
  "Beautiful. Finally, what time of day would you prefer? Misty morning, golden hour sunset, or starry night?",
  `Thank you for sharing all that information. Let me summarize what you've told me to make sure I have everything correct. Based on your preferences, here is your personalized onsen profile:

\`\`\`json
{
  "wellbeingProfile": {
    "skinType": "sensitive",
    "muscleSoreness": "shoulders and neck",
    "stressLevel": "moderate",
    "waterTemperature": "warm",
    "healthGoals": "relaxation and stress relief"
  },
  "aestheticProfile": {
    "atmosphere": "serene natural outdoor setting",
    "colorPalette": "warm sunset tones with purple accents",
    "timeOfDay": "golden hour"
  }
}
\`\`\`

Thank you. I have everything I need. Now, allow me to prepare a visual representation of your unique onsen. Please give me a moment.`,
  "I hope you enjoy your personalized onsen experience. The warm waters and beautiful surroundings should help you relax and rejuvenate. Enjoy your virtual bath."
];

let responseIndex = 0;

// ============================================================================
// HELPER: Convert file to base64
// ============================================================================

const fileToBase64 = async (filePath: string): Promise<string> => {
  try {
    const response = await fetch(filePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/mpeg;base64," or "data:image/png;base64,")
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting file to base64:', error);
    return '';
  }
};

// ============================================================================
// 1. MOCK CHAT CONVERSATION
// ============================================================================

export const sendMessageToBot = async (message: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const response = MOCK_RESPONSES[responseIndex];
  responseIndex = Math.min(responseIndex + 1, MOCK_RESPONSES.length - 1);
  
  return response;
};

// ============================================================================
// 2. MOCK TEXT-TO-SPEECH
// ============================================================================

export const generateSpeech = async (text: string): Promise<string | null> => {
  if (!text.trim()) {
    return null;
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Return a special marker to indicate this is a mock MP3 file
  // The audio player will detect this and handle it differently
  return 'MOCK_MP3:/audio/duck_sound.mp3';
};

// ============================================================================
// 3. MOCK IMAGE GENERATION
// ============================================================================

export const generateOnsenImage = async (preferences: OnsenPreferences): Promise<string[] | null> => {
  // Simulate network delay for image generation
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('🦆 [MOCK] Generating images with preferences:', preferences);

  // Convert the two pre-generated images to base64
  const image1Base64 = await fileToBase64('/images/cp_purple_green_bath.png');
  const image2Base64 = await fileToBase64('/images/cp_sunlight.png');

  // Map each image to its corresponding video
  imageToVideoMap.set(image1Base64, '/videos/cp_pg_video.mp4');
  imageToVideoMap.set(image2Base64, '/videos/cp_sunlight_video.mp4');

  console.log('🦆 [MOCK] Generated 2 images and mapped to videos');

  return [image1Base64, image2Base64];
};

// ============================================================================
// 4. MOCK VIDEO GENERATION
// ============================================================================

export const generateLoopingVideo = async (
  base64Image: string,
  mimeType: string,
): Promise<string> => {
  // Simulate network delay for video generation
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('🦆 [MOCK] Generating video for selected image');

  // Look up the video URL from our mapping
  const videoUrl = imageToVideoMap.get(base64Image);

  if (videoUrl) {
    console.log('🦆 [MOCK] Found mapped video:', videoUrl);
    return videoUrl;
  }

  // Fallback: if not found in map, return a default video
  console.log('🦆 [MOCK] No mapping found, using default video');
  return '/videos/cp_sunlight_video.mp4';
};

