import React, { useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, Platform, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Button, Heading, Body } from "@/components/common";
import { CatalogCard } from "@/components/onboarding";
import { OnboardingHeader } from "../../components/onboarding-header";
import { colors, spacing } from "@/theme/colors";

const OPTIONS = [
  {
    title: "Upload first report",
    description: "Start with a document when you’re ready.",
  },
  {
    title: "Skip for now",
    description: "You can upload later from the dashboard.",
  },
];

export default function FirstActionScreen() {
  const router = useRouter();
  const [selection, setSelection] = useState<string>(OPTIONS[1].title);

  const payload = useMemo(
    () => ({
      selectedOptions: [selection],
      optionalNote: null,
    }),
    [selection]
  );

  const handleContinue = () => {
    console.log("First action payload", payload);
    router.push("/(onboarding)/complete");
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F5FCFB", "#FFFFFF"]} style={styles.gradientContainer}>
        <OnboardingHeader step={11} totalSteps={12} title="First step" />
        <ScrollView
          contentContainerStyle={[styles.content, styles.contentGrow]}
          showsVerticalScrollIndicator={false}
        >
        <Heading level={2} style={styles.title}>Your first step</Heading>
        <Body style={styles.subtitle}>
          Choose a gentle first action. No pressure.
        </Body>

        <View style={styles.cardStack}>
          {OPTIONS.map((option) => (
            <CatalogCard
              key={option.title}
              title={option.title}
              description={option.description}
              selected={selection === option.title}
              onPress={() => setSelection(option.title)}
              accessibilityLabel={option.title}
            />
          ))}
        </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Finish setup" onPress={handleContinue} />
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
  cardStack: {
    gap: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? spacing.xxl : spacing.lg,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
});
