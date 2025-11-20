/**
 * ============================================================================
 * MION Onsen Concierge - Service Selector
 * ============================================================================
 * 
 * This file allows you to easily switch between different development modes.
 * Simply change the MODE constant below to switch between:
 * 
 * - 'mock': No API calls, instant responses (fastest, no quota usage)
 * - 'dev': Mock chat + real API for images/TTS (balanced)
 * - 'prod': Full production with all real API calls (slowest, uses quota)
 * 
 * USAGE:
 * 1. Change the MODE constant below
 * 2. Save this file
 * 3. Import from 'services' in your components
 * 
 * Example:
 * import { sendMessageToBot, generateOnsenImage } from '../services';
 */

// ============================================================================
// SELECT YOUR MODE HERE
// ============================================================================

type ServiceMode = 'mock' | 'dev' | 'prod';

/**
 * 🎯 CHANGE THIS TO SWITCH MODES:
 *
 * 'mock' - Fast testing, no API calls, instant responses
 * 'dev'  - Mock chat (2 turns) + real images/TTS/video
 * 'prod' - Full production with all real API calls
 */
const MODE: ServiceMode = 'prod';

// ============================================================================
// AUTO-IMPORT BASED ON MODE
// ============================================================================

// Import all service implementations
import * as mockService from './geminiService.mock';
import * as devService from './geminiService.dev';
import * as prodService from './geminiService.prod';

// Select the service based on MODE
const service = MODE === 'mock' 
  ? mockService 
  : MODE === 'dev' 
    ? devService 
    : prodService;

// ============================================================================
// EXPORTS (Re-export from selected service)
// ============================================================================

export const sendMessageToBot = service.sendMessageToBot;
export const generateSpeech = service.generateSpeech;
export const generateOnsenImage = service.generateOnsenImage;
export const generateLoopingVideo = service.generateLoopingVideo;

// Export types
export type { 
  WellbeingProfile, 
  AestheticProfile, 
  OnsenPreferences 
} from './geminiService.prod';

// ============================================================================
// MODE INDICATOR (for debugging)
// ============================================================================

console.log(`🎯 MION Service Mode: ${MODE.toUpperCase()}`);

