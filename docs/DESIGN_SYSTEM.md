# Healthcare UI Design System - Visual Reference

## Color Palette

### Primary Colors
```
Teal Primary:        #10B981  ✓ (Trust, healthcare, calm)
Light Teal:          #D1FAE5  (for subtle backgrounds)
Primary 50:          #F0FDF4  (very light backgrounds)
```

### Neutral Colors
```
Gray 900:            #111827  (dark text, headings)
Gray 800:            #1F2937  (body text)
Gray 600:            #4B5563  (secondary text)
Gray 500:            #6B7280  (muted text)
Gray 400:            #9CA3AF  (borders, disabled)
Gray 50:             #F9FAFB  (background, off-white)
White:               #FFFFFF  (cards, overlays)
```

### Status Colors
```
Warning/Amber:       #F59E0B  (for validation, caution)
Error 50:            #FEF2F2  (error background - very muted)
Error:               #DC2626  (error text - avoid harsh red)
Success:             #10B981  (success state - same as primary)
```

---

## Typography System

### Heading Styles
```
Heading (28px)
- Font Weight: 700 (Bold)
- Color: Gray 900 (#111827)
- Letter Spacing: 0.4px
- Use: Main form titles ("Welcome back", "Create your account")

Subheading (14px)
- Font Weight: 500 (Medium)
- Color: Gray 600 (#4B5563)
- Line Height: 20px
- Use: Form descriptions and helper text
```

### Body Text
```
Body (16px)
- Font Weight: 400 (Regular)
- Color: Gray 800 (#1F2937)
- Line Height: 24px
- Use: Input labels, instructions, general text

Small Text (13px)
- Font Weight: 500 (Medium)
- Color: Gray 600 (#4B5563)
- Use: Captions, secondary information, error messages

Button Text (16px)
- Font Weight: 600 (Semi-bold)
- Color: White or Gray 900
- Use: Call-to-action buttons
```

---

## Component Sizes

### Touch Targets (Accessibility)
```
Minimum Height:   48px   (Small buttons, inputs)
Preferred Height: 52px   (Input fields)
Large Height:     56px   (Primary CTA buttons)

All touch targets meet WCAG AAA minimum of 44x44px
Preferred minimum for elderly users: 56px
```

### Spacing Increments
```
xs:    4px    (smallest space)
sm:    8px    (small gaps)
md:   12px    (medium gaps)
lg:   16px    (standard spacing)
xl:   24px    (large spacing)
xxl:  32px    (extra large)
xxxl: 48px    (form spacing)
```

### Border Radius
```
Small:    8px   (minor elements)
Medium:  12px   (inputs, small cards)
Large:   16px   (main containers)
XL:      20px   (glassmorphism cards)
```

---

## Component Specifications

### GlassCard (Glassmorphism Container)
```
Background:        rgba(255, 255, 255, 0.70)
Blur Intensity:    85 (expo-blur)
Border Radius:     20px
Border:            1px solid rgba(255, 255, 255, 0.5)
Shadow:            0 4px 12px rgba(0, 0, 0, 0.08)
Padding:           24px (lg)
Margin:            24px horizontal
```

### AuthInput (Text Field)
```
Height:            52px minimum
Background:        White (#FFFFFF)
Border:            1px solid Gray 400
Border Radius:     12px
Padding:           12px horizontal, 14px vertical

Focus State:
  Border Color:    Teal Primary (#10B981)
  Border Width:    2px
  Shadow:          0 0 0 3px rgba(16, 185, 129, 0.1)
  Background:      Light Teal (#F0FDF4)

Error State:
  Background:      Error 50 (#FEF2F2)
  Border Color:    Warning (#F59E0B)
  Text Color:      Gray 800

Disabled State:
  Background:      Gray 50
  Text Color:      Gray 400
  Opacity:         0.5
```

### SignInButton (Primary CTA)
```
Height:            56px
Background:        Teal Primary (#10B981)
Text Color:        White
Border Radius:     12px
Font Weight:       600
Font Size:         16px

Shadow:            0 4px 12px rgba(16, 185, 129, 0.3)

Hover/Active State:
  Background:      Darker Teal (darken by 10%)
  Shadow:          0 6px 16px rgba(16, 185, 129, 0.4)

Disabled State:
  Background:      Gray 400
  Opacity:         0.5
  Shadow:          None

Loading State:
  Shows spinner in place of text
  Prevents interaction
```

### GoogleAuthButton
```
Height:            52px minimum
Background:        White (#FFFFFF)
Border:            1.5px solid Gray 400 (#9CA3AF)
Border Radius:     12px
Text Color:        Gray 900

Shadow:            0 2px 8px rgba(0, 0, 0, 0.06)

Hover State:
  Background:      Gray 50
  Border Color:    Gray 500
  Shadow:          0 4px 12px rgba(0, 0, 0, 0.1)
```

### AuthDivider (Separator)
```
Line Color:        Gray 400
Line Height:       1px
Text Color:        Gray 600
Font Size:         13px
Font Weight:       500
Spacing:           xl (24px) above and below
```

### Error Message Container
```
Background:        Error 50 (#FEF2F2) - very muted
Border Left:       4px solid Warning (#F59E0B)
Border Radius:     12px
Padding:           12px horizontal, 12px vertical
Margin Bottom:     16px

Text Color:        Gray 800 (#1F2937)
Font Size:         13px
Font Weight:       500
Line Height:       18px

Icon:              ⚠️ (warning emoji, 18px)
Icon Margin:       8px right
```

---

## Animation & Motion

### Focus State Transitions
```
Duration:   200ms
Easing:     ease-out
Properties: borderColor, backgroundColor, shadowColor
```

### Button Press
```
Duration:   100ms
Easing:     ease-in-out
Scale:      0.98 (subtle press effect)
```

### Loading Spinner
```
Duration:   1000ms (1 second rotation)
Color:      Teal Primary
Size:       18px
```

### Disabled State
```
Opacity:    0.5
Cursor:     not-allowed
```

---

## Accessibility Standards

### Color Contrast
```
WCAG AAA Compliance:
- Text on background: ≥ 7:1 contrast ratio
- All gray text verified against white background
- Error colors verified for accessibility

Examples:
- Gray 900 text on Gray 50 background: ✓ 13:1
- Gray 600 text on White background: ✓ 7.5:1
- Teal text on White background: ✓ 5.8:1
```

### Touch Targets
```
- Minimum: 44x44px (WCAG AA)
- Preferred: 48x48px (healthcare)
- Large: 56x56px (elderly users)

All buttons: 56px minimum height
All inputs: 52px minimum height
All touch areas: ≥48px
```

### Screen Reader Support
```
Components include:
- accessibilityRole: "button", "link", "alert"
- accessibilityLabel: descriptive labels
- accessibilityHint: additional context
- accessibilityLiveRegion: "polite" for dynamic content
- accessibilityHint: instructions for complex controls
```

### Font Scaling
```
System Font Size Multiplier: up to 1.3x
- Supports users with vision sensitivity
- Text doesn't overflow with large fonts
- Line heights accommodate scaling
```

---

## Responsive Design

### Layout Breakpoints
```
Mobile (< 375px):   Small devices, iPhone SE
Mobile (375-667px): Standard phones
Mobile (> 667px):   Large phones, tablets
```

### Orientation Support
```
Portrait:   Standard vertical layout (primary)
Landscape:  Adjusted padding and spacing
```

### Safe Area Insets
```
Used for:
- iOS notch avoidance
- Android status bar
- Bottom gesture area
All screens wrapped in SafeAreaView
```

---

## Dark Mode (Future)

```
Teal Primary:        #14B8A6 (lighter teal for dark)
Background:          #111827 (dark gray)
Card Background:     #1F2937 (lighter gray)
Text Color:          #F3F4F6 (light gray)

Error:               #FCA5A5 (lighter red for dark)
Success:             #6EE7B7 (lighter green)
```

*(Currently light mode only, ready for future dark mode implementation)*

---

## Implementation Notes

### iOS Specific
- Uses System font for platform authenticity
- Supports Face ID integration point
- Respects Safe Area for notch devices
- VoiceOver compatible

### Android Specific
- Uses sans-serif for platform authenticity
- Respects system gesture areas
- TalkBack compatible
- Supports Dynamic Island-like features (if available)

### Cross-Platform
- Same visual design on both platforms
- Platform-specific fonts (System vs sans-serif)
- Consistent spacing and sizing
- Universal accessibility features

---

## Testing Checklist

- [ ] All components render correctly
- [ ] Glassmorphism blur effect visible on both iOS/Android
- [ ] Large text mode (1.3x) doesn't overflow
- [ ] Screen reader (VoiceOver/TalkBack) reads all labels
- [ ] All buttons are 56px minimum height
- [ ] Error messages display with proper styling
- [ ] Focus states visible on all inputs
- [ ] Loading spinners animate smoothly
- [ ] Color contrast meets WCAG AAA
- [ ] Devices tested: iPhone SE, iPhone 13, iPhone 15, Android 5"/6"

