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
  ImageBackground,
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

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

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
        {/* Hero Upload Card with Background Image */}
        <ImageBackground
          source={require("@/assets/card-bg.jpeg")}
          style={styles.heroCard}
          imageStyle={styles.heroCardImage}
        >
          <View style={styles.uploadIconContainer}>
            <CloudUpload size={44} color="#1E88E5" strokeWidth={1.5} />
          </View>
          
          <Text style={styles.heroTitle}>Upload New Report</Text>
          
          <TextInput
            placeholder="Add a label (e.g., Annual Checkup)"
            value={reportLabel}
            onChangeText={setReportLabel}
            style={styles.labelInput}
            placeholderTextColor="#9CA3AF"
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
              color={selectedFile ? "#1E88E5" : "#9CA3AF"} 
              strokeWidth={1.5} 
            />
            <Text style={[
              styles.filePickerText,
              selectedFile && styles.filePickerTextActive
            ]}>
              {selectedFile ? selectedFile.name : "Select PDF or Image"}
            </Text>
          </TouchableOpacity>

          {/* Status Messages - Only Error shown inline */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Upload CTA */}
          <TouchableOpacity
            style={[styles.uploadButton, (!canUpload || uploading) && styles.uploadButtonDisabled]}
            onPress={handleUpload}
            disabled={!canUpload || uploading}
          >
            <LinearGradient
              colors={canUpload && !uploading ? ["#1E88E5", "#1565C0"] : ["#CBD5E1", "#CBD5E1"]}
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
        </ImageBackground>

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

      {/* Success Feedback Popup - Instant notification that auto-dismisses */}
      {success && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>✓ {success}</Text>
        </View>
      )}
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
        return "#E63946";
      case "x-ray":
        return "#1E88E5";
      case "ecg":
        return "#2EC4B6";
      default:
        return "#9CA3AF";
    }
  };

  const getBadgeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "blood test":
        return { bg: "rgba(230, 57, 70, 0.1)", text: "#E63946" };
      case "x-ray":
        return { bg: "rgba(30, 136, 229, 0.1)", text: "#1E88E5" };
      case "ecg":
        return { bg: "rgba(46, 196, 182, 0.1)", text: "#2EC4B6" };
      default:
        return { bg: "rgba(156, 163, 175, 0.1)", text: "#6B7280" };
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
          <Trash2 size={18} color="#E63946" strokeWidth={1.5} />
        </TouchableOpacity>
        <ChevronRight size={20} color="#CBD5E1" strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D9F0ED",
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
    backgroundColor: "rgba(217, 240, 237, 0.85)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(46, 196, 182, 0.1)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    letterSpacing: -0.5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(46, 196, 182, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(46, 196, 182, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Hero Upload Card
  heroCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#2EC4B6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
  },
  heroCardImage: {
    borderRadius: 20,
    resizeMode: "cover",
  },
  uploadIconContainer: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 16,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: -0.3,
    marginHorizontal: 20,
  },
  labelInput: {
    height: 48,
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#DDE7F0",
    marginBottom: 14,
  },

  // Quick Tags
  quickTagsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  quickTag: {
    height: 36,
    paddingHorizontal: 16,
    backgroundColor: "#F1F5F9",
    borderRadius: 18,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  quickTagActive: {
    backgroundColor: "#1E88E5",
  },
  quickTagText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#475569",
  },
  quickTagTextActive: {
    color: "#FFFFFF",
  },

  // File Picker
  filePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#DDE7F0",
    marginBottom: 14,
    gap: 8,
  },
  filePickerButtonActive: {
    backgroundColor: "rgba(30, 136, 229, 0.05)",
    borderColor: "#1E88E5",
  },
  filePickerText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
  filePickerTextActive: {
    color: "#1E88E5",
  },

  // Status Messages
  errorContainer: {
    height: 44,
    backgroundColor: "rgba(230, 57, 70, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 14,
    justifyContent: "center",
  },
  successContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    height: 48,
    backgroundColor: "#2ECC71",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    shadowColor: "#2ECC71",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#E63946",
    textAlign: "center",
  },
  successText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0.3,
  },

  // Upload CTA Button
  uploadButton: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 14,
    overflow: "hidden",
    height: 52,
    shadowColor: "#1E88E5",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonGradient: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButtonText: {
    fontSize: 15,
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
    color: "#1F2937",
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
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
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
    borderRadius: 16,
    gap: 14,
    shadowColor: "#2EC4B6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
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
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  reportDate: {
    fontSize: 13,
    fontWeight: "400",
    color: "#9CA3AF",
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
    backgroundColor: "#FEECEC",
    alignItems: "center",
    justifyContent: "center",
  },
});
