import React from "react";
import { View, ScrollView, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { Button, Heading, Body } from "@/components/common";
import { spacing } from "@/theme/colors";
import { globalStyles } from "@/theme/styles";
import {
  Zap,
  MessageSquare,
  MapPin,
  Target,
} from "lucide-react-native";

const ACCENT = "#00BFA5";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#EAFBF8", "#F7FEFD", "#FFFFFF"]}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Heading level={1} style={styles.title}>Welcome to NueraCare</Heading>
          <Body style={styles.subtitle}>
            Your intelligent healthcare companion. Let's set up your profile.
          </Body>
        </View>

        <View style={styles.features}>
          <FeatureItem
            icon={<Zap size={24} color={ACCENT} />}
            title="Understand Your Reports"
            description="AI-powered explanations of medical reports in simple language"
          />
          <FeatureItem
            icon={<MessageSquare size={24} color={ACCENT} />}
            title="Chat About Your Health"
            description="Ask questions about your reports with our smart assistant"
          />
          <FeatureItem
            icon={<MapPin size={24} color={ACCENT} />}
            title="Find Care Nearby"
            description="Discover hospitals and specialists near you instantly"
          />
          <FeatureItem
            icon={<Target size={24} color={ACCENT} />}
            title="Track Your Health"
            description="Manage tasks and stay on top of your wellness journey"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <BlurView intensity={60} tint="light" style={styles.blurContainer}>
          <Button
            title="Let's Get Started"
            onPress={() => router.push("/(onboarding)/health-info")}
          />
        </BlurView>
      </View>
    </LinearGradient>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <BlurView intensity={50} tint="light" style={styles.featureBlurvView}>
        <View style={styles.featureContent}>
          <View style={styles.iconBox}>{icon}</View>
          <View style={styles.textBox}>
            <Heading level={4} style={styles.featureTitle}>{title}</Heading>
            <Body style={styles.featureDescription}>{description}</Body>
          </View>
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
    paddingVertical: spacing.xxl,
    paddingTop: Platform.OS === "ios" ? spacing.xxl : spacing.xl,
  },
  header: {
    marginBottom: spacing.xxxl,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "Inter",
  },
  subtitle: {
    color: "#6B7280",
    marginTop: spacing.md,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: "Inter",
  },
  features: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  featureItem: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  featureBlurvView: {
    borderRadius: 22,
  },
  featureContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    gap: spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(0, 191, 165, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  textBox: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "Inter",
  },
  featureDescription: {
    color: "#6B7280",
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter",
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? spacing.xxl : spacing.lg,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
});
