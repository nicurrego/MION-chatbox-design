import { useState, useRef, useCallback } from 'react';
import type { SpeechRecognition } from '../types/webSpeech';

export const useVoiceInput = () => {
    const [isActive, setIsActive] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const startListening = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Sorry, your browser doesn't support speech recognition.");
            return;
        }

        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsRecording(true);
        
        recognition.onend = () => setIsRecording(false);
        
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsRecording(false);
        };

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';
            for (let i = 0; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setTranscript(finalTranscript + interimTranscript);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsActive(true);
        setTranscript('');
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsActive(false);
        setIsRecording(false);
        setTranscript('');
    }, []);

    return {
        isActive,
        isRecording,
        transcript,
        startListening,
        stopListening
    };
};

