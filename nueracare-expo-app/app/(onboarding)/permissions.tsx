import React, { useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Button, Heading, Body } from "@/components/common";
import { colors, spacing, borderRadius } from "@/theme/colors";
import { globalStyles } from "@/theme/styles";

export default function PermissionsScreen() {
  const router = useRouter();
  const [permissions, setPermissions] = useState({
    camera: false,
    location: false,
    notifications: false,
  });

  const handleNext = () => {
    // Request permissions in native code
    router.push("/(onboarding)/complete");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Heading level={2}>App Permissions</Heading>
        <Body style={styles.subtitle}>
          Allow NueraCare to access these features
        </Body>
      </View>

      <View style={styles.permissions}>
        <PermissionCard
          title="📷 Camera"
          description="Upload medical reports from your camera or gallery"
          required={true}
        />

        <PermissionCard
          title="📍 Location"
          description="Find nearby hospitals and healthcare providers"
          required={false}
        />

        <PermissionCard
          title="🔔 Notifications"
          description="Get reminders for tasks and health updates"
          required={false}
        />
      </View>

      <View style={styles.footer}>
        <Button title="Continue to Dashboard" onPress={handleNext} />
        <Button
          title="Skip for Now"
          variant="secondary"
          onPress={handleNext}
        />
      </View>
    </ScrollView>
  );
}

function PermissionCard({
  title,
  description,
  required,
}: {
  title: string;
  description: string;
  required: boolean;
}) {
  const [granted, setGranted] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.permissionCard, granted && styles.permissionGranted]}
      onPress={() => setGranted(!granted)}
      activeOpacity={0.7}
    >
      <View style={styles.permissionContent}>
        <Heading level={4}>{title}</Heading>
        <Body style={styles.permissionDescription}>{description}</Body>
        {required && (
          <Body style={styles.requiredText}>Required for full experience</Body>
        )}
      </View>
      <View
        style={[styles.checkbox, granted && styles.checkboxGranted]}
      >
        {granted && <Body style={styles.checkmark}>✓</Body>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  subtitle: {
    color: colors.textLight,
    marginTop: spacing.md,
    fontSize: 14,
  },
  permissions: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  permissionCard: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "transparent",
  },
  permissionGranted: {
    backgroundColor: colors.primary50,
    borderColor: colors.primary,
  },
  permissionContent: {
    flex: 1,
    marginRight: spacing.lg,
  },
  permissionDescription: {
    color: colors.textLight,
    marginTop: spacing.sm,
    fontSize: 13,
  },
  requiredText: {
    color: colors.error,
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: "500",
  },
  checkbox: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: colors.gray300,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxGranted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  footer: {
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
});
