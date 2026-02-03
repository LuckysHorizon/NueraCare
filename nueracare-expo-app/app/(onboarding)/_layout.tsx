import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="health-info" />
      <Stack.Screen name="accessibility" />
      <Stack.Screen name="permissions" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
