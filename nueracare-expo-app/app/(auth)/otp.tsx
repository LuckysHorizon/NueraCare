import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Button, Heading, Body } from "@/components/common";
import { colors, spacing, borderRadius } from "@/theme/colors";
import { globalStyles } from "@/theme/styles";

const { width } = Dimensions.get("window");

interface OtpScreenProps {
  email?: string;
  onVerified?: () => void;
}

export default function OtpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(60);

  // Timer for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleVerifyCode = async () => {
    if (!isLoaded) {
      console.warn("❌ Clerk not loaded");
      return;
    }
    
    if (!signUp) {
      console.error("❌ signUp object not available!");
      setError("Sign up object not available");
      return;
    }
    
    const trimmedCode = code.trim();
    if (trimmedCode.length !== 6) {
      setError("Code must be 6 digits");
      console.warn("⚠️ Invalid code length:", trimmedCode.length);
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("✉️ [OTP] ========== OTP VERIFICATION START ==========");
      console.log("✉️ [OTP] Code:", trimmedCode);
      console.log("✉️ [OTP] Code length:", trimmedCode.length);
      console.log("✉️ [OTP] SignUp state:", {
        id: signUp.id,
        status: signUp.status,
        emailAddress: signUp.emailAddress,
      });
      console.log("✉️ [OTP] Verifications state:", Object.keys(signUp.verifications || {}));
      console.log("✉️ [OTP] Calling attemptEmailAddressVerification()...");
      
      // Attempt to verify the email address with the code
      const result = await signUp.attemptEmailAddressVerification({ code: trimmedCode });

      console.log("✉️ [OTP] Response received");
      console.log("✉️ [OTP] Status:", result.status);
      console.log("✉️ [OTP] Session ID:", result.createdSessionId);
      console.log("✉️ [OTP] Verifications:", result.verifications);
      console.log("✉️ [OTP] Full response:", JSON.stringify(result, null, 2));

      if (result.status === "complete") {
        console.log("✅ [OTP] Verification successful!");
        console.log("✅ [OTP] Session ID:", result.createdSessionId);
        console.log("✅ [OTP] Setting active session...");
        // Sign up is complete, create a session
        await setActive({ session: result.createdSessionId });
        console.log("✅ [OTP] Session set, redirecting to onboarding...");
        router.replace("/(onboarding)/welcome");
      } else {
        const msg = `Verification incomplete. Status: ${result.status}`;
        console.error("❌ [OTP] Unexpected status:", msg);
        setError(msg);
      }
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.message ||
        err.message ||
        "Verification failed. Try again.";
      setError(errorMessage);
      console.error("❌ [OTP] ========== OTP VERIFICATION FAILED ==========");
      console.error("❌ [OTP] Error Message:", errorMessage);
      console.error("❌ [OTP] Error Code:", err.code);
      console.error("❌ [OTP] Error Status:", err.status);
      console.error("❌ [OTP] Clerk Errors:", err.errors);
      console.error("❌ [OTP] Full Error:", JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) {
      console.warn("❌ Clerk or signUp not ready");
      return;
    }
    setResending(true);
    setError("");

    try {
      console.log("📧 [RESEND] Requesting new OTP code...");
      console.log("📧 [RESEND] SignUp ID:", signUp.id);
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      console.log("✅ [RESEND] New code sent!");
      setTimer(60);
      setCanResend(false);
    } catch (err: any) {
      const msg = err.errors?.[0]?.message || "Failed to resend code";
      setError(msg);
      console.error("❌ [RESEND] Error:", msg);
      console.error("❌ [RESEND] Full error:", JSON.stringify(err, null, 2));
    } finally {
      setResending(false);
    }
  };

  const handleCodeInput = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue.length <= 6) {
      setCode(numericValue);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>✉️</Text>
        </View>
        <Heading level={1} style={styles.title}>
          Verify Email
        </Heading>
        <Body style={styles.subtitle}>
          We've sent a 6-digit code to your email address
        </Body>
      </View>

      {/* Code Input Section */}
      <View style={styles.formContainer}>
        {/* Code Input */}
        <View style={styles.codeInputContainer}>
          <Text style={styles.inputLabel}>Enter Verification Code</Text>
          <View style={styles.codeInputWrapper}>
            <TextInput
              style={styles.codeInput}
              placeholder="000000"
              value={code}
              onChangeText={handleCodeInput}
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading && !resending}
              selectTextOnFocus
              textAlign="center"
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {/* Info Message */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            📧 Check your spam folder if you don't see the email
          </Text>
        </View>

        {/* Verify Button */}
        <Button
          title={loading ? "Verifying..." : "Verify Code"}
          onPress={handleVerifyCode}
          loading={loading}
          disabled={code.length !== 6 || loading || resending}
        />
      </View>

      {/* Resend Section */}
      <View style={styles.resendContainer}>
        <Body style={styles.resendLabel}>Didn't receive the code?</Body>
        <TouchableOpacity
          onPress={handleResendCode}
          disabled={!canResend || resending}
        >
          <Text
            style={[
              styles.resendButton,
              (!canResend || resending) && styles.resendButtonDisabled,
            ]}
          >
            {resending ? "Sending..." : canResend ? "Resend Code" : `Resend in ${timer}s`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer Spacing */}
      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
    paddingHorizontal: spacing.lg,
  },
  header: {
    marginTop: spacing.xxxl,
    marginBottom: spacing.xxxl,
    alignItems: "center",
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  logoEmoji: {
    fontSize: 32,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: colors.textLight,
  },
  formContainer: {
    marginBottom: spacing.xl,
  },
  codeInputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  codeInputWrapper: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  codeInput: {
    fontSize: 32,
    fontWeight: "600",
    letterSpacing: 8,
    color: colors.text,
    textAlign: "center",
    fontFamily: "monospace",
  },
  errorBox: {
    backgroundColor: colors.error50,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: "500",
  },
  infoBox: {
    backgroundColor: colors.primary50,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "500",
  },
  resendContainer: {
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  resendLabel: {
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  resendButton: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  resendButtonDisabled: {
    color: colors.textLight,
    opacity: 0.5,
  },
  spacer: {
    height: spacing.xxxl,
  },
});
