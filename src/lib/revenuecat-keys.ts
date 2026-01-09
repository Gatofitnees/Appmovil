/**
 * RevenueCat SDK Keys configuration
 * 
 * This file is intentionally separated to prevent Vite's dead-code elimination
 * from removing platform-specific keys during the build process.
 * 
 * DO NOT refactor this into the hook - it will cause the keys to be optimized away.
 */

// Force all keys to be included in the bundle by using a factory function
// that Vite cannot statically analyze
export function getRevenueCatApiKey(platform: string): string | undefined {
  // These will be replaced by Vite with actual values at build time,
  // but the function wrapper prevents dead-code elimination
  const keys: Record<string, string | undefined> = {
    'ios': import.meta.env.VITE_REVENUECAT_IOS_SDK_KEY || import.meta.env.VITE_REVENUECAT_API_KEY,
    'android': import.meta.env.VITE_REVENUECAT_ANDROID_SDK_KEY || import.meta.env.VITE_REVENUECAT_API_KEY,
    'default': import.meta.env.VITE_REVENUECAT_API_KEY,
  };
  
  // Use bracket notation with the parameter to force runtime lookup
  return keys[platform] ?? keys['default'];
}

// Export individual keys for debugging purposes
export const SDK_KEYS = {
  ios: import.meta.env.VITE_REVENUECAT_IOS_SDK_KEY,
  android: import.meta.env.VITE_REVENUECAT_ANDROID_SDK_KEY,
  fallback: import.meta.env.VITE_REVENUECAT_API_KEY,
} as const;
