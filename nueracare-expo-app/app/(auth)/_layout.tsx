import React from "react";
import { useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";
import * as Router from "expo-router";
import { Stack } from "expo-router";
import { LoadingScreen } from "@/components/common";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = Router.useRouter();

  useEffect(() => {
    // If user is already signed in, redirect out of auth flow
    if (isLoaded && isSignedIn) {
      console.log("User already signed in, redirecting from auth layout...");
      router.replace("/(onboarding)/welcome");
    }
  }, [isLoaded, isSignedIn, router]);

  // If loading, show loading screen
  if (!isLoaded) {
    return <LoadingScreen />;
  }

  // If user is signed in, redirect (this will prevent rendering auth screens)
  if (isSignedIn) {
    return <LoadingScreen />;
  }

  // Only show auth screens if user is NOT signed in
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="otp"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="callback"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
