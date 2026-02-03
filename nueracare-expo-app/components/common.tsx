import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { colors, spacing, borderRadius } from "@/theme/colors";

// ========================================
// HEADING COMPONENT
// ========================================
interface HeadingProps {
  level?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  style?: any;
}

export function Heading({ level = 1, children, style }: HeadingProps) {
  const sizes = {
    1: { fontSize: 32, fontWeight: "700" as const },
    2: { fontSize: 28, fontWeight: "700" as const },
    3: { fontSize: 24, fontWeight: "700" as const },
    4: { fontSize: 20, fontWeight: "700" as const },
  };

  return (
    <Text
      style={[
        {
          ...sizes[level],
          color: colors.gray900,
          marginBottom: spacing.sm,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// ========================================
// BODY TEXT COMPONENT
// ========================================
interface BodyProps {
  children: React.ReactNode;
  style?: any;
}

export function Body({ children, style }: BodyProps) {
  return (
    <Text
      style={[
        {
          fontSize: 16,
          fontWeight: "400",
          color: colors.gray800,
          lineHeight: 24,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// ========================================
// BUTTON COMPONENT
// ========================================
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  testID,
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      testID={testID}
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={loading ? "Loading" : undefined}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.white : colors.primary} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            isPrimary ? styles.buttonTextPrimary : styles.buttonTextSecondary,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ========================================
// INPUT COMPONENT
// ========================================
interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  editable?: boolean;
  maxLength?: number;
  testID?: string;
  multiline?: boolean;
  numberOfLines?: number;
  [key: string]: any; // Allow additional props
}

export function Input({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  editable = true,
  maxLength,
  testID,
  multiline = false,
  numberOfLines = 1,
  ...otherProps
}: InputProps) {
  return (
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline]}
      placeholder={placeholder}
      placeholderTextColor={colors.gray400}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      editable={editable}
      maxLength={maxLength}
      testID={testID}
      multiline={multiline}
      numberOfLines={numberOfLines}
      accessible
      accessibilityLabel={placeholder}
      {...otherProps}
    />
  );
}

// ========================================
// CARD COMPONENT
// ========================================
interface CardProps {
  children: React.ReactNode;
  style?: any;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ========================================
// LOADING SCREEN COMPONENT
// ========================================
export function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
}

// ========================================
// STYLES
// ========================================
const styles = StyleSheet.create({
  // Button Styles
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    marginVertical: spacing.sm,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  buttonTextPrimary: {
    color: colors.white,
  },
  buttonTextSecondary: {
    color: colors.primary,
  },

  // Input Styles
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    color: colors.gray900,
    backgroundColor: colors.white,
    marginVertical: spacing.sm,
    minHeight: 48,
  },
  inputMultiline: {
    minHeight: 120,
    textAlignVertical: "top",
    paddingVertical: spacing.md,
  },

  // Card Styles
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Loading Screen Styles
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.gray50,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    gap: spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray600,
  },
});
