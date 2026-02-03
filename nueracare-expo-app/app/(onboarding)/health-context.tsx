import React, { useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, Platform, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Button, Heading, Body } from "@/components/common";
import { CatalogChip, OptionalNoteInput } from "@/components/onboarding";
import { OnboardingHeader } from "../../components/onboarding-header";
import { colors, spacing } from "@/theme/colors";

const CONDITIONS = [
  "Diabetes",
  "Blood Pressure",
  "Heart related",
  "Thyroid",
  "None",
  "Other",
];

export default function HealthContextScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [optionalNote, setOptionalNote] = useState("");

  const payload = useMemo(
    () => ({
      selectedOptions: selected,
      optionalNote: optionalNote.trim() ? optionalNote.trim() : null,
    }),
    [selected, optionalNote]
  );

  const toggleOption = (value: string) => {
    if (value === "None") {
      setSelected(["None"]);
      return;
    }
    setSelected((prev) => {
      const next = prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev.filter((item) => item !== "None"), value];
      return next;
    });
  };

  const showOther = selected.includes("Other");

  const handleContinue = () => {
    console.log("Health context payload", payload);
    router.push("/(onboarding)/reminders");
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
          Choose any that apply. This helps us explain things better.
        </Body>

        <View style={styles.chipGrid}>
          {CONDITIONS.map((item) => (
            <CatalogChip
              key={item}
              label={item}
              selected={selected.includes(item)}
              onPress={() => toggleOption(item)}
              accessibilityLabel={`Condition ${item}`}
            />
          ))}
        </View>

        {showOther ? (
          <OptionalNoteInput
            value={optionalNote}
            onChangeText={setOptionalNote}
            placeholder="Add a short note"
            helperText="Optional. Helps us personalize explanations. Not a diagnosis."
            accessibilityLabel="Other condition note"
          />
        ) : null}
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
