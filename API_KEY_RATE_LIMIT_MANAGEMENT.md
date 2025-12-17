# API Key Rate Limit Management System

## Overview

The application now includes an **automatic API key rate limit detection and rotation system** that seamlessly switches between multiple Gemini API keys when rate limits are reached.

## Features

✅ **Automatic Rate Limit Detection** - Detects 429, 503, and quota errors
✅ **Seamless Key Rotation** - Automatically switches to the next available key
✅ **Multiple Key Support** - Supports up to 4 API keys (GEMINI_API_KEY1-4)
✅ **Intelligent Fallback** - Falls back to single API_KEY if numbered keys not found
✅ **Rate Limit Recovery** - Automatically resets rate-limited keys after 1 minute
✅ **Comprehensive Logging** - Detailed console logs for debugging

## Setup

### 1. Environment Variables (.env)

Add your API keys to `.env`:

```env
GEMINI_API_KEY1="your-first-api-key"
GEMINI_API_KEY2="your-second-api-key"
GEMINI_API_KEY3="your-third-api-key"
GEMINI_API_KEY4="your-fourth-api-key"
```

### 2. Vite Configuration

The `vite.config.ts` automatically loads all numbered API keys:

```typescript
for (let i = 1; i <= 4; i++) {
  const keyName = `GEMINI_API_KEY${i}`;
  defineEnv[`process.env.${keyName}`] = JSON.stringify(env[keyName] || '');
}
```

## How It Works

### 1. **Initialization**
- On app startup, `ApiKeyManager` loads all available API keys
- Logs the number of keys loaded

### 2. **API Calls**
- All Gemini API calls use `apiKeyManager.getCurrentKey()`
- Returns the current active key (or next available if current is rate-limited)

### 3. **Error Detection**
- When an API call fails, `apiKeyManager.reportError(error)` is called
- Checks for rate limit indicators:
  - HTTP status codes: 429, 503
  - Error messages containing: "quota", "rate limit", "too many requests"

### 4. **Key Rotation**
- After 3 consecutive failures, a key is marked as rate-limited
- Automatically rotates to the next available key
- Rate-limited keys reset after 1 minute

### 5. **Logging**
Console output shows:
```
✅ [API KEY MANAGER] Initialized with 4 API key(s)
🔄 [API KEY MANAGER] Rate limit detected on key 1 (1/3)
🔄 [API KEY MANAGER] Rotated from key 1 to key 2
📊 Key 1: 🔴 Rate Limited | Key 2: 🟢 Active | Key 3: 🟢 Active | Key 4: 🟢 Active
```

## Integration Points

### Services Updated

1. **geminiService.ts**
   - `sendMessageToBot()` - Chat messages
   - `generateSpeech()` - Text-to-speech
   - `generateOnsenDescription()` - Description generation
   - `generateOnsenImage()` - Image generation
   - `generateLoopingVideo()` - Video generation

2. **apiKeyManager.ts** (New)
   - Singleton instance managing all keys
   - Handles rate limit detection and rotation

3. **vite.config.ts**
   - Loads all numbered API keys from environment

## API Reference

### `apiKeyManager.getCurrentKey()`
Returns the current active API key.

### `apiKeyManager.reportError(error)`
Reports an error and checks for rate limits. Rotates keys if needed.

### `apiKeyManager.getStatus()`
Returns current status:
```typescript
{
  keyIndex: 2,
  totalKeys: 4,
  status: "Key 1: 🔴 Rate Limited | Key 2: 🟢 Active | ..."
}
```

### `apiKeyManager.resetAllKeys()`
Manually reset all keys (useful for testing).

## Configuration

Edit these constants in `apiKeyManager.ts`:

```typescript
RATE_LIMIT_THRESHOLD = 3;        // Failures before marking as rate limited
RATE_LIMIT_RESET_TIME = 60000;   // 1 minute in ms
RATE_LIMIT_ERROR_CODES = [429, 503];
```

## Testing

Monitor the browser console for logs:
- Look for `[API KEY MANAGER]` and `[GEMINI]` prefixed messages
- Check key rotation when rate limits are hit
- Verify automatic recovery after 1 minute

## Troubleshooting

**No API keys loaded?**
- Check `.env` file has `GEMINI_API_KEY1` through `GEMINI_API_KEY4`
- Verify vite.config.ts is loading keys correctly

**Keys not rotating?**
- Check browser console for error messages
- Verify error messages contain rate limit indicators
- Increase `RATE_LIMIT_THRESHOLD` if needed

**All keys rate limited?**
- Wait 1 minute for automatic reset
- Or manually call `apiKeyManager.resetAllKeys()`

