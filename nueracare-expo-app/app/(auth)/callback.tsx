import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { View, Text } from "react-native";
import { LoadingScreen } from "@/components/common";

/**
 * OAuth Callback Handler
 * Handles redirect from OAuth providers (Google, etc.)
 * Includes timeout handling and error states
 */
const OAUTH_TIMEOUT = 20000; // 20 seconds for slower networks

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [timedOut, setTimedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log("OAuth Callback Screen mounted - Auth state:", {
      isLoaded,
      isSignedIn,
      timedOut,
    });

    // If not loaded yet, wait
    if (!isLoaded) {
      console.log("Waiting for Clerk to load in callback...");
      
      // Set timeout for initial load
      const initialTimeout = setTimeout(() => {
        console.log("Initial load timeout - redirecting to login");
        setError("Authentication loading took too long");
        router.replace("/(auth)/login");
      }, OAUTH_TIMEOUT);
      
      setTimeoutId(initialTimeout);
      return () => clearTimeout(initialTimeout);
    }

    // If already timed out, don't do anything
    if (timedOut) {
      console.log("Already timed out, waiting for redirect");
      return;
    }

    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    // If user is signed in after OAuth, redirect to onboarding
    if (isSignedIn) {
      console.log("✅ User signed in successfully in callback!");
      console.log("Redirecting to onboarding...");
      router.replace("/(onboarding)/welcome");
      return;
    }

    // Still not signed in and loaded, set timeout for auth completion
    console.log("Clerk loaded but user not signed in yet, waiting for OAuth completion...");
    
    const timeout = setTimeout(() => {
      console.log("OAuth timeout - user still not signed in after 20s");
      setTimedOut(true);
      setError("Authentication request timed out. Please try again.");
      router.replace("/(auth)/login");
    }, OAUTH_TIMEOUT);

    setTimeoutId(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoaded, isSignedIn, timedOut]);

  return (
    <View style={{ flex: 1 }}>
      <LoadingScreen />
      {error && (
        <View
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: "#FEF2F2",
            padding: 12,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: "#EF4444",
          }}
        >
          <Text style={{ color: "#DC2626", fontSize: 14, fontWeight: "500" }}>
            ⚠️ {error}
          </Text>
        </View>
      )}
    </View>
  );
}
