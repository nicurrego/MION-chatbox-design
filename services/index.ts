/**
 * ============================================================================
 * Service Selector
 * ============================================================================
 *
 * This file exports either the real Gemini service or the mock service
 * based on the ServiceModeContext (which can be toggled via UI).
 *
 * The service mode is controlled by the toggle switch on the language selection screen.
 */

import * as geminiService from './geminiService';
import * as mockService from './mockService';

// Re-export types from geminiService
export type { OnsenPreferences, WellbeingProfile, AestheticProfile } from './geminiService';

// Helper function to get the current service mode
// This will be called dynamically to check the context value
let getServiceMode = () => {
  // Default to Real API (false)
  return false;
};

// Allow setting the service mode getter (called by App.tsx)
export const setServiceModeGetter = (getter: () => boolean) => {
  getServiceMode = getter;
};

// Wrapper functions that dynamically select the service
export const sendMessageToBot = async (message: string): Promise<string> => {
  const isDev = getServiceMode();
  return isDev
    ? mockService.sendMessageToBot(message)
    : geminiService.sendMessageToBot(message);
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  const isDev = getServiceMode();
  return isDev
    ? mockService.generateSpeech(text)
    : geminiService.generateSpeech(text);
};

export const generateOnsenDescription = async (preferences: any): Promise<string | null> => {
  const isDev = getServiceMode();
  return isDev
    ? mockService.generateOnsenDescription(preferences)
    : geminiService.generateOnsenDescription(preferences);
};

export const generateOnsenImage = async (preferences: any, isMobile?: boolean): Promise<string[] | null> => {
  const isDev = getServiceMode();
  return isDev
    ? mockService.generateOnsenImage(preferences, isMobile)
    : geminiService.generateOnsenImage(preferences, isMobile);
};

export const generateLoopingVideo = async (
  base64Image: string,
  mimeType: string,
  aspectRatio?: '9:16' | '16:9'
): Promise<string> => {
  const isDev = getServiceMode();
  return isDev
    ? mockService.generateLoopingVideo(base64Image, mimeType, aspectRatio)
    : geminiService.generateLoopingVideo(base64Image, mimeType, aspectRatio);
};

// Export language configuration
export const setLanguageConfig = (languageCode: string, voiceName: string) => {
  const isDev = getServiceMode();
  if (isDev) {
    mockService.setMockLanguage(languageCode);
  } else {
    geminiService.setLanguageConfig(languageCode, voiceName);
  }
};

