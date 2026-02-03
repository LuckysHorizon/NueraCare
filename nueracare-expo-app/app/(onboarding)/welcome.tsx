import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Button, Heading, Body } from "@/components/common";
import { colors, spacing } from "@/theme/colors";
import { globalStyles } from "@/theme/styles";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Heading level={1}>Welcome to NueraCare</Heading>
          <Body style={styles.subtitle}>
            Your intelligent healthcare companion. Let's set up your profile.
          </Body>
        </View>

        <View style={styles.features}>
          <FeatureItem
            title="📋 Understand Your Reports"
            description="AI-powered explanations of medical reports in simple language"
          />
          <FeatureItem
            title="💬 Chat About Your Health"
            description="Ask questions about your reports with our smart assistant"
          />
          <FeatureItem
            title="🏥 Find Care Nearby"
            description="Discover hospitals and specialists near you instantly"
          />
          <FeatureItem
            title="🎯 Track Your Health"
            description="Manage tasks and stay on top of your wellness journey"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Let's Get Started"
          onPress={() => router.push("/(onboarding)/health-info")}
        />
      </View>
    </ScrollView>
  );
}

function FeatureItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
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
  header: {
    marginBottom: spacing.xxxl,
    marginTop: spacing.xxl,
  },
  subtitle: {
    color: colors.textLight,
    marginTop: spacing.md,
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
  },
  featureDescription: {
    color: colors.textLight,
    marginTop: spacing.sm,
    fontSize: 14,
  },
  footer: {
    paddingVertical: spacing.xl,
  },
});
