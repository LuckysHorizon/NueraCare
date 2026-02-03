# Healthcare Authentication Implementation Guide

## Quick Start

### Installation
```bash
cd nueracare-expo-app
npm install
npx expo install expo-blur
```

### Verify Setup
```bash
npx tsc --noEmit --skipLibCheck  # Should show 0 errors
npm list expo-blur               # Verify expo-blur installed
```

---

## File Structure

```
nueracare-expo-app/
├── components/
│   └── auth.tsx                    # ✨ NEW: Reusable auth components
│
├── app/
│   ├── (auth)/
│   │   ├── login.tsx              # ✨ UPDATED: Enhanced sign in
│   │   ├── signup.tsx             # ✨ UPDATED: Enhanced sign up + OTP
│   │   ├── otp.tsx                # Standalone OTP screen
│   │   └── _layout.tsx            # Auth routing
│   │
│   ├── (onboarding)/              # Post-auth flow
│   └── (tabs)/                    # Main app screens
│
└── theme/
    └── colors.ts                   # Design tokens
```

---

## Component Usage Guide

### Using GlassCard

```tsx
import { GlassCard } from "@/components/auth";

export default function MyScreen() {
  return (
    <GlassCard>
      <Text style={styles.heading}>My Form</Text>
      {/* Form content here */}
    </GlassCard>
  );
}
```

### Using AuthInput

```tsx
import { AuthInput } from "@/components/auth";
import { useState } from "react";

export default function MyForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  return (
    <AuthInput
      label="Email Address"
      placeholder="you@example.com"
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      error={error}
      editable={true}
    />
  );
}
```

### Using SignInButton

```tsx
import { SignInButton } from "@/components/auth";
import { useState } from "react";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Handle login logic
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignInButton
      title={loading ? "Signing in..." : "Sign In"}
      onPress={handleSubmit}
      loading={loading}
      disabled={false}
    />
  );
}
```

### Using GoogleAuthButton

```tsx
import { GoogleAuthButton } from "@/components/auth";

export default function OAuthFlow() {
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      // Handle Google OAuth
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleAuthButton
      title={loading ? "Connecting..." : "Continue with Google"}
      onPress={handleGoogleAuth}
      loading={loading}
      disabled={false}
    />
  );
}
```

### Using AuthDivider

```tsx
import { AuthDivider } from "@/components/auth";

export default function FormWithDivider() {
  return (
    <>
      {/* Form fields above */}
      <AuthDivider />
      {/* Alternative auth method below */}
    </>
  );
}
```

---

## Error Handling Best Practices

### Display Errors

```tsx
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";

const [error, setError] = useState("");

return (
  <>
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
  </>
);

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: colors.error50,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 8,
    marginTop: 2,
  },
  errorMessage: {
    flex: 1,
    fontSize: 13,
    color: colors.gray800,
    fontWeight: "500",
    lineHeight: 18,
  },
});
```

### Extract User-Friendly Messages

```tsx
try {
  // API call
} catch (err: any) {
  // Extract Clerk-specific error
  const errorMessage =
    err.errors?.[0]?.message ||
    err.message ||
    "An unexpected error occurred. Please try again.";
  
  setError(errorMessage);
}
```

---

## Logging Best Practices

### Structured Logging

```tsx
// Sign In Flow
console.log("🔐 [LOGIN] Starting email sign in...");
console.log("🔐 [LOGIN] Input validation passed");
const result = await signIn.create({ /*...*/ });
console.log("🔐 [LOGIN] Sign in status:", result.status);

if (result.status === "complete") {
  console.log("✅ [LOGIN] Email sign in successful!");
} else {
  console.error("❌ [LOGIN] Sign in failed:", result.status);
}

// Sign Up Flow
console.log("📝 [SIGNUP] Creating account with email:", email);
console.log("✉️  [OTP] Verification code sent");

// Resend Flow
console.log("📧 [RESEND] Resending verification code...");

// Google OAuth
console.log("🔐 [GOOGLE] Starting Google authentication...");
console.log("✅ [GOOGLE] Google sign in successful!");
```

### Error Logging

```tsx
catch (err: any) {
  console.error("❌ [LOGIN] Error:", {
    message: err.message,
    code: err.code,
    clerkErrors: err.errors,
    fullError: JSON.stringify(err, null, 2),
  });
}
```

---

## Accessibility Implementation

### Screen Reader Support

```tsx
<View
  accessible
  accessibilityRole="alert"
  accessibilityLiveRegion="polite"
  accessibilityLabel="Error message"
>
  <Text>Invalid email address</Text>
</View>

<TouchableOpacity
  accessible
  accessibilityRole="button"
  accessibilityLabel="Sign in button"
  accessibilityHint="Double tap to sign in with your email"
>
  <Text>Sign In</Text>
</TouchableOpacity>
```

### Large Text Support

```tsx
const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    maxFontSizeMultiplier: 1.3,  // Prevents overflow with large text
  },
  heading: {
    fontSize: 28,
    maxFontSizeMultiplier: 1.3,
  },
});
```

---

## Performance Optimization

### Avoid Unnecessary Re-renders

```tsx
// ❌ BAD: Component re-renders on every input change
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

return (
  <GlassCard>
    <AuthInput value={email} onChangeText={setEmail} />
    <AuthInput value={password} onChangeText={setPassword} />
  </GlassCard>
);

// ✅ GOOD: Uses local component state for inputs
const MyForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  
  return (
    <GlassCard>
      <AuthInput
        value={formData.email}
        onChangeText={(email) => setFormData({ ...formData, email })}
      />
    </GlassCard>
  );
};
```

### Memoize Expensive Components

```tsx
import { memo } from "react";
import { GlassCard } from "@/components/auth";

const FormCard = memo(({ children }) => {
  return <GlassCard>{children}</GlassCard>;
});

export default FormCard;
```

---

## Testing Checklist

### Unit Tests
- [ ] Input validation (email format, phone digits, password length)
- [ ] Error message extraction from Clerk API
- [ ] Phone number formatting (removes non-digits, max 10)
- [ ] OTP code trimming

### Integration Tests
- [ ] Email login flow end-to-end
- [ ] Email signup + OTP verification flow
- [ ] Google OAuth flow
- [ ] Error handling and display
- [ ] Loading states

### UI/UX Tests
- [ ] All components render correctly
- [ ] Glassmorphism blur visible
- [ ] Colors match design system
- [ ] Spacing and alignment consistent
- [ ] Buttons are 56px minimum height
- [ ] Text readable at 1.3x font scale

### Accessibility Tests
- [ ] iOS VoiceOver reads all labels
- [ ] Android TalkBack reads all labels
- [ ] All buttons accessible via keyboard
- [ ] Error messages announced as alerts
- [ ] Focus indicators visible

### Device Tests
- [ ] iPhone SE (4.7")
- [ ] iPhone 13 (6.1")
- [ ] iPhone 15 (6.1")
- [ ] Android 5" screen
- [ ] Android 6" screen
- [ ] Landscape orientation

---

## Troubleshooting

### "Cannot find module 'expo-blur'"
```bash
# Solution: Install expo-blur
npx expo install expo-blur
npm install
```

### "BlurView not rendering"
```tsx
// Make sure you're on Expo SDK 54.0+
// Check that expo-blur is in node_modules
// Rebuild the app: npx expo prebuild --clean
```

### TypeScript errors in auth components
```bash
# Clear TypeScript cache and rebuild
rm -rf node_modules/.vite
npx tsc --noEmit --skipLibCheck
```

### Glassmorphism not working on Android
```tsx
// expo-blur requires Android API level 30+
// Fallback: Use semi-transparent view without blur
import { Platform } from "react-native";

const blurIntensity = Platform.OS === "ios" ? 85 : 0;
<BlurView intensity={blurIntensity} />
```

### Phone validation rejecting valid numbers
```tsx
// Make sure you're cleaning the input properly
const cleaned = text.replace(/\D/g, "");  // Remove all non-digits
setPhoneNumber(cleaned.slice(0, 10));     // Limit to 10 digits
```

---

## Common Issues & Solutions

### Issue: Form inputs lose focus on error
```tsx
// ❌ DON'T: Don't clear input on error
// ✅ DO: Keep input value and just show error message
const [email, setEmail] = useState("user@example.com");
return (
  <>
    <AuthInput
      value={email}
      onChangeText={setEmail}
      error={error}
    />
    {error && <ErrorMessage text={error} />}
  </>
);
```

### Issue: OTP code with spaces not validating
```tsx
// Make sure to trim whitespace
const trimmedCode = code.trim();
const result = await signUp.attemptEmailAddressVerification({
  code: trimmedCode,  // "123 456" → "123456"
});
```

### Issue: Google OAuth not completing
```tsx
// Ensure WebBrowser.maybeCompleteAuthSession() is called in root _layout.tsx
import * as WebBrowser from "expo-web-browser";

// Call at module level (not inside component)
WebBrowser.maybeCompleteAuthSession();
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All TypeScript errors resolved (0 errors)
- [ ] All components tested on target devices
- [ ] Accessibility audit completed
- [ ] Error handling implemented
- [ ] Logging added for debugging
- [ ] Design system colors applied consistently
- [ ] All fonts use maximum scaling of 1.3x
- [ ] All buttons are minimum 56px height
- [ ] Error messages are user-friendly
- [ ] Loading states implemented

### Post-Deployment
- [ ] Monitor error logs
- [ ] Collect user feedback
- [ ] Track form completion rate
- [ ] Monitor authentication success rate
- [ ] Check accessibility metrics
- [ ] Performance monitoring active

---

## Resources

### Design System
- See: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
- Colors, typography, spacing, component specs

### Architecture
- See: [AUTHENTICATION_REDESIGN.md](AUTHENTICATION_REDESIGN.md)
- Component overview, features, implementation summary

### Clerk Documentation
- https://clerk.com/docs/reference/expo/use-sign-in
- https://clerk.com/docs/reference/expo/use-sign-up

### Expo Documentation
- https://docs.expo.dev/
- https://docs.expo.io/expo-blur/

### React Native Accessibility
- https://reactnative.dev/docs/accessibility

