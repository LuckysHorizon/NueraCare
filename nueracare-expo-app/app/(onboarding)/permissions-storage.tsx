import React, { useMemo } from "react";
import { View, ScrollView, StyleSheet, Platform, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Button, Heading, Body } from "@/components/common";
import { OnboardingHeader } from "../../components/onboarding-header";
import { colors, spacing } from "@/theme/colors";

export default function StoragePermissionScreen() {
  const router = useRouter();
  const payload = useMemo(
    () => ({
      selectedOptions: ["Storage permission: requested"],
      optionalNote: null,
    }),
    []
  );

  const handleNext = (decision: "Allow" | "Skip") => {
    console.log("Storage permission", { ...payload, decision });
    router.push("/(onboarding)/permissions-location");
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F5FCFB", "#FFFFFF"]} style={styles.gradientContainer}>
        <OnboardingHeader step={8} totalSteps={12} title="Storage" />
        <ScrollView
          contentContainerStyle={[styles.content, styles.contentGrow]}
          showsVerticalScrollIndicator={false}
        >
          <Heading level={2} style={styles.title}>Storage access</Heading>
          <Body style={styles.subtitle}>
            Helps us save reports securely on your device when you choose.
          </Body>
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Allow" onPress={() => handleNext("Allow")} />
          <Button
            title="Skip"
            variant="secondary"
            onPress={() => handleNext("Skip")}
            style={styles.secondaryButton}
          />
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
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: "space-between",
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
    lineHeight: 22,
  },
  footer: {
    gap: spacing.md,
  },
  secondaryButton: {
    backgroundColor: colors.gray100,
  },
});
