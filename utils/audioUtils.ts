
import type { MutableRefObject } from 'react';

/**
 * Decodes a base64 string into a Uint8Array.
 * @param base64 The base64 encoded string.
 * @returns A Uint8Array containing the decoded binary data.
 */
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data into an AudioBuffer for playback.
 * The Gemini API returns raw audio, not a standard file format like .wav or .mp3.
 * @param data The raw audio data as a Uint8Array.
 * @param ctx The AudioContext to use for creating the buffer.
 * @param sampleRate The sample rate of the audio (24000 for Gemini TTS).
 * @param numChannels The number of audio channels (1 for mono).
 * @returns A promise that resolves to an AudioBuffer.
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // The raw data is 16-bit PCM, so we create a Int16Array view on the buffer.
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalize the 16-bit integer to a float between -1.0 and 1.0
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Stops any currently playing audio tracked by the provided ref.
 * @param audioSourceRef A React ref to the current AudioBufferSourceNode.
 */
export const stopAudio = (
  audioSourceRef: MutableRefObject<AudioBufferSourceNode | null>
) => {
  if (audioSourceRef.current) {
    audioSourceRef.current.stop();
    audioSourceRef.current.disconnect(); // Disconnect to be safe
    audioSourceRef.current = null;
  }
};


/**
 * Plays a base64 encoded audio string using a GainNode for volume control.
 * @param base64Audio The base64 encoded audio data.
 * @param audioCtxRef A React ref to store the AudioContext instance.
 * @param audioSourceRef A React ref to store the current AudioBufferSourceNode.
 * @param gainNodeRef A React ref to store the GainNode for volume control.
 * @param isMuted The current mute state to set initial volume.
 * @param onEnded A callback function to execute when audio playback finishes.
 */
export const playAudio = async (
  base64Audio: string,
  audioCtxRef: MutableRefObject<AudioContext | null>,
  audioSourceRef: MutableRefObject<AudioBufferSourceNode | null>,
  gainNodeRef: MutableRefObject<GainNode | null>,
  isMuted: boolean,
  onEnded: () => void,
) => {
  // Ensure any previously playing audio is stopped before starting new audio.
  stopAudio(audioSourceRef);

  // Create an AudioContext if one doesn't exist.
  // The sample rate must match the audio from the API.
  if (!audioCtxRef.current) {
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000,
    });
  }
  const ctx = audioCtxRef.current;

  // Create and configure the GainNode if it doesn't exist.
  if (!gainNodeRef.current) {
    gainNodeRef.current = ctx.createGain();
    gainNodeRef.current.connect(ctx.destination);
  }
  const gainNode = gainNodeRef.current;

  // Set the initial volume based on the mute state.
  gainNode.gain.setValueAtTime(isMuted ? 0 : 1, ctx.currentTime);
  

  // Check if the AudioContext is suspended. If so, resume it.
  // This is crucial for browsers that auto-suspend audio contexts.
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  
  try {
    const decodedData = decode(base64Audio);
    const audioBuffer = await decodeAudioData(decodedData, ctx, 24000, 1);
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    // Connect the source to the GainNode, which is then connected to the destination.
    source.connect(gainNode);
    source.start();

    // Store the source so we can stop it later
    audioSourceRef.current = source;
    
    source.onended = () => {
      // Check if this source is still the active one before clearing
      if (audioSourceRef.current === source) {
        audioSourceRef.current = null;
      }
      onEnded();
    };
  } catch (error) {
    console.error("Error playing audio:", error);
    onEnded(); // Ensure state is reset even on error
  }
};
