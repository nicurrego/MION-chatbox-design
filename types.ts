export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface VisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  width: number;
  height: number;
  color?: string;
}
