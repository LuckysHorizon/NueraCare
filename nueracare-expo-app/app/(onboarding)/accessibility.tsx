import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Switch, Platform, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Button, Heading, Body } from "@/components/common";
import { spacing } from "@/theme/colors";
import { updateUserProfile } from "@/services/sanity";
import {
  Volume2,
  Eye,
  Wind,
  Shield,
} from "lucide-react-native";

const ACCENT = "#00BFA5";

export default function AccessibilityScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    largeText: true,
    highContrast: false,
    reduceMotion: false,
    voiceMode: false,
  });

  const handleNext = async () => {
    if (!user?.id) {
      router.push("/(onboarding)/permissions");
      return;
    }

    setLoading(true);
    try {
      // Save accessibility preferences to Sanity
      await updateUserProfile(user.id, {
        largeTextMode: preferences.largeText,
        highContrast: preferences.highContrast,
        reducedMotion: preferences.reduceMotion,
      });
      router.push("/(onboarding)/permissions");
    } catch (error) {
      console.error("Error saving accessibility preferences:", error);
      router.push("/(onboarding)/permissions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#EAFBF8", "#F7FEFD", "#FFFFFF"]}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Heading level={2} style={styles.title}>Accessibility Preferences</Heading>
          <Body style={styles.subtitle}>
            Customize the app for your comfort
          </Body>
        </View>

        <View style={styles.preferences}>
          <PreferenceToggle
            icon={<Eye size={20} color={ACCENT} />}
            title="Large Text"
            description="Increase font size for easier reading"
            value={preferences.largeText}
            onChange={(largeText) =>
              setPreferences({ ...preferences, largeText })
            }
          />

          <PreferenceToggle
            icon={<Shield size={20} color={ACCENT} />}
            title="High Contrast"
            description="Bold colors for better visibility"
            value={preferences.highContrast}
            onChange={(highContrast) =>
              setPreferences({ ...preferences, highContrast })
            }
          />

          <PreferenceToggle
            icon={<Wind size={20} color={ACCENT} />}
            title="Reduce Motion"
            description="Minimize animations and transitions"
            value={preferences.reduceMotion}
            onChange={(reduceMotion) =>
              setPreferences({ ...preferences, reduceMotion })
            }
          />

          <PreferenceToggle
            icon={<Volume2 size={20} color={ACCENT} />}
            title="Voice Mode"
            description="Primarily use voice navigation"
            value={preferences.voiceMode}
            onChange={(voiceMode) =>
              setPreferences({ ...preferences, voiceMode })
            }
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Tip</Text>
          <Text style={styles.infoText}>
            You can change these settings anytime in your profile.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={loading ? "Saving..." : "Continue"}
          onPress={handleNext}
        />
      </View>
    </LinearGradient>
  );
}

function PreferenceToggle({
  icon,
  title,
  description,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.preferenceItem}>
      <BlurView intensity={50} tint="light" style={styles.preferenceBlur}>
        <View style={styles.preferenceContent}>
          <View style={styles.preferenceLeft}>
            <View style={styles.iconBox}>{icon}</View>
            <View style={styles.textBox}>
              <Heading level={4} style={styles.preferenceTitle}>{title}</Heading>
              <Body style={styles.preferenceDescription}>{description}</Body>
            </View>
          </View>
          <Switch
            value={value}
            onValueChange={onChange}
            trackColor={{ false: "#D1D5DB", true: "#BFF3EC" }}
            thumbColor={value ? ACCENT : "#FFFFFF"}
          />
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: Platform.OS === "ios" ? spacing.xxl : spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "Inter",
  },
  subtitle: {
    color: "#6B7280",
    marginTop: spacing.md,
    fontSize: 14,
    fontFamily: "Inter",
  },
  preferences: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  preferenceItem: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  preferenceBlur: {
    borderRadius: 20,
  },
  preferenceContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  preferenceLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(0, 191, 165, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  textBox: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "Inter",
  },
  preferenceDescription: {
    color: "#6B7280",
    marginTop: spacing.xs,
    fontSize: 13,
    fontFamily: "Inter",
  },
  infoBox: {
    borderRadius: 16,
    padding: spacing.lg,
    backgroundColor: "rgba(0, 191, 165, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(0, 191, 165, 0.2)",
    marginBottom: spacing.xl,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "Inter",
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: 13,
    color: "#4B5563",
    fontFamily: "Inter",
    lineHeight: 18,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? spacing.xl : spacing.lg,
  },
});
