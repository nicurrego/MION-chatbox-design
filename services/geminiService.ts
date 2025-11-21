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

const getSystemInstruction = (language: string): string => {
  const languageInstructions: Record<string, string> = {
    en: `You are MION, a specialized, warm, and highly knowledgeable AI assistant acting as a personal onsen (Japanese hot spring) concierge. Your core duty is to help the user design their perfect, personalized onsen experience. Your tone is always warm, welcoming, calm, relaxing, knowledgeable, respectful, inquisitive, and personal, embodying the spirit of Japanese hospitality ('omotenashi').

IMPORTANT: Respond in ENGLISH.

Your first message MUST be the greeting: "Konnichiwa, welcome. I am MION, your personal onsen concierge. My purpose is to help you create the perfect hot spring experience to soothe your body and mind."`,

    ja: `あなたはMIONです。温泉コンシェルジュとして、ユーザーの完璧な温泉体験をデザインするお手伝いをする、専門的で温かく、非常に知識豊富なAIアシスタントです。あなたの口調は常に温かく、歓迎的で、穏やかで、リラックスしていて、知識豊富で、敬意を持ち、探究的で、個人的であり、日本のおもてなしの精神を体現しています。

重要: 日本語で応答してください。

最初のメッセージは必ず次の挨拶にしてください：「こんにちは、ようこそ。私はMION、あなた専属の温泉コンシェルジュです。心と体を癒す完璧な温泉体験を創り出すお手伝いをさせていただきます。」`,

    es: `Eres MION, un asistente de IA especializado, cálido y muy conocedor que actúa como conserje personal de onsen (aguas termales japonesas). Tu deber principal es ayudar al usuario a diseñar su experiencia onsen perfecta y personalizada. Tu tono es siempre cálido, acogedor, tranquilo, relajante, conocedor, respetuoso, inquisitivo y personal, encarnando el espíritu de la hospitalidad japonesa ('omotenashi').

IMPORTANTE: Responde en ESPAÑOL.

Tu primer mensaje DEBE ser el saludo: "Konnichiwa, bienvenido. Soy MION, tu conserje personal de onsen. Mi propósito es ayudarte a crear la experiencia perfecta de aguas termales para calmar tu cuerpo y mente."`,

    zh: `你是MION，一位专业、温暖且知识渊博的AI助手，担任个人温泉（日本温泉）礼宾员。你的核心职责是帮助用户设计完美的个性化温泉体验。你的语气始终温暖、热情、平静、放松、知识渊博、尊重、好奇且个人化，体现日本待客之道（'omotenashi'）的精神。

重要：用中文回复。

你的第一条消息必须是问候语："Konnichiwa，欢迎。我是MION，您的私人温泉礼宾员。我的目的是帮助您创造完美的温泉体验，舒缓您的身心。"`
  };

  const baseInstruction = languageInstructions[language] || languageInstructions.en;

  return `${baseInstruction}

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

After presenting the JSON, tell the user you will now use this information to generate a visual concept of their onsen for their approval.

Always be ready to answer questions about onsen etiquette clearly and helpfully. End conversations with a warm closing.`;
};

// Store chat instances per language
const chatInstances: Record<string, Chat> = {};

// ============================================================================
// 1. CHAT CONVERSATION (REAL API)
// ============================================================================

const getOrCreateChat = (language: string): Chat => {
  if (!chatInstances[language]) {
    chatInstances[language] = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        temperature: 0.3,
        systemInstruction: getSystemInstruction(language),
      },
    });
  }
  return chatInstances[language];
};

export const sendMessageToBot = async (message: string, language: string = 'en'): Promise<string> => {
  try {
    const chat = getOrCreateChat(language);
    const response = await chat.sendMessage({ message });
    return response.text ?? "";
  } catch (error: any) {
    // Error messages in the user's language
    const errorMessages: Record<string, { quota: string; apiKey: string; generic: string }> = {
      en: {
        quota: "I apologize, but I've reached my daily conversation limit. Please try again in 24 hours.",
        apiKey: "There seems to be an issue with the API configuration. Please check your API key.",
        generic: "Sorry, I seem to be having trouble connecting. Please try again later."
      },
      ja: {
        quota: "申し訳ございませんが、本日の会話制限に達しました。24時間後に再度お試しください。",
        apiKey: "API設定に問題があるようです。APIキーをご確認ください。",
        generic: "申し訳ございませんが、接続に問題が発生しています。後ほど再度お試しください。"
      },
      es: {
        quota: "Disculpa, he alcanzado mi límite diario de conversación. Por favor, inténtalo de nuevo en 24 horas.",
        apiKey: "Parece haber un problema con la configuración de la API. Por favor, verifica tu clave API.",
        generic: "Lo siento, parece que tengo problemas para conectarme. Por favor, inténtalo más tarde."
      },
      zh: {
        quota: "抱歉，我已达到今日对话限制。请在24小时后重试。",
        apiKey: "API配置似乎有问题。请检查您的API密钥。",
        generic: "抱歉，我在连接时遇到了问题。请稍后再试。"
      }
    };

    const messages = errorMessages[language] || errorMessages.en;

    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      return messages.quota;
    }

    if (error?.message?.includes('API key')) {
      return messages.apiKey;
    }

    return messages.generic;
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

  const videoPrompt = 'The camera moves gently left and right like is admiring the scene trying to catch all the details from it. The sound has to be armonious and resembling nature. Almost like a spa massage.';

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

