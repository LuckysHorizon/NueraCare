import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  TextInput,
  TouchableOpacity,
  Text,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Button, Heading, Body } from "@/components/common";
import { spacing } from "@/theme/colors";
import { upsertUserProfile } from "@/services/sanity";
import { Heart, Ruler, Weight } from "lucide-react-native";

const ACCENT = "#00BFA5";

export default function HealthInfoScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: "",
    bloodGroup: "",
    height: "",
    weight: "",
    chronicDiseases: "",
    primaryLanguage: "English",
  });

  const handleNext = async () => {
    if (!user?.id) {
      alert("User not authenticated");
      return;
    }

    setLoading(true);
    try {
      // Save to Sanity
      await upsertUserProfile(user.id, {
        clerkId: user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.emailAddresses[0]?.emailAddress || "",
        imageUrl: user.imageUrl,
        age: parseInt(formData.age) || 0,
        bloodGroup: formData.bloodGroup,
        height: parseInt(formData.height) || 0,
        weight: parseInt(formData.weight) || 0,
        chronicDiseases: formData.chronicDiseases,
        primaryLanguage: formData.primaryLanguage,
        highContrast: false,
        largeTextMode: true,
        reducedMotion: false,
        createdAt: new Date().toISOString(),
      });
      router.push("/(onboarding)/accessibility");
    } catch (error) {
      console.error("Error saving health info:", error);
      alert("Failed to save health information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/(onboarding)/accessibility");
  };

  return (
    <LinearGradient
      colors={["#EAFBF8", "#F7FEFD", "#FFFFFF"]}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Heading level={2} style={styles.title}>Your Health Profile</Heading>
          <Body style={styles.subtitle}>
            Help us understand your health better (all optional)
          </Body>
        </View>

        <View style={styles.form}>
          <InputField
            icon={<Heart size={18} color={ACCENT} />}
            label="Blood Group"
            placeholder="e.g., O+, A-, B+"
            value={formData.bloodGroup}
            onChangeText={(bloodGroup) => setFormData({ ...formData, bloodGroup })}
          />

          <InputField
            icon={<Heart size={18} color={ACCENT} />}
            label="Age"
            placeholder="Your age in years"
            value={formData.age}
            onChangeText={(age) => setFormData({ ...formData, age })}
            keyboardType="numeric"
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <InputField
                icon={<Ruler size={18} color={ACCENT} />}
                label="Height"
                placeholder="cm"
                value={formData.height}
                onChangeText={(height) => setFormData({ ...formData, height })}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <InputField
                icon={<Weight size={18} color={ACCENT} />}
                label="Weight"
                placeholder="kg"
                value={formData.weight}
                onChangeText={(weight) => setFormData({ ...formData, weight })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <InputField
            icon={<Heart size={18} color={ACCENT} />}
            label="Chronic Diseases (if any)"
            placeholder="List any chronic conditions..."
            value={formData.chronicDiseases}
            onChangeText={(chronicDiseases) => setFormData({ ...formData, chronicDiseases })}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={loading ? "Saving..." : "Continue"}
          onPress={handleNext}
        />
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={loading}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

function InputField({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  multiline = false,
  numberOfLines = 1,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "numeric" | "email-address";
  multiline?: boolean;
  numberOfLines?: number;
}) {
  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputLabelRow}>
        {icon}
        <Heading level={4} style={styles.inputLabel}>{label}</Heading>
      </View>
      <BlurView intensity={50} tint="light" style={styles.inputBlur}>
        <TextInput
          style={[
            styles.input,
            multiline && { height: numberOfLines * 40, paddingTop: spacing.md },
          ]}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: Platform.OS === "ios" ? spacing.xxl : spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "Inter",
  },
  subtitle: {
    color: "#6B7280",
    marginTop: spacing.md,
    fontSize: 14,
    fontFamily: "Inter",
  },
  form: {
    marginBottom: spacing.xxl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    fontFamily: "Inter",
  },
  inputBlur: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  input: {
    padding: spacing.md,
    fontSize: 14,
    color: "#0F172A",
    fontFamily: "Inter",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? spacing.xl : spacing.lg,
    gap: spacing.md,
  },
  skipButton: {
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: ACCENT,
    alignItems: "center",
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: ACCENT,
    fontFamily: "Inter",
  },
});
