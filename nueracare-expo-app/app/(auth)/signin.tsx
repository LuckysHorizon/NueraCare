import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useSignIn, useOAuth } from "@clerk/clerk-expo";
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
// SIGN IN SCREEN - Healthcare UI
// ========================================
export default function SignInScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // ========================================
  // EMAIL SIGN IN
  // ========================================
  const handleEmailSignIn = async () => {
    if (!isLoaded) return;

    // Validation
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("🔐 [LOGIN] Starting email sign in...");

      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      console.log("🔐 [LOGIN] Sign in status:", result.status);

      if (result.status === "complete") {
        console.log("✅ [LOGIN] Email sign in successful!");
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)/home");
      } else {
        setError("Sign in failed. Please try again.");
      }
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.message ||
        err.message ||
        "Invalid email or password. Please try again.";
      setError(errorMessage);
      console.error("❌ [LOGIN] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // GOOGLE SIGN IN
  // ========================================
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      console.log("🔐 [GOOGLE] Starting Google authentication...");

      const result = await startOAuthFlow();

      console.log("🔐 [GOOGLE] OAuth result:", result);

      if (result?.createdSessionId) {
        console.log("✅ [GOOGLE] Google sign in successful!");
        await result.setActive!({ session: result.createdSessionId });
        router.replace("/(tabs)/home");
      } else {
        setError(
          "Google sign in unavailable. Please check your internet connection or enable it in settings."
        );
      }
    } catch (err: any) {
      console.error("❌ [GOOGLE] Error:", err);
      const errorMessage =
        err?.message ||
        "Unable to complete Google sign in. Please try again.";
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
            {/* WELCOME TEXT INSIDE CARD */}
            <View style={styles.cardHeader}>
              <Text style={styles.heading}>Welcome back</Text>
              <Text style={styles.subheading}>
                Sign in to continue your care journey
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
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading && !googleLoading}
            />

            {/* FORGOT PASSWORD */}
            <View style={styles.forgotContainer}>
              <Link href="/(auth)/otp" asChild>
                <TouchableOpacity accessible accessibilityRole="link">
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* SIGN IN BUTTON */}
            <SignInButton
              title={loading ? "Signing in..." : "Sign In"}
              onPress={handleEmailSignIn}
              loading={loading}
              disabled={googleLoading}
            />

            {/* DIVIDER */}
            <AuthDivider />

            {/* GOOGLE SIGN IN */}
            <GoogleAuthButton
              title={googleLoading ? "Connecting..." : "Continue with Google"}
              onPress={handleGoogleSignIn}
              loading={googleLoading}
              disabled={loading}
            />

            {/* SIGNUP LINK */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity accessible accessibilityRole="link">
                  <Text style={styles.signupLink}>Sign up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </GlassCard>

          {/* TERMS NOTICE */}
          <Text style={styles.termsText}>
            By continuing, you agree to NueraCare’s{" "}
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

  // WELCOME BLOCK
  welcomeBlock: {
    alignItems: "center",
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
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

  // FORGOT PASSWORD
  forgotContainer: {
    alignItems: "flex-end",
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  forgotText: {
    color: "#0F9D7A",
    fontSize: 13,
    fontWeight: "600",
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

  // SIGNUP CONTAINER
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(16, 185, 129, 0.1)",
  },
  signupText: {
    fontSize: 13,
    color: colors.gray600,
    fontWeight: "400",
  },
  signupLink: {
    fontSize: 13,
    color: "#16C79A",
    fontWeight: "600",
  },
});
