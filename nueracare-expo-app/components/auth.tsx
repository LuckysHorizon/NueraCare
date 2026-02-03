import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { colors, spacing, borderRadius } from "@/theme/colors";
import { BlurView } from "expo-blur";

// ========================================
// GLASS CARD - Premium glassmorphism
// ========================================
interface GlassCardProps {
  children: React.ReactNode;
  style?: any;
}

export function GlassCard({ children, style }: GlassCardProps) {
  return (
    <BlurView intensity={85} style={[styles.glassCard, style]}>
      <View style={styles.glassCardContent}>{children}</View>
    </BlurView>
  );
}

// ========================================
// AUTH INPUT FIELD
// ========================================
interface AuthInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  label?: string;
  error?: string;
  editable?: boolean;
  maxLength?: number;
}

export function AuthInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  label,
  error,
  editable = true,
  maxLength,
}: AuthInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[
          styles.authInput,
          isFocused && styles.authInputFocused,
          error && styles.authInputError,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.gray400}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        maxLength={maxLength}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        accessible
        accessibilityLabel={label || placeholder}
      />
      {error && (
        <Text style={styles.errorText} accessible accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
}

// ========================================
// SIGN IN BUTTON
// ========================================
interface SignInButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function SignInButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: SignInButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.signInButton,
        (disabled || loading) && { opacity: 0.6 },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <Text style={styles.signInButtonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// ========================================
// GOOGLE AUTH BUTTON
// ========================================
interface GoogleAuthProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function GoogleAuthButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: GoogleAuthProps) {
  return (
    <TouchableOpacity
      style={[styles.googleButton, (disabled || loading) && { opacity: 0.6 }]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint="Opens Google authentication"
    >
      {loading ? (
        <ActivityIndicator color={colors.gray800} size="small" />
      ) : (
        <>
          <Text style={styles.googleIcon}>🔐</Text>
          <Text style={styles.googleButtonText}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// ========================================
// DIVIDER WITH TEXT
// ========================================
export function AuthDivider({ text = "or continue with" }) {
  return (
    <View style={styles.dividerContainer}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{text}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

// ========================================
// STYLES
// ========================================
const styles = StyleSheet.create({
  // GLASS CARD
  glassCard: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.70)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.85)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  glassCardContent: {
    padding: spacing.lg,
  },

  // INPUT FIELD
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray800,
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  authInput: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.gray800,
    backgroundColor: colors.white,
    minHeight: 52,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  authInputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  authInputError: {
    borderColor: colors.warning,
    backgroundColor: colors.error50,
  },
  errorText: {
    fontSize: 13,
    color: colors.warning,
    marginTop: spacing.xs,
    fontWeight: "500",
    letterSpacing: 0.2,
  },

  // SIGN IN BUTTON
  signInButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    minHeight: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.md,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  signInButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  // GOOGLE BUTTON
  googleButton: {
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.gray300,
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  googleIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  googleButtonText: {
    color: colors.gray800,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // DIVIDER
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray200,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.gray500,
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
});
