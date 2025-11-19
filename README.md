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

## 🌟 Features

### 🤖 **AI-Powered Conversations**
- Powered by **Google Gemini 2.5 Flash** for intelligent, context-aware responses
- MION acts as your personal onsen (Japanese hot spring) concierge
- Warm, welcoming personality embodying Japanese hospitality (*omotenashi*)

### 🎮 **Visual Novel Interface**
- Retro pixel-art aesthetic with VT323 monospace font
- Character sprite with thinking animation
- Smooth typing animation for bot messages (letter-by-letter reveal)
- Responsive design for both portrait and landscape orientations

### 🔊 **Text-to-Speech Integration**
- Real-time voice synthesis using **Gemini TTS** (Kore voice)
- Audio playback controls (play, stop, mute/unmute)
- Auto-play option for immersive experience
- Visual indicators for audio playback status

### 🎨 **Polished UI/UX**
- Animated welcome screen with video background
- Full-screen image viewer for onsen visualizations
- Real-time clock and weather display
- Cyan/teal neon aesthetic with glassmorphism effects
- Loading states and typing indicators

### 🧘 **Personalized Onsen Experience**
MION guides you through a structured interview to create your perfect hot spring experience:
1. **Well-being Profile**: Skin type, muscle soreness, stress level, water temperature, health goals
2. **Aesthetic Profile**: Atmosphere, color palette, time of day
3. **JSON Output**: Structured data for generating personalized visuals

---

## 🚀 Quick Start

### **Prerequisites**
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Google Gemini API Key** ([Get one here](https://ai.google.dev/))

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd MION-chatbox-design
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

   > ⚠️ **Important**: Never commit your `.env.local` file! It's already in `.gitignore`.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:3000`

---

## 🛠️ Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

To preview the production build locally:
```bash
npm run preview
```

---

## 📁 Project Structure

```
MION-chatbox-design/
├── components/
│   ├── ChatBox.tsx          # Main chat interface with input
│   ├── CharacterSprite.tsx  # Animated character display
│   ├── InfoBox.tsx          # Clock and weather widget
│   ├── MainScreen.tsx       # Main app screen with state management
│   └── WelcomeScreen.tsx    # Animated splash screen
├── services/
│   └── geminiService.ts     # Gemini API integration (chat + TTS)
├── utils/
│   └── audioUtils.ts        # Audio playback utilities
├── types.ts                 # TypeScript type definitions
├── App.tsx                  # Root component
├── index.tsx                # App entry point
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
└── .env.local               # Environment variables (create this!)
```

---

## 🎯 How It Works

### **Conversation Flow**
1. **Greeting**: MION introduces herself and explains her purpose
2. **Well-being Interview**: Asks 5 questions about your physical/mental state
3. **Aesthetic Interview**: Asks 3 questions about your visual preferences
4. **Confirmation**: Summarizes your responses for approval
5. **JSON Output**: Provides structured data for generating visuals
6. **Visualization**: Shows a concept image of your personalized onsen

### **Technical Architecture**
- **React 19** with TypeScript for type-safe component development
- **Vite** for fast development and optimized builds
- **Google Gemini API** for AI chat and text-to-speech
- **Tailwind CSS** for utility-first styling
- **Web Audio API** for audio playback control

---

## 🎨 Customization

### **Change AI Personality**
Edit the `systemInstruction` in `services/geminiService.ts` (lines 15-45)

### **Modify Character Sprite**
Update the `imageUrl` in `components/MainScreen.tsx` (line 160)

### **Adjust Typing Speed**
Change the interval duration in `components/MainScreen.tsx` (line 69):
```typescript
}, 50); // 50ms = faster, 100ms = slower
```

### **Change Voice**
Modify the `voiceName` in `services/geminiService.ts` (line 75):
```typescript
prebuiltVoiceConfig: { voiceName: 'Kore' }, // Try: Aoede, Charon, Fenrir, etc.
```

---

## 🐛 Troubleshooting

### **"API_KEY environment variable not set"**
- Make sure you created `.env.local` with `GEMINI_API_KEY=your_key`
- Restart the dev server after creating the file

### **"429 - Quota Exceeded" Error**
- **Cause**: You've hit the daily request limit for Gemini API (free tier)
- **Solution**:
  - Wait 24 hours for quota to reset
  - Upgrade to a paid plan at [Google AI Studio](https://ai.google.dev/)
  - The app will continue working without TTS/image generation
- **Free Tier Limits**:
  - 1,500 requests per day for text generation
  - 50 requests per day for image generation
  - 100 requests per day for TTS

### **Text appears corrupted or shows "undefined"**
- This was a font rendering issue, now fixed with improved letter spacing
- Clear browser cache and refresh

### **Audio doesn't play**
- Check browser console for errors
- Some browsers require user interaction before playing audio
- Try clicking the speaker icon to manually trigger playback
- If you see quota errors, TTS is disabled but chat still works

### **"Video generation is only available in AI Studio"**
- Video generation requires the AI Studio environment
- When running locally, you'll see static images instead
- This is expected behavior and doesn't affect core functionality

### **Build fails**
- Run `npm install` to ensure all dependencies are installed
- Check that Node.js version is 18 or higher

---

## 📊 API Usage & Quotas

### **Free Tier Limits (Gemini API)**
The free tier has daily quotas that reset every 24 hours:

| Feature | Free Tier Limit | Model Used |
|---------|----------------|------------|
| **Chat Messages** | 1,500 requests/day | `gemini-2.5-flash` |
| **Text-to-Speech** | 100 requests/day | `gemini-2.5-flash-preview-tts` |
| **Image Generation** | 50 requests/day | `gemini-2.5-flash-image` |

### **What Happens When You Hit Quota?**
- ✅ **Chat continues working** - Core conversation functionality is preserved
- ❌ **TTS is disabled** - No voice synthesis, but text still appears
- ❌ **Image generation fails** - Fallback to placeholder images
- 🔄 **Quota resets** - Wait 24 hours or upgrade your plan

### **Best Practices**
1. **Monitor your usage** at [Google AI Studio Usage Dashboard](https://ai.dev/usage?tab=rate-limit)
2. **Disable TTS during testing** - Set `DEV_MODE = 'Developing'` in `geminiService.ts`
3. **Use mock data** - Enable development mode to avoid API calls
4. **Upgrade if needed** - Consider paid plans for production use

---

## 🔒 Security Notes

- ✅ API keys are loaded from environment variables
- ✅ `.env.local` is in `.gitignore` to prevent accidental commits
- ✅ No sensitive data is hardcoded in the source
- ⚠️ Always use `.env.local` for local development
- ⚠️ For production deployment, use your hosting platform's environment variable system
- ⚠️ Never share your API key publicly or commit it to version control

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **Google Gemini** for AI and TTS capabilities
- **VT323 Font** for retro aesthetic
- **React & Vite** for excellent developer experience
- Inspired by visual novel games and Japanese onsen culture

---

## 🔗 Links

- **AI Studio**: https://ai.studio/apps/drive/1PfX6HRxdN83BGpmmqyFlJc3N3aGNye6F
- **Google Gemini API**: https://ai.google.dev/
- **Report Issues**: [GitHub Issues](your-repo-url/issues)

---

<div align="center">

**Made with 💙 by [Nicolas Urrego Diaz]**

*Enjoy your virtual onsen experience!* 🧘‍♀️♨️

</div>
