import { View, Text, StyleSheet } from "react-native";

export default function OtpScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP Verification</Text>
      <Text>OTP placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 6 },
});
