import React, { useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, Platform, TouchableOpacity, Text, SafeAreaView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Button, Heading, Body } from "@/components/common";
import { CatalogCard, ToggleTile, OptionalNoteInput } from "@/components/onboarding";
import { OnboardingHeader } from "../../components/onboarding-header";
import { colors, spacing } from "@/theme/colors";
import { updateOnboardingField } from "@/services/onboarding";

const TIMES = ["Morning", "Afternoon", "Evening"];
const TYPES = ["Notification", "Voice call", "Both"];

export default function RemindersScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [wantsReminders, setWantsReminders] = useState<string>("");
  const [time, setTime] = useState("Morning");
  const [reminderType, setReminderType] = useState("Notification");
  const [medicationReminders, setMedicationReminders] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [healthCheckReminders, setHealthCheckReminders] = useState(true);
  const [showNote, setShowNote] = useState(false);
  const [optionalNote, setOptionalNote] = useState("");

  const payload = useMemo(
    () => ({
      selectedOptions: [
        `Reminders: ${wantsReminders || "Not set"}`,
        wantsReminders === "Yes" ? `Time: ${time}` : "",
        wantsReminders === "Yes" ? `Type: ${reminderType}` : "",
      ].filter(Boolean),
      optionalNote: optionalNote.trim() ? optionalNote.trim() : null,
    }),
    [wantsReminders, time, reminderType, optionalNote]
  );

  const handleContinue = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    if (!wantsReminders) {
      Alert.alert("Validation", "Please choose if you want reminders");
      return;
    }

    setIsSaving(true);
    try {
      console.log("Saving reminder preferences for user:", user.id);
      
      // Convert time to HH:MM format
      let reminderTime = "09:00"; // Default morning
      if (time === "Afternoon") reminderTime = "14:00";
      else if (time === "Evening") reminderTime = "18:00";
      
      const reminderData = {
        medicationReminders,
        appointmentReminders,
        healthCheckReminders,
        reminderTime,
      };

      await updateOnboardingField(user.id, "reminders", reminderData);
      console.log("Reminder preferences saved successfully");
      router.push("/(onboarding)/caregiver");
    } catch (error) {
      console.error("Error saving reminder preferences:", error);
      Alert.alert("Error", "Failed to save reminder preferences. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F5FCFB", "#FFFFFF"]} style={styles.gradientContainer}>
        <OnboardingHeader step={5} totalSteps={12} title="Reminders" />
        <ScrollView
          contentContainerStyle={[styles.content, styles.contentGrow]}
          showsVerticalScrollIndicator={false}
        >
        <Body style={styles.subtitle}>
          We can gently remind you when it’s helpful.
        </Body>

        <Text style={styles.sectionLabel}>Want reminders?</Text>
        <View style={styles.cardRow}>
          {["Yes", "No"].map((option) => (
            <CatalogCard
              key={option}
              title={option}
              selected={wantsReminders === option}
              onPress={() => setWantsReminders(option)}
              accessibilityLabel={`Reminders ${option}`}
            />
          ))}
        </View>

        {wantsReminders === "Yes" ? (
          <View>
            <Text style={styles.sectionLabel}>What to remind you about?</Text>
            <View style={styles.stack}>
              <ToggleTile
                title="Medication Reminders"
                selected={medicationReminders}
                onPress={() => setMedicationReminders(!medicationReminders)}
                accessibilityLabel="Medication Reminders"
              />
              <ToggleTile
                title="Appointment Reminders"
                selected={appointmentReminders}
                onPress={() => setAppointmentReminders(!appointmentReminders)}
                accessibilityLabel="Appointment Reminders"
              />
              <ToggleTile
                title="Health Check Reminders"
                selected={healthCheckReminders}
                onPress={() => setHealthCheckReminders(!healthCheckReminders)}
                accessibilityLabel="Health Check Reminders"
              />
            </View>

            <Text style={styles.sectionLabel}>Preferred time</Text>
            <View style={styles.stack}>
              {TIMES.map((option) => (
                <ToggleTile
                  key={option}
                  title={option}
                  selected={time === option}
                  onPress={() => setTime(option)}
                  accessibilityLabel={`Preferred time ${option}`}
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>Reminder type</Text>
            <View style={styles.stack}>
              {TYPES.map((option) => (
                <ToggleTile
                  key={option}
                  title={option}
                  selected={reminderType === option}
                  onPress={() => setReminderType(option)}
                  accessibilityLabel={`Reminder type ${option}`}
                />
              ))}
            </View>

            {!showNote ? (
              <TouchableOpacity
                style={styles.optionalTrigger}
                onPress={() => setShowNote(true)}
                accessibilityRole="button"
                accessibilityLabel="Add specific preference"
              >
                <Text style={styles.optionalTriggerText}>Add specific preference (optional)</Text>
              </TouchableOpacity>
            ) : (
              <OptionalNoteInput
                value={optionalNote}
                onChangeText={setOptionalNote}
                placeholder="Add a short preference"
                helperText="Optional. Helps us time reminders respectfully."
                accessibilityLabel="Reminder preference note"
              />
            )}
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
  stack: {
    gap: spacing.sm,
  },
  optionalTrigger: {
    marginTop: spacing.lg,
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
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
});
