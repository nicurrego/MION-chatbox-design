/**
 * ============================================================================
 * API Key Manager - Rate Limit Detection & Key Rotation
 * ============================================================================
 *
 * This service manages multiple Gemini API keys and automatically rotates
 * to the next key when rate limits are detected.
 */

interface ApiKeyStatus {
  key: string;
  isRateLimited: boolean;
  lastChecked: number;
  failureCount: number;
}

class ApiKeyManager {
  private apiKeys: ApiKeyStatus[] = [];
  private currentKeyIndex: number = 0;
  private readonly RATE_LIMIT_THRESHOLD = 3; // Failures before marking as rate limited
  private readonly RATE_LIMIT_RESET_TIME = 60000; // 1 minute in ms
  private readonly RATE_LIMIT_ERROR_CODES = [429, 503]; // HTTP status codes for rate limits

  constructor() {
    this.initializeApiKeys();
  }

  private initializeApiKeys(): void {
    // Load all API keys from environment variables
    const keys: string[] = [];
    
    // Try to load GEMINI_API_KEY_1 through GEMINI_API_KEY_4
    for (let i = 1; i <= 4; i++) {
      const key = (process.env as any)[`GEMINI_API_KEY${i}`];
      if (key) {
        keys.push(key);
      }
    }

    // Fallback to single API_KEY if no numbered keys found
    if (keys.length === 0) {
      const singleKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (singleKey) {
        keys.push(singleKey);
      }
    }

    if (keys.length === 0) {
      console.warn('⚠️ [API KEY MANAGER] No API keys found in environment variables');
    }

    this.apiKeys = keys.map(key => ({
      key,
      isRateLimited: false,
      lastChecked: 0,
      failureCount: 0,
    }));

    console.log(`✅ [API KEY MANAGER] Initialized with ${this.apiKeys.length} API key(s)`);
  }

  /**
   * Get the current active API key
   */
  public getCurrentKey(): string {
    if (this.apiKeys.length === 0) {
      throw new Error('No API keys available');
    }

    const currentKey = this.apiKeys[this.currentKeyIndex];
    
    // Check if current key's rate limit has expired
    if (currentKey.isRateLimited) {
      const timeSinceLastCheck = Date.now() - currentKey.lastChecked;
      if (timeSinceLastCheck > this.RATE_LIMIT_RESET_TIME) {
        console.log(`🔄 [API KEY MANAGER] Resetting rate limit for key ${this.currentKeyIndex + 1}`);
        currentKey.isRateLimited = false;
        currentKey.failureCount = 0;
      }
    }

    return currentKey.key;
  }

  /**
   * Report an API error and potentially rotate to next key
   */
  public reportError(error: any): void {
    if (this.apiKeys.length === 0) return;

    const currentKey = this.apiKeys[this.currentKeyIndex];
    const errorMessage = error?.message || String(error);
    const statusCode = error?.status || error?.statusCode;

    // Check if this is a rate limit error
    const isRateLimitError = 
      this.RATE_LIMIT_ERROR_CODES.includes(statusCode) ||
      errorMessage.includes('429') ||
      errorMessage.includes('quota') ||
      errorMessage.includes('rate limit') ||
      errorMessage.toLowerCase().includes('too many requests');

    if (isRateLimitError) {
      currentKey.failureCount++;
      currentKey.lastChecked = Date.now();

      console.warn(
        `⚠️ [API KEY MANAGER] Rate limit detected on key ${this.currentKeyIndex + 1} ` +
        `(${currentKey.failureCount}/${this.RATE_LIMIT_THRESHOLD})`
      );

      if (currentKey.failureCount >= this.RATE_LIMIT_THRESHOLD) {
        currentKey.isRateLimited = true;
        this.rotateToNextKey();
      }
    }
  }

  /**
   * Rotate to the next available API key
   */
  private rotateToNextKey(): void {
    const previousIndex = this.currentKeyIndex;
    let nextIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    let attempts = 0;

    // Find the next non-rate-limited key
    while (
      this.apiKeys[nextIndex].isRateLimited &&
      attempts < this.apiKeys.length
    ) {
      nextIndex = (nextIndex + 1) % this.apiKeys.length;
      attempts++;
    }

    this.currentKeyIndex = nextIndex;

    console.log(
      `🔄 [API KEY MANAGER] Rotated from key ${previousIndex + 1} to key ${nextIndex + 1}`
    );

    if (attempts === this.apiKeys.length) {
      console.error(
        '❌ [API KEY MANAGER] All API keys are rate limited! ' +
        'Please wait or add more API keys.'
      );
    }
  }

  /**
   * Get status of all API keys
   */
  public getStatus(): { keyIndex: number; totalKeys: number; status: string } {
    return {
      keyIndex: this.currentKeyIndex + 1,
      totalKeys: this.apiKeys.length,
      status: this.apiKeys
        .map((k, i) => `Key ${i + 1}: ${k.isRateLimited ? '🔴 Rate Limited' : '🟢 Active'}`)
        .join(' | '),
    };
  }

  /**
   * Reset all keys (useful for testing or manual reset)
   */
  public resetAllKeys(): void {
    this.apiKeys.forEach(key => {
      key.isRateLimited = false;
      key.failureCount = 0;
      key.lastChecked = 0;
    });
    this.currentKeyIndex = 0;
    console.log('🔄 [API KEY MANAGER] All keys reset');
  }
}

// Export singleton instance
export const apiKeyManager = new ApiKeyManager();

