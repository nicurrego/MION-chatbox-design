<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🦆 MION - Your Personal Onsen Concierge

*An immersive AI chatbot experience with visual novel-style interface*

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.5--flash-4285F4?logo=google)](https://ai.google.dev/)

</div>

---

## ✨ Overview

MION is an interactive AI chatbot that guides you through creating your perfect personalized onsen (Japanese hot spring) experience. With a charming visual novel-style interface, immersive audio, and AI-generated visuals, MION provides a relaxing and engaging wellness journey.

**Perfect for:**
- 🧘 Wellness and relaxation experiences
- 🎮 Interactive storytelling and visual novel enthusiasts
- 🌍 Multi-language support (5+ languages)
- 📱 Mobile-first responsive design
- 🎨 AI-powered personalization

---

## 🌟 Key Features

### 🤖 **AI-Powered Conversations**
- **Google Gemini 2.5 Flash** integration for intelligent, context-aware responses
- MION acts as your personal onsen concierge with warm, welcoming personality
- Embodies Japanese hospitality principles (*omotenashi*)
- Structured interview process to understand your wellness needs
- Development mode with mock data for testing without API costs

### 🎮 **Visual Novel Interface**
- Retro pixel-art aesthetic with VT323 monospace font
- Animated character sprite with thinking and idle animations
- Smooth typing animation for bot messages (letter-by-letter reveal)
- Responsive design for portrait and landscape orientations
- Optimized for both mobile and desktop experiences
- Keyboard shortcuts for quick actions (hotkeys support)

### 🔊 **Text-to-Speech Integration**
- Real-time voice synthesis using **Gemini TTS** with Kore voice
- Full audio playback controls (play, pause, stop, mute/unmute)
- Auto-play option for immersive hands-free experience
- Visual indicators for audio playback status
- Subtitle display for accessibility

### 🎨 **Polished UI/UX**
- Animated welcome screen with video background
- Full-screen image viewer for onsen visualizations
- Real-time clock display
- Cyan/teal neon aesthetic with glassmorphism effects
- Smooth loading states and typing indicators
- Leave confirmation dialog to prevent accidental navigation

### 🧘 **Personalized Onsen Experience**
MION guides you through a structured interview to create your perfect hot spring experience:

1. **Well-being Profile** (5 questions)
   - Skin type and condition
   - Muscle soreness and tension areas
   - Stress level and mental state
   - Water temperature preference
   - Health and wellness goals

2. **Aesthetic Profile** (3 questions)
   - Atmosphere preference (serene, energetic, etc.)
   - Color palette preference
   - Time of day preference

3. **Personalized Output**
   - Structured JSON data with your preferences
   - AI-generated concept images of your ideal onsen
   - AI-generated video visualization of your experience

### 🌍 **Multi-Language Support**
- Full support for 5+ languages
- Seamless language switching
- Localized content and translations
- Language selection screen on startup

### 📱 **Mobile-First Design**
- Optimized for all screen sizes
- Touch-friendly interface
- Voice input support via Web Speech API
- Handles mobile browser UI (address bar, keyboard)
- Safe area support for notched devices

---

## 🚀 Quick Start

### **Prerequisites**
- **Node.js** v18 or higher
- **npm**, **yarn**, or **pnpm**
- **Google Gemini API Key** ([Get one free here](https://ai.google.dev/))

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/MION-chatbox-design.git
   cd MION-chatbox-design
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   VITE_DEV_MODE=false
   ```

   > ⚠️ **Important**: Never commit `.env.local`! It's already in `.gitignore`.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in your browser**
   ```
   http://localhost:3000
   ```

---

## 🎮 How to Use MION

### **First Time Setup**
1. **Select your language** from the welcome screen
2. **Click "Start Experience"** to begin
3. **Answer the interview questions** about your wellness needs
4. **Review your preferences** and confirm
5. **Receive your personalized onsen experience** with AI-generated visuals

### **Features During Chat**
- 🎤 **Voice Input**: Click the microphone icon to speak your responses
- 🔊 **Audio**: Click the speaker icon to hear MION's responses
- 🖼️ **Images**: Click on generated images to view them full-screen
- 📝 **Subtitles**: Toggle subtitles for accessibility
- ⌨️ **Keyboard Shortcuts**: Use hotkeys for quick actions
- 🚪 **Leave**: Click leave to exit (with confirmation)

---

## 🦆 Development Mode

MION includes a **development mode** for testing without API costs. Perfect for:
- 🎨 UI/UX development and testing
- 💰 Avoiding API quota limits
- 🌐 Working offline
- 🎬 Demonstrating features without costs

### **Enable Development Mode**

Set `VITE_DEV_MODE=true` in `.env.local`:

```bash
VITE_DEV_MODE=true
```

Restart the dev server and the app will use mock data instead of the Gemini API.

### **Feature Comparison**

| Feature | Production | Development |
|---------|-----------|-------------|
| **Chat** | Gemini AI | Pre-scripted responses |
| **Voice** | Gemini TTS | `duck_sound.mp3` |
| **Images** | AI-generated | Mock PNG files |
| **Videos** | Veo 3.1 generated | Mock MP4 files |

### **Mock Assets**

Located in `public/`:
- 🎵 **Audio**: `public/audio/duck_sound.mp3`
- 🖼️ **Images**: `public/images/cp_purple_green_bath.png`, `cp_sunlight.png`
- 🎬 **Videos**: `public/videos/cp_pg_video.mp4`, `cp_sunlight_video.mp4`

Replace these files with your own for different test scenarios.

---

## 🛠️ Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

Preview the production build locally:
```bash
npm run preview
```

---

## 📁 Project Structure

```
MION-chatbox-design/
├── components/                          # React components
│   ├── ActionButtons.tsx               # Action buttons (voice, mute, subtitles, leave)
│   ├── CharacterSprite.tsx             # Animated MION character display
│   ├── ChatBox.tsx                     # Chat input and message display
│   ├── ConfirmationButtons.tsx         # Preference confirmation UI
│   ├── InfoBox.tsx                     # Session info, clock, image selection
│   ├── LeaveConfirmationDialog.tsx     # Leave confirmation modal
│   ├── LoadingOverlay.tsx              # Loading state display
│   ├── MionCharacter.tsx               # Character sprite wrapper
│   ├── ResponsiveMediaDisplay.tsx      # Image/video display component
│   ├── Subtitles.tsx                   # Subtitle display for accessibility
│   ├── Visualizer.tsx                  # Onsen visualization component
│   └── VoiceInputUI.tsx                # Voice input interface
│
├── screens/                             # Full-screen views
│   ├── LanguageSelectionScreen.tsx     # Language selection
│   ├── MainScreen.tsx                  # Main app screen with state management
│   └── WelcomeScreen.tsx               # Animated welcome/splash screen
│
├── services/                            # API and data services
│   ├── geminiService.ts                # Google Gemini API integration
│   ├── mockService.ts                  # Mock service for development mode
│   └── index.ts                        # Service selector (real/mock)
│
├── hooks/                               # Custom React hooks
│   ├── useAudioController.ts           # Audio playback management
│   ├── useBackgroundMusic.ts           # Background music control
│   ├── useBeforeUnload.ts              # Leave confirmation logic
│   ├── useChatSession.ts               # Chat session management
│   ├── useInitialBotMessage.ts         # Initial message preloading
│   ├── useVoiceInput.ts                # Voice input handling
│   └── index.ts                        # Hook exports
│
├── utils/                               # Utility functions
│   ├── audioUtils.ts                   # Audio playback utilities
│   ├── deviceUtils.ts                  # Device detection utilities
│   ├── downloadUtils.ts                # File download utilities
│   ├── imageUtils.ts                   # Image conversion utilities
│   └── markdownParser.tsx              # Markdown parsing for chat
│
├── contexts/                            # React contexts
│   └── LanguageContext.tsx             # Multi-language support
│
├── translations/                        # Localization files
│   └── leaveConfirmationTranslations.ts # Leave dialog translations
│
├── types/                               # TypeScript type definitions
│   └── webSpeech.ts                    # Web Speech API types
│
├── config/                              # Configuration files
│   └── subtitleConfig.ts               # Subtitle configuration
│
├── public/                              # Static assets
│   ├── audio/
│   │   └── duck_sound.mp3              # Mock TTS audio
│   ├── images/
│   │   ├── base_ofuro.png              # Base onsen image
│   │   ├── TheMION.png                 # Character sprite
│   │   ├── cp_purple_green_bath.png    # Mock generated image 1
│   │   └── cp_sunlight.png             # Mock generated image 2
│   └── videos/
│       ├── looping_ofuro.mp4           # Default background video
│       ├── cp_pg_video.mp4             # Mock generated video 1
│       └── cp_sunlight_video.mp4       # Mock generated video 2
│
├── dist/                                # Production build output (generated)
├── types.ts                             # Global TypeScript types
├── App.tsx                              # Root component
├── index.tsx                            # App entry point
├── index.html                           # HTML template
├── vite.config.ts                       # Vite configuration
├── tsconfig.json                        # TypeScript configuration
├── package.json                         # Dependencies and scripts
└── .env.local                           # Environment variables (create this!)
```

---

## 🎯 How It Works

### **User Journey**

```
1. Language Selection
   ↓
2. Welcome Screen
   ↓
3. MION Greeting
   ↓
4. Well-being Interview (5 questions)
   ├─ Skin type & condition
   ├─ Muscle soreness areas
   ├─ Stress level
   ├─ Water temperature preference
   └─ Health goals
   ↓
5. Aesthetic Interview (3 questions)
   ├─ Atmosphere preference
   ├─ Color palette
   └─ Time of day
   ↓
6. Preference Confirmation
   ↓
7. Personalized Onsen Experience
   ├─ JSON output with preferences
   ├─ AI-generated concept image
   └─ AI-generated video visualization
```

### **Technical Stack**

**Frontend Framework**
- **React 19** with TypeScript for type-safe component development
- **Vite 6.2** for fast development and optimized production builds
- **Tailwind CSS** for utility-first styling

**AI & APIs**
- **Google Gemini 2.5 Flash** (`@google/genai` v1.27.0) for:
  - Intelligent conversational AI
  - Text-to-speech generation (Kore voice)
  - Image-to-image generation (onsen visualizations)
  - Video generation with Veo 3.1

**Browser APIs**
- **Web Audio API** for audio playback control
- **Web Speech API** for voice input recognition
- **Fetch API** for API communication

**Localization**
- **React Context** for multi-language support
- **Custom translation system** for 5+ languages

---

## 🎨 Customization

### **Change AI Personality**
Edit the `systemInstruction` in `services/geminiService.ts`:
```typescript
const systemInstruction = `
  You are MION, a warm and welcoming onsen concierge...
  // Customize the personality here
`;
```

### **Modify Character Sprite**
Update the image URL in `components/MainScreen.tsx`:
```typescript
const imageUrl = 'images/TheMION.png'; // Replace with your character
```

### **Adjust Typing Speed**
Change the interval in `components/MainScreen.tsx`:
```typescript
}, 50); // 50ms = faster, 100ms = slower
```

### **Change Voice**
Modify `voiceName` in `services/geminiService.ts`:
```typescript
prebuiltVoiceConfig: { voiceName: 'Kore' }
// Try: Aoede, Charon, Fenrir, Glow, Helix, Kore, Orbit, Sage
```

### **Add New Languages**
1. Create translation file in `translations/`
2. Add language to `contexts/LanguageContext.tsx`
3. Update language selection screen

---

## 🐛 Troubleshooting

### **"API_KEY environment variable not set"**
✅ **Solution:**
- Create `.env.local` with `GEMINI_API_KEY=your_key`
- Restart the dev server
- Verify the file is in the root directory

### **Audio doesn't play**
✅ **Solution:**
- Check browser console for errors
- Some browsers require user interaction first
- Try clicking the speaker icon manually
- Ensure audio files exist in `public/audio/`

### **Voice input not working**
✅ **Solution:**
- Check browser supports Web Speech API (Chrome, Edge, Safari)
- Ensure microphone permissions are granted
- Check browser console for errors

### **Text appears corrupted**
✅ **Solution:**
- Clear browser cache and refresh
- Check font loading in browser DevTools
- Verify Inter font is loaded from Google Fonts

### **Build fails**
✅ **Solution:**
- Run `npm install` to ensure dependencies are installed
- Check Node.js version is 18+: `node --version`
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`

### **Images/Videos not loading**
✅ **Solution:**
- Verify files exist in `public/` directory
- Check file paths are correct (case-sensitive on Linux/Mac)
- Ensure API key has image/video generation permissions
- Check browser console for 404 errors

---

## 🔒 Security & Best Practices

### **Environment Variables**
- ✅ API keys loaded from `.env.local` (never committed)
- ✅ `.env.local` is in `.gitignore`
- ✅ No sensitive data hardcoded in source
- ✅ Safe for public repositories

### **Deployment**
- ⚠️ **Local Development**: Use `.env.local` file
- ⚠️ **Production**: Use your hosting platform's environment variable system
  - **Render**: Set in Dashboard → Environment
  - **Vercel**: Set in Project Settings → Environment Variables
  - **Netlify**: Set in Site Settings → Build & Deploy → Environment
  - **Docker**: Pass via `docker run -e GEMINI_API_KEY=...`

### **API Key Safety**
- Never share your API key
- Rotate keys regularly
- Monitor API usage in Google Cloud Console
- Use separate keys for development and production

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **Google Gemini API** for AI, TTS, and image/video generation
- **React 19** for excellent component framework
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **Web APIs** (Web Speech, Web Audio) for browser capabilities
- Inspired by visual novel games and Japanese onsen culture

---

## 🤝 Contributing

Contributions are welcome! Please feel free to:
- Report bugs via [GitHub Issues](https://github.com/yourusername/MION-chatbox-design/issues)
- Submit feature requests
- Create pull requests with improvements

---

## 📞 Support

- 📖 **Documentation**: See this README
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/MION-chatbox-design/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/MION-chatbox-design/discussions)

---

## 🔗 Resources

- **Google Gemini API**: https://ai.google.dev/
- **React Documentation**: https://react.dev/
- **Vite Documentation**: https://vitejs.dev/
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

---

<div align="center">

## 🦆 Made with 💙 by [Nicolas Urrego Diaz]

*Enjoy your virtual onsen experience!* 🧘‍♀️♨️

**[⭐ Star this repo if you find it helpful!](https://github.com/yourusername/MION-chatbox-design)**

</div>
