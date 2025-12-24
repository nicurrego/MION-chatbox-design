import { useEffect, useRef, useState } from 'react';

export type BackgroundMusicTrack = 'whirlwind' | 'rivulet' | 'none';

interface UseBackgroundMusicProps {
  track: BackgroundMusicTrack;
  isMuted: boolean;
  isTTSPlaying: boolean;
}

export const useBackgroundMusic = ({ track, isMuted, isTTSPlaying }: UseBackgroundMusicProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<BackgroundMusicTrack>('none');
  const [userInteracted, setUserInteracted] = useState(false);

  // Initialize audio element once and start after 2 seconds
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3; // Background music at 30% volume (default)
    }

    // Enable audio playback after 2 seconds
    const timer = setTimeout(() => {
      setUserInteracted(true);
    }, 2000);

    // Cleanup only on unmount
    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  // Handle track changes with 2-second silence transition
  useEffect(() => {
    if (!audioRef.current || !userInteracted) {
      if (!userInteracted) {
      }
      return;
    }

    const audio = audioRef.current;

    // If track changed, switch to new track
    if (track !== currentTrackRef.current) {
      const previousTrack = currentTrackRef.current;
      currentTrackRef.current = track;

      // Stop current playback
      if (previousTrack !== 'none') {
      }
      audio.pause();
      audio.currentTime = 0;

      // Determine if we need a 2-second silence transition
      const needsSilenceTransition =
        previousTrack === 'whirlwind' && track === 'rivulet';

      if (needsSilenceTransition) {
        audio.src = '';

        // Wait 2 seconds before starting new track
        setTimeout(() => {
          if (currentTrackRef.current === 'rivulet') {
            audio.src = '/audio/Romeo - Rivulet.mp3';
            audio.load();
            audio.play()
          }
        }, 2000);
      } else {
        // No transition needed - play immediately
        if (track === 'whirlwind') {
          audio.src = '/audio/Gil Kita - Whirlwind of Joy.mp3';
          audio.load();
          audio.play()
        } else if (track === 'rivulet') {
          audio.src = '/audio/Romeo - Rivulet.mp3';
          audio.load();
          audio.play()
        } else {
          // track === 'none'
          audio.src = '';
        }
      }
    }
  }, [track, userInteracted]);

  // Handle mute changes separately
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = isMuted;
  }, [isMuted]);

  // Handle volume changes based on TTS playback
  useEffect(() => {
    if (!audioRef.current) return;

    // When TTS is playing, reduce background music to 10%
    // When TTS is not playing, restore to 30%
    const newVolume = isTTSPlaying ? 0.1 : 0.3;
    audioRef.current.volume = newVolume;
  }, [isTTSPlaying]);

  return null;
};

