import React, { useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, Platform, Text, TextInput, TouchableOpacity, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Button, Heading, Body } from "@/components/common";
import { CatalogCard } from "@/components/onboarding";
import { OnboardingHeader } from "../../components/onboarding-header";
import { colors, spacing } from "@/theme/colors";

const AGE_GROUPS = ["18–30", "31–45", "46–60", "60+"];

export default function IdentityScreen() {
  const router = useRouter();
  const [ageGroup, setAgeGroup] = useState<string>("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [preferredName, setPreferredName] = useState("");

  const payload = useMemo(
    () => ({
      selectedOptions: ageGroup ? [ageGroup] : [],
      optionalNote: preferredName.trim() ? preferredName.trim() : null,
    }),
    [ageGroup, preferredName]
  );

  const handleContinue = () => {
    if (!ageGroup) {
      return alert("Please select your age group.");
    }
    console.log("Identity payload", payload);
    router.push("/(onboarding)/accessibility");
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F5FCFB", "#FFFFFF"]} style={styles.gradientContainer}>
        <OnboardingHeader step={2} totalSteps={12} title="Your identity" />
        <ScrollView
          contentContainerStyle={[styles.content, styles.contentGrow]}
          showsVerticalScrollIndicator={false}
        >
        <Body style={styles.subtitle}>
          This keeps your experience age‑appropriate and respectful.
        </Body>

        <Text style={styles.sectionLabel}>Age group</Text>
        <View style={styles.cardGrid}>
          {AGE_GROUPS.map((group) => (
            <CatalogCard
              key={group}
              title={group}
              selected={ageGroup === group}
              onPress={() => setAgeGroup(group)}
              accessibilityLabel={`Age group ${group}`}
            />
          ))}
        </View>

        <View style={styles.optionalBlock}>
          {!showNameInput ? (
            <TouchableOpacity
              style={styles.optionalTrigger}
              onPress={() => setShowNameInput(true)}
              accessibilityRole="button"
              accessibilityLabel="Add preferred name"
            >
              <Text style={styles.optionalTriggerText}>Add preferred name (optional)</Text>
            </TouchableOpacity>
          ) : (
            <View>
              <Text style={styles.noteHelper}>
                Optional. Helps us address you respectfully.
              </Text>
              <TextInput
                value={preferredName}
                onChangeText={setPreferredName}
                placeholder="Preferred name"
                placeholderTextColor={colors.gray400}
                style={styles.textInput}
                accessible
                accessibilityLabel="Preferred name"
                maxLength={24}
              />
            </View>
          )}
        </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Continue" onPress={handleContinue} />
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
  subtitle: {
    color: colors.gray600,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.gray700,
    marginBottom: spacing.sm,
  },
  cardGrid: {
    gap: spacing.md,
  },
  optionalBlock: {
    marginTop: spacing.xl,
  },
  optionalTrigger: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
  },
  optionalTriggerText: {
    color: colors.gray700,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  noteHelper: {
    color: colors.gray600,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? spacing.md : spacing.sm,
    fontSize: 14,
    color: colors.gray800,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
});
