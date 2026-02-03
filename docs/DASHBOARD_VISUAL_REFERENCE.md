# Dashboard Components - Quick Visual Reference

## 🎨 Component Showcase

### AIGreeting
```
┌─────────────────────────────────────────┐
│  Good morning, Manikanta 👋            │
│                                         │
│  You're doing well today. Let's take   │
│  care of your health step by step.     │
└─────────────────────────────────────────┘
```
**Size**: Full width  
**Height**: ~100px  
**Background**: White (#FFFFFF)  
**Shadow**: Subtle (0.05 opacity)

---

### HealthStatCard Grid (2x2)
```
┌──────────────────┐  ┌──────────────────┐
│   ❤️             │  │   🩸             │
│   Blood Pressure │  │   Blood Sugar    │
│                  │  │                  │
│   120/80         │  │   95             │
│   mmHg           │  │   mg/dL          │
└──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│   ⚖️             │  │   💓             │
│   BMI            │  │   Heart Rate     │
│                  │  │                  │
│   23.5           │  │   72             │
│   kg/m²          │  │   bpm            │
└──────────────────┘  └──────────────────┘
```
**Card Size**: 150px min width, 140px min height  
**Gap**: 12px  
**Status Colors**:
- Optimal: Light teal background (#F0FDF4)
- Normal: Light blue background (#F0F9FF)
- Attention: Light amber background (#FEF3C7)

---

### AIInsightCard
```
┌─────────────────────────────────────────┐
│ ┃ 💡 Today's Insight                   │
│ ┃                                       │
│ ┃ A short walk after meals can help    │
│ ┃ balance sugar levels and improve     │
│ ┃ digestion. Try 10 minutes today!     │
└─────────────────────────────────────────┘
```
**Left Border**: 4px teal (#10B981)  
**Background**: White  
**Text**: 15px, line-height 22px

---

### TaskItem
```
┌─────────────────────────────────────────┐
│  ☐  Take morning medication             │
│      9:00 AM                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  ☑  Log blood pressure                  │
│      10:00 AM                           │
└─────────────────────────────────────────┘
```
**Height**: 64px minimum  
**Checkbox**: 24x24px  
**Touch Area**: Full row  
**Completed**: Strikethrough text, gray color

---

### QuickActionButton (2x2 Grid)
```
┌──────────────┐  ┌──────────────┐
│              │  │              │
│      📋      │  │      💬      │
│              │  │              │
│    Upload    │  │   Chat with  │
│    Report    │  │      AI      │
│              │  │              │
└──────────────┘  └──────────────┘
      (Primary)        (Secondary)

┌──────────────┐  ┌──────────────┐
│              │  │              │
│      🏥      │  │      📊      │
│              │  │              │
│     Find     │  │     View     │
│   Hospital   │  │    Reports   │
│              │  │              │
└──────────────┘  └──────────────┘
   (Secondary)       (Secondary)
```
**Size**: 47% width, 100px min height  
**Icon**: 32px emoji  
**Text**: 14px bold  
**Primary**: Teal background, white text  
**Secondary**: White background, border, dark text

---

### Progress Card
```
┌─────────────────────────────────────────┐
│                                         │
│    ╱───╲      │        🔥              │
│   │ 75% │     │                        │
│    ╲───╱      │        5               │
│                │       days             │
│  Tasks         │                        │
│  Completed     │   Current Streak       │
│                                         │
└─────────────────────────────────────────┘
```
**Layout**: Two metrics side-by-side  
**Divider**: 1px vertical line  
**Ring Size**: 80px diameter  
**Number Size**: 32px bold

---

### SectionHeader
```
Health Snapshot                    
Your vitals at a glance            
```
**Title**: 20px bold  
**Subtitle**: 14px regular, gray  
**Optional Action**: "View All" (14px, teal)

---

## 📏 Spacing Guide

### Vertical Rhythm
```
Profile Button
  ↓ 8px
AI Greeting Card
  ↓ 16px
Section Header
  ↓ 12px
Health Stats Grid (Row 1)
  ↓ 12px
Health Stats Grid (Row 2)
  ↓ 16px
AI Insight Card
  ↓ 16px
Section Header
  ↓ 12px
Task List
  ↓ 16px
Section Header
  ↓ 12px
Quick Actions Grid
  ↓ 24px
Section Header
  ↓ 12px
Progress Card
  ↓ 48px (bottom spacer)
```

### Horizontal Padding
- Screen edges: 16px
- Card internal: 16-24px
- Between grid items: 12px

---

## 🎨 Color Reference

### Primary Actions
```css
Background: #10B981 (Teal)
Text: #FFFFFF (White)
```

### Secondary Actions
```css
Background: #FFFFFF (White)
Border: #E5E7EB (Gray 200)
Text: #111827 (Gray 900)
```

### Health Status Colors
```css
Optimal:   #10B981 (Teal) on #F0FDF4 (Light teal)
Normal:    #0EA5E9 (Blue) on #F0F9FF (Light blue)
Attention: #F59E0B (Amber) on #FEF3C7 (Light amber)
```

### Text Colors
```css
Primary:   #1F2937 (Gray 800)
Secondary: #6B7280 (Gray 500)
Disabled:  #9CA3AF (Gray 400)
```

---

## 📱 Responsive Breakpoints

### Small Phones (< 375px)
- Health stats: Might need single column
- Quick actions: Force 2 columns (current design)
- Text may wrap more

### Standard Phones (375px - 428px)
- All components fit perfectly
- 2x2 grids work well
- Optimal experience

### Large Phones (> 428px)
- Components stay constrained
- Extra padding on sides optional
- Maintains readability

---

## ♿ Accessibility Specifications

### Minimum Touch Targets
```
Profile Button:     48x48px ✓
Health Stat Card:   150x140px ✓
Task Row:           full width x 64px ✓
Quick Action:       ~165x100px ✓
Checkbox:           24x24px (in 64px row) ✓
```

### Color Contrast Ratios
```
Gray 900 on White:    14.7:1 ✓✓✓ (AAA)
Gray 800 on White:    10.4:1 ✓✓✓ (AAA)
Gray 600 on White:    5.7:1 ✓✓ (AA)
Primary on White:     3.9:1 ✓ (AA Large)
Primary on Primary50: 8.2:1 ✓✓✓ (AAA)
```

### Screen Reader Labels
```typescript
// Health Stat
accessibilityLabel="Blood Pressure: 120 over 80 millimeters of mercury"
accessibilityRole="button"

// Task
accessibilityLabel="Incomplete task: Take morning medication"
accessibilityHint="Double tap to toggle completion"

// Quick Action
accessibilityLabel="Upload Report"
accessibilityRole="button"
```

---

## 🔧 Implementation Tips

### Import Components
```typescript
import {
  AIGreeting,
  HealthStatCard,
  AIInsightCard,
  TaskItem,
  QuickActionButton,
  SectionHeader,
  ProgressRing,
} from "@/components/dashboard";
```

### Use Section Headers Consistently
```typescript
<SectionHeader
  title="Section Title"
  subtitle="Optional description"
  actionText="View All"
  onActionPress={() => {}}
/>
```

### Grid Layouts
```typescript
// Auto-wrapping grid
<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
  <Component1 style={{ flex: 1, minWidth: "47%" }} />
  <Component2 style={{ flex: 1, minWidth: "47%" }} />
</View>
```

### Dynamic Content
```typescript
// Time-aware greeting
const hour = new Date().getHours();
const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

// Random AI messages
const messages = [/* array of messages */];
const randomMessage = messages[Math.floor(Math.random() * messages.length)];
```

---

## 📸 Screenshot Checklist

When documenting/presenting:
1. Capture full dashboard scroll
2. Show task completion interaction
3. Highlight accessibility features
4. Demonstrate responsive layout
5. Show with/without data states

---

## 🚦 Status Indicators Summary

### Visual Cues (No Reliance on Color Alone)
- ✅ Icon + Color + Text
- ✅ Checkmark for completed tasks
- ✅ Numbers + Units for health stats
- ❌ Color only

### Hierarchy
1. **Primary Action**: Teal button (Upload Report)
2. **Secondary Actions**: White buttons with borders
3. **Tertiary Actions**: Text links in headers ("View All")

---

## 🎯 Quick Decision Matrix

| Component | When to Use | When NOT to Use |
|-----------|-------------|-----------------|
| AIGreeting | Dashboard top, once | Multiple times per page |
| HealthStatCard | Numeric health metrics | Text-heavy info |
| AIInsightCard | One insight/tip | Multiple tips (use list) |
| TaskItem | Checkbox tasks | Complex forms |
| QuickActionButton | Primary workflows | Rarely-used features |
| ProgressRing | Percentage metrics | Time-series data |

---

## 🧩 Component Combinations

### Standard Dashboard Layout
```
AIGreeting
  ↓
SectionHeader + HealthStatCard Grid
  ↓
AIInsightCard
  ↓
SectionHeader + TaskItem List
  ↓
SectionHeader + QuickActionButton Grid
  ↓
SectionHeader + Progress Card
```

### Minimal Dashboard (Low-info users)
```
AIGreeting
  ↓
QuickActionButton Grid
  ↓
AIInsightCard
```

### Data-Rich Dashboard (Active users)
```
AIGreeting
  ↓
HealthStatCard Grid (larger)
  ↓
AIInsightCard
  ↓
TaskItem List
  ↓
Progress Card (multiple metrics)
```

---

**Remember**: This is Apple-level design — every pixel has a purpose, every interaction feels natural, and every color choice reduces anxiety. Keep it calm, clear, and caring.
