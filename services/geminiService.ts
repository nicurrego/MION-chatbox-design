
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
    console.log("📤 [API] sendMessageToBot called - Mode:", DEV_MODE);
    console.log("📝 [API] Message preview:", message.substring(0, 50) + "...");

    if (DEV_MODE === 'test') {
      console.log("🌐 [API] Test mode - making real API call to Gemini...");
      try {
        const response = await chat.sendMessage({ message });
        const responseText = response.text ?? "";
        console.log("✅ [API] Response received - Length:", responseText.length, "characters");
        return responseText;
      } catch (error: any) {
        console.error("❌ [API] Error sending message to Gemini:", error);

        // Check for quota errors
        if (error?.message?.includes('429') || error?.message?.includes('quota')) {
            console.error("⚠️ [API] QUOTA EXCEEDED - Daily limit reached");
        }

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
      console.log("🧪 [API] Mock conversation - Turn:", turn);

      if (turn === 0) {
        turn++;
        console.log("🧪 [API] Mock turn 1 - Asking for medical condition");
        return "Hi, whats your medical condition?";
      }
      if (turn === 1) {
        wellbeingInfo = message;
        turn++;
        console.log("🧪 [API] Mock turn 2 - Saved wellbeing info, asking for visual preference");
        return "whats your visual preference?";
      }
      if (turn === 2) {
        turn++; // Subsequent calls will now fall through to the real AI for fast_develop
        console.log("🧪 [API] Mock turn 3 - Generating JSON response");

        if (DEV_MODE === 'Developing') {
          console.log("🧪 [API] Full development mode - returning mock JSON");
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
    console.log("🔊 [TTS] generateSpeech called - Mode:", DEV_MODE);

    // FIX: Re-ordered if/else to avoid a TypeScript error about an always-false condition when DEV_MODE is set to 'test'. The logic is functionally identical.
    if (DEV_MODE !== 'Developing') {
        if (!text.trim()) {
            console.log("ℹ️ [TTS] Empty text provided, skipping TTS");
            return null;
        }

        console.log("🌐 [TTS] Generating speech with Gemini TTS...");
        console.log("📝 [TTS] Text preview:", text.substring(0, 50) + "...");

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

            if (base64Audio) {
                console.log("✅ [TTS] Speech generated successfully");
            } else {
                console.warn("⚠️ [TTS] No audio data in response");
            }

            return base64Audio ?? null;
        } catch (error: any) {
            console.error("❌ [TTS] Error generating speech:", error);

            // Check for quota errors
            if (error?.message?.includes('429') || error?.message?.includes('quota')) {
                console.error("⚠️ [TTS] QUOTA EXCEEDED - TTS daily limit reached");
            }

            return null;
        }
    } else {
        console.log("🧪 [TTS] Development mode - skipping TTS generation");
        return null; // No speech synthesis in full developing mode
    }
};

export const generateOnsenImage = async (preferences: OnsenPreferences): Promise<string[] | null> => {
    console.log("🖼️ [IMAGE] generateOnsenImage called - Mode:", DEV_MODE);
    console.log("📋 [IMAGE] Preferences:", JSON.stringify(preferences, null, 2));

    // FIX: Re-ordered if/else to avoid a TypeScript error about an always-false condition when DEV_MODE is set to 'test'. The logic is functionally identical.
    if (DEV_MODE !== 'Developing') {
      // Real generation for 'fast_develop' and 'test'
      console.log("🌐 [IMAGE] Generating real images with Gemini...");

      // Load the base image
      console.log("📥 [IMAGE] Loading base_ofuro.png as reference image...");
      let baseImageBase64: string;
      let baseImageMimeType: string;

      try {
          const response = await fetch('/images/base_ofuro.png');
          if (!response.ok) {
              throw new Error(`Failed to fetch base image: ${response.statusText}`);
          }
          const blob = await response.blob();
          baseImageMimeType = blob.type || 'image/png';

          baseImageBase64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  const base64Result = (reader.result as string).split(',')[1];
                  resolve(base64Result);
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
          });

          console.log("✅ [IMAGE] Base image loaded successfully");
      } catch (error) {
          console.error("❌ [IMAGE] Failed to load base image:", error);
          return null;
      }

      const basePrompt = `Modify this onsen image to create a custom experience based on these preferences:
    - Atmosphere: '${preferences.aestheticProfile.atmosphere}'
    - Time of day: '${preferences.aestheticProfile.timeOfDay}' with '${preferences.aestheticProfile.colorPalette}' lighting
    - Designed for: '${preferences.wellbeingProfile.healthGoals}' and soothing '${preferences.wellbeingProfile.muscleSoreness}'

    Keep the overall onsen structure but modify the atmosphere, lighting, colors, and surrounding elements to match these preferences. The mood should be tranquil, inviting, and deeply peaceful.`;

      const variations = [
          " Show a wide angle view with modified surrounding nature and atmosphere.",
          " Focus on the water texture and steam with the new lighting and color palette.",
      ];

      console.log(`🎨 [IMAGE] Generating ${variations.length} image variations based on base_ofuro.png...`);

      const imagePromises = variations.map((variation, index) => {
          const promptWithVariation = basePrompt + variation;
          console.log(`📤 [IMAGE] Variation ${index + 1}:`, variation);
          return ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: {
                  parts: [
                      { text: promptWithVariation },
                      {
                          inlineData: {
                              mimeType: baseImageMimeType,
                              data: baseImageBase64
                          }
                      }
                  ],
              },
              config: {
                  responseModalities: [Modality.IMAGE],
              },
          });
      });

      try {
          console.log("⏳ [IMAGE] Waiting for all image generations to complete...");
          const responses = await Promise.all(imagePromises);
          console.log("✅ [IMAGE] All API calls completed");

          const imageDatas = responses.map((response, index) => {
              console.log(`🔍 [IMAGE] Processing response ${index + 1}...`);
              for (const part of response?.candidates?.[0]?.content?.parts ?? []) {
                  if (part.inlineData) {
                      console.log(`✅ [IMAGE] Found image data in response ${index + 1}`);
                      return part.inlineData.data;
                  }
              }
              console.warn(`⚠️ [IMAGE] No image data in response ${index + 1}`);
              return null;
          }).filter((data): data is string => data !== null); // Filter out any nulls

          if (imageDatas.length === 0) {
              console.error("❌ [IMAGE] No image data found in any Gemini response");
              console.error("📋 [IMAGE] Response details:", responses);
              return null;
          }

          console.log(`✅ [IMAGE] Successfully generated ${imageDatas.length} images`);
          return imageDatas;

      } catch (error: any) {
          console.error("❌ [IMAGE] Error generating onsen images:", error);

          // Check for quota errors
          if (error?.message?.includes('429') || error?.message?.includes('quota')) {
              console.error("⚠️ [IMAGE] QUOTA EXCEEDED - Image generation daily limit reached");
          }

          return null;
      }
    } else {
        console.log("🧪 [IMAGE] Development mode - using mock images");
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
