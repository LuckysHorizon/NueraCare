import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions,
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

const { width } = Dimensions.get("window");

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
          <Text style={styles.tagline}>Your trusted health companion</Text>
        </View>

        {/* MAIN FORM CARD */}
        <GlassCard>
          {/* HEADING */}
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subheading}>
            Sign in to continue your health journey
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

          {/* EMAIL INPUT */}
          <AuthInput
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
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

          {/* SIGN UP LINK */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity accessible accessibilityRole="link">
                <Text style={styles.signUpLink}>Create one</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </GlassCard>

        {/* FOOTER REASSURANCE */}
        <View style={styles.footer}>
          <Text style={styles.footerIcon}>🔒</Text>
          <Text style={styles.footerText}>
            Your data is encrypted and secure
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },

  // HEADER
  header: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  logo: {
    fontSize: 56,
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

  // SIGN UP LINK
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  signUpText: {
    fontSize: 14,
    color: colors.gray600,
    fontWeight: "500",
  },
  signUpLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "700",
    letterSpacing: 0.3,
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
