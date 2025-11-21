// Web Speech API type definitions
// These are not included in standard DOM typings

export interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}
  
export interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}
  
export interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}
  
export interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}
  
export interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onstart: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
}

