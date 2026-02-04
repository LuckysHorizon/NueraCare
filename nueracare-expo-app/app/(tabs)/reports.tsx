import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Body, Heading, Card } from "@/components/common";
import { borderRadius, colors, spacing } from "@/theme/colors";
import { useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  uploadMedicalReport,
  UploadReportResponse,
} from "@/services/backend";

const LAST_REPORT_ID_KEY = "nueracare:lastReportId";

export default function ReportsScreen() {
  const { user } = useUser();
  const [userId, setUserId] = useState("");
  const [reportType, setReportType] = useState("");
  const [selectedFile, setSelectedFile] = useState<
    DocumentPicker.DocumentPickerAsset | undefined
  >(undefined);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user?.id]);

  const canUpload = useMemo(
    () => Boolean(userId.trim() && selectedFile?.uri),
    [userId, selectedFile]
  );

  const handlePickFile = async () => {
    setError(null);
    const response = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*", "text/*"],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (response.canceled) {
      return;
    }

    const asset = response.assets?.[0];
    setSelectedFile(asset);
  };

  const handleUpload = async () => {
    if (!canUpload || !selectedFile) return;
    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const uploadResult = await uploadMedicalReport({
        userId: userId.trim(),
        reportType: reportType.trim() || undefined,
        file: {
          uri: selectedFile.uri,
          name: selectedFile.name || "medical-report.pdf",
          mimeType: selectedFile.mimeType,
        },
      });

      setResult(uploadResult);
      await AsyncStorage.setItem(LAST_REPORT_ID_KEY, uploadResult.report_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <LinearGradient colors={["#F5FCFB", "#FFFFFF"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Heading level={3} style={styles.title}>
            Upload Medical Report
          </Heading>
          <Body style={styles.subtitle}>
            Upload a PDF or image so the assistant can explain it gently.
          </Body>
        </View>

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Signed-in user</Text>
            <Text style={styles.infoValue}>{userId || "Not available"}</Text>
          </View>
          <TextInput
            placeholder="Report type (optional)"
            value={reportType}
            onChangeText={setReportType}
            style={styles.input}
            placeholderTextColor={colors.gray400}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Report file</Text>
          <TouchableOpacity style={styles.filePicker} onPress={handlePickFile}>
            <Text style={styles.filePickerText}>
              {selectedFile?.name || "Select PDF / Image / Text file"}
            </Text>
          </TouchableOpacity>
          <Body style={styles.helperText}>
            Supported: PDF, JPG, PNG, and text files (max 10MB)
          </Body>

          <View style={styles.uploadButtonWrapper}>
            {uploading ? (
              <View style={styles.loadingButton}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <Button
                title="Upload Report"
                onPress={handleUpload}
                disabled={!canUpload}
              />
            )}
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </Card>

        {result ? (
          <Card style={styles.card}>
            <Text style={styles.sectionLabel}>Upload result</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Report ID</Text>
              <Text style={styles.resultValue}>{result.report_id}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>User ID</Text>
              <Text style={styles.resultValue}>{result.user_id}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Report type</Text>
              <Text style={styles.resultValue}>{result.report_type || "N/A"}</Text>
            </View>

            <Text style={styles.sectionLabel}>Parsed values</Text>
            {result.parsed_values?.length ? (
              result.parsed_values.slice(0, 6).map((value, index) => (
                <View key={`${value.test_name}-${index}`} style={styles.valueRow}>
                  <Text style={styles.valueName}>{value.test_name}</Text>
                  <Text style={styles.valueDetail}>
                    {value.value} {value.unit || ""} • {value.reference_range || "range N/A"}
                  </Text>
                  <Text style={styles.valueNote}>{value.classification}</Text>
                </View>
              ))
            ) : (
              <Body style={styles.helperText}>
                No structured values found. You can still chat about the report.
              </Body>
            )}

            <Body style={styles.helperText}>
              Use the Report ID above in the Chat tab to ask questions.
            </Body>
          </Card>
        ) : null}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.gray600,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.gray500,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? spacing.md : spacing.sm,
    fontSize: 14,
    color: colors.gray900,
    backgroundColor: colors.gray50,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.gray600,
  },
  infoValue: {
    fontSize: 13,
    color: colors.gray900,
    fontWeight: "600",
  },
  filePicker: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.gray50,
  },
  filePickerText: {
    color: colors.gray700,
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
    color: colors.gray500,
  },
  uploadButtonWrapper: {
    marginTop: spacing.sm,
  },
  loadingButton: {
    height: 48,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resultLabel: {
    fontSize: 13,
    color: colors.gray600,
  },
  resultValue: {
    fontSize: 13,
    color: colors.gray900,
    fontWeight: "600",
  },
  valueRow: {
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  valueName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.gray900,
  },
  valueDetail: {
    fontSize: 12,
    color: colors.gray600,
  },
  valueNote: {
    fontSize: 12,
    color: colors.primary700,
  },
});
