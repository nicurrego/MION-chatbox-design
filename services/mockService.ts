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

// Mock responses in different languages
const MOCK_RESPONSES_BY_LANGUAGE: Record<string, string[]> = {
  'en-US': [
    "Konnichiwa, welcome. I am MION, your personal onsen concierge. My purpose is to help you create the perfect hot spring experience to soothe your body and mind.",
    "To create your personalized onsen experience, I need to understand your needs. Let's begin with your well-being profile. First, could you tell me about your skin type? Is it dry, oily, sensitive, or combination?",
    "Thank you. Now, do you have any muscle soreness or tension? If so, where do you feel it most?",
    "I understand. What is your current stress level? Would you say it's low, moderate, or high?",
    "Perfect. What water temperature do you prefer? Hot, warm, or moderate?",
    "Excellent. Now for the aesthetic profile. What kind of atmosphere appeals to you? For example, serene and secluded, traditional cedar wood, modern minimalist, or natural outdoor setting?",
    "Wonderful choice. What color palette would you like for your onsen scene? For example, warm autumn tones, cool blues and greens, earthy browns, or vibrant sunset colors?",
    "Beautiful. Finally, what time of day would you prefer? Misty morning, golden hour sunset, or starry night?",
    `Thank you for sharing all that information. Based on your preferences, here is your personalized onsen profile:\n\n\`\`\`json\n{\n  "wellbeingProfile": {\n    "skinType": "sensitive",\n    "muscleSoreness": "shoulders and neck",\n    "stressLevel": "moderate",\n    "waterTemperature": "warm",\n    "healthGoals": "relaxation and stress relief"\n  },\n  "aestheticProfile": {\n    "atmosphere": "serene natural outdoor setting",\n    "colorPalette": "warm sunset tones with purple accents",\n    "timeOfDay": "golden hour"\n  }\n}\n\`\`\`\n\nThank you. I have everything I need. Now, allow me to prepare a visual representation of your unique onsen. Please give me a moment.`,
    "I hope you enjoy your personalized onsen experience. The warm waters and beautiful surroundings should help you relax and rejuvenate. Enjoy your virtual bath."
  ],
  'es-ES': [
    "Konnichiwa, bienvenido. Soy MION, tu conserje personal de onsen. Mi propósito es ayudarte a crear la experiencia perfecta de aguas termales para calmar tu cuerpo y mente.",
    "Para crear tu experiencia personalizada de onsen, necesito entender tus necesidades. Comencemos con tu perfil de bienestar. Primero, ¿podrías decirme sobre tu tipo de piel? ¿Es seca, grasa, sensible o mixta?",
    "Gracias. Ahora, ¿tienes algún dolor o tensión muscular? Si es así, ¿dónde lo sientes más?",
    "Entiendo. ¿Cuál es tu nivel de estrés actual? ¿Dirías que es bajo, moderado o alto?",
    "Perfecto. ¿Qué temperatura de agua prefieres? ¿Caliente, tibia o moderada?",
    "Excelente. Ahora para el perfil estético. ¿Qué tipo de atmósfera te atrae? Por ejemplo, serena y aislada, madera de cedro tradicional, minimalista moderna, o entorno natural al aire libre?",
    "Maravillosa elección. ¿Qué paleta de colores te gustaría para tu escena de onsen? Por ejemplo, tonos cálidos de otoño, azules y verdes frescos, marrones terrosos, o colores vibrantes de atardecer?",
    "Hermoso. Finalmente, ¿qué momento del día preferirías? ¿Mañana brumosa, atardecer dorado, o noche estrellada?",
    `Gracias por compartir toda esa información. Basándome en tus preferencias, aquí está tu perfil personalizado de onsen:\n\n\`\`\`json\n{\n  "wellbeingProfile": {\n    "skinType": "sensitive",\n    "muscleSoreness": "shoulders and neck",\n    "stressLevel": "moderate",\n    "waterTemperature": "warm",\n    "healthGoals": "relaxation and stress relief"\n  },\n  "aestheticProfile": {\n    "atmosphere": "serene natural outdoor setting",\n    "colorPalette": "warm sunset tones with purple accents",\n    "timeOfDay": "golden hour"\n  }\n}\n\`\`\`\n\nGracias. Tengo todo lo que necesito. Ahora, permíteme preparar una representación visual de tu onsen único. Dame un momento por favor.`,
    "Espero que disfrutes tu experiencia personalizada de onsen. Las aguas cálidas y el hermoso entorno deberían ayudarte a relajarte y rejuvenecer. Disfruta tu baño virtual."
  ],
};

// Current language for mock responses
let currentMockLanguage = 'en-US';
let responseIndex = 0;

export const setMockLanguage = (languageCode: string) => {
  currentMockLanguage = languageCode;
  responseIndex = 0; // Reset response index when language changes
};

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

  const responses = MOCK_RESPONSES_BY_LANGUAGE[currentMockLanguage] || MOCK_RESPONSES_BY_LANGUAGE['en-US'];
  const response = responses[responseIndex];
  responseIndex = Math.min(responseIndex + 1, responses.length - 1);

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

