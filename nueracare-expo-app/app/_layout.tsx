import React from "react";
import { useEffect } from "react";
import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Stack } from "expo-router";
import { LoadingScreen } from "@/components/common";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  useEffect(() => {
    if (isLoaded) {
      console.log("Auth state:", {
        isLoaded,
        isSignedIn,
        userId: user?.id,
        email: user?.emailAddresses?.[0]?.emailAddress,
      });
    }
  }, [isLoaded, isSignedIn, user?.id]);

  if (!isLoaded) {
    console.log("Waiting for Clerk to load...");
    return <LoadingScreen />;
  }

  console.log("Rendering AuthLayout - isSignedIn:", isSignedIn);

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

  // If signed in, show onboarding and tabs (NOT auth screens)
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="(onboarding)"
        options={{
          headerShown: false,
        }}
      />
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

