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
      console.log('🎵 [BACKGROUND MUSIC] Audio element initialized');
    }

    // Enable audio playback after 2 seconds
    console.log('⏱️ [BACKGROUND MUSIC] Starting 2-second delay...');
    const timer = setTimeout(() => {
      console.log('✅ [BACKGROUND MUSIC] 2 seconds elapsed - audio enabled');
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
        console.log('🎵 [BACKGROUND MUSIC] Waiting for 2-second delay...');
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
        console.log(`🎵 [BACKGROUND MUSIC] Stopping: ${previousTrack}`);
      }
      audio.pause();
      audio.currentTime = 0;

      // Determine if we need a 2-second silence transition
      const needsSilenceTransition =
        previousTrack === 'whirlwind' && track === 'rivulet';

      if (needsSilenceTransition) {
        console.log('⏸️ [BACKGROUND MUSIC] 2-second silence transition...');
        audio.src = '';

        // Wait 2 seconds before starting new track
        setTimeout(() => {
          if (currentTrackRef.current === 'rivulet') {
            console.log('🎵 [BACKGROUND MUSIC] Starting: Rivulet (30% volume)');
            audio.src = '/audio/Romeo - Rivulet.mp3';
            audio.load();
            audio.play()
              .then(() => console.log('✅ [BACKGROUND MUSIC] Successfully playing: Rivulet'))
              .catch(err => console.error('❌ [BACKGROUND MUSIC] Failed to play Rivulet:', err));
          }
        }, 2000);
      } else {
        // No transition needed - play immediately
        if (track === 'whirlwind') {
          console.log('🎵 [BACKGROUND MUSIC] Starting: Whirlwind of Joy (30% volume)');
          audio.src = '/audio/Gil Kita - Whirlwind of Joy.mp3';
          audio.load();
          audio.play()
            .then(() => console.log('✅ [BACKGROUND MUSIC] Successfully playing: Whirlwind of Joy'))
            .catch(err => console.error('❌ [BACKGROUND MUSIC] Failed to play Whirlwind of Joy:', err));
        } else if (track === 'rivulet') {
          console.log('🎵 [BACKGROUND MUSIC] Starting: Rivulet (30% volume)');
          audio.src = '/audio/Romeo - Rivulet.mp3';
          audio.load();
          audio.play()
            .then(() => console.log('✅ [BACKGROUND MUSIC] Successfully playing: Rivulet'))
            .catch(err => console.error('❌ [BACKGROUND MUSIC] Failed to play Rivulet:', err));
        } else {
          // track === 'none'
          console.log('🎵 [BACKGROUND MUSIC] Stopped (track set to none)');
          audio.src = '';
        }
      }
    }
  }, [track, userInteracted]);

  // Handle mute changes separately
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = isMuted;
    console.log(`🔇 [BACKGROUND MUSIC] Mute state: ${isMuted ? 'MUTED' : 'UNMUTED'}`);
  }, [isMuted]);

  // Handle volume changes based on TTS playback
  useEffect(() => {
    if (!audioRef.current) return;

    // When TTS is playing, reduce background music to 20%
    // When TTS is not playing, restore to 30%
    const newVolume = isTTSPlaying ? 0.1 : 0.3;
    audioRef.current.volume = newVolume;
    console.log(`🔊 [BACKGROUND MUSIC] Volume adjusted: ${newVolume * 100}% (TTS playing: ${isTTSPlaying})`);
  }, [isTTSPlaying]);

  return null;
};

