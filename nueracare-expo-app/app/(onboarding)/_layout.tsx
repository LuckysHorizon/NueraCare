import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="identity" />
      <Stack.Screen name="accessibility" />
      <Stack.Screen name="health-context" />
      <Stack.Screen name="reminders" />
      <Stack.Screen name="caregiver" />
      <Stack.Screen name="permissions-camera" />
      <Stack.Screen name="permissions-storage" />
      <Stack.Screen name="permissions-location" />
      <Stack.Screen name="permissions-notifications" />
      <Stack.Screen name="first-action" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
