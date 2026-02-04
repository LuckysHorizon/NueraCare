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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Body, Heading } from "@/components/common";
import { colors, spacing, borderRadius } from "@/theme/colors";
import { sendChatMessage } from "@/services/backend";
import { useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_REPORT_ID_KEY = "nueracare:lastReportId";

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
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [explainSimple, setExplainSimple] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    const loadLastReportId = async () => {
      const stored = await AsyncStorage.getItem(LAST_REPORT_ID_KEY);
      if (stored) {
        setReportId(stored);
      }
    };
    loadLastReportId();
  }, []);

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

  return (
    <LinearGradient colors={["#F5FCFB", "#FFFFFF"]} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Heading level={3} style={styles.title}>Report Chatbot</Heading>
          <Body style={styles.subtitle}>
            Gentle explanations based on your uploaded report only.
          </Body>
        </View>

        <View style={styles.contextCard}>
          <Text style={styles.sectionLabel}>Session</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Signed-in user</Text>
            <Text style={styles.infoValue}>{userId || "Not available"}</Text>
          </View>
          <TextInput
            placeholder="Report ID"
            value={reportId}
            onChangeText={setReportId}
            style={styles.input}
            placeholderTextColor={colors.gray400}
          />
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleChip, voiceMode && styles.toggleChipActive]}
              onPress={() => setVoiceMode((prev) => !prev)}
            >
              <Text style={[styles.toggleText, voiceMode && styles.toggleTextActive]}>
                Voice mode
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleChip, explainSimple && styles.toggleChipActive]}
              onPress={() => setExplainSimple((prev) => !prev)}
            >
              <Text style={[styles.toggleText, explainSimple && styles.toggleTextActive]}>
                Explain simpler
              </Text>
            </TouchableOpacity>
          </View>
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
              <Text
                style={[
                  styles.messageText,
                  item.role === "user" && styles.userMessageText,
                ]}
              >
                {item.text}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Start a gentle chat</Text>
              <Text style={styles.emptySubtitle}>
                Select a report in the Reports tab to auto-fill the report ID.
              </Text>
            </View>
          }
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Ask about your report…"
            value={message}
            onChangeText={setMessage}
            style={styles.messageInput}
            placeholderTextColor={colors.gray400}
            multiline
          />
          <View style={styles.sendButtonWrapper}>
            {loading ? (
              <View style={styles.loadingButton}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <Button title="Send" onPress={() => handleSend()} disabled={!canSend} />
            )}
          </View>
        </View>
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
  contextCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
  errorText: {
    color: colors.error,
    fontSize: 12,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  messageInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    color: colors.gray900,
  },
  sendButtonWrapper: {
    minWidth: 88,
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
});
