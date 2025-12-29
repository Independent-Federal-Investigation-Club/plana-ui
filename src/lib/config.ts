/**
 * Runtime Configuration
 * 
 * This module provides runtime configuration that can be injected after build.
 * For Docker deployments, the entrypoint script generates __ENV_CONFIG__.js
 * which sets window.__ENV__ with the actual environment values.
 * 
 * Usage:
 *   import { getConfig } from '@/lib/config';
 *   const config = getConfig();
 *   console.log(config.PLANA_API_URL);
 */

export interface RuntimeConfig {
  PLANA_API_URL: string;
  PLANA_SITE_URL: string;
  DISCORD_BOT_ID: string;
}

// Default values (used during development or if not configured)
const defaults: RuntimeConfig = {
  PLANA_API_URL: 'http://localhost:8000',
  PLANA_SITE_URL: 'http://localhost:3000',
  DISCORD_BOT_ID: '',
};

// Extend Window interface to include __ENV__
declare global {
  interface Window {
    __ENV__?: Partial<RuntimeConfig>;
  }
}

/**
 * Get runtime configuration
 * 
 * Priority:
 * 1. window.__ENV__ (injected at runtime for Docker)
 * 2. process.env.NEXT_PUBLIC_* (build-time fallback)
 * 3. Default values
 */
export function getConfig(): RuntimeConfig {
  // Client-side: check window.__ENV__ first
  if (typeof window !== 'undefined' && window.__ENV__) {
    return {
      PLANA_API_URL: window.__ENV__.PLANA_API_URL || process.env.NEXT_PUBLIC_PLANA_API_URL || defaults.PLANA_API_URL,
      PLANA_SITE_URL: window.__ENV__.PLANA_SITE_URL || process.env.NEXT_PUBLIC_PLANA_SITE_URL || defaults.PLANA_SITE_URL,
      DISCORD_BOT_ID: window.__ENV__.DISCORD_BOT_ID || process.env.NEXT_PUBLIC_DISCORD_BOT_ID || defaults.DISCORD_BOT_ID,
    };
  }

  // Server-side or window.__ENV__ not set: use process.env
  return {
    PLANA_API_URL: process.env.NEXT_PUBLIC_PLANA_API_URL || defaults.PLANA_API_URL,
    PLANA_SITE_URL: process.env.NEXT_PUBLIC_PLANA_SITE_URL || defaults.PLANA_SITE_URL,
    DISCORD_BOT_ID: process.env.NEXT_PUBLIC_DISCORD_BOT_ID || defaults.DISCORD_BOT_ID,
  };
}

// Singleton for performance (config doesn't change during runtime)
let cachedConfig: RuntimeConfig | null = null;

export function getCachedConfig(): RuntimeConfig {
  if (!cachedConfig) {
    cachedConfig = getConfig();
  }
  return cachedConfig;
}

// Reset cache (useful for testing or if config changes)
export function resetConfigCache(): void {
  cachedConfig = null;
}
