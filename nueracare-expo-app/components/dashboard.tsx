// Premium Healthcare Dashboard Components
// Apple-level UI/UX for NueraCare
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors, spacing, borderRadius, typography } from "@/theme/colors";
import { BlurView } from "expo-blur";

// ========================================
// AI GREETING CARD
// ========================================
interface AIGreetingProps {
  userName: string;
  timeOfDay: "morning" | "afternoon" | "evening";
  message: string;
  style?: ViewStyle;
}

export function AIGreeting({
  userName,
  timeOfDay,
  message,
  style,
}: AIGreetingProps) {
  const greetings = {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
  };

  return (
    <View style={[styles.aiGreetingCard, style]}>
      <Text style={styles.greetingText}>
        {greetings[timeOfDay]}, {userName} 👋
      </Text>
      <Text style={styles.aiMessage}>{message}</Text>
    </View>
  );
}

// ========================================
// HEALTH STAT CARD
// ========================================
interface HealthStatCardProps {
  label: string;
  value: string | number;
  unit: string;
  status?: "optimal" | "normal" | "attention";
  icon?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function HealthStatCard({
  label,
  value,
  unit,
  status = "normal",
  icon,
  onPress,
  style,
}: HealthStatCardProps) {
  const statusColors = {
    optimal: colors.primary,
    normal: colors.secondary,
    attention: colors.warning,
  };

  const statusBgs = {
    optimal: colors.primary50,
    normal: colors.secondary50,
    attention: "#FEF3C7",
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[styles.healthStatCard, { backgroundColor: statusBgs[status] }, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      accessible
      accessibilityLabel={`${label}: ${value} ${unit}`}
      accessibilityRole={onPress ? "button" : "text"}
    >
      {icon && <Text style={styles.statIcon}>{icon}</Text>}
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueContainer}>
        <Text style={[styles.statValue, { color: statusColors[status] }]}>
          {value}
        </Text>
        <Text style={styles.statUnit}>{unit}</Text>
      </View>
    </Component>
  );
}

// ========================================
// GLASS CARD WITH BLUR EFFECT
// ========================================
interface GlassCardProps {
  children: React.ReactNode;
  intensity?: number;
  style?: ViewStyle;
}

export function GlassCard({ children, intensity = 80, style }: GlassCardProps) {
  return (
    <View style={[styles.glassCardContainer, style]}>
      <BlurView intensity={intensity} style={styles.blurView}>
        <View style={styles.glassOverlay}>{children}</View>
      </BlurView>
    </View>
  );
}

// ========================================
// AI INSIGHT CARD
// ========================================
interface AIInsightCardProps {
  insight: string;
  category?: "tip" | "reminder" | "achievement";
  icon?: string;
  style?: ViewStyle;
}

export function AIInsightCard({
  insight,
  category = "tip",
  icon = "💡",
  style,
}: AIInsightCardProps) {
  return (
    <View style={[styles.insightCard, style]}>
      <View style={styles.insightHeader}>
        <Text style={styles.insightIcon}>{icon}</Text>
        <Text style={styles.insightLabel}>Today's Insight</Text>
      </View>
      <Text style={styles.insightText}>{insight}</Text>
    </View>
  );
}

// ========================================
// TASK ITEM
// ========================================
interface TaskItemProps {
  title: string;
  time?: string;
  completed?: boolean;
  onToggle: () => void;
  style?: ViewStyle;
}

export function TaskItem({
  title,
  time,
  completed = false,
  onToggle,
  style,
}: TaskItemProps) {
  return (
    <TouchableOpacity
      style={[styles.taskItem, style]}
      onPress={onToggle}
      activeOpacity={0.7}
      accessible
      accessibilityLabel={`${completed ? "Completed" : "Incomplete"} task: ${title}`}
      accessibilityRole="button"
      accessibilityHint="Double tap to toggle completion"
    >
      <View style={styles.taskCheckbox}>
        {completed && <View style={styles.taskCheckboxFill} />}
      </View>
      <View style={styles.taskContent}>
        <Text
          style={[
            styles.taskTitle,
            completed && styles.taskTitleCompleted,
          ]}
        >
          {title}
        </Text>
        {time && <Text style={styles.taskTime}>{time}</Text>}
      </View>
    </TouchableOpacity>
  );
}

// ========================================
// QUICK ACTION BUTTON
// ========================================
interface QuickActionButtonProps {
  title: string;
  icon: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  style?: ViewStyle;
}

export function QuickActionButton({
  title,
  icon,
  onPress,
  variant = "primary",
  style,
}: QuickActionButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      style={[
        styles.quickActionButton,
        isPrimary ? styles.quickActionPrimary : styles.quickActionSecondary,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessible
      accessibilityLabel={title}
      accessibilityRole="button"
    >
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text
        style={[
          styles.quickActionText,
          isPrimary
            ? styles.quickActionTextPrimary
            : styles.quickActionTextSecondary,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

// ========================================
// PROGRESS RING (Simple)
// ========================================
interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  style?: ViewStyle;
}

export function ProgressRing({
  percentage,
  size = 80,
  strokeWidth = 8,
  color = colors.primary,
  label,
  style,
}: ProgressRingProps) {
  return (
    <View style={[styles.progressRingContainer, { width: size, height: size }, style]}>
      <View
        style={[
          styles.progressRingBackground,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
          },
        ]}
      />
      <View style={styles.progressRingContent}>
        <Text style={styles.progressRingText}>{percentage}%</Text>
        {label && <Text style={styles.progressRingLabel}>{label}</Text>}
      </View>
    </View>
  );
}

// ========================================
// SECTION HEADER
// ========================================
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export function SectionHeader({
  title,
  subtitle,
  actionText,
  onActionPress,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {actionText && onActionPress && (
        <TouchableOpacity
          onPress={onActionPress}
          accessible
          accessibilityLabel={actionText}
          accessibilityRole="button"
        >
          <Text style={styles.sectionAction}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ========================================
// STYLES
// ========================================
const styles = StyleSheet.create({
  // AI Greeting Card
  aiGreetingCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.gray900,
    marginBottom: spacing.md,
    lineHeight: 36,
  },
  aiMessage: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.gray600,
    lineHeight: 24,
  },

  // Health Stat Card
  healthStatCard: {
    flex: 1,
    minWidth: 150,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.gray600,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  statValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: spacing.xs,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 38,
  },
  statUnit: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray500,
    marginLeft: spacing.xs,
  },

  // Glass Card
  glassCardContainer: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  blurView: {
    overflow: "hidden",
    borderRadius: borderRadius.xl,
  },
  glassOverlay: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: spacing.xl,
  },

  // AI Insight Card
  insightCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  insightIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray700,
  },
  insightText: {
    fontSize: 15,
    fontWeight: "400",
    color: colors.gray800,
    lineHeight: 22,
  },

  // Task Item
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray200,
    minHeight: 64,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  taskCheckboxFill: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: colors.gray500,
  },
  taskTime: {
    fontSize: 13,
    color: colors.gray500,
  },

  // Quick Action Button
  quickActionButton: {
    flex: 1,
    minWidth: "47%",
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionPrimary: {
    backgroundColor: colors.primary,
  },
  quickActionSecondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  quickActionTextPrimary: {
    color: colors.white,
  },
  quickActionTextSecondary: {
    color: colors.gray900,
  },

  // Progress Ring
  progressRingContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  progressRingBackground: {
    position: "absolute",
    borderColor: colors.gray200,
  },
  progressRingContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  progressRingText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.gray900,
  },
  progressRingLabel: {
    fontSize: 11,
    color: colors.gray600,
    marginTop: spacing.xs,
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.gray600,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
});
