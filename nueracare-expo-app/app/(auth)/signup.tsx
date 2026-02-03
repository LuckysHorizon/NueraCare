import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
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

const { width } = Dimensions.get("window");

// ========================================
// SIGN UP SCREEN - Healthcare UI
// ========================================
export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "verification">("form");

  // ========================================
  // PHONE VALIDATION (10 digits only)
  // ========================================
  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length === 10;
  };

  const formatPhoneForInput = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    setPhoneNumber(cleaned.slice(0, 10));
  };

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
    if (!phoneNumber || !validatePhone(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number");
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
      console.log("📝 [SIGNUP] Creating account with email:", email);

      const result = await signUp.create({
        emailAddress: email.trim(),
        password,
      });

      console.log("📝 [SIGNUP] Account created, status:", result.status);

      // Send verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      console.log("✉️  [OTP] Verification code sent to email");

      setStep("verification");
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.message ||
        err.message ||
        "Unable to create account. Please try again.";
      setError(errorMessage);
      console.error("❌ [SIGNUP] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // VERIFY EMAIL CODE
  // ========================================
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      return;
    }

    if (!isLoaded || !signUp) return;

    setVerifying(true);
    setError("");

    try {
      console.log("✉️  [OTP] Verifying code...");

      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });

      console.log("✉️  [OTP] Verification status:", result.status);

      if (result.status === "complete") {
        console.log("✅ [OTP] Email verified successfully!");
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
      console.error("❌ [OTP] Error:", err);
    } finally {
      setVerifying(false);
    }
  };

  // ========================================
  // GOOGLE SIGN UP
  // ========================================
  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      console.log("🔐 [GOOGLE] Starting Google signup...");

      const result = await startOAuthFlow();

      console.log("🔐 [GOOGLE] OAuth result:", result);

      if (result?.createdSessionId) {
        console.log("✅ [GOOGLE] Google signup successful!");
        await result.setActive!({ session: result.createdSessionId });
        router.replace("/(onboarding)/welcome");
      } else {
        setError(
          "Google sign up unavailable. Please check your internet connection."
        );
      }
    } catch (err: any) {
      console.error("❌ [GOOGLE] Error:", err);
      const errorMessage =
        err?.message || "Unable to complete Google sign up. Please try again.";
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  // ========================================
  // RESEND CODE
  // ========================================
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) return;

    setResending(true);
    setError("");

    try {
      console.log("📧 [RESEND] Resending verification code...");

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      console.log("✅ [RESEND] Code resent successfully");

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
      console.error("❌ [RESEND] Error:", err);
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>🏥</Text>
          <Text style={styles.appName}>NueraCare</Text>
          <Text style={styles.tagline}>Join thousands of users</Text>
        </View>

        {/* MAIN FORM CARD */}
        <GlassCard>
          {step === "form" ? (
            // ===== SIGNUP FORM =====
            <>
              <Text style={styles.heading}>Create your account</Text>
              <Text style={styles.subheading}>
                We'll keep your health journey secure and private
              </Text>

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
              <AuthInput
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
                editable={!loading && !googleLoading}
              />

              {/* EMAIL INPUT */}
              <AuthInput
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!loading && !googleLoading}
              />

              {/* PHONE INPUT */}
              <AuthInput
                label="Phone Number (10 digits)"
                placeholder="9876543210"
                value={phoneNumber}
                onChangeText={formatPhoneForInput}
                keyboardType="number-pad"
                maxLength={10}
                editable={!loading && !googleLoading}
              />

              {/* PASSWORD INPUT */}
              <AuthInput
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading && !googleLoading}
              />

              {/* CONFIRM PASSWORD INPUT */}
              <AuthInput
                label="Confirm Password"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading && !googleLoading}
              />

              {/* SIGNUP BUTTON */}
              <SignInButton
                title={loading ? "Creating account..." : "Continue"}
                onPress={handleSignUp}
                loading={loading}
                disabled={googleLoading}
              />

              {/* DIVIDER */}
              <AuthDivider />

              {/* GOOGLE SIGNUP */}
              <GoogleAuthButton
                title={
                  googleLoading ? "Connecting..." : "Sign up with Google"
                }
                onPress={handleGoogleSignUp}
                loading={googleLoading}
                disabled={loading}
              />

              {/* SIGN IN LINK */}
              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity accessible accessibilityRole="link">
                    <Text style={styles.signInLink}>Sign in</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </>
          ) : (
            // ===== VERIFICATION FORM =====
            <>
              <Text style={styles.heading}>Verify your email</Text>
              <Text style={styles.subheading}>
                We've sent a verification code to {email}
              </Text>

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
              <AuthInput
                label="Verification Code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
                editable={!verifying && !resending}
              />

              {/* VERIFY BUTTON */}
              <SignInButton
                title={verifying ? "Verifying..." : "Verify Email"}
                onPress={handleVerifyCode}
                loading={verifying}
                disabled={resending}
              />

              {/* RESEND LINK */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>
                  Didn't receive the code?{" "}
                </Text>
                <TouchableOpacity
                  onPress={handleResendCode}
                  disabled={resendCooldown > 0 || resending}
                  accessible
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.resendLink,
                      (resendCooldown > 0 || resending) && styles.resendDisabled,
                    ]}
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend code"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </GlassCard>

        {/* FOOTER REASSURANCE */}
        <View style={styles.footer}>
          <Text style={styles.footerIcon}>🔒</Text>
          <Text style={styles.footerText}>
            Your health data is encrypted and HIPAA compliant
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ========================================
// STYLES
// ========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  // HEADER
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.gray900,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: colors.gray500,
    fontWeight: "500",
    letterSpacing: 0.3,
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
    fontSize: 28,
    fontWeight: "700",
    color: colors.gray900,
    marginBottom: spacing.xs,
    letterSpacing: 0.4,
  },
  subheading: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: spacing.xl,
    fontWeight: "500",
    lineHeight: 20,
  },

  // SIGN IN LINK
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  signInText: {
    fontSize: 14,
    color: colors.gray600,
    fontWeight: "500",
  },
  signInLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "700",
    letterSpacing: 0.3,
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
    fontWeight: "500",
  },
  resendLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  resendDisabled: {
    color: colors.gray400,
    opacity: 0.5,
  },

  // FOOTER
  footer: {
    alignItems: "center",
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  footerIcon: {
    fontSize: 20,
    marginBottom: spacing.sm,
  },
  footerText: {
    fontSize: 13,
    color: colors.gray500,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 18,
  },
});
