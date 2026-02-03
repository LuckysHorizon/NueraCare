import React, { useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, Platform, Text, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Button, Heading, Body } from "@/components/common";
import { CatalogCard, CatalogChip, OptionalNoteInput } from "@/components/onboarding";
import { OnboardingHeader } from "../../components/onboarding-header";
import { colors, spacing } from "@/theme/colors";

const RELATIONSHIPS = ["Son", "Daughter", "Spouse", "Doctor", "Other"];

export default function CaregiverScreen() {
  const router = useRouter();
  const [hasCaregiver, setHasCaregiver] = useState<string>("");
  const [relationship, setRelationship] = useState<string>("");
  const [optionalNote, setOptionalNote] = useState("");

  const payload = useMemo(
    () => ({
      selectedOptions: [
        `Caregiver: ${hasCaregiver || "Not set"}`,
        hasCaregiver === "Yes" && relationship ? `Relationship: ${relationship}` : "",
      ].filter(Boolean),
      optionalNote: optionalNote.trim() ? optionalNote.trim() : null,
    }),
    [hasCaregiver, relationship, optionalNote]
  );

  const handleContinue = () => {
    if (!hasCaregiver) {
      return alert("Please select yes or no.");
    }
    if (hasCaregiver === "Yes" && !relationship) {
      return alert("Please choose a relationship.");
    }
    console.log("Caregiver payload", payload);
    router.push("/(onboarding)/permissions-camera");
  };

  const showOther = relationship === "Other";

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F5FCFB", "#FFFFFF"]} style={styles.gradientContainer}>
        <OnboardingHeader step={6} totalSteps={12} title="Caregiver" />
        <ScrollView
          contentContainerStyle={[styles.content, styles.contentGrow]}
          showsVerticalScrollIndicator={false}
        >
        <Body style={styles.subtitle}>
          If someone helps you, we can tailor reminders for you both.
        </Body>

        <Text style={styles.sectionLabel}>Do you have a caregiver?</Text>
        <View style={styles.cardRow}>
          {["Yes", "No"].map((option) => (
            <CatalogCard
              key={option}
              title={option}
              selected={hasCaregiver === option}
              onPress={() => setHasCaregiver(option)}
              accessibilityLabel={`Caregiver ${option}`}
            />
          ))}
        </View>

        {hasCaregiver === "Yes" ? (
          <View>
            <Text style={styles.sectionLabel}>Relationship</Text>
            <View style={styles.chipGrid}>
              {RELATIONSHIPS.map((option) => (
                <CatalogChip
                  key={option}
                  label={option}
                  selected={relationship === option}
                  onPress={() => setRelationship(option)}
                  accessibilityLabel={`Relationship ${option}`}
                />
              ))}
            </View>
            {showOther ? (
              <OptionalNoteInput
                value={optionalNote}
                onChangeText={setOptionalNote}
                placeholder="Add relationship details"
                helperText="Optional. Helps us personalize caregiver messages."
                accessibilityLabel="Caregiver relationship note"
              />
            ) : null}
          </View>
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.gray700,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  cardRow: {
    gap: spacing.sm,
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
