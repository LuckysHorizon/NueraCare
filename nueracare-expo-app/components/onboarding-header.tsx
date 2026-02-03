import React from "react";
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { colors, spacing } from "@/theme/colors";

interface OnboardingHeaderProps {
  title?: string;
  step: number;
  totalSteps: number;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export function OnboardingHeader({
  title,
  step,
  totalSteps,
  showBackButton = true,
  onBackPress,
}: OnboardingHeaderProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const progressPercent = (step / totalSteps) * 100;

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {showBackButton && (
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={colors.gray700} strokeWidth={2.5} />
          </TouchableOpacity>
        )}
        {!showBackButton && <View style={styles.backButton} />}

        {title && <Text style={styles.title}>{title}</Text>}

        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>
            {step} / {totalSteps}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#F5FCFB",
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === "ios" ? spacing.md : spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  title: {
    flex: 1,
    marginHorizontal: spacing.md,
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray900,
    fontFamily: "Inter",
  },
  stepIndicator: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    backgroundColor: colors.primary50,
  },
  stepText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary700,
    fontFamily: "Inter",
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.gray200,
    borderRadius: 2,
    marginTop: spacing.md,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});
