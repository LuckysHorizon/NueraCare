import { View, Text, StyleSheet } from "react-native";

export default function ReportResultScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report Result</Text>
      <Text>Summary placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 6 },
});
