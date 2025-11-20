/**
 * ============================================================================
 * MION Onsen Concierge - MOCK MODE (No API Calls)
 * ============================================================================
 * 
 * This version uses NO real API calls. Perfect for:
 * - Fast local development
 * - Testing UI without consuming API quota
 * - Offline development
 * 
 * All functions return mock data instantly.
 */

import { GoogleGenAI, Chat } from "@google/genai";

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_KEY = process.env.API_KEY || "mock-api-key";
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
// MOCK CONVERSATION STATE
// ============================================================================

let turn = 0;
let wellbeingInfo = "";

// ============================================================================
// 1. CHAT CONVERSATION (MOCK)
// ============================================================================

export const sendMessageToBot = async (message: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // TURN 1: Ask for wellbeing information
  if (turn === 0) {
    turn++;
    return "Hi, whats your medical condition?";
  }
  
  // TURN 2: Ask for aesthetic preferences
  if (turn === 1) {
    wellbeingInfo = message;
    turn++;
    return "whats your visual preference?";
  }
  
  // TURN 3: Return mock JSON
  if (turn === 2) {
    turn++;
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
  
  // After turn 3
  return "Mock conversation ended. To start over, please refresh the page.";
};

// ============================================================================
// 2. TEXT-TO-SPEECH (MOCK)
// ============================================================================

export const generateSpeech = async (text: string): Promise<string | null> => {
  // No TTS in mock mode
  return null;
};

// ============================================================================
// 3. IMAGE GENERATION (MOCK)
// ============================================================================

export const generateOnsenImage = async (preferences: OnsenPreferences): Promise<string[] | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
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
    
    // Return 2 copies of the same image
    return [base64Data, base64Data];
  } catch (error) {
    return null;
  }
};

// ============================================================================
// 4. VIDEO GENERATION (MOCK)
// ============================================================================

export async function generateLoopingVideo(
  base64Image: string,
  mimeType: string,
): Promise<string> {
  throw new Error("Video generation is not available in mock mode");
}

