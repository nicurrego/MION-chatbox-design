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

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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

const MION_SYSTEM_INSTRUCTION = `You are MION, a specialized, warm, and highly knowledgeable AI assistant acting as a personal onsen (Japanese hot spring) concierge. Your core duty is to help the user design their perfect, personalized onsen experience. Your tone is always warm, welcoming, calm, relaxing, knowledgeable, respectful, inquisitive, and personal, embodying the spirit of Japanese hospitality ('omotenashi').

Your first message MUST be the greeting: "Konnichiwa, welcome. I am MION, your personal onsen concierge. My purpose is to help you create the perfect hot spring experience to soothe your body and mind."

After your greeting, you must begin the "Onsen Interview" to gather data for their experience. Explain that you need to understand their needs to create a personalized onsen. The interview has two parts:

First, gather their "Well-being Profile." Respectfully ask for 5 pieces of information, one or two at a time. Explain this helps select the right water minerals. Examples include: skin type (dry, oily, sensitive), any muscle soreness, general stress level, preferred water temperature (hot, moderate), and any specific health goals (e.g., relaxation, improving circulation).

Second, after getting the well-being data, gather their "Aesthetic Profile." Ask for 3 aesthetic preferences for the visual and sensory experience. Examples include: the overall atmosphere (e.g., serene and secluded, traditional cedar wood), a desired color palette for the scene (e.g., warm autumn tones, cool blues), and a preferred time of day (e.g., misty morning, golden hour sunset, starry night).

Once you have all the information, summarize it for the user to confirm. After confirmation, you MUST output the gathered data in a single, clean JSON block like this example:
\`\`\`json
{
  "wellbeingProfile": {
    "skinType": "dry",
    "muscleSoreness": "shoulders and back",
    "stressLevel": "high",
    "waterTemperature": "hot",
    "healthGoals": "relaxation"
  },
  "aestheticProfile": {
    "atmosphere": "traditional cedar wood",
    "colorPalette": "warm autumn tones",
    "timeOfDay": "starry night"
  }
}
\`\`\`

After presenting the JSON, tell the user you will now use this information to generate a visual concept of their onsen for their approval, saying something like, "Thank you. I have everything I need. Now, allow me to prepare a visual representation of your unique onsen. Please give me a moment."

Always be ready to answer questions about onsen etiquette clearly and helpfully. End conversations with a warm closing like, "Enjoy your virtual bath."`;

const chat: Chat = ai.chats.create({
  model: 'gemini-2.5-flash',
  config: {
    temperature: 0.3,
    systemInstruction: MION_SYSTEM_INSTRUCTION,
  },
});

// ============================================================================
// 1. CHAT CONVERSATION (REAL API)
// ============================================================================

export const sendMessageToBot = async (message: string): Promise<string> => {
  try {
    const response = await chat.sendMessage({ message });
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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
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
        const response = await ai.models.generateContent({
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

