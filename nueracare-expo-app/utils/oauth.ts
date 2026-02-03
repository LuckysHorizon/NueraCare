/**
 * OAuth Redirect URL Utility
 * Handles dynamic redirect URL for Google OAuth callbacks
 * Works across web, iOS, and Android platforms
 */

import * as Application from "expo-application";

/**
 * Get the appropriate OAuth redirect URL based on the environment
 * This handles:
 * - Expo Go on mobile devices
 * - EAS builds
 * - Development server
 * - Production builds
 */
export function getOAuthRedirectUrl(): string {
  // For Clerk OAuth, we use the scheme defined in app.json
  // This works across all platforms: Expo Go, EAS, native builds
  return "nueracare://auth/callback";
}

/**
 * Alternative: Using Clerk's built-in handling
 * If the above doesn't work, uncomment this to use Clerk's default callback
 * You'll need to configure the redirect URL in Clerk Dashboard instead
 */
export function useClerkDefaultOAuth(): boolean {
  // If set to true, you must:
  // 1. Remove redirectUrl from signIn.create() calls
  // 2. Configure the redirect URL in Clerk Dashboard
  // 3. Set OAuth credentials in Clerk Dashboard
  return false;
}

/**
 * Get the current app environment
 * Useful for debugging and conditional logic
 */
export function getEnvironment(): "expo-go" | "eas" | "native" | "web" {
  // Check if running in Expo Go
  if (
    process.env.EXPO_RUNTIME_VERSION ||
    process.env.EAS_BUILD_GIT_COMMIT_HASH
  ) {
    return "eas";
  }

  // Check if native build
  if (Application.nativeApplicationVersion) {
    return "native";
  }

  // Default to Expo Go
  return "expo-go";
}
