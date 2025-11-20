/**
 * ============================================================================
 * MION Onsen Concierge - Gemini Service
 * ============================================================================
 *
 * This service manages all interactions with Google's Gemini AI API to create
 * personalized onsen (Japanese hot spring) experiences.
 *
 * MAIN FEATURES:
 * 1. Chat conversation with MION AI concierge
 * 2. Text-to-speech generation for bot responses
 * 3. Image generation based on user preferences
 * 4. Video generation for immersive experiences
 *
 * DEVELOPMENT MODES:
 * - 'Developing': Mock data only, no API calls (fast testing)
 * - 'fast_develop': Mock chat + real AI for JSON/images/TTS
 * - 'test': Full production mode with all real API calls
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

type DevMode = 'Developing' | 'fast_develop' | 'test';
let DEV_MODE: DevMode = 'test';

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

// ============================================================================
// CHAT INITIALIZATION
// ============================================================================

const chat: Chat = ai.chats.create({
  model: 'gemini-2.5-flash',
  config: {
    temperature: 0.3,
    systemInstruction: MION_SYSTEM_INSTRUCTION,
  },
});

// ============================================================================
// MOCK CONVERSATION STATE (for development modes)
// ============================================================================

let turn = 0;
let wellbeingInfo = "";

// ============================================================================
// 1. CHAT CONVERSATION
// ============================================================================

/**
 * Sends a message to MION and receives a response.
 *
 * FLOW:
 * - In 'test' mode: Direct API call to Gemini
 * - In 'Developing' mode: Returns mock responses (no API calls)
 * - In 'fast_develop' mode: Mock for first 2 turns, then real API
 *
 * @param message - User's message text
 * @returns Bot's response text
 */
export const sendMessageToBot = async (message: string): Promise<string> => {
  // TEST MODE: Full production behavior
  if (DEV_MODE === 'test') {
    return await sendRealMessage(message);
  }

  // DEVELOPMENT MODES: Mock conversation flow
  return await sendMockOrHybridMessage(message);
};

/**
 * Sends a real message to Gemini API.
 */
async function sendRealMessage(message: string): Promise<string> {
  try {
    const response = await chat.sendMessage({ message });
    return response.text ?? "";
  } catch (error: any) {
    return handleChatError(error);
  }
}

/**
 * Handles mock conversation flow for development modes.
 */
async function sendMockOrHybridMessage(message: string): Promise<string> {
  // End mock conversation after 3 turns in 'Developing' mode
  if (DEV_MODE === 'Developing' && turn > 2) {
    return "Mock conversation ended. To start over, please refresh the page.";
  }

  // TURN 1: Ask for wellbeing information
  if (turn === 0) {
    turn++;
    return "Hi, whats your medical condition?";
  }

  // TURN 2: Save wellbeing info and ask for aesthetic preferences
  if (turn === 1) {
    wellbeingInfo = message;
    turn++;
    return "whats your visual preference?";
  }

  // TURN 3: Generate final JSON response
  if (turn === 2) {
    turn++;

    // In 'Developing' mode: Return mock JSON
    if (DEV_MODE === 'Developing') {
      return generateMockJsonResponse();
    }

    // In 'fast_develop' mode: Call real API with combined prompt
    return await generateRealJsonResponse(message);
  }

  // AFTER TURN 3: Continue with real API in 'fast_develop' mode
  try {
    const response = await chat.sendMessage({ message });
    return response.text ?? "";
  } catch (error: any) {
    return handleChatError(error);
  }
}

/**
 * Generates a mock JSON response for development mode.
 */
function generateMockJsonResponse(): string {
  const mockPreferences: OnsenPreferences = {
    wellbeingProfile: {
      skinType: "dry",
      muscleSoreness: "shoulders",
      stressLevel: "high",
      waterTemperature: "hot",
      healthGoals: "relaxation"
    },
    aestheticProfile: {
      atmosphere: "traditional cedar wood",
      colorPalette: "warm autumn tones",
      timeOfDay: "starry night"
    }
  };

  const jsonBlock = `\`\`\`json\n${JSON.stringify(mockPreferences, null, 2)}\n\`\`\``;
  return `${jsonBlock}\n\nThank you. I have everything I need. Now, allow me to prepare a visual representation of your unique onsen. Please give me a moment.`;
}

/**
 * Generates a real JSON response by calling Gemini API with combined preferences.
 */
async function generateRealJsonResponse(aestheticInfo: string): Promise<string> {
  const combinedPrompt = `The user has provided their preferences through a shortened flow. Your task is to extract the necessary information from the details below and generate the final summary JSON block, followed by your concluding message.

User's well-being information: "${wellbeingInfo}"
- From this, infer values for skinType, muscleSoreness, stressLevel, waterTemperature, and healthGoals.

User's aesthetic preferences: "${aestheticInfo}"
- From this, infer values for atmosphere, colorPalette, and timeOfDay.

Please proceed directly to generating the JSON and the final confirmation message.`;

  try {
    const response = await chat.sendMessage({ message: combinedPrompt });
    return response.text ?? "";
  } catch (error: any) {
    return handleChatError(error);
  }
}

/**
 * Handles errors from chat API calls.
 */
function handleChatError(error: any): string {
  if (error?.message?.includes('429') || error?.message?.includes('quota')) {
    return "I apologize, but I've reached my daily conversation limit. Please try again in 24 hours.";
  }

  if (error?.message?.includes('API key')) {
    return "There seems to be an issue with the API configuration. Please check your API key.";
  }

  return "Sorry, I seem to be having trouble connecting. Please try again later.";
}

// ============================================================================
// 2. TEXT-TO-SPEECH GENERATION
// ============================================================================

/**
 * Generates speech audio from text using Gemini TTS.
 *
 * FLOW:
 * - In 'test' and 'fast_develop' modes: Calls Gemini TTS API
 * - In 'Developing' mode: Returns null (no audio)
 *
 * @param text - Text to convert to speech
 * @returns Base64-encoded audio data, or null if unavailable
 */
export const generateSpeech = async (text: string): Promise<string | null> => {
  // Skip TTS in 'Developing' mode
  if (DEV_MODE === 'Developing') {
    return null;
  }

  // Validate input
  if (!text.trim()) {
    return null;
  }

  // Generate speech using Gemini TTS
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

  } catch (error: any) {
    // Gracefully handle errors (quota exceeded, network issues, etc.)
    return null;
  }
};

// ============================================================================
// 3. IMAGE GENERATION
// ============================================================================

/**
 * Generates 4 onsen image variations based on user preferences.
 *
 * FLOW:
 * 1. Load base_ofuro.png as reference image
 * 2. Create 4 prompts with different camera angles/perspectives
 * 3. Call Gemini Image API with base image + text prompt (image-to-image)
 * 4. Extract and return base64 image data
 *
 * In 'Developing' mode: Returns 4 copies of base_ofuro.png (no API calls)
 *
 * @param preferences - User's wellbeing and aesthetic preferences
 * @returns Array of 4 base64-encoded images, or null on error
 */
export const generateOnsenImage = async (preferences: OnsenPreferences): Promise<string[] | null> => {
  // DEVELOPING MODE: Return mock images
  if (DEV_MODE === 'Developing') {
    return await loadMockImages();
  }

  // PRODUCTION MODE: Generate real images
  return await generateRealImages(preferences);
};

/**
 * Loads the base onsen image and returns 4 copies for development mode.
 */
async function loadMockImages(): Promise<string[] | null> {
  try {
    const base64Data = await loadBaseImage();
    return [base64Data, base64Data, base64Data, base64Data];
  } catch (error) {
    return null;
  }
}

/**
 * Generates 4 real image variations using Gemini Image API.
 */
async function generateRealImages(preferences: OnsenPreferences): Promise<string[] | null> {
  // STEP 1: Load base image
  let baseImageBase64: string;
  let baseImageMimeType: string;

  try {
    const result = await loadBaseImageWithMimeType();
    baseImageBase64 = result.base64;
    baseImageMimeType = result.mimeType;
  } catch (error) {
    return null;
  }

  // STEP 2: Create prompts for 4 variations
  const basePrompt = createImagePrompt(preferences);
  const variations = [
    " Show a wide angle view with modified surrounding nature and atmosphere.",
    " Focus on the water texture and steam with the new lighting and color palette.",
    " Emphasize the traditional architecture and materials with the new atmosphere.",
    " Show the view from the perspective of someone relaxing in the water with the new ambiance.",
  ];

  // STEP 3: Generate all 4 images in parallel
  const imagePromises = variations.map(variation =>
    generateSingleImage(basePrompt + variation, baseImageBase64, baseImageMimeType)
  );

  // STEP 4: Wait for all generations and extract image data
  try {
    const responses = await Promise.all(imagePromises);
    const imageDatas = responses
      .map(extractImageData)
      .filter((data): data is string => data !== null);

    return imageDatas.length > 0 ? imageDatas : null;
  } catch (error) {
    return null;
  }
}

/**
 * Loads the base onsen image and returns base64 data only.
 */
async function loadBaseImage(): Promise<string> {
  const response = await fetch('/images/base_ofuro.png');
  if (!response.ok) {
    throw new Error(`Failed to fetch base image: ${response.statusText}`);
  }

  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Result = (reader.result as string).split(',')[1];
      resolve(base64Result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Loads the base onsen image with MIME type information.
 */
async function loadBaseImageWithMimeType(): Promise<{ base64: string; mimeType: string }> {
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

/**
 * Creates the base image generation prompt from user preferences.
 */
function createImagePrompt(preferences: OnsenPreferences): string {
  return `Modify this onsen image to create a custom experience based on these preferences:
    - Atmosphere: '${preferences.aestheticProfile.atmosphere}'
    - Time of day: '${preferences.aestheticProfile.timeOfDay}' with '${preferences.aestheticProfile.colorPalette}' lighting
    - Designed for: '${preferences.wellbeingProfile.healthGoals}' and soothing '${preferences.wellbeingProfile.muscleSoreness}'

    Keep the overall onsen structure but modify the atmosphere, lighting, colors, and surrounding elements to match these preferences. The mood should be tranquil, inviting, and deeply peaceful.`;
}

/**
 * Generates a single image using Gemini Image API.
 */
async function generateSingleImage(
  prompt: string,
  baseImageBase64: string,
  mimeType: string
) {
  return ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: mimeType,
            data: baseImageBase64
          }
        }
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });
}

/**
 * Extracts base64 image data from Gemini API response.
 */
function extractImageData(response: any): string | null {
  for (const part of response?.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }
  return null;
}

// ============================================================================
// 4. VIDEO GENERATION (AI Studio Only)
// ============================================================================

/**
 * Generates a looping video from a selected onsen image using Veo API.
 *
 * FLOW:
 * 1. Initialize Gemini AI with API key
 * 2. Call Veo video generation API with image + prompt
 * 3. Poll for completion (checks every 10 seconds)
 * 4. Download generated video
 * 5. Create and return object URL for playback
 *
 * NOTE: This feature only works in Google AI Studio environment.
 * When running locally, the calling code should skip video generation.
 *
 * @param base64Image - Base64-encoded image data
 * @param mimeType - MIME type of the image (e.g., 'image/png')
 * @returns Object URL for the generated video
 * @throws Error if API key is missing or video generation fails
 */
export async function generateLoopingVideo(
  base64Image: string,
  mimeType: string,
): Promise<string> {
  // Validate API key
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  // Create new AI instance (per Veo guidelines)
  const veoAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // STEP 1: Start video generation
  const operation = await startVideoGeneration(veoAI, base64Image, mimeType);

  // STEP 2: Poll until video is ready
  const completedOperation = await pollForCompletion(veoAI, operation);

  // STEP 3: Download and return video
  return await downloadVideo(completedOperation);
}

/**
 * Starts the video generation process.
 */
async function startVideoGeneration(
  veoAI: GoogleGenAI,
  base64Image: string,
  mimeType: string
) {
  const videoPrompt = 'The camera moves gently left and right like is admiring the scene trying to catch all the details from it. The sound has to be armonious and resembling nature. Almost like a spa massage.';

  const imagePayload = {
    imageBytes: base64Image,
    mimeType: mimeType,
  };

  return await veoAI.models.generateVideos({
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
}

/**
 * Polls the video generation operation until completion.
 * Checks every 10 seconds.
 */
async function pollForCompletion(veoAI: GoogleGenAI, operation: any): Promise<any> {
  let currentOperation = operation;

  while (!currentOperation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    currentOperation = await veoAI.operations.getVideosOperation({ operation: currentOperation });
  }

  return currentOperation;
}

/**
 * Downloads the generated video and creates an object URL.
 */
async function downloadVideo(operation: any): Promise<string> {
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