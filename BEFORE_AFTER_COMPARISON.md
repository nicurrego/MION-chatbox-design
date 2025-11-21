# Before & After Comparison

## Code Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| MainScreen Lines | 463 | 252 | **-45%** |
| useState Calls | 15+ | 3 groups | **-80%** |
| useRef Calls | 6 | 1 | **-83%** |
| Responsibilities | 7+ | 3 | **-57%** |
| Files | 1 | 8 | Better organization |

## Responsibilities Breakdown

### Before (God Component)
MainScreen handled:
1. ❌ Audio context management
2. ❌ Speech recognition
3. ❌ Chat message processing
4. ❌ Typing effect animation
5. ❌ Subtitle synchronization
6. ❌ Onsen image generation
7. ❌ Video generation
8. ❌ UI rendering
9. ❌ Event handling

### After (Separation of Concerns)
**MainScreen** (Coordinator):
- ✅ Layout & rendering
- ✅ Event coordination
- ✅ Onsen visual state

**useAudioController** (Audio):
- ✅ Audio playback
- ✅ Volume control
- ✅ Analyser for visualizations

**useVoiceInput** (Speech):
- ✅ Speech recognition
- ✅ Transcript management

**useChatSession** (Conversation):
- ✅ Message history
- ✅ Typing effects
- ✅ Subtitle sync
- ✅ API communication

## Code Comparison

### State Management

#### Before:
```typescript
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [currentBotMessage, setCurrentBotMessage] = useState('');
const [persistentSubtitle, setPersistentSubtitle] = useState('');
const [currentSubtitle, setCurrentSubtitle] = useState('');
const [isTyping, setIsTyping] = useState(false);
const [isLoading, setIsLoading] = useState(!initialMessage);
const [lastBotAudio, setLastBotAudio] = useState<string | null>(null);
const [isAudioPlaying, setAudioPlaying] = useState(false);
const audioCtxRef = useRef<AudioContext | null>(null);
const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
const gainNodeRef = useRef<GainNode | null>(null);
const analyserRef = useRef<AnalyserNode | null>(null);
const [isVoiceInputActive, setIsVoiceInputActive] = useState(false);
const [isRecording, setIsRecording] = useState(false);
const [transcript, setTranscript] = useState('');
const recognitionRef = useRef<SpeechRecognition | null>(null);
// ... 6 more state variables
```

#### After:
```typescript
const audioCtrl = useAudioController(isMuted);
const voiceInput = useVoiceInput();
const chat = useChatSession();

const [onsenState, setOnsenState] = useState({
  isGeneratingImage: false,
  imageUrls: null as string[] | null,
  selectedConceptUrl: null as string | null,
  isGeneratingVideo: false,
  videoUrl: null as string | null,
  videoLoadingMsg: '',
  error: null as string | null
});
```

### Message Handling

#### Before (60+ lines):
```typescript
const handleSendMessage = useCallback(async (userInput: string) => {
  if (isTyping || isLoading) return;
  
  setPersistentSubtitle('');
  setCurrentSubtitle('');
  subtitleTimeoutRefs.current.forEach(clearTimeout);
  subtitleTimeoutRefs.current = [];
  stopAudio(audioSourceRef);
  setAudioPlaying(false);
  setLastBotAudio(null);

  const userMessage: ChatMessage = { sender: 'user', text: userInput };
  setMessages(prev => [...prev, userMessage]);
  setIsLoading(true);
  setCurrentBotMessage('');

  const botResponseText = await sendMessageToBot(userInput);
  
  // JSON parsing logic...
  // Image generation logic...
  // TTS generation logic...
  // Typing effect logic...
}, [isTyping, isLoading, typeMessage]);
```

#### After (21 lines):
```typescript
const handleSendMessage = useCallback(async (userInput: string) => {
  audioCtrl.stop();
  
  const result = await chat.processUserMessage(userInput);
  if (!result) return;

  if (result.audio) {
    audioCtrl.play(result.audio);
  }

  chat.runTypingEffect(result.text);

  if (result.preferences) {
    handleGenerateImages(result.preferences);
  }
}, [chat, audioCtrl]);
```

### Voice Input

#### Before (80+ lines):
```typescript
const handleStartVoiceInput = useCallback(() => {
  setPersistentSubtitle('');
  const SpeechRecognition = (window as any).SpeechRecognition || 
                            (window as any).webkitSpeechRecognition;
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
  recognition.onresult = (event) => {
    // Complex transcript handling...
  };
  recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
    setIsRecording(false);
  };
  recognition.onend = () => setIsRecording(false);
  
  recognition.start();
  recognitionRef.current = recognition;
  setIsVoiceInputActive(true);
  setTranscript('');
}, []);
```

#### After (1 line):
```typescript
onStartVoiceInput={voiceInput.startListening}
```

## Benefits Summary

### 1. **Debugging**
- **Before:** Search through 463 lines to find audio bug
- **After:** Check `useAudioController.ts` (47 lines)

### 2. **Testing**
- **Before:** Mock entire MainScreen with all dependencies
- **After:** Test individual hooks in isolation

### 3. **Reusability**
- **Before:** Copy-paste logic to new components
- **After:** Import and use hooks directly

### 4. **Onboarding**
- **Before:** New developer needs to understand entire file
- **After:** Can focus on one hook at a time

### 5. **Maintenance**
- **Before:** Changes risk breaking unrelated features
- **After:** Changes are isolated to specific hooks

## Conclusion

The refactoring successfully transformed a monolithic "God Component" into a clean, maintainable architecture following React best practices. The code is now:

- ✅ **More readable** - Clear separation of concerns
- ✅ **More testable** - Isolated, mockable hooks
- ✅ **More maintainable** - Easy to locate and fix issues
- ✅ **More reusable** - Hooks can be used elsewhere
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Production-ready** - No breaking changes, all features preserved

