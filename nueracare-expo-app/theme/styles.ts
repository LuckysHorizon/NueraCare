import { StyleSheet } from "react-native";
import { colors, spacing, borderRadius, typography } from "./colors";

export const globalStyles = StyleSheet.create({
  // Layout
  flex: { flex: 1 },
  flexCenter: { flex: 1, alignItems: "center", justifyContent: "center" },

  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
  },

  // Text
  h1: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight as any,
    lineHeight: typography.h1.lineHeight,
    color: colors.text,
  },
  h2: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight as any,
    lineHeight: typography.h2.lineHeight,
    color: colors.text,
  },
  h3: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight as any,
    lineHeight: typography.h3.lineHeight,
    color: colors.text,
  },
  h4: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight as any,
    lineHeight: typography.h4.lineHeight,
    color: colors.text,
  },
  body: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight as any,
    lineHeight: typography.body.lineHeight,
    color: colors.text,
  },
  bodyMedium: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodyMedium.fontWeight as any,
    lineHeight: typography.bodyMedium.lineHeight,
    color: colors.textLight,
  },

  // Buttons
  buttonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  buttonSecondary: {
    backgroundColor: colors.gray100,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  buttonText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: "600",
  },
  buttonTextSecondary: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: "600",
  },

  // Input
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    color: colors.text,
    marginVertical: spacing.sm,
    minHeight: 48,
  },
  inputFocused: {
    borderColor: colors.primary,
  },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
});
