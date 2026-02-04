import React, { useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, Platform, Text, SafeAreaView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Button, Heading, Body } from "@/components/common";
import { ToggleTile } from "@/components/onboarding";
import { OnboardingHeader } from "../../components/onboarding-header";
import { colors, spacing } from "@/theme/colors";
import { updateOnboardingField } from "@/services/onboarding";

export default function AccessibilityScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [textSize, setTextSize] = useState("Normal");
  const [voiceAssist, setVoiceAssist] = useState("Off");
  const [language, setLanguage] = useState("English");
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);

  const accessibilityNeeds = [
    { id: "large-text", label: "Large Text" },
    { id: "high-contrast", label: "High Contrast" },
    { id: "screen-reader", label: "Screen Reader" },
    { id: "voice-input", label: "Voice Input" },
    { id: "closed-captions", label: "Closed Captions" },
  ];

  const toggleAccessibilityNeed = (id: string) => {
    setSelectedNeeds((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  };

  const payload = useMemo(
    () => ({
      selectedOptions: [
        `Text size: ${textSize}`,
        `Voice assistance: ${voiceAssist}`,
        `Language: ${language}`,
        `Accessibility needs: ${selectedNeeds.join(", ") || "None"}`,
      ],
      optionalNote: null,
    }),
    [textSize, voiceAssist, language, selectedNeeds]
  );

  const handleContinue = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    setIsSaving(true);
    try {
      console.log("Saving accessibility needs for user:", user.id);
      await updateOnboardingField(user.id, "accessibilityNeeds", selectedNeeds);
      console.log("Accessibility needs saved successfully");
      router.push("/(onboarding)/health-context");
    } catch (error) {
      console.error("Error saving accessibility needs:", error);
      Alert.alert("Error", "Failed to save accessibility preferences. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F5FCFB", "#FFFFFF"]} style={styles.gradientContainer}>
        <OnboardingHeader step={3} totalSteps={12} title="Accessibility" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, styles.contentGrow]}
        >
        <Body style={styles.subtitle}>
          Choose the experience that feels most comfortable for you.
        </Body>

        <Text style={styles.sectionLabel}>Text size</Text>
        <View style={styles.stack}>
          {["Normal", "Large", "Extra large"].map((option) => (
            <ToggleTile
              key={option}
              title={option}
              selected={textSize === option}
              onPress={() => setTextSize(option)}
              accessibilityLabel={`Text size ${option}`}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Voice assistance</Text>
        <View style={styles.stack}>
          {["On", "Off"].map((option) => (
            <ToggleTile
              key={option}
              title={option}
              selected={voiceAssist === option}
              onPress={() => setVoiceAssist(option)}
              accessibilityLabel={`Voice assistance ${option}`}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Language</Text>
        <View style={styles.stack}>
          {["English", "Hindi"].map((option) => (
            <ToggleTile
              key={option}
              title={option}
              selected={language === option}
              onPress={() => setLanguage(option)}
              accessibilityLabel={`Language ${option}`}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Accessibility Features</Text>
        <Body style={styles.subtitle}>Select any features you need support with:</Body>
        <View style={styles.stack}>
          {accessibilityNeeds.map((need) => (
            <ToggleTile
              key={need.id}
              title={need.label}
              selected={selectedNeeds.includes(need.id)}
              onPress={() => toggleAccessibilityNeed(need.id)}
              accessibilityLabel={need.label}
            />
          ))}
        </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Continue" onPress={handleContinue} disabled={isSaving} />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  gradientContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  contentGrow: {
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.gray900,
    fontFamily: "Inter",
  },
  subtitle: {
    color: colors.gray600,
    marginTop: spacing.sm,
    fontSize: 14,
    fontFamily: "Inter",
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.gray700,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  stack: {
    gap: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
});
