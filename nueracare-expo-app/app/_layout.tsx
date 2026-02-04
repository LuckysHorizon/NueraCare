import React from "react";
import { useEffect, useState } from "react";
import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Stack, useRouter } from "expo-router";
import { LoadingScreen } from "@/components/common";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isOnboardingCompleted } from "@/services/onboarding";

// Complete OAuth session when returning from browser
WebBrowser.maybeCompleteAuthSession();

// Create token cache for secure storage
const tokenCache = {
  getToken: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (err) {
      return null;
    }
  },
  saveToken: (key: string, token: string) => {
    return AsyncStorage.setItem(key, token);
  },
  clearToken: (key: string) => {
    return AsyncStorage.removeItem(key);
  },
};

// Create the redirect URL for OAuth callbacks
const redirectUrl = Linking.createURL("auth/callback");

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error(
      "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable"
    );
  }

  console.log("Clerk initialized with publishable key:", publishableKey.slice(0, 20) + "...");
  console.log("OAuth redirect URL:", redirectUrl);

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={publishableKey}
      signInFallbackRedirectUrl={redirectUrl}
      signUpFallbackRedirectUrl={redirectUrl}
    >
      <AuthLayout />
    </ClerkProvider>
  );
}

function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      // Auth state ready
    }
  }, [isLoaded, isSignedIn, user?.id]);

  // Check onboarding status when user is signed in
  useEffect(() => {
    const checkOnboarding = async () => {
      // Only run if we have a signed-in user
      if (!isSignedIn || !user?.id) {
        setIsCheckingOnboarding(false);
        return;
      }

      setIsCheckingOnboarding(true);

      try {
        const completed = await isOnboardingCompleted(user.id);
        
        if (completed === true) {
          setOnboardingComplete(true);
        } else if (completed === false) {
          setOnboardingComplete(false);
        } else {
          setOnboardingComplete(false);
        }
      } catch (error) {
        setOnboardingComplete(false);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [isSignedIn, user?.id]);

  if (!isLoaded || isCheckingOnboarding) {
    return <LoadingScreen />;
  }

  // If NOT signed in, ONLY show auth screens
  if (!isSignedIn) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    );
  }

  // If signed in but onboarding NOT complete, show onboarding
  if (!onboardingComplete) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="(onboarding)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="report" />
      </Stack>
    );
  }

  // If signed in AND onboarding complete, show main app
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="report" />
      <Stack.Screen name="accessibility" />
      <Stack.Screen name="tasks" />
      <Stack.Screen name="emergency" />
    </Stack>
  );
}

