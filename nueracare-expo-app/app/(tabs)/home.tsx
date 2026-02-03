/**
 * NueraCare Home Screen (Dashboard)
 * Futuristic Healthcare UI with Glassmorphism
 * 
 * Design Features:
 * - White theme with mint-teal accent (#00BFA5)
 * - Glassmorphism cards with blur effect
 * - SVG health score ring
 * - Smooth animations with Reanimated
 * - WCAG AA accessibility compliance
 * 
 * Tech Stack:
 * - React Native + Expo
 * - Expo Vector Icons
 * - React Native SVG
 * - React Native Reanimated
 */

import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { colors, spacing, borderRadius } from "@/theme/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import Svg, { Circle } from "react-native-svg";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";


// Health Score Ring Component
interface HealthScoreRingProps {
  score: number;
  size?: number;
}

function HealthScoreRing({ score, size = 80 }: HealthScoreRingProps) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (score / 100) * circumference;

  return (
    <View style={styles.scoreContainer}>
      <Svg width={size} height={size} style={styles.scoreSvg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E0F2F1"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#00BFA5"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          fill="transparent"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.scoreTextContainer}>
        <Text style={styles.scoreNumber}>{score}</Text>
        <Text style={styles.scoreLabel}>Excellent</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  
  const [healthScore] = useState(92);
  
  // Get time of day for greeting
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  // Get user display name
  const getUserName = () => {
    if (user?.firstName) return user.firstName;
    if (user?.id) return user.id;
    return "User";
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: Greeting + Health Score */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>
              Good {getTimeOfDay()}, {getUserName()}
            </Text>
            <Text style={styles.greetingSubtext}>
              You're doing well today.
            </Text>
          </View>
          <HealthScoreRing score={healthScore} size={80} />
        </View>

        {/* Health Snapshot Card */}
        <View style={styles.glassCard}>
          <BlurView intensity={60} style={styles.blurContainer}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Health Snapshot</Text>
              
              {/* Health Metrics Grid */}
              <View style={styles.metricsGrid}>
                {/* Blood Pressure */}
                <View style={styles.metricRow}>
                  <View style={styles.metricLeft}>
                    <MaterialCommunityIcons name="heart-pulse" size={20} color="#00BFA5" />
                    <View style={styles.metricInfo}>
                      <Text style={styles.metricLabel}>Blood Pressure</Text>
                      <Text style={styles.metricValue}>120/80</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, styles.statusNormal]}>
                    <Text style={styles.statusText}>Normal</Text>
                  </View>
                </View>

                {/* Blood Sugar */}
                <View style={styles.metricRow}>
                  <View style={styles.metricLeft}>
                    <MaterialCommunityIcons name="water" size={20} color="#00BFA5" />
                    <View style={styles.metricInfo}>
                      <Text style={styles.metricLabel}>Blood Sugar</Text>
                      <Text style={styles.metricValue}>95</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, styles.statusGood]}>
                    <Text style={styles.statusText}>Good</Text>
                  </View>
                </View>

                {/* Heart Rate */}
                <View style={styles.metricRow}>
                  <View style={styles.metricLeft}>
                    <Feather name="activity" size={20} color="#00BFA5" />
                    <View style={styles.metricInfo}>
                      <Text style={styles.metricLabel}>Heart Rate</Text>
                      <Text style={styles.metricValue}>72 bpm</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, styles.statusResting]}>
                    <Text style={styles.statusText}>Resting</Text>
                  </View>
                </View>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Today's Focus Card */}
        <View style={styles.glassCard}>
          <BlurView intensity={60} style={styles.blurContainer}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Today's Focus</Text>
              
              <View style={styles.taskRow}>
                <View style={styles.taskLeft}>
                  <View style={styles.taskBullet} />
                  <Text style={styles.taskText}>Take morning medication</Text>
                </View>
                <TouchableOpacity
                  style={styles.markDoneButton}
                  accessible
                  accessibilityLabel="Mark task as done"
                  accessibilityRole="button"
                >
                  <Text style={styles.markDoneText}>Mark done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Primary Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/report/upload")}
            accessible
            accessibilityLabel="Upload Medical Report"
            accessibilityRole="button"
          >
            <Feather name="upload-cloud" size={24} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Upload Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/(tabs)/chat")}
            accessible
            accessibilityLabel="Chat with AI Assistant"
            accessibilityRole="button"
          >
            <Feather name="message-circle" size={24} color="#00BFA5" style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>Chat with AI</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F9F8", // Soft mint-teal background
  },
  container: {
    flex: 1,
    backgroundColor: "#F0F9F8",
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100, // Extra padding for bottom nav
  },

  // Header: Greeting + Health Score
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  greetingContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: spacing.xs,
    lineHeight: 32,
  },
  greetingSubtext: {
    fontSize: 15,
    fontWeight: "400",
    color: "#6B7280",
    lineHeight: 22,
  },

  // Health Score Ring
  scoreContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreSvg: {
    transform: [{ rotate: "-90deg" }],
  },
  scoreTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#00BFA5",
    lineHeight: 28,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#00BFA5",
    marginTop: 2,
  },

  // Glassmorphism Card
  glassCard: {
    borderRadius: 24,
    marginBottom: spacing.lg,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  blurContainer: {
    overflow: "hidden",
    borderRadius: 24,
  },
  cardContent: {
    padding: spacing.xl,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: spacing.lg,
  },

  // Health Metrics Grid
  metricsGrid: {
    gap: spacing.lg,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusNormal: {
    backgroundColor: "#E0F2F1",
  },
  statusGood: {
    backgroundColor: "#E0F2F1",
  },
  statusResting: {
    backgroundColor: "#F3F4F6",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#00BFA5",
  },

  // Today's Focus Card
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
  },
  taskBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00BFA5",
  },
  taskText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1A1A1A",
    flex: 1,
  },
  markDoneButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#00BFA5",
  },
  markDoneText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00BFA5",
  },

  // Primary Actions
  actionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: "#00BFA5",
    borderRadius: 16,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    shadowColor: "#00BFA5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#00BFA5",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00BFA5",
  },

  // Bottom Spacer
  bottomSpacer: {
    height: spacing.xxxl,
  },
});

