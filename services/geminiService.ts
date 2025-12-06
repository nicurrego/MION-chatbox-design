/**
 * ============================================================================
 * MION Onsen Concierge - Gemini Service
 * ============================================================================
 *
 * This service handles all interactions with Google's Gemini AI API:
 * - Full conversation with MION AI concierge
 * - Real-time text-to-speech generation
 * - AI-powered image generation (2 variations)
 * - Video generation with Veo 3.1
 */

import { GoogleGenAI, Chat, Modality } from "@google/genai";

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_KEY = process.env.API_KEY;

// Lazy initialization to avoid errors when in dev mode
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface WellbeingProfile {
  skinType: string;
  muscleSoreness: string;
  stressLevel: string;
  waterTemperature: string;
  healthGoals: string;
}

export interface AestheticProfile {
  atmosphere: string;
  colorPalette: string;
  timeOfDay: string;
}

export interface OnsenPreferences {
  wellbeingProfile: WellbeingProfile;
  aestheticProfile: AestheticProfile;
}

// ============================================================================
// MION AI SYSTEM INSTRUCTIONS
// ============================================================================

// Store current language for the chat session
let currentLanguage: string = 'en-US';
let currentVoice: string = 'Kore';

export const setLanguageConfig = (languageCode: string, voiceName: string) => {
  currentLanguage = languageCode;
  currentVoice = voiceName;
  // Reset chat when language changes
  chat = null;
};

const getMionSystemInstruction = (languageCode: string): string => {
  const languageInstructions: Record<string, string> = {
    'es-ES': 'IMPORTANTE: Debes responder SIEMPRE en español. Todos tus mensajes deben estar completamente en español.',
    'en-US': 'IMPORTANT: You must ALWAYS respond in English. All your messages must be completely in English.',
    'ko-KR': '중요: 항상 한국어로 응답해야 합니다. 모든 메시지는 완전히 한국어로 작성되어야 합니다.',
    'ja-JP': '重要：常に日本語で応答する必要があります。すべてのメッセージは完全に日本語である必要があります。',
    'zh-CN': '重要：您必须始终用中文回复。所有消息必须完全使用中文。',
  };

  const langInstruction = languageInstructions[languageCode] || languageInstructions['en-US'];

  return `${langInstruction}

You are MION, a specialized, warm, and highly knowledgeable AI assistant acting as a personal onsen (Japanese hot spring) concierge. Your core duty is to help the user design their perfect, personalized onsen experience. Your tone is always warm, welcoming, calm, relaxing, knowledgeable, respectful, inquisitive, and personal, embodying the spirit of Japanese hospitality ('omotenashi').

Your first message MUST be a greeting in the user's language. After your greeting, you must begin the "Onsen Interview" to gather data for their experience. Explain that you need to understand their needs to create a personalized onsen. The interview has two parts:

First, gather their "Well-being Profile." Respectfully ask for information one or two questions at a time. Explain this helps select the right water minerals and temperature. Examples include: skin type (dry, oily, sensitive), any muscle soreness, general stress level, preferred water temperature (hot, moderate), and any specific health goals (e.g., relaxation, improving circulation).

Second, after getting the well-being data, gather their "Aesthetic Profile." Ask for aesthetic preferences for the visual and sensory experience. Examples include: the overall atmosphere (e.g., serene and secluded, traditional cedar wood), a desired color palette for the scene (e.g., warm autumn tones, cool blues), and a preferred time of day (e.g., misty morning, golden hour sunset, starry night).

Once you have all the information, provide a warm summary of their preferences including:
- Their well-being profile (skin type, muscle soreness, stress level, water temperature, health goals)
- Their aesthetic profile (atmosphere, color palette, time of day)

After the summary, include a hidden data block (not visible to user) with their preferences in this exact format:
[PREFERENCES_START]
skinType: ...
muscleSoreness: ...
stressLevel: ...
waterTemperature: ...
healthGoals: ...
atmosphere: ...
colorPalette: ...
timeOfDay: ...
[PREFERENCES_END]

Then ask the user if they would like to proceed with creating their onsen experience based on these preferences. Wait for their confirmation before proceeding.`;
};

// Lazy chat initialization
let chat: Chat | null = null;

const getChat = (): Chat => {
  if (!chat) {
    chat = getAI().chats.create({
      model: 'gemini-2.5-flash',
      config: {
        temperature: 0.3,
        systemInstruction: getMionSystemInstruction(currentLanguage),
      },
    });
  }
  return chat;
};

// ============================================================================
// 1. CHAT CONVERSATION (REAL API)
// ============================================================================

export const sendMessageToBot = async (message: string): Promise<string> => {
  try {
    const response = await getChat().sendMessage({ message });
    return response.text ?? "";
  } catch (error: any) {
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      return "I apologize, but I've reached my daily conversation limit. Please try again in 24 hours.";
    }

    if (error?.message?.includes('API key')) {
      return "There seems to be an issue with the API configuration. Please check your API key.";
    }

    return "Sorry, I seem to be having trouble connecting. Please try again later.";
  }
};

// ============================================================================
// 2. TEXT-TO-SPEECH (REAL API)
// ============================================================================

export const generateSpeech = async (text: string): Promise<string | null> => {
  if (!text.trim()) {
    return null;
  }

  try {
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: currentVoice },
          },
          languageCode: currentLanguage,
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio ?? null;
  } catch (error) {
    return null;
  }
};

// ============================================================================
// 2.5. ONSEN DESCRIPTION GENERATION
// ============================================================================

export const generateOnsenDescription = async (preferences: OnsenPreferences): Promise<string | null> => {
  try {
    const descriptionPrompt = `Based on these onsen preferences, create a detailed, immersive description of the personalized onsen experience. Make it vivid, sensory, and inspiring:

Well-being Profile:
- Skin Type: ${preferences.wellbeingProfile.skinType}
- Muscle Soreness: ${preferences.wellbeingProfile.muscleSoreness}
- Stress Level: ${preferences.wellbeingProfile.stressLevel}
- Water Temperature: ${preferences.wellbeingProfile.waterTemperature}
- Health Goals: ${preferences.wellbeingProfile.healthGoals}

Aesthetic Profile:
- Atmosphere: ${preferences.aestheticProfile.atmosphere}
- Color Palette: ${preferences.aestheticProfile.colorPalette}
- Time of Day: ${preferences.aestheticProfile.timeOfDay}

Write a comprehensive 4-5 paragraph description that includes:

1. **Visual & Atmospheric Description**: Describe the scene in detail - the colors, lighting, time of day, surrounding nature, and overall ambiance that matches their aesthetic preferences.

2. **Therapeutic Benefits**: Explain the health benefits based on their well-being profile. Be specific about how the water temperature, minerals, and environment address their needs.

3. **Recommended Minerals & Their Benefits**: Based on their diagnostic (skin type, muscle soreness, stress level, health goals), recommend specific minerals that should be in the onsen water and explain why each mineral is beneficial for their specific condition. Examples: sulfur for skin conditions, magnesium for muscle relaxation, calcium for stress relief, iron for circulation, etc.

4. **Sensory Experience**: Evoke the complete sensory experience - the sounds of water and nature, the scents in the air, the texture of the water, the feeling of warmth, the visual beauty.

5. **Emotional & Spiritual Impact**: Create a sense of tranquility, healing, and anticipation. Make them feel the transformative power of this personalized onsen.

Write in the current language (${currentLanguage}). Be poetic but grounded, warm but professional, and scientifically informed about the mineral benefits.`;

    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: descriptionPrompt }] }],
    });

    const description = response.candidates?.[0]?.content?.parts?.[0]?.text;
    return description ?? null;
  } catch (error) {
    console.error("Error generating onsen description:", error);
    return null;
  }
};

// ============================================================================
// 3. IMAGE GENERATION (REAL API)
// ============================================================================

export const generateOnsenImage = async (preferences: OnsenPreferences): Promise<string[] | null> => {
  try {
    // STEP 1: Load base image
    const { base64, mimeType } = await loadBaseImage();

    // STEP 2: Create prompt
    const basePrompt = `Modify this onsen image to create a custom experience based on these preferences:
    - Atmosphere: '${preferences.aestheticProfile.atmosphere}'
    - Time of day: '${preferences.aestheticProfile.timeOfDay}' with '${preferences.aestheticProfile.colorPalette}' lighting
    - Designed for: '${preferences.wellbeingProfile.healthGoals}' and soothing '${preferences.wellbeingProfile.muscleSoreness}'

    Keep the overall onsen structure but modify the atmosphere, lighting, colors, and surrounding elements to match these preferences. The mood should be tranquil, inviting, and deeply peaceful.`;

    const variations = [
      " Show a wide angle view with modified surrounding nature and atmosphere.",
      " Focus on the water texture and steam with the new lighting and color palette.",
    ];

    // STEP 3: Generate 2 images one at a time to avoid overwhelming the API
    const imageDatas: string[] = [];

    for (let i = 0; i < variations.length; i++) {
      try {
        const response = await getAI().models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { text: basePrompt + variations[i] },
              { inlineData: { mimeType, data: base64 } }
            ],
          },
          config: {
            responseModalities: [Modality.IMAGE],
          },
        });

        // Extract image data
        for (const part of response?.candidates?.[0]?.content?.parts ?? []) {
          if (part.inlineData) {
            imageDatas.push(part.inlineData.data);
            break;
          }
        }
      } catch (error: any) {
        console.error(`Error generating image variation ${i + 1}:`, error?.message || error);
        // Continue with other variations even if one fails
      }
    }

    return imageDatas.length > 0 ? imageDatas : null;
  } catch (error: any) {
    console.error('Error in generateOnsenImage:', error?.message || error);
    return null;
  }
};

async function loadBaseImage(): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch('/images/base_ofuro.png');
  if (!response.ok) {
    throw new Error(`Failed to fetch base image: ${response.statusText}`);
  }

  const blob = await response.blob();
  const mimeType = blob.type || 'image/png';

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Result = (reader.result as string).split(',')[1];
      resolve(base64Result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  return { base64, mimeType };
}

// ============================================================================
// 4. VIDEO GENERATION (REAL API - AI Studio Only)
// ============================================================================

export async function generateLoopingVideo(
  base64Image: string,
  mimeType: string,
): Promise<string> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const veoAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const videoPrompt = 'The camera moves gently left and right like is admiring the scene trying to catch all the details from it. The sound has to represent the ambient sounds of the reference and have present the water of the onsen.';

  const imagePayload = {
    imageBytes: base64Image,
    mimeType: mimeType,
  };

  let operation = await veoAI.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: videoPrompt,
    image: imagePayload,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      lastFrame: imagePayload,
      aspectRatio: '9:16'
    }
  });

  // Poll for completion (checks every 10 seconds)
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await veoAI.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

  if (!downloadLink) {
    throw new Error("Video generation succeeded, but no download link was found.");
  }

  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);

  if (!videoResponse.ok) {
    throw new Error(`Failed to download the generated video: ${videoResponse.statusText}`);
  }

  const videoBlob = await videoResponse.blob();
  return URL.createObjectURL(videoBlob);
}

