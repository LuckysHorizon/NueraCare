import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useUser, useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Heading, Body, Card, Button } from "@/components/common";
import { colors, spacing, borderRadius } from "@/theme/colors";
import { globalStyles } from "@/theme/styles";

export default function HomeScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Heading level={1}>Hello, {user?.firstName || "User"}! 👋</Heading>
          <Body style={styles.subtitle}>
            Welcome back to NueraCare
          </Body>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Body style={styles.profileInitial}>
            {user?.firstName?.charAt(0) || "U"}
          </Body>
        </TouchableOpacity>
      </View>

      {/* Health Snapshot Card */}
      <Card>
        <Heading level={3}>Today's Health</Heading>
        <View style={styles.healthMetrics}>
          <MetricItem label="BP" value="---" unit="mmHg" />
          <MetricItem label="Sugar" value="---" unit="mg/dL" />
          <MetricItem label="BMI" value="---" unit="kg/m²" />
        </View>
        <Body style={styles.hint}>
          Add your measurements for personalized insights
        </Body>
        <Button
          title="+ Add Measurements"
          onPress={() => {}}
          variant="secondary"
        />
      </Card>

      {/* Health Tip */}
      <Card>
        <Heading level={3}>💡 Daily Tip</Heading>
        <Body style={styles.tipText}>
          Drinking 8 glasses of water daily supports your immune system and
          improves digestion. Stay hydrated!
        </Body>
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Heading level={3}>Quick Actions</Heading>
        <View style={styles.actionGrid}>
          <ActionButton
            emoji="📋"
            title="Upload Report"
            onPress={() => router.push("/report/upload")}
          />
          <ActionButton
            emoji="🏥"
            title="Find Hospital"
            onPress={() => router.push("/(tabs)/hospitals")}
          />
          <ActionButton
            emoji="💬"
            title="Chat AI"
            onPress={() => router.push("/(tabs)/chat")}
          />
          <ActionButton
            emoji="⚙️"
            title="Settings"
            onPress={() => router.push("/accessibility/settings")}
          />
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <Button
          title="Log Out"
          onPress={handleLogout}
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
}

function MetricItem({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <View style={styles.metricItem}>
      <Body style={styles.metricLabel}>{label}</Body>
      <Heading level={3} style={styles.metricValue}>
        {value}
      </Heading>
      <Body style={styles.metricUnit}>{unit}</Body>
    </View>
  );
}

function ActionButton({
  emoji,
  title,
  onPress,
}: {
  emoji: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Heading level={1} style={styles.actionEmoji}>
        {emoji}
      </Heading>
      <Body style={styles.actionTitle}>{title}</Body>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xl,
  },
  subtitle: {
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary100,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitial: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "700",
  },
  healthMetrics: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  metricItem: {
    alignItems: "center",
  },
  metricLabel: {
    color: colors.textLight,
    fontSize: 12,
  },
  metricValue: {
    marginVertical: spacing.sm,
  },
  metricUnit: {
    fontSize: 11,
    color: colors.textLight,
  },
  hint: {
    color: colors.textLight,
    fontSize: 13,
    marginVertical: spacing.md,
  },
  tipText: {
    color: colors.text,
    lineHeight: 24,
    marginVertical: spacing.md,
  },
  quickActions: {
    marginVertical: spacing.lg,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.primary50,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  actionEmoji: {
    marginBottom: spacing.sm,
  },
  actionTitle: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
  },
  logoutSection: {
    marginVertical: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});

