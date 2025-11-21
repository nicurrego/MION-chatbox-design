import { useState, useRef, useEffect, useCallback } from 'react';
import { playAudio, stopAudio } from '../utils/audioUtils';

export const useAudioController = (isMuted: boolean) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    useEffect(() => {
        if (gainNodeRef.current && audioCtxRef.current) {
            gainNodeRef.current.gain.setValueAtTime(
                isMuted ? 0 : 1, 
                audioCtxRef.current.currentTime
            );
        }
    }, [isMuted]);

    const play = useCallback((audioData: string, onComplete?: () => void) => {
        setIsPlaying(true);
        playAudio(
            audioData, 
            audioCtxRef, 
            audioSourceRef, 
            gainNodeRef, 
            analyserRef, 
            isMuted, 
            () => {
                setIsPlaying(false);
                if (onComplete) onComplete();
            }
        );
    }, [isMuted]);

    const stop = useCallback(() => {
        stopAudio(audioSourceRef);
        setIsPlaying(false);
    }, []);

    return {
        isPlaying,
        analyser: analyserRef.current,
        play,
        stop
    };
};

