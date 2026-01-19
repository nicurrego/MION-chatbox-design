/**
 * Device detection utilities for responsive design
 * Handles mobile/desktop detection and orientation detection
 */

/**
 * Detects if the device is mobile based on user agent and screen size
 * @returns true if device is mobile, false otherwise
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isMobileSize = window.innerWidth < 768;
  return mobileRegex.test(userAgent.toLowerCase()) || isMobileSize;
};

/**
 * Detects if the device is in portrait orientation
 * @returns true if portrait, false if landscape
 */
export const isPortraitOrientation = (): boolean => {
  if (typeof window === 'undefined') return true;
  return window.innerHeight > window.innerWidth;
};

/**
 * Gets the appropriate video aspect ratio based on device orientation
 * @returns '9:16' for portrait, '16:9' for landscape
 */
export const getVideoAspectRatio = (): '9:16' | '16:9' => {
  return isPortraitOrientation() ? '9:16' : '16:9';
};

/**
 * Gets the appropriate background video path based on device type
 * Uses mobile-optimized video for mobile devices, standard video for desktop
 * @returns path to the background video file
 */
export const getDefaultBackgroundVideo = (): string => {
  const isMobile = isMobileDevice();
  return isMobile ? 'videos/looping_ofuro_mobile.mp4' : 'videos/looping_ofuro.mp4';
};

