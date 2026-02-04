import React, { useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, Platform, Text, SafeAreaView, TextInput, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Button, Heading, Body } from "@/components/common";
import { CatalogCard, CatalogChip, OptionalNoteInput } from "@/components/onboarding";
import { OnboardingHeader } from "../../components/onboarding-header";
import { colors, spacing } from "@/theme/colors";
import { updateOnboardingField } from "@/services/onboarding";

const RELATIONSHIPS = ["Son", "Daughter", "Spouse", "Doctor", "Other"];

export default function CaregiverScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [hasCaregiver, setHasCaregiver] = useState<string>("");
  const [relationship, setRelationship] = useState<string>("");
  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverPhone, setCaregiverPhone] = useState("");

  const payload = useMemo(
    () => ({
      selectedOptions: [
        `Caregiver: ${hasCaregiver || "Not set"}`,
        hasCaregiver === "Yes" && relationship ? `Relationship: ${relationship}` : "",
      ].filter(Boolean),
    }),
    [hasCaregiver, relationship]
  );

  const handleContinue = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    if (!hasCaregiver) {
      Alert.alert("Validation", "Please select yes or no");
      return;
    }

    if (hasCaregiver === "Yes") {
      if (!relationship) {
        Alert.alert("Validation", "Please choose a relationship");
        return;
      }
      if (!caregiverName.trim()) {
        Alert.alert("Validation", "Please enter caregiver's name");
        return;
      }
    }

    setIsSaving(true);
    try {
      console.log("Saving caregiver info for user:", user.id);
      
      let caregiverData = { hasCaregivers: hasCaregiver === "Yes" };
      
      if (hasCaregiver === "Yes") {
        caregiverData = {
          ...caregiverData,
          name: caregiverName.trim(),
          phone: caregiverPhone.trim(),
          relationship: relationship,
        } as any;
      }

      await updateOnboardingField(user.id, "caregiverInfo", caregiverData);
      console.log("Caregiver info saved successfully");
      router.push("/(onboarding)/permissions-camera");
    } catch (error) {
      console.error("Error saving caregiver info:", error);
      Alert.alert("Error", "Failed to save caregiver information. Please try again.");
      setIsSaving(false);
    }
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

            <Text style={styles.sectionLabel}>Caregiver's Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter caregiver's name"
              value={caregiverName}
              onChangeText={setCaregiverName}
              editable={!isSaving}
              placeholderTextColor={colors.textLight}
            />

            <Text style={styles.sectionLabel}>Caregiver's Phone (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              value={caregiverPhone}
              onChangeText={setCaregiverPhone}
              keyboardType="phone-pad"
              editable={!isSaving}
              placeholderTextColor={colors.textLight}
            />
          </View>
        ) : null}
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
  cardRow: {
    gap: spacing.sm,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.md,
    fontFamily: "Inter",
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
});
