import React, { useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Button, Heading, Body } from "@/components/common";
import { colors, spacing } from "@/theme/colors";
import { globalStyles } from "@/theme/styles";
import { completeOnboarding } from "@/services/onboarding";

export default function CompleteScreen() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const markComplete = async () => {
      if (!user?.id) return;
      
      try {
        console.log("Marking onboarding as complete for user:", user.id);
        await completeOnboarding(user.id);
        console.log("Onboarding marked complete successfully");
        
        // Auto-navigate after 3 seconds
        const timer = setTimeout(() => {
          router.replace("/(tabs)/home");
        }, 3000);
        return () => clearTimeout(timer);
      } catch (error) {
        console.error("Error completing onboarding:", error);
        Alert.alert("Notice", "Onboarding marked complete. Proceeding to dashboard...");
        // Still navigate even if there's an error
        const timer = setTimeout(() => {
          router.replace("/(tabs)/home");
        }, 3000);
        return () => clearTimeout(timer);
      }
    };

    markComplete();
  }, [user?.id]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.successBox}>
          <Heading level={1} style={styles.emoji}>
            ✅
          </Heading>
          <Heading level={2}>You're All Set!</Heading>
          <Body style={styles.message}>
            Your NueraCare account is ready. Let's explore your dashboard.
          </Body>
        </View>

        <View style={styles.features}>
          <Feature
            emoji="📋"
            title="Upload Reports"
            description="Get instant AI-powered explanations"
          />
          <Feature
            emoji="💬"
            title="Chat with AI"
            description="Ask questions about your health"
          />
          <Feature
            emoji="🏥"
            title="Find Care"
            description="Discover nearby hospitals"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Go to Dashboard"
          onPress={() => router.replace("/(tabs)/home")}
        />
      </View>
    </ScrollView>
  );
}

function Feature({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <Heading level={3} style={styles.featureEmoji}>
        {emoji}
      </Heading>
      <Heading level={4}>{title}</Heading>
      <Body style={styles.featureDescription}>{description}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
    paddingHorizontal: spacing.lg,
  },
  content: {
    paddingVertical: spacing.xxxl,
  },
  successBox: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
    paddingVertical: spacing.xxl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  message: {
    color: colors.textLight,
    marginTop: spacing.md,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
  features: {
    gap: spacing.lg,
  },
  featureItem: {
    backgroundColor: colors.primary50,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: "center",
    textAlign: "center",
  },
  featureEmoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  featureDescription: {
    color: colors.textLight,
    marginTop: spacing.sm,
    fontSize: 13,
    textAlign: "center",
  },
  footer: {
    paddingVertical: spacing.xl,
  },
});
