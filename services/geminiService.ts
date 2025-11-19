
import { GoogleGenAI, Chat, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const chat: Chat = ai.chats.create({
  model: 'gemini-2.5-flash',
  config: {
    temperature: 0.3,
    systemInstruction: `You are MION, a specialized, warm, and highly knowledgeable AI assistant acting as a personal onsen (Japanese hot spring) concierge. Your core duty is to help the user design their perfect, personalized onsen experience. Your tone is always warm, welcoming, calm, relaxing, knowledgeable, respectful, inquisitive, and personal, embodying the spirit of Japanese hospitality ('omotenashi').

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

Always be ready to answer questions about onsen etiquette clearly and helpfully. End conversations with a warm closing like, "Enjoy your virtual bath."`,
  },
});

// --- DEVELOPMENT MODES ---
type DevMode = 'Developing' | 'fast_develop' | 'test';

/**
 * Set the application's development mode.
 * a) 'Developing': No API calls. Uses mock chat for 2 turns then provides a mock JSON. Mock image is used. No speech synthesis.
 * b) 'fast_develop': Short mock chat for 2 turns, then calls the real AI to generate the JSON. Real image generation and speech synthesis are used.
 * c) 'test': Full app functionality. All calls go to the real APIs.
 */
// Fix: Use 'let' for DEV_MODE. Using 'const' would cause TypeScript to infer a narrow literal type,
// leading to a comparison error with other DevMode values. 'let' ensures the type is the broader
// union type, allowing for correct comparisons.
let DEV_MODE: DevMode = 'test';
// --------------------------

let turn = 0;
let wellbeingInfo = "";

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


export const sendMessageToBot = async (message: string): Promise<string> => {
    if (DEV_MODE === 'test') {
      try {
        const response = await chat.sendMessage({ message });
        return response.text ?? "";
      } catch (error) {
        console.error("Error sending message to Gemini:", error);
        return "Sorry, I seem to be having trouble connecting. Please try again later.";
      }
    } else {
      // FIX: Use an else block to make control flow explicit for the TypeScript type checker.
      // This prevents it from incorrectly inferring DEV_MODE as a constant 'test' type
      // in the code below, which would cause comparison errors.
      
      // Handle post-mock for 'Developing' mode
      if (DEV_MODE === 'Developing' && turn > 2) {
          return "Mock conversation ended. To start over, please refresh the page.";
      }
    
      // Mock sequence for 'Developing' and 'fast_develop'
      if (turn === 0) {
        turn++;
        return "Hi, whats your medical condition?";
      }
      if (turn === 1) {
        wellbeingInfo = message;
        turn++;
        return "whats your visual preference?";
      }
      if (turn === 2) {
        turn++; // Subsequent calls will now fall through to the real AI for fast_develop
        
        if (DEV_MODE === 'Developing') {
          const mockPreferences: OnsenPreferences = {
            wellbeingProfile: {
              skinType: "dry", muscleSoreness: "shoulders", stressLevel: "high",
              waterTemperature: "hot", healthGoals: "relaxation"
            },
            aestheticProfile: {
              atmosphere: "traditional cedar wood", colorPalette: "warm autumn tones", timeOfDay: "starry night"
            }
          };
          const jsonBlock = `\`\`\`json\n${JSON.stringify(mockPreferences, null, 2)}\n\`\`\``;
          return `${jsonBlock}\n\nThank you. I have everything I need. Now, allow me to prepare a visual representation of your unique onsen. Please give me a moment.`;
        }
        
        // This part is for 'fast_develop'
        const aestheticInfo = message;
        const combinedPrompt = `The user has provided their preferences through a shortened flow. Your task is to extract the necessary information from the details below and generate the final summary JSON block, followed by your concluding message.

User's well-being information: "${wellbeingInfo}"
- From this, infer values for skinType, muscleSoreness, stressLevel, waterTemperature, and healthGoals.

User's aesthetic preferences: "${aestheticInfo}"
- From this, infer values for atmosphere, colorPalette, and timeOfDay.

Please proceed directly to generating the JSON and the final confirmation message.`;

        try {
          const response = await chat.sendMessage({ message: combinedPrompt });
          return response.text ?? "";
        } catch (error) {
          console.error("Error sending message to Gemini:", error);
          return "Sorry, I seem to be having trouble connecting. Please try again later.";
        }
      }
    
      // Default behavior for 'fast_develop' after mock sequence is complete
      try {
        const response = await chat.sendMessage({ message });
        return response.text ?? "";
      } catch (error) {
        console.error("Error sending message to Gemini:", error);
        return "Sorry, I seem to be having trouble connecting. Please try again later.";
      }
    }
  };

export const generateSpeech = async (text: string): Promise<string | null> => {
    // FIX: Re-ordered if/else to avoid a TypeScript error about an always-false condition when DEV_MODE is set to 'test'. The logic is functionally identical.
    if (DEV_MODE !== 'Developing') {
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
        } catch (error: any) {
            // Check if it's a quota error (429)
            if (error?.message?.includes('429') || error?.message?.includes('quota')) {
                console.warn("⚠️ TTS quota exceeded. Continuing without audio.");
            } else {
                console.error("Error generating speech:", error);
            }
            return null; // Gracefully continue without audio
        }
    } else {
        return null; // No speech synthesis in full developing mode
    }
};

export const generateOnsenImage = async (preferences: OnsenPreferences): Promise<string[] | null> => {
    // FIX: Re-ordered if/else to avoid a TypeScript error about an always-false condition when DEV_MODE is set to 'test'. The logic is functionally identical.
    if (DEV_MODE !== 'Developing') {
      // Real generation for 'fast_develop' and 'test'
      const basePrompt = `Generate a visually stunning, photorealistic, portrait-aspect-ratio (9:16) image of a custom onsen experience.
    The atmosphere is serene and embodies the feeling of a '${preferences.aestheticProfile.atmosphere}'.
    The time of day is '${preferences.aestheticProfile.timeOfDay}', which casts a light palette best described as '${preferences.aestheticProfile.colorPalette}'.
    The onsen is designed for ultimate relaxation, reflecting a goal of '${preferences.wellbeingProfile.healthGoals}' and soothing '${preferences.wellbeingProfile.muscleSoreness}'.
    The overall mood should be tranquil, inviting, and deeply peaceful. Focus on high-detail, realistic textures for the water, surrounding nature, and materials.`;

      const variations = [
          " (wide angle, showing the surrounding nature)",
          " (close-up on the water texture and steam)",
          " (view focusing on the traditional architecture and materials)",
          " (a view from the perspective of someone relaxing in the water)",
      ];

      const imagePromises = variations.map(variation => {
          const promptWithVariation = basePrompt + variation;
          return ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: {
                  parts: [{ text: promptWithVariation }],
              },
              config: {
                  responseModalities: [Modality.IMAGE],
              },
          });
      });

      try {
          const responses = await Promise.all(imagePromises);
          
          const imageDatas = responses.map(response => {
              for (const part of response?.candidates?.[0]?.content?.parts ?? []) {
                  if (part.inlineData) {
                      return part.inlineData.data;
                  }
              }
              return null;
          }).filter((data): data is string => data !== null); // Filter out any nulls

          if (imageDatas.length === 0) {
              console.warn("No image data found in any Gemini response.", responses);
              return null;
          }
          
          return imageDatas;

      } catch (error: any) {
          // Check if it's a quota error (429)
          if (error?.message?.includes('429') || error?.message?.includes('quota')) {
              console.error("⚠️ Image generation quota exceeded. Please try again later or upgrade your API plan.");
          } else {
              console.error("Error generating onsen images:", error);
          }
          return null;
      }
    } else {
        console.log("Using mock images for development.");
        try {
            const response = await fetch('/images/base_ofuro.png');
            if (!response.ok) {
                throw new Error(`Failed to fetch mock image: ${response.statusText}`);
            }
            const blob = await response.blob();
            const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64Result = (reader.result as string).split(',')[1];
                    resolve(base64Result);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            // Return an array of 4 identical images for the mock.
            return [base64Data, base64Data, base64Data, base64Data];
        } catch (error) {
            console.error("Error loading mock onsen image:", error);
            return null;
        }
    }
};

export async function generateLoopingVideo(
    base64Image: string,
    mimeType: string,
): Promise<string> {
    console.log('generateLoopingVideo service started.');
    if (!process.env.API_KEY) {
        console.error("API_KEY not found in generateLoopingVideo");
        throw new Error("API_KEY environment variable not set");
    }
    // Per Veo guidelines, create a new instance right before the call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const videoPrompt = 'The camera moves gently left and right like is admiring the scene trying to catch all the details from it. The sound has to be armonious and resembling nature. Almost like a spa massage.';
    
    const imagePayload = {
        imageBytes: base64Image,
        mimeType: mimeType,
    };
    
    try {
        console.log('Calling ai.models.generateVideos with prompt:', videoPrompt);
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: videoPrompt,
            image: imagePayload,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                lastFrame: imagePayload, // To create a looping effect
                aspectRatio: '9:16' // Match our portrait view
            }
        });
        
        console.log('Initial operation response received:', operation);

        // Polling logic
        let pollCount = 0;
        while (!operation.done) {
            pollCount++;
            console.log(`Polling for video status (Attempt ${pollCount})... Operation not done yet.`);
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
            console.log(`Polling response (Attempt ${pollCount}):`, operation);
        }

        console.log('Video generation operation is done.');
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        console.log('Received download link:', downloadLink);

        if (!downloadLink) {
            throw new Error("Video generation succeeded, but no download link was found.");
        }

        console.log('Fetching video from download link...');
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        console.log('Video fetch response status:', videoResponse.status);
        if (!videoResponse.ok) {
            const errorText = await videoResponse.text();
            console.error("Video download error:", errorText);
            throw new Error(`Failed to download the generated video: ${videoResponse.statusText}`);
        }

        console.log('Creating blob from video response...');
        const videoBlob = await videoResponse.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        console.log('Created object URL for video:', videoUrl);

        return videoUrl;
    } catch (error) {
        console.error("Error calling Veo API:", error);
        throw error;
    }
}
