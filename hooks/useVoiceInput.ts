import { useState, useRef, useCallback } from 'react';
import type { SpeechRecognition } from '../types/webSpeech';

export const useVoiceInput = (languageCode: string = 'en-US') => {
    const [isActive, setIsActive] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const baseTranscriptRef = useRef<string>(''); // Transcript from previous sessions
    const sessionTranscriptRef = useRef<string>(''); // Transcript from current session

    const startListening = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Sorry, your browser doesn't support speech recognition.");
            return;
        }

        // If already recording, stop it
        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
            // Don't save here - let stopListening() handle cleanup
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = languageCode;

        // Reset session transcript for new recording
        sessionTranscriptRef.current = '';

        recognition.onstart = () => {
            setIsRecording(true);
            if (!isActive) {
                setIsActive(true);
            }
        };

        recognition.onend = () => {
            setIsRecording(false);
            // Don't save to base here - let stopListening() handle cleanup
            // This prevents transcript accumulation on subsequent recordings
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsRecording(false);
        };

        recognition.onresult = (event: any) => {
            // Build the complete transcript from all results
            // event.results contains ALL results from the start of this recognition session
            let sessionFinalTranscript = '';
            let interimTranscript = '';

            for (let i = 0; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    sessionFinalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            // Update session transcript (this already contains all final results from this session)
            sessionTranscriptRef.current = sessionFinalTranscript;

            // Combine base (from previous sessions) + current session final + current interim
            const combinedTranscript = baseTranscriptRef.current + sessionFinalTranscript + interimTranscript;
            setTranscript(combinedTranscript);
        };

        recognition.start();
        recognitionRef.current = recognition;
    }, [languageCode, isRecording, isActive, transcript]);

    const pauseListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsActive(false);
        setIsRecording(false);
        setTranscript('');
        // Clear all transcript refs to prevent accumulation
        baseTranscriptRef.current = '';
        sessionTranscriptRef.current = '';
        console.log('🎤 [VOICE] Stopped listening - all transcripts cleared');
    }, []);

    const updateTranscript = useCallback((newTranscript: string) => {
        setTranscript(newTranscript);
        baseTranscriptRef.current = newTranscript;
        sessionTranscriptRef.current = '';
    }, []);

    return {
        isActive,
        isRecording,
        transcript,
        startListening,
        pauseListening,
        stopListening,
        updateTranscript
    };
};

