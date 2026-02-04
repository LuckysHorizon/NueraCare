import React, { useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, Platform, SafeAreaView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Button, Heading, Body } from "@/components/common";
import { CatalogChip, OptionalNoteInput } from "@/components/onboarding";
import { OnboardingHeader } from "../../components/onboarding-header";
import { colors, spacing } from "@/theme/colors";
import { updateOnboardingField } from "@/services/onboarding";

const FOCUS_AREAS = [
  { id: "heart-health", label: "Heart Health" },
  { id: "mental-wellness", label: "Mental Wellness" },
  { id: "fitness", label: "Fitness" },
  { id: "nutrition", label: "Nutrition" },
  { id: "sleep", label: "Sleep" },
  { id: "stress", label: "Stress Management" },
  { id: "chronic-condition", label: "Chronic Condition" },
  { id: "preventive-care", label: "Preventive Care" },
];

export default function HealthContextScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [optionalNote, setOptionalNote] = useState("");

  const payload = useMemo(
    () => ({
      selectedOptions: selectedFocusAreas,
      optionalNote: optionalNote.trim() ? optionalNote.trim() : null,
    }),
    [selectedFocusAreas, optionalNote]
  );

  const toggleFocusArea = (id: string) => {
    setSelectedFocusAreas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    if (selectedFocusAreas.length === 0) {
      Alert.alert("Validation", "Please select at least one focus area");
      return;
    }

    setIsSaving(true);
    try {
      console.log("Saving focus areas for user:", user.id);
      await updateOnboardingField(user.id, "focusAreas", selectedFocusAreas);
      console.log("Focus areas saved successfully");
      router.push("/(onboarding)/reminders");
    } catch (error) {
      console.error("Error saving focus areas:", error);
      Alert.alert("Error", "Failed to save focus areas. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F5FCFB", "#FFFFFF"]} style={styles.gradientContainer}>
        <OnboardingHeader step={4} totalSteps={12} title="Health context" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, styles.contentGrow]}
        >
        <Body style={styles.subtitle}>
          Choose the health areas most important to you. We'll personalize your care recommendations.
        </Body>

        <View style={styles.chipGrid}>
          {FOCUS_AREAS.map((area) => (
            <CatalogChip
              key={area.id}
              label={area.label}
              selected={selectedFocusAreas.includes(area.id)}
              onPress={() => toggleFocusArea(area.id)}
              accessibilityLabel={area.label}
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
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
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
