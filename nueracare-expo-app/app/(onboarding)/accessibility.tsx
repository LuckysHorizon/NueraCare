import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Switch } from "react-native";
import { useRouter } from "expo-router";
import { Button, Heading, Body } from "@/components/common";
import { colors, spacing, borderRadius } from "@/theme/colors";
import { globalStyles } from "@/theme/styles";

export default function AccessibilityScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState({
    largeText: false,
    highContrast: false,
    reduceMotion: false,
    voiceMode: false,
  });

  const handleNext = () => {
    // Save preferences
    router.push("/(onboarding)/permissions");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Heading level={2}>Accessibility Preferences</Heading>
        <Body style={styles.subtitle}>
          Customize the app for your comfort
        </Body>
      </View>

      <View style={styles.preferences}>
        <PreferenceToggle
          title="Large Text"
          description="Increase font size for easier reading"
          value={preferences.largeText}
          onChange={(largeText: boolean) =>
            setPreferences({ ...preferences, largeText })
          }
        />

        <PreferenceToggle
          title="High Contrast"
          description="Bold colors for better visibility"
          value={preferences.highContrast}
          onChange={(highContrast: boolean) =>
            setPreferences({ ...preferences, highContrast })
          }
        />

        <PreferenceToggle
          title="Reduce Motion"
          description="Minimize animations and transitions"
          value={preferences.reduceMotion}
          onChange={(reduceMotion: boolean) =>
            setPreferences({ ...preferences, reduceMotion })
          }
        />

        <PreferenceToggle
          title="Voice Mode"
          description="Primarily use voice navigation"
          value={preferences.voiceMode}
          onChange={(voiceMode: boolean) =>
            setPreferences({ ...preferences, voiceMode })
          }
        />
      </View>

      <View style={styles.footer}>
        <Button title="Continue" onPress={handleNext} />
      </View>
    </ScrollView>
  );
}

function PreferenceToggle({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleItem}>
      <View style={styles.toggleContent}>
        <Heading level={4}>{title}</Heading>
        <Body style={styles.toggleDescription}>{description}</Body>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.gray200, true: colors.primary200 }}
        thumbColor={value ? colors.primary : colors.gray400}
      />
    </View>
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
  preferences: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  toggleItem: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleContent: {
    flex: 1,
    marginRight: spacing.lg,
  },
  toggleDescription: {
    color: colors.textLight,
    marginTop: spacing.sm,
    fontSize: 12,
  },
  footer: {
    paddingVertical: spacing.xl,
  },
});
