import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Button, Input, Heading, Body } from "@/components/common";
import { colors, spacing, borderRadius } from "@/theme/colors";
import { globalStyles } from "@/theme/styles";

export default function HealthInfoScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    age: "",
    bloodType: "",
    height: "",
    weight: "",
    chronicDiseases: "",
  });

  const handleNext = () => {
    // Validate and save data
    router.push("/(onboarding)/accessibility");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Heading level={2}>Your Health Profile</Heading>
        <Body style={styles.subtitle}>
          Help us understand your health better (all optional)
        </Body>
      </View>

      <View style={styles.form}>
        <Input
          placeholder="Age"
          value={formData.age}
          onChangeText={(age: string) => setFormData({ ...formData, age })}
          keyboardType="numeric"
        />

        <Input
          placeholder="Blood Type (e.g., O+)"
          value={formData.bloodType}
          onChangeText={(bloodType: string) =>
            setFormData({ ...formData, bloodType })
          }
        />

        <View style={styles.row}>
          <Input
            placeholder="Height (cm)"
            value={formData.height}
            onChangeText={(height: string) => setFormData({ ...formData, height })}
            keyboardType="numeric"
          />
          <Input
            placeholder="Weight (kg)"
            value={formData.weight}
            onChangeText={(weight: string) => setFormData({ ...formData, weight })}
            keyboardType="numeric"
          />
        </View>

        <Input
          placeholder="Chronic Diseases (if any)"
          value={formData.chronicDiseases}
          onChangeText={(chronicDiseases: string) =>
            setFormData({ ...formData, chronicDiseases })
          }
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.footer}>
        <Button title="Continue" onPress={handleNext} />
        <Button
          title="Skip"
          variant="secondary"
          onPress={handleNext}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  subtitle: {
    color: colors.textLight,
    marginTop: spacing.md,
    fontSize: 14,
  },
  form: {
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  footer: {
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
});
