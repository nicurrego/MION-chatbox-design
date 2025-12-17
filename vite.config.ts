import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // Load all API keys (GEMINI_API_KEY1 through GEMINI_API_KEY4)
    const defineEnv: Record<string, string> = {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    };

    // Add numbered API keys
    for (let i = 1; i <= 4; i++) {
      const keyName = `GEMINI_API_KEY${i}`;
      defineEnv[`process.env.${keyName}`] = JSON.stringify(env[keyName] || '');
    }

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: [
          'talk-to-duck.onrender.com',
          'localhost',
          '.onrender.com' // Allow all Render subdomains
        ]
      },
      plugins: [react()],
      define: defineEnv,
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
