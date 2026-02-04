import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Markdown from "react-native-markdown-display";
import { Button, Body, Heading } from "@/components/common";
import { colors, spacing, borderRadius } from "@/theme/colors";
import {
  sendChatMessage,
  fetchUserReports,
  fetchChatHistory,
  saveChat,
  UserReport,
  ChatMessage as BackendChatMessage,
} from "@/services/backend";
import { useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronDown, RotateCcw } from "lucide-react-native";

const LAST_REPORT_ID_KEY = "nueracare:lastReportId";
const { width } = Dimensions.get("window");

type Role = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "Explain this report simply",
  "What does the out-of-range value mean?",
  "Is this common?",
];

export default function ChatScreen() {
  const { user } = useUser();
  const [userId, setUserId] = useState("");
  const [reportId, setReportId] = useState("");
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [explainSimple, setExplainSimple] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [showReportSelector, setShowReportSelector] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
      loadUserReports(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    const loadLastReportId = async () => {
      const stored = await AsyncStorage.getItem(LAST_REPORT_ID_KEY);
      if (stored) {
        setReportId(stored);
        // Load the report details
        const report = reports.find(r => r.reportId === stored);
        if (report) {
          setSelectedReport(report);
          await loadChatHistory(stored);
        }
      }
    };
    if (reports.length > 0) {
      loadLastReportId();
    }
  }, [reports]);

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

  const loadChatHistory = async (rId: string) => {
    try {
      const history = await fetchChatHistory(rId, userId);
      if (history && history.length > 0) {
        // Convert backend messages to chat messages
        const chatMsgs: ChatMessage[] = history.map((msg, idx) => ({
          id: `history-${idx}`,
          role: msg.role as Role,
          text: msg.text,
          timestamp: msg.timestamp || new Date().toISOString(),
        }));
        setMessages(chatMsgs);
        setHasUnsavedChanges(false);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Error loading chat history:", err);
      setMessages([]);
    }
  };

  const handleSelectReport = async (report: UserReport) => {
    // Save current chat if there are changes
    if (hasUnsavedChanges && messages.length > 0 && reportId) {
      await saveCurrentChat();
    }

    setReportId(report.reportId);
    setSelectedReport(report);
    setShowReportSelector(false);
    await AsyncStorage.setItem(LAST_REPORT_ID_KEY, report.reportId);
    await loadChatHistory(report.reportId);
  };

  const saveCurrentChat = async () => {
    if (!reportId || !userId || messages.length === 0) return;
    
    try {
      const backendMessages: BackendChatMessage[] = messages.map(m => ({
        role: m.role,
        text: m.text,
        timestamp: m.timestamp,
      }));
      
      const summary = messages
        .filter(m => m.role === "assistant")
        .slice(-1)
        .map(m => m.text.substring(0, 100))[0] || "";
      
      await saveChat(reportId, userId, backendMessages, summary);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Error saving chat:", err);
    }
  };

  const canSend = useMemo(
    () => Boolean(userId.trim() && reportId.trim() && message.trim()),
    [userId, reportId, message]
  );

  const pushMessage = (role: Role, text: string) => {
    setMessages((prev) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        role,
        text,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
    setHasUnsavedChanges(true);
  };

  const handleSend = async (overrideText?: string) => {
    if (!canSend && !overrideText) return;
    const content = (overrideText || message).trim();
    if (!content) return;

    pushMessage("user", content);
    setMessage("");
    setError(null);
    setLoading(true);

    try {
      const response = await sendChatMessage({
        reportId: reportId.trim(),
        userId: userId.trim(),
        message: content,
        mode: explainSimple ? "explain_simple" : "normal",
        voiceMode,
      });

      pushMessage("assistant", response.response);
      if (response.disclaimers?.length) {
        pushMessage("assistant", response.disclaimers.join(" "));
      }
    } catch (err) {
      setError("Unable to reach the medical assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setHasUnsavedChanges(false);
  };

  return (
    <LinearGradient colors={["#F5FCFB", "#FFFFFF"]} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Heading level={2} style={styles.title}>Report Chat</Heading>
          <Body style={styles.subtitle}>
            Ask about your medical report - get gentle, caring explanations
          </Body>
        </View>

        {/* Report Selector */}
        <View style={styles.reportSelectorWrapper}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => setShowReportSelector(!showReportSelector)}
          >
            <View style={styles.reportButtonContent}>
              <View style={styles.reportButtonLeft}>
                <Text style={styles.reportButtonLabel}>
                  {selectedReport 
                    ? (selectedReport.label || `Report ${selectedReport.reportId.substring(0, 8)}...`) 
                    : "Select a Report"}
                </Text>
                {selectedReport && (
                  <Text style={styles.reportButtonDate}>
                    {new Date(selectedReport.uploadDate).toLocaleDateString()}
                  </Text>
                )}
              </View>
              <ChevronDown size={20} color={colors.primary} />
            </View>
          </TouchableOpacity>

          {/* Report Selector Modal */}
          {showReportSelector && (
            <View style={styles.reportSelectorDropdown}>
              {loadingReports ? (
                <View style={styles.centerContainer}>
                  <ActivityIndicator color={colors.primary} size="small" />
                </View>
              ) : reports.length === 0 ? (
                <Text style={styles.emptyText}>No reports available</Text>
              ) : (
                <ScrollView style={styles.reportList}>
                  {reports.map((report) => (
                    <TouchableOpacity
                      key={report.reportId}
                      style={[
                        styles.reportOption,
                        selectedReport?.reportId === report.reportId &&
                          styles.reportOptionActive,
                      ]}
                      onPress={() => handleSelectReport(report)}
                    >
                      <View>
                        <Text style={styles.reportOptionLabel}>
                          {report.label || `Report ${report.reportId.substring(0, 8)}...`}
                        </Text>
                        <Text style={styles.reportOptionDate}>
                          {new Date(report.uploadDate).toLocaleDateString()}
                        </Text>
                      </View>
                      {selectedReport?.reportId === report.reportId && (
                        <View style={styles.checkmark}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>

        {/* Chat Controls */}
        <View style={styles.controlsCard}>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleChip, voiceMode && styles.toggleChipActive]}
              onPress={() => setVoiceMode((prev) => !prev)}
            >
              <Text
                style={[
                  styles.toggleText,
                  voiceMode && styles.toggleTextActive,
                ]}
              >
                🎙️ Voice
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleChip, explainSimple && styles.toggleChipActive]}
              onPress={() => setExplainSimple((prev) => !prev)}
            >
              <Text
                style={[
                  styles.toggleText,
                  explainSimple && styles.toggleTextActive,
                ]}
              >
                ✨ Simple
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toggleChip}
              onPress={handleClearChat}
            >
              <Text style={styles.toggleText}>
                <RotateCcw size={14} color={colors.gray600} /> Clear
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickPrompts}>
            {QUICK_PROMPTS.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                style={styles.promptChip}
                onPress={() => handleSend(prompt)}
              >
                <Text style={styles.promptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.messages}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.role === "user" ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              {item.role === "assistant" ? (
                <Markdown
                  style={{
                    body: [
                      styles.messageText,
                      styles.assistantMessageText,
                    ],
                    strong: {
                      fontWeight: "700",
                      color: colors.primary,
                    },
                    em: {
                      fontStyle: "italic",
                    },
                    bullet_list: {
                      marginLeft: spacing.md,
                    },
                    bullet_list_item: {
                      marginBottom: spacing.xs,
                    },
                  }}
                >
                  {item.text}
                </Markdown>
              ) : (
                <Text
                  style={[
                    styles.messageText,
                    styles.userMessageText,
                  ]}
                >
                  {item.text}
                </Text>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Start your conversation</Text>
              <Text style={styles.emptySubtitle}>
                {reportId
                  ? "Ask a question about your selected report above."
                  : "Select a report to begin chatting."}
              </Text>
            </View>
          }
        />

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Ask about your report…"
            value={message}
            onChangeText={setMessage}
            style={styles.messageInput}
            placeholderTextColor={colors.gray400}
            multiline
            editable={!!reportId}
          />
          <View style={styles.sendButtonWrapper}>
            {loading ? (
              <View style={styles.loadingButton}>
                <ActivityIndicator color={colors.primary} size="small" />
              </View>
            ) : (
              <Button
                title="Send"
                onPress={() => handleSend()}
                disabled={!canSend}
              />
            )}
          </View>
        </View>

        {hasUnsavedChanges && (
          <View style={styles.autoSaveNotice}>
            <Text style={styles.autoSaveText}>
              💾 Chat will be saved automatically
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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

  // Report Selector
  reportSelectorWrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  reportButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary200,
  },
  reportButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reportButtonLeft: {
    flex: 1,
  },
  reportButtonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray900,
  },
  reportButtonDate: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  reportSelectorDropdown: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    marginTop: spacing.sm,
    maxHeight: 300,
    paddingVertical: spacing.sm,
  },
  reportList: {
    maxHeight: 300,
  },
  reportOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  reportOptionActive: {
    backgroundColor: colors.primary50,
  },
  reportOptionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.gray900,
  },
  reportOptionDate: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  checkmark: {
    marginLeft: "auto",
    paddingHorizontal: spacing.sm,
  },
  checkmarkText: {
    color: colors.primary700,
    fontSize: 16,
    fontWeight: "bold",
  },

  // Controls Card
  controlsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    gap: spacing.md,
  },
  toggleRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  toggleChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
  },
  toggleChipActive: {
    backgroundColor: colors.primary50,
    borderColor: colors.primary,
  },
  toggleText: {
    fontSize: 12,
    color: colors.gray600,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: colors.primary700,
  },
  quickPrompts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  promptChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
  },
  promptText: {
    fontSize: 12,
    color: colors.gray700,
    fontWeight: "600",
  },

  // Messages
  messages: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  messageBubble: {
    maxWidth: "85%",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  messageText: {
    color: colors.gray900,
    fontSize: 14,
    lineHeight: 20,
  },
  assistantMessageText: {
    color: colors.gray800,
  },
  userMessageText: {
    color: colors.white,
  },
  emptyState: {
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray700,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.gray500,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    color: colors.gray500,
    textAlign: "center",
    padding: spacing.md,
  },
  centerContainer: {
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },

  // Error & Messages
  errorContainer: {
    backgroundColor: colors.error50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.error700,
    fontSize: 12,
  },

  // Input Area
  inputRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.gray900,
    backgroundColor: colors.gray50,
    maxHeight: 100,
  },
  sendButtonWrapper: {
    justifyContent: "center",
  },
  loadingButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },

  // Auto-save Notice
  autoSaveNotice: {
    backgroundColor: colors.success50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  autoSaveText: {
    fontSize: 12,
    color: colors.success700,
    fontWeight: "600",
  },
});
