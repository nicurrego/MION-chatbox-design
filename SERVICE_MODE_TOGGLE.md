# Service Mode Toggle - Implementation Guide

## Overview
Toggle between **Mock Service** and **Real API** directly from the language selection screen. No environment variables needed!

## What Changed

### 1. **New Context: `ServiceModeContext.tsx`**
   - Manages the service mode state (mock vs real)
   - Persists selection to localStorage
   - Defaults to Real API if no localStorage value exists

### 2. **Updated `services/index.ts`**
   - Changed from static service selection to dynamic selection
   - Uses `setServiceModeGetter()` to receive the current mode from the context
   - All service functions now check the mode at runtime

### 3. **Updated `LanguageSelectionScreen.tsx`**
   - Added a toggle switch below the language buttons
   - Shows "🦆 Mock Mode" or "🤖 Real API" label
   - Toggle persists across page refreshes

### 4. **Updated `App.tsx`**
   - Wrapped app with `ServiceModeProvider`
   - Sets up the service mode getter in `AppContent`
   - Ensures context is available throughout the app

## How to Use

### On the Language Selection Screen:
1. **Toggle Switch** - Click the toggle to switch between:
   - **🦆 Mock Mode** (left) - Uses pre-scripted responses and mock assets
   - **🤖 Real API** (right) - Uses Google Gemini API

2. **Persistence** - Your choice is saved to localStorage and persists across sessions

3. **Default** - Defaults to Real API mode if no selection has been made

## Benefits

✅ **No Environment Variables** - Pure UI-based toggle
✅ **Persistent** - Your choice is remembered across sessions
✅ **Runtime Switching** - Change modes instantly without restarting
✅ **Clean Setup** - No .env configuration needed

## Technical Details

### Service Mode Flow:
```
User toggles switch
    ↓
ServiceModeContext updates state
    ↓
localStorage is updated
    ↓
App.tsx calls setServiceModeGetter()
    ↓
services/index.ts uses the getter to select the right service
```

### localStorage Key:
- **Key**: `useMockService`
- **Values**: `"true"` or `"false"`

## Clearing the Setting

To reset to Real API mode (default):
```javascript
localStorage.removeItem('useMockService');
```

Then refresh the page. The app will default to Real API mode.

