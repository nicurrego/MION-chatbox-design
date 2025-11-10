# Public Assets Folder

This folder is for **static assets** like images, videos, fonts, and other files that should be served directly.

## How to Use

### 1. Place your files here
```
public/
├── images/
│   ├── character.png
│   └── background.jpg
├── videos/
│   └── intro.mp4
└── fonts/
    └── custom-font.ttf
```

### 2. Reference them in your code

Files in the `public` folder are served from the root URL `/`:

```tsx
// ✅ Correct way to reference public files
<img src="/images/character.png" alt="Character" />
<video src="/videos/intro.mp4" />

// ❌ Don't include "public" in the path
<img src="/public/images/character.png" /> // Wrong!
```

### 3. In CSS or inline styles

```tsx
<div style={{ backgroundImage: 'url(/images/background.jpg)' }} />
```

## Current Usage in the App

Right now, the app uses external URLs (imgur.com) for assets:
- Character sprite: `https://i.imgur.com/wWoqIhN.jpeg`
- Background video: `https://i.imgur.com/XV1EEY6.mp4`
- Splash video: `https://i.imgur.com/Ks0Iqxp.mp4`

You can download these and place them in the `public` folder, then update the paths in:
- `components/MainScreen.tsx`
- `components/SplashScreen.tsx`
- `components/CharacterSprite.tsx`

## Example Migration

**Before:**
```tsx
<video src="https://i.imgur.com/XV1EEY6.mp4" />
```

**After:**
1. Download the video and save as `public/videos/background.mp4`
2. Update the code:
```tsx
<video src="/videos/background.mp4" />
```

