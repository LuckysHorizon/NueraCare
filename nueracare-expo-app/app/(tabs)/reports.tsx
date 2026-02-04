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
  LayoutAnimation,
  UIManager,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
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
import { 
  ChevronRight, 
  Plus, 
  Trash2, 
  CloudUpload,
  FileText,
  Activity,
  Search,
  ChevronLeft,
} from "lucide-react-native";

const LAST_REPORT_ID_KEY = "nueracare:lastReportId";
const { width } = Dimensions.get("window");

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleUpload = async () => {
    if (!canUpload || !selectedFile) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await AsyncStorage.setItem(LAST_REPORT_ID_KEY, uploadResult.report_id);
      
      // Reset form
      setReportLabel("");
      setReportType("");
      setSelectedFile(undefined);
      
      // Reload reports with animation
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await loadUserReports(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setUploading(false);
    }
  };

  const handleSelectReport = async (report: UserReport) => {
    await Haptics.selectionAsync();
    await AsyncStorage.setItem(LAST_REPORT_ID_KEY, report.reportId);
    // Navigate to chat is handled by tab navigation
  };

  const handleDeleteReport = async (reportId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this report? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setReports(reports.filter(r => r.reportId !== reportId));
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Glassmorphic Header */}
      <BlurView intensity={80} tint="light" style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton}>
            <ChevronLeft size={24} color="#1C1C1E" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medical Reports</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Search size={20} color="#1C1C1E" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </BlurView>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Hero Upload Card with Gradient */}
        <LinearGradient
          colors={["#E0F2FE", "#FFFFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.uploadIconContainer}>
            <CloudUpload size={44} color="#007AFF" strokeWidth={1.5} />
          </View>
          
          <Text style={styles.heroTitle}>Upload New Report</Text>
          
          <TextInput
            placeholder="Add a label (e.g., Annual Checkup)"
            value={reportLabel}
            onChangeText={setReportLabel}
            style={styles.labelInput}
            placeholderTextColor="#8E8E93"
          />

          {/* Quick Tags */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickTagsContainer}
          >
            {["Blood Test", "X-Ray", "ECG", "Other"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.quickTag,
                  reportType === type && styles.quickTagActive,
                ]}
                onPress={async () => {
                  await Haptics.selectionAsync();
                  setReportType(type);
                }}
              >
                <Text
                  style={[
                    styles.quickTagText,
                    reportType === type && styles.quickTagTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* File Picker Button */}
          <TouchableOpacity
            style={[styles.filePickerButton, selectedFile && styles.filePickerButtonActive]}
            onPress={handlePickFile}
          >
            <FileText 
              size={18} 
              color={selectedFile ? "#007AFF" : "#8E8E93"} 
              strokeWidth={1.5} 
            />
            <Text style={[
              styles.filePickerText,
              selectedFile && styles.filePickerTextActive
            ]}>
              {selectedFile ? selectedFile.name : "Select PDF or Image"}
            </Text>
          </TouchableOpacity>

          {/* Status Messages */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}
          {success && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>✓ {success}</Text>
            </View>
          )}

          {/* Upload CTA */}
          <TouchableOpacity
            style={[styles.uploadButton, (!canUpload || uploading) && styles.uploadButtonDisabled]}
            onPress={handleUpload}
            disabled={!canUpload || uploading}
          >
            <LinearGradient
              colors={canUpload && !uploading ? ["#34C759", "#30D158"] : ["#C7C7CC", "#C7C7CC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.uploadButtonGradient}
            >
              {uploading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.uploadButtonText}>
                  {uploading ? "Uploading..." : "Upload Report"}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* Reports List Section */}
        <View style={styles.reportsSection}>
          <Text style={styles.sectionHeader}>Your Reports</Text>

          {loadingReports ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#007AFF" size="large" />
            </View>
          ) : reports.length === 0 ? (
            <View style={styles.emptyState}>
              <Activity size={48} color="#C7C7CC" strokeWidth={1.5} />
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
              ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
            />
          )}
        </View>
      </ScrollView>
    </View>
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
  const uploadDate = new Date(report.uploadDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const getIconColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "blood test":
        return "#FF3B30";
      case "x-ray":
        return "#007AFF";
      case "ecg":
        return "#34C759";
      default:
        return "#8E8E93";
    }
  };

  const getBadgeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "blood test":
        return { bg: "rgba(255, 59, 48, 0.1)", text: "#FF3B30" };
      case "x-ray":
        return { bg: "rgba(0, 122, 255, 0.1)", text: "#007AFF" };
      case "ecg":
        return { bg: "rgba(52, 199, 89, 0.1)", text: "#34C759" };
      default:
        return { bg: "rgba(142, 142, 147, 0.1)", text: "#8E8E93" };
    }
  };

  const badgeColors = getBadgeColor(report.reportType);

  return (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={async () => {
        await Haptics.selectionAsync();
        onSelect(report);
      }}
      activeOpacity={0.7}
    >
      {/* Leading Icon */}
      <View style={[styles.reportIcon, { backgroundColor: `${getIconColor(report.reportType)}15` }]}>
        <FileText size={22} color={getIconColor(report.reportType)} strokeWidth={1.5} />
      </View>

      {/* Middle Content */}
      <View style={styles.reportContent}>
        <Text style={styles.reportLabel} numberOfLines={1}>
          {report.label || "Untitled Report"}
        </Text>
        <Text style={styles.reportDate}>{uploadDate}</Text>
        {report.reportType && (
          <View style={[styles.reportBadge, { backgroundColor: badgeColors.bg }]}>
            <Text style={[styles.reportBadgeText, { color: badgeColors.text }]}>
              {report.reportType}
            </Text>
          </View>
        )}
      </View>

      {/* Trailing Actions */}
      <View style={styles.reportActions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={async (e) => {
            e.stopPropagation();
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onDelete(report.reportId);
          }}
        >
          <Trash2 size={18} color="#FF3B30" strokeWidth={1.5} />
        </TouchableOpacity>
        <ChevronRight size={20} color="#C7C7CC" strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 120,
    paddingBottom: 24,
  },

  // Glassmorphic Header
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1C1E",
    letterSpacing: -0.5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Hero Upload Card
  heroCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  uploadIconContainer: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 20,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  labelInput: {
    fontSize: 16,
    fontWeight: "400",
    color: "#1C1C1E",
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
  },

  // Quick Tags
  quickTagsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  quickTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    borderRadius: 20,
    marginRight: 10,
  },
  quickTagActive: {
    backgroundColor: "#007AFF",
  },
  quickTagText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
  },
  quickTagTextActive: {
    color: "#FFFFFF",
  },

  // File Picker
  filePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    paddingVertical: 14,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
    gap: 8,
  },
  filePickerButtonActive: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  filePickerText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8E8E93",
  },
  filePickerTextActive: {
    color: "#007AFF",
  },

  // Status Messages
  errorContainer: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  successContainer: {
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FF3B30",
    textAlign: "center",
  },
  successText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#34C759",
    textAlign: "center",
  },

  // Upload CTA Button
  uploadButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#34C759",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  // Reports Section
  reportsSection: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginHorizontal: 20,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: "400",
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },
  cardSeparator: {
    height: 12,
  },

  // Report Card (Elevated Design)
  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 22,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  reportIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  reportContent: {
    flex: 1,
    gap: 4,
  },
  reportLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    letterSpacing: -0.3,
  },
  reportDate: {
    fontSize: 13,
    fontWeight: "400",
    color: "#8E8E93",
  },
  reportBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  reportBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  reportActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
});
