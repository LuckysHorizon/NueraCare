import { useAuth } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";
import { useEffect } from "react";
import { LoadingScreen } from "@/components/common";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  // Wait for Clerk to load
  if (!isLoaded) {
    return <LoadingScreen />;
  }

  // If not signed in, go to login
  if (!isSignedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  // If signed in, go to onboarding or home
  return <Redirect href="/(onboarding)/welcome" />;
}
