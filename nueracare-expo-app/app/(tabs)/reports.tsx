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
  FlatList,
  Alert,
  Dimensions,
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
  fetchUserReports,
  UserReport,
} from "@/services/backend";
import { ChevronRight, Plus, Trash2 } from "lucide-react-native";

const LAST_REPORT_ID_KEY = "nueracare:lastReportId";
const { width } = Dimensions.get("window");

export default function ReportsScreen() {
  const { user } = useUser();
  const [userId, setUserId] = useState("");
  const [reportLabel, setReportLabel] = useState("");
  const [reportType, setReportType] = useState("");
  const [selectedFile, setSelectedFile] = useState<
    DocumentPicker.DocumentPickerAsset | undefined
  >(undefined);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
      loadUserReports(user.id);
    }
  }, [user?.id]);

  const loadUserReports = async (uid: string) => {
    setLoadingReports(true);
    try {
      const fetchedReports = await fetchUserReports(uid);
      setReports(fetchedReports);
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  const canUpload = useMemo(
    () => Boolean(userId.trim() && selectedFile?.uri && reportLabel.trim()),
    [userId, selectedFile, reportLabel]
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
    setSuccess(null);

    try {
      const uploadResult = await uploadMedicalReport({
        userId: userId.trim(),
        reportType: reportType.trim() || undefined,
        label: reportLabel.trim(),
        file: {
          uri: selectedFile.uri,
          name: selectedFile.name || "medical-report.pdf",
          mimeType: selectedFile.mimeType,
        },
      });

      setSuccess(`Report uploaded successfully!`);
      await AsyncStorage.setItem(LAST_REPORT_ID_KEY, uploadResult.report_id);
      
      // Reset form
      setReportLabel("");
      setReportType("");
      setSelectedFile(undefined);
      
      // Reload reports
      await loadUserReports(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSelectReport = async (report: UserReport) => {
    await AsyncStorage.setItem(LAST_REPORT_ID_KEY, report.reportId);
    // Navigate to chat is handled by tab navigation
  };

  const handleDeleteReport = async (reportId: string) => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this report? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // TODO: Implement delete endpoint
            setReports(reports.filter(r => r.reportId !== reportId));
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={["#F5FCFB", "#FFFFFF"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Heading level={2} style={styles.title}>
            Medical Reports
          </Heading>
          <Body style={styles.subtitle}>
            Upload and organize your medical reports
          </Body>
        </View>

        {/* Upload Section */}
        <View style={styles.uploadCard}>
          <View style={styles.uploadHeader}>
            <Plus size={20} color={colors.primary} />
            <Text style={styles.uploadTitle}>Upload New Report</Text>
          </View>

          <TextInput
            placeholder="Add a label (e.g., Annual Checkup)"
            value={reportLabel}
            onChangeText={setReportLabel}
            style={styles.input}
            placeholderTextColor={colors.gray400}
          />

          <View style={styles.reportTypeSelector}>
            {["Blood Test", "X-Ray", "ECG", "Other"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeChip,
                  reportType === type && styles.typeChipActive,
                ]}
                onPress={() => setReportType(type)}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    reportType === type && styles.typeChipTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.fileButton, selectedFile && styles.fileButtonActive]}
            onPress={handlePickFile}
          >
            <Text style={styles.fileButtonText}>
              {selectedFile ? `📄 ${selectedFile.name}` : "Select PDF or Image"}
            </Text>
          </TouchableOpacity>

          {error && <Text style={styles.errorText}>❌ {error}</Text>}
          {success && <Text style={styles.successText}>✅ {success}</Text>}

          <Button
            title={uploading ? "Uploading..." : "Upload Report"}
            onPress={handleUpload}
            disabled={!canUpload || uploading}
          />
        </View>

        {/* Reports List */}
        <View style={styles.reportsSection}>
          <View style={styles.sectionHeader}>
            <Heading level={4} style={styles.sectionTitle}>
              Your Reports ({reports.length})
            </Heading>
          </View>

          {loadingReports ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : reports.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No reports yet</Text>
              <Text style={styles.emptySubtext}>
                Upload your first medical report to get started
              </Text>
            </View>
          ) : (
            <FlatList
              data={reports}
              keyExtractor={(item) => item.reportId}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <ReportCard
                  report={item}
                  onSelect={handleSelectReport}
                  onDelete={handleDeleteReport}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const ReportCard = ({
  report,
  onSelect,
  onDelete,
}: {
  report: UserReport;
  onSelect: (report: UserReport) => void;
  onDelete: (id: string) => void;
}) => {
  const uploadDate = new Date(report.uploadDate).toLocaleDateString();

  return (
    <TouchableOpacity
      style={styles.reportCardContainer}
      onPress={() => onSelect(report)}
      activeOpacity={0.7}
    >
      <View style={styles.reportCard}>
        <View style={styles.reportInfo}>
          <Text style={styles.reportLabel}>{report.label}</Text>
          <Text style={styles.reportDate}>{uploadDate}</Text>
          {report.reportType && (
            <View style={styles.reportTypeBadge}>
              <Text style={styles.reportTypeBadgeText}>{report.reportType}</Text>
            </View>
          )}
        </View>
        <ChevronRight size={20} color={colors.gray400} />
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(report.reportId)}
      >
        <Trash2 size={16} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingBottom: spacing.xl,
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

  // Upload Section
  uploadCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary50,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  uploadHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray900,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.gray900,
    backgroundColor: colors.gray50,
  },
  reportTypeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  typeChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
  },
  typeChipActive: {
    backgroundColor: colors.primary50,
    borderColor: colors.primary,
  },
  typeChipText: {
    fontSize: 12,
    color: colors.gray600,
    fontWeight: "600",
  },
  typeChipTextActive: {
    color: colors.primary700,
  },
  fileButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.gray300,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray50,
    alignItems: "center",
  },
  fileButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary50,
  },
  fileButtonText: {
    fontSize: 14,
    color: colors.gray700,
    fontWeight: "500",
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
  },
  successText: {
    color: colors.success,
    fontSize: 12,
  },

  // Reports Section
  reportsSection: {
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.gray900,
  },
  centerContainer: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray600,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.gray500,
    textAlign: "center",
  },
  reportCardContainer: {
    marginBottom: spacing.md,
  },
  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  reportInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  reportLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.gray900,
  },
  reportDate: {
    fontSize: 12,
    color: colors.gray500,
  },
  reportTypeBadge: {
    backgroundColor: colors.primary50,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: "flex-start",
    marginTop: spacing.xs,
  },
  reportTypeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary700,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray100,
    marginVertical: spacing.xs,
  },

  // Old styles (kept for backwards compatibility if needed)
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
});
