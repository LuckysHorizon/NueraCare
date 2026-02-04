import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useSignUp, useOAuth } from "@clerk/clerk-expo";
import { useRouter, Link } from "expo-router";
import {
  GlassCard,
  AuthInput,
  SignInButton,
  GoogleAuthButton,
  AuthDivider,
} from "@/components/auth";
import { colors, spacing, borderRadius } from "@/theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// ========================================
// SIGN UP SCREEN - Healthcare UI
// ========================================
export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "verification">("form");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  // ========================================
  // CREATE ACCOUNT
  // ========================================
  const handleSignUp = async () => {
    if (!isLoaded) return;

    // Validation
    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signUp.create({
        emailAddress: email.trim(),
        password,
      });

      // Send verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setStep("verification");
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.message ||
        err.message ||
        "Unable to create account. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // VERIFY EMAIL CODE
  // ========================================
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      return;
    }

    if (!isLoaded || !signUp) return;

    setVerifying(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });

      if (result.status === "complete") {
        await signUp.reload();
        await setActive({ session: result.createdSessionId });
        router.replace("/(onboarding)/welcome");
      } else {
        setError("Verification failed. Please check your code and try again.");
      }
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.message || "Invalid code. Please try again.";
      setError(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  // ========================================
  // RESEND CODE
  // ========================================
  const handleResendCode = async () => {
    if (!isLoaded || !signUp) return;

    setResending(true);
    setError("");

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.message || "Unable to resend code. Please try again.";
      setError(errorMessage);
    } finally {
      setResending(false);
    }
  };

  // ========================================
  // GOOGLE SIGN UP
  // ========================================
  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      const result = await startOAuthFlow();

      if (result?.createdSessionId) {
        await result.setActive!({ session: result.createdSessionId });
        router.replace("/(onboarding)/welcome");
      } else {
        setError(
          "Google sign up unavailable. Please check your internet connection."
        );
      }
    } catch (err: any) {
      const errorMessage =
        err?.message || "Unable to complete Google sign up. Please try again.";
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#F4FFFB", "#E9FDF5"]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* BRAND HEADER */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <MaterialCommunityIcons
                name="heart-plus"
                size={22}
                color={colors.white}
              />
            </View>
            <Text style={styles.appName}>NueraCare</Text>
            <Text style={styles.tagline}>Your gentle healthcare companion</Text>
          </View>

          {/* MAIN FORM CARD */}
          <GlassCard style={styles.formCard}>
            {step === "form" ? (
              // ===== SIGNUP FORM =====
              <>
                {/* CARD HEADER */}
                <View style={styles.cardHeader}>
                  <Text style={styles.heading}>Create account</Text>
                  <Text style={styles.subheading}>
                    Join thousands of users keeping their health secure
                  </Text>
                </View>

                {/* ERROR MESSAGE */}
                {error && (
                  <View
                    style={styles.errorContainer}
                    accessible
                    accessibilityRole="alert"
                    accessibilityLiveRegion="polite"
                  >
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                  </View>
                )}

                {/* NAME INPUT */}
                <View style={styles.inputLabelRow}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={18}
                    color={colors.gray600}
                  />
                  <Text style={styles.inputLabelText}>Full Name</Text>
                </View>
                <AuthInput
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  editable={!loading && !googleLoading}
                />

                {/* EMAIL INPUT */}
                <View style={styles.inputLabelRow}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={18}
                    color={colors.gray600}
                  />
                  <Text style={styles.inputLabelText}>Email</Text>
                </View>
                <AuthInput
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  editable={!loading && !googleLoading}
                />

                {/* PASSWORD INPUT */}
                <View style={styles.inputLabelRow}>
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={18}
                    color={colors.gray600}
                  />
                  <Text style={styles.inputLabelText}>Password</Text>
                </View>
                <AuthInput
                  placeholder="Enter your password (8+ characters)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading && !googleLoading}
                />

                {/* CONFIRM PASSWORD INPUT */}
                <View style={styles.inputLabelRow}>
                  <MaterialCommunityIcons
                    name="lock-check-outline"
                    size={18}
                    color={colors.gray600}
                  />
                  <Text style={styles.inputLabelText}>Confirm Password</Text>
                </View>
                <AuthInput
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!loading && !googleLoading}
                />

                {/* SIGN UP BUTTON */}
                <SignInButton
                  title={loading ? "Creating account..." : "Sign Up"}
                  onPress={handleSignUp}
                  loading={loading}
                  disabled={googleLoading}
                />

                {/* DIVIDER */}
                <AuthDivider />

                {/* GOOGLE SIGN UP */}
                <GoogleAuthButton
                  title={googleLoading ? "Connecting..." : "Continue with Google"}
                  onPress={handleGoogleSignUp}
                  loading={googleLoading}
                  disabled={loading}
                />

                {/* SIGNIN LINK */}
                <View style={styles.signinContainer}>
                  <Text style={styles.signinText}>Already have an account? </Text>
                  <Link href="/(auth)/signin" asChild>
                    <TouchableOpacity accessible accessibilityRole="link">
                      <Text style={styles.signinLink}>Sign in</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </>
            ) : (
              // ===== VERIFICATION FORM =====
              <>
                {/* VERIFICATION HEADER */}
                <View style={styles.cardHeader}>
                  <Text style={styles.heading}>Verify your email</Text>
                  <Text style={styles.subheading}>
                    Enter the 6-digit code we sent to {email}
                  </Text>
                </View>

                {/* ERROR MESSAGE */}
                {error && (
                  <View
                    style={styles.errorContainer}
                    accessible
                    accessibilityRole="alert"
                    accessibilityLiveRegion="polite"
                  >
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                  </View>
                )}

                {/* VERIFICATION CODE INPUT */}
                <View style={styles.inputLabelRow}>
                  <MaterialCommunityIcons
                    name="shield-check-outline"
                    size={18}
                    color={colors.gray600}
                  />
                  <Text style={styles.inputLabelText}>Verification Code</Text>
                </View>
                <AuthInput
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!verifying}
                />

                {/* VERIFY BUTTON */}
                <SignInButton
                  title={verifying ? "Verifying..." : "Verify Code"}
                  onPress={handleVerifyCode}
                  loading={verifying}
                />

                {/* RESEND CODE */}
                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>Didn't receive the code? </Text>
                  <TouchableOpacity
                    onPress={handleResendCode}
                    disabled={resendCooldown > 0 || resending}
                    accessible
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        styles.resendLink,
                        (resendCooldown > 0 || resending) &&
                          styles.resendDisabled,
                      ]}
                    >
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : resending
                          ? "Sending..."
                          : "Resend"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </GlassCard>

          {/* TERMS NOTICE */}
          <Text style={styles.termsText}>
            By continuing, you agree to NueraCare's{" "}
            <Text style={styles.termsLink}>Terms & Privacy Policy</Text>
          </Text>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// ========================================
// STYLES
// ========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4FFFB",
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },

  // HEADER
  header: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    backgroundColor: "#16C79A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    shadowColor: "#16C79A",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.gray900,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: colors.gray600,
    fontWeight: "400",
    letterSpacing: 0.2,
  },

  // CARD HEADER
  cardHeader: {
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(16, 185, 129, 0.1)",
  },

  // ERROR
  errorContainer: {
    backgroundColor: colors.error50,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  errorMessage: {
    flex: 1,
    fontSize: 13,
    color: colors.gray800,
    fontWeight: "500",
    lineHeight: 18,
  },

  // HEADING
  heading: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.gray900,
    marginBottom: spacing.md,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  subheading: {
    fontSize: 13,
    color: colors.gray600,
    fontWeight: "400",
    lineHeight: 20,
    textAlign: "center",
  },

  // FORM CARD
  formCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
  },

  // INPUT LABEL ROW
  inputLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  inputLabelText: {
    fontSize: 14,
    color: colors.gray700,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  // SIGNIN CONTAINER
  signinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(16, 185, 129, 0.1)",
  },
  signinText: {
    fontSize: 13,
    color: colors.gray600,
    fontWeight: "400",
  },
  signinLink: {
    fontSize: 13,
    color: "#16C79A",
    fontWeight: "600",
  },

  // RESEND CODE
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
  },
  resendText: {
    fontSize: 13,
    color: colors.gray600,
    fontWeight: "400",
  },
  resendLink: {
    fontSize: 13,
    color: "#0F9D7A",
    fontWeight: "600",
  },
  resendDisabled: {
    color: colors.gray400,
    opacity: 0.5,
  },

  // TERMS NOTICE
  termsText: {
    marginTop: spacing.xl,
    fontSize: 12,
    color: colors.gray600,
    textAlign: "center",
    opacity: 0.7,
    paddingHorizontal: spacing.lg,
    lineHeight: 18,
  },
  termsLink: {
    color: "#0F9D7A",
    fontWeight: "600",
  },
});
