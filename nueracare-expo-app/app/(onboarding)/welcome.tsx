import React from "react";
import { View, ScrollView, StyleSheet, Platform, Text, SafeAreaView, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Button, Heading, Body } from "@/components/common";
import { OnboardingHeader } from "../../components/onboarding-header";
import { colors, spacing } from "@/theme/colors";

export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWideScreen = width > 560;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F5FCFB", "#FFFFFF"]} style={styles.gradientContainer}>
        <OnboardingHeader step={1} totalSteps={12} showBackButton={false} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, styles.contentGrow]}
        >
        <Heading level={1} style={styles.title}>
          Welcome to NueraCare
        </Heading>
        <Body style={styles.subtitle}>
          A calm, private setup so we can support you with clarity and care.
        </Body>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What we’ll ask</Text>
          <Text style={styles.cardText}>• A few preferences to personalize your experience</Text>
          <Text style={styles.cardText}>• Optional health context to improve explanations</Text>
          <Text style={styles.cardText}>• Permissions only when needed</Text>
        </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Continue" onPress={() => router.push("/(onboarding)/identity")} />
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
    fontSize: 28,
    fontWeight: "700",
    color: colors.gray900,
    fontFamily: "Inter",
  },
  subtitle: {
    color: colors.gray600,
    marginTop: spacing.md,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: "Inter",
  },
  card: {
    marginTop: spacing.xxl,
    padding: spacing.lg,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontSize: 13,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? spacing.xxl : spacing.lg,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
});
