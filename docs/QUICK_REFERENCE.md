# 🎯 Quick Reference Card - NueraCare Auth Redesign

## File Locations

```
components/auth.tsx                    ✨ NEW - 5 components
├── GlassCard
├── AuthInput
├── SignInButton
├── GoogleAuthButton
└── AuthDivider

app/(auth)/login.tsx                   ✨ UPDATED - Sign In
app/(auth)/signup.tsx                  ✨ UPDATED - Sign Up + OTP
```

## Component Imports

```tsx
import {
  GlassCard,
  AuthInput,
  SignInButton,
  GoogleAuthButton,
  AuthDivider,
} from "@/components/auth";
```

## Component Props Quick Reference

### GlassCard
```tsx
<GlassCard style={styleObject}>
  {children}
</GlassCard>
```

### AuthInput
```tsx
<AuthInput
  label="Email Address"              // Optional label
  placeholder="you@example.com"       // Placeholder text
  value={email}                       // Input value
  onChangeText={setEmail}             // Change handler
  keyboardType="email-address"        // Keyboard type
  secureTextEntry={false}             // Hide text (for passwords)
  error="Invalid email"               // Optional error message
  editable={true}                     // Enable/disable
  maxLength={10}                      // Max characters
/>
```

### SignInButton
```tsx
<SignInButton
  title="Sign In"                     // Button text
  onPress={handleSubmit}              // Press handler
  loading={false}                     // Show spinner
  disabled={false}                    // Disable button
/>
```

### GoogleAuthButton
```tsx
<GoogleAuthButton
  title="Continue with Google"        // Button text
  onPress={handleGoogleAuth}          // Press handler
  loading={false}                     // Show spinner
  disabled={false}                    // Disable button
/>
```

### AuthDivider
```tsx
<AuthDivider />
// No props needed - renders "or continue with" separator
```

## Common Patterns

### Email Input
```tsx
<AuthInput
  label="Email"
  placeholder="user@example.com"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
/>
```

### Password Input
```tsx
<AuthInput
  label="Password"
  placeholder="••••••••"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
/>
```

### Phone Input (10 digits)
```tsx
const formatPhone = (text: string) => {
  const cleaned = text.replace(/\D/g, "");
  setPhone(cleaned.slice(0, 10));
};

<AuthInput
  label="Phone"
  placeholder="9876543210"
  value={phone}
  onChangeText={formatPhone}
  keyboardType="number-pad"
  maxLength={10}
/>
```

### Error Display
```tsx
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
```

## Design Tokens

### Colors
```
Primary:     #10B981 (Teal)
Background:  #F9FAFB (Off-white)
Warning:     #F59E0B (Amber)
Gray 900:    #111827 (Dark text)
Gray 600:    #4B5563 (Secondary text)
```

### Sizing
```
Button Height:  56px minimum
Input Height:   52px minimum
Padding:        16px (lg)
Border Radius:  12-20px
```

### Logging Prefixes
```
🔐 [LOGIN]   - Email sign in
🔐 [GOOGLE]  - Google OAuth
📝 [SIGNUP]  - Account creation
✉️ [OTP]     - Email verification
📧 [RESEND]  - Code resend
❌ [ERROR]   - Error handling
✅ [SUCCESS] - Success state
```

## Accessibility Checklist

```
✅ All buttons ≥ 56px height
✅ All inputs ≥ 52px height
✅ accessibilityRole on interactive elements
✅ accessibilityLabel on all components
✅ accessibilityLiveRegion for dynamic content
✅ Error messages with role="alert"
✅ maxFontSizeMultiplier: 1.3 on text
✅ High contrast (≥ 4.5:1 for WCAG AA)
```

## Testing

### TypeScript Check
```bash
npx tsc --noEmit --skipLibCheck
# Expected: 0 errors in auth files
```

### Dependencies
```bash
npm list expo-blur
# Expected: expo-blur@15.0.10
```

### Device Testing
```
iPhone SE (4.7")     - Test glassmorphism
iPhone 13 (6.1")     - Main device
Android 5"           - Small screen test
Android 6"           - Large screen test
```

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| Cannot find expo-blur | Not installed | `npx expo install expo-blur` |
| BlurView not rendering | Old SDK | Rebuild: `npx expo prebuild --clean` |
| Input loses focus on error | Re-rendering | Keep input value, just show error |
| OTP validation fails | Whitespace | Use `.trim()` on code |
| Phone validation rejects 10 digits | Formatting | Clean with `.replace(/\D/g, "")` |
| Google OAuth doesn't complete | Missing WebBrowser | Add `WebBrowser.maybeCompleteAuthSession()` to _layout.tsx |

## Resources

```
📄 AUTHENTICATION_REDESIGN.md  - Full implementation details
📄 DESIGN_SYSTEM.md            - Visual specifications
📄 IMPLEMENTATION_GUIDE.md     - Developer guide
📄 PROJECT_COMPLETE.md         - Project summary
```

## Key Props Summary

| Component | Key Props | Required |
|-----------|-----------|----------|
| GlassCard | children, style | children |
| AuthInput | value, onChangeText, label, placeholder | All except error, editable, maxLength |
| SignInButton | title, onPress | ✅ Both |
| GoogleAuthButton | title, onPress | ✅ Both |
| AuthDivider | (none) | - |

## Screen Structure

### Sign In
```
Header
 ├── Logo (🏥)
 ├── App Name
 └── Tagline

GlassCard
 ├── Heading
 ├── Subheading
 ├── Error (if any)
 ├── Email Input
 ├── Password Input
 ├── Sign In Button
 ├── AuthDivider
 ├── Google Button
 └── Sign Up Link

Footer
 └── Security Message (🔒)
```

### Sign Up
```
Header
 ├── Logo (🏥)
 ├── App Name
 └── Tagline

GlassCard (Step 1)
 ├── Heading
 ├── Subheading
 ├── Error (if any)
 ├── Full Name Input
 ├── Email Input
 ├── Phone Input
 ├── Password Input
 ├── Confirm Password Input
 ├── Continue Button
 ├── AuthDivider
 ├── Google Button
 └── Sign In Link

GlassCard (Step 2 - OTP)
 ├── Heading
 ├── Subheading
 ├── Error (if any)
 ├── Verification Code Input
 ├── Verify Button
 └── Resend Link

Footer
 └── HIPAA Message (🔒)
```

## Styling Template

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
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
});
```

## Keyboard Types
```
"default"          - Default keyboard
"email-address"    - Email with @ symbol
"number-pad"       - Numbers only
"phone-pad"        - Phone numbers
"url"              - URL keyboard
```

## FAQ

**Q: How do I enable glassmorphism on Android?**
A: It's already enabled. expo-blur works on Android API 30+. For older devices, set blur intensity to 0.

**Q: Can I customize button colors?**
A: Colors are in theme/colors.ts. Update colors.primary for main CTA color.

**Q: How do I change error message styling?**
A: Error styles are in the component. Check errorContainer style in each screen.

**Q: How do I add more input fields?**
A: Use AuthInput component. Add state, validation, and error handling following existing pattern.

**Q: How do I customize the logo?**
A: Change the emoji (🏥) or replace with an Image component.

## Performance Tips

```
✅ Use functional components
✅ Memoize static content
✅ Avoid inline styles
✅ Use StyleSheet.create()
✅ Keep state minimal
✅ Avoid unnecessary re-renders
```

## Deployment Checklist

```
□ TypeScript: 0 errors
□ All devices tested
□ Accessibility verified
□ Error messages reviewed
□ Logging implemented
□ Design tokens applied
□ Documentation reviewed
□ Code reviewed by team
```

---

**Need help?** Check the full guides:
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for visual specs
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for code examples
- [AUTHENTICATION_REDESIGN.md](AUTHENTICATION_REDESIGN.md) for architecture

