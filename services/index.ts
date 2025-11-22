/**
 * ============================================================================
 * Service Selector
 * ============================================================================
 *
 * This file exports either the real Gemini service or the mock service
 * based on the VITE_DEV_MODE environment variable.
 *
 * Set VITE_DEV_MODE=true in your .env file to use mock data for development.
 */

import * as geminiService from './geminiService';
import * as mockService from './mockService';

// Re-export types from geminiService
export type { OnsenPreferences, WellbeingProfile, AestheticProfile } from './geminiService';

// Determine which service to use
const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';

if (isDevelopmentMode) {
  console.log('🦆 [DEV MODE] Using mock service with static assets');
}

// Export the appropriate service functions
export const sendMessageToBot = isDevelopmentMode
  ? mockService.sendMessageToBot
  : geminiService.sendMessageToBot;

export const generateSpeech = isDevelopmentMode
  ? mockService.generateSpeech
  : geminiService.generateSpeech;

export const generateOnsenImage = isDevelopmentMode
  ? mockService.generateOnsenImage
  : geminiService.generateOnsenImage;

export const generateLoopingVideo = isDevelopmentMode
  ? mockService.generateLoopingVideo
  : geminiService.generateLoopingVideo;

