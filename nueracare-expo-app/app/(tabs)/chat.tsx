import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ImageBackground,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import Markdown from "react-native-markdown-display";
import {
  ChevronLeft,
  Plus,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  TrendingUp,
  Pill,
  HelpCircle,
  Activity,
  Send,
  Paperclip,
  FileText,
  Mic,
  MicOff,
  X,
} from "lucide-react-native";
import { useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  sendChatMessage,
  fetchUserReports,
  fetchChatHistory,
  saveChat,
  uploadMedicalReport,
  transcribeAudio,
  UserReport,
  ChatMessage as BackendChatMessage,
} from "@/services/backend";

const LAST_REPORT_ID_KEY = "nueracare:lastReportId";

interface ParsedReport {
  primaryFinding?: {
    title: string;
    value: string;
    unit: string;
    description: string;
    status: "normal" | "abnormal";
  };
  testResults: Array<{
    name: string;
    value: string;
    status: "normal" | "out_of_range";
    normalRange: string;
    explanation?: string;
  }>;
}

type Role = "user" | "assistant" | "system";

interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  timestamp: string;
}

export default function ChatScreen() {
  const { user } = useUser();
  const [userId, setUserId] = useState("");
  const [reportId, setReportId] = useState("");
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [parsedReport, setParsedReport] = useState<ParsedReport | null>(null);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [showExpandedCard, setShowExpandedCard] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showReportSelector, setShowReportSelector] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Voice Assistant states
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  
  // Upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLabel, setUploadLabel] = useState("");
  const [uploadReportType, setUploadReportType] = useState("Blood Test");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
      loadUserReports(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    const loadLastReport = async () => {
      const stored = await AsyncStorage.getItem(LAST_REPORT_ID_KEY);
      if (stored && reports.length > 0) {
        const report = reports.find((r) => r.reportId === stored);
        if (report) {
          handleSelectReport(report);
        }
      }
    };
    if (reports.length > 0) loadLastReport();
  }, [reports]);

  const loadUserReports = async (uid: string) => {
    try {
      const fetchedReports = await fetchUserReports(uid);
      setReports(fetchedReports);
    } catch (err) {
      console.error("Error loading reports:", err);
    }
  };

  const startRecording = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        if (voiceMode) {
          Speech.speak("Please grant microphone permission to use voice assistant", {
            language: "en",
          });
        } else {
          alert("Please grant microphone permission to use voice assistant");
        }
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Optimized preset for faster upload and transcription
      const { recording: newRecording } = await Audio.Recording.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000, // Optimized for speech recognition
          numberOfChannels: 1, // Mono for speech
          bitRate: 64000, // Lower bitrate for faster upload
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.IOSAudioQuality.MEDIUM, // Faster upload
          sampleRate: 16000, // Optimized for speech recognition
          numberOfChannels: 1, // Mono for speech
          bitRate: 64000, // Lower bitrate for faster upload
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 64000,
        },
      });
      
      setRecording(newRecording);
      setIsRecording(true);
      
      // Voice feedback only in voice mode
      if (voiceMode) {
        Speech.speak("Listening", {
          language: "en",
          pitch: 1.0,
          rate: 1.2,
        });
      }
    } catch (err) {
      console.error("Failed to start recording:", err);
      if (voiceMode) {
        Speech.speak("Failed to start voice recording. Please try again.", {
          language: "en",
        });
      } else {
        alert("Failed to start voice recording. Please try again.");
      }
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        // Show processing feedback
        setMessage("🎤 Processing your voice...");
        
        try {
          // Send audio to backend for transcription
          const transcription = await transcribeAudio(uri);
          
          if (transcription && transcription.trim()) {
            // Set the transcribed text in the input field
            setMessage(transcription.trim());
            
            // Only speak confirmation if voice mode is enabled
            if (voiceMode) {
              Speech.speak(`I heard: ${transcription.substring(0, 50)}`, {
                language: "en",
                pitch: 1.0,
                rate: 0.9,
              });
            }
            
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            setMessage("");
            if (voiceMode) {
              Speech.speak("Sorry, I couldn't understand that. Please try again.", {
                language: "en",
              });
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        } catch (transcriptionError) {
          console.error("Transcription error:", transcriptionError);
          setMessage("");
          if (voiceMode) {
            Speech.speak("Sorry, there was an error processing your voice. Please try again.", {
              language: "en",
            });
          }
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (err) {
      console.error("Failed to stop recording:", err);
      setMessage("");
      if (voiceMode) {
        Speech.speak("Sorry, there was an error with voice recording.", {
          language: "en",
        });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const toggleVoiceMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMode = !voiceMode;
    setVoiceMode(newMode);
    
    // Provide voice feedback about the mode change
    if (newMode) {
      Speech.speak("Voice mode activated. I will now speak my responses.", {
        language: "en",
        pitch: 1.0,
        rate: 0.9,
      });
    } else {
      // Stop any currently playing speech when voice mode is disabled
      Speech.stop();
    }
  };

  const handleAttachFile = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedFile(result.assets[0]);
        setShowUploadModal(true);
      }
    } catch (err) {
      console.error("Error picking document:", err);
      alert("Failed to select file");
    }
  };

  const handleUploadReport = async () => {
    if (!selectedFile || !uploadLabel.trim()) {
      alert("Please enter a label for your report");
      return;
    }

    if (!userId) {
      alert("User not logged in");
      return;
    }

    setUploading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await uploadMedicalReport({
        userId,
        reportType: uploadReportType,
        label: uploadLabel.trim(),
        file: {
          uri: selectedFile.uri,
          name: selectedFile.name,
          mimeType: selectedFile.mimeType,
        },
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Reload reports
      await loadUserReports(userId);
      
      // Close modal and reset
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadLabel("");
      setUploadReportType("Blood Test");
      
      // Auto-select the new report
      if (response.report_id) {
        // Reload to get the new report
        const updatedReports = await fetchUserReports(userId);
        const newReport = updatedReports.find(r => r.reportId === response.report_id);
        if (newReport) {
          await handleSelectReport(newReport);
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert("Failed to upload report. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const loadChatHistory = async (rId: string) => {
    try {
      const history = await fetchChatHistory(rId, userId);
      if (history && history.length > 0) {
        const chatMsgs: ChatMessage[] = history.map((msg, idx) => ({
          id: `history-${idx}`,
          role: msg.role as Role,
          text: msg.text,
          timestamp: msg.timestamp || new Date().toISOString(),
        }));
        setMessages(chatMsgs);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Error loading chat history:", err);
      setMessages([]);
    }
  };

  const saveCurrentChat = async () => {
    if (!reportId || !userId || messages.length === 0) return;
    
    try {
      // Filter out system messages and convert to backend format
      const backendMessages = messages
        .filter((m) => m.role !== "system")
        .map((msg) => ({
          role: msg.role as "user" | "assistant",
          text: msg.text,
          timestamp: msg.timestamp,
        }));

      const lastAssistantMsg = messages
        .slice()
        .reverse()
        .find((m) => m.role === "assistant");
      const summary = lastAssistantMsg
        ? lastAssistantMsg.text.substring(0, 100) + "..."
        : "Chat conversation";

      await saveChat(reportId, userId, backendMessages, summary);

      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Error saving chat:", err);
    }
  };

  const handleSelectReport = async (report: UserReport) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (hasUnsavedChanges) {
      await saveCurrentChat();
    }

    setReportId(report.reportId);
    setSelectedReport(report);
    setShowReportSelector(false);
    await AsyncStorage.setItem(LAST_REPORT_ID_KEY, report.reportId);
    
    await loadChatHistory(report.reportId);
    await analyzeReport(report);
  };

  const analyzeReport = async (report: UserReport) => {
    setLoading(true);
    try {
      const response = await sendChatMessage({
        reportId: report.reportId,
        userId,
        message: "Analyze this medical report and provide a structured summary with test results.",
        mode: "normal",
        voiceMode: false,
      });

      setAiResponse(response.response);
      parseReportData(response.response, report);
    } catch (err) {
      console.error("Error analyzing report:", err);
    } finally {
      setLoading(false);
    }
  };

  const parseReportData = (aiText: string, report: UserReport) => {
    // Simple parsing logic - in production, use more sophisticated parsing
    const parsed: ParsedReport = {
      testResults: [],
    };

    // Extract TSH or primary finding
    if (aiText.toLowerCase().includes("tsh")) {
      const tshMatch = aiText.match(/TSH.*?(\d+\.?\d*)\s*(mIU\/l|mlU\/l)/i);
      if (tshMatch) {
        parsed.primaryFinding = {
          title: "Your Thyroid Stimulating Hormone",
          value: tshMatch[1],
          unit: "mIU/l",
          description: `Your TSH level is ${tshMatch[1]} mIU/l, which is slightly above the normal range of 0.4 – 4.5.`,
          status: parseFloat(tshMatch[1]) > 4.5 ? "abnormal" : "normal",
        };

        parsed.testResults.push({
          name: "TSH",
          value: `${tshMatch[1]} mIU/l`,
          status: "out_of_range",
          normalRange: "0.4 – 4.5",
          explanation:
            "Your TSH level is slightly elevated. This can be influenced by stress, medication, or thyroid conditions.",
        });
      }
    }

    // Add mock data for demonstration
    if (parsed.testResults.length === 0) {
      parsed.testResults.push(
        {
          name: "Hemoglobin",
          value: "13.5 g/dL",
          status: "normal",
          normalRange: "12.0 – 16.0",
        },
        {
          name: "White Blood Cell Count",
          value: "7,200 /µL",
          status: "normal",
          normalRange: "4,500 – 11,000",
        }
      );
    }

    setParsedReport(parsed);
  };

  const sendQuickMessage = async (quickMessage: string) => {
    if (!reportId || loading) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: quickMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setHasUnsavedChanges(true);
    setLoading(true);

    // Scroll to bottom after adding user message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await sendChatMessage({
        reportId,
        userId,
        message: quickMessage,
        mode: "normal",
        voiceMode: false,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: response.response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setAiResponse(response.response);
      setHasUnsavedChanges(true);

      // Scroll to bottom after adding assistant message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Speak AI response if voice mode is enabled
      if (voiceMode) {
        Speech.speak(response.response, {
          language: "en",
          pitch: 1.0,
          rate: 0.85,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error("Error sending message:", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !reportId || loading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage = message.trim();
    setMessage("");

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: userMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setHasUnsavedChanges(true);
    setLoading(true);

    // Scroll to bottom after adding user message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await sendChatMessage({
        reportId,
        userId,
        message: userMessage,
        mode: "normal",
        voiceMode: false,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: response.response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setAiResponse(response.response);
      setHasUnsavedChanges(true);

      // Scroll to bottom after adding assistant message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Speak AI response if voice mode is enabled
      if (voiceMode) {
        Speech.speak(response.response, {
          language: "en",
          pitch: 1.0,
          rate: 0.85,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error("Error sending message:", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <LinearGradient
        colors={["#F4FAFB", "#EAF6F7"]}
        style={styles.container}
      >
      {/* Header with Doctor Avatar */}
      <BlurView intensity={80} tint="light" style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton}>
            <ChevronLeft size={24} color="#1F2937" strokeWidth={2} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerCenter}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowReportSelector(true);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Activity size={24} color="#2FB7B5" strokeWidth={2} />
              </View>
              <View style={styles.onlineBadge} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                {selectedReport?.label || "Select a Report"}
              </Text>
              <Text style={styles.headerSubtitle}>Online</Text>
            </View>
            <ChevronDown size={20} color="#9CA3AF" strokeWidth={1.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.voiceModeToggle,
              voiceMode && styles.voiceModeToggleActive,
            ]}
            onPress={toggleVoiceMode}
            activeOpacity={0.7}
          >
            {voiceMode ? (
              <Activity size={20} color="#FFFFFF" strokeWidth={2} />
            ) : (
              <Activity size={20} color="#2FB7B5" strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>
      </BlurView>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {loading && !parsedReport ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2FB7B5" />
            <Text style={styles.loadingText}>Analyzing your report...</Text>
          </View>
        ) : parsedReport ? (
          <>
            {/* Primary Finding Card */}
            {parsedReport.primaryFinding && (
              <TouchableOpacity
                style={styles.primaryCard}
                onPress={() => setShowExpandedCard(!showExpandedCard)}
                activeOpacity={0.9}
              >
                <BlurView intensity={20} tint="light" style={styles.cardBlur}>
                  <View style={styles.cardHeader}>
                    <View style={styles.medicalIcon}>
                      <Plus size={20} color="#2FB7B5" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.cardTitle}>
                      {parsedReport.primaryFinding.title}
                    </Text>
                  </View>

                  <View style={styles.highlightBadge}>
                    <Text style={styles.highlightText}>
                      TSH {parsedReport.primaryFinding.value}{" "}
                      {parsedReport.primaryFinding.unit}
                    </Text>
                  </View>

                  <Text style={styles.cardDescription}>
                    {parsedReport.primaryFinding.description}
                  </Text>

                  <ChevronDown
                    size={20}
                    color="#9CA3AF"
                    style={[
                      styles.expandIcon,
                      showExpandedCard && styles.expandIconRotated,
                    ]}
                  />
                </BlurView>
              </TouchableOpacity>
            )}

            {/* Test Results Cards */}
            <View style={styles.testResultsSection}>
              {parsedReport.testResults.map((test, index) => (
                <View
                  key={index}
                  style={[
                    styles.testCard,
                    test.status === "out_of_range" && styles.testCardWarning,
                  ]}
                >
                  <View style={styles.testCardHeader}>
                    <View style={styles.testCardLeft}>
                      <View
                        style={[
                          styles.statusIcon,
                          test.status === "normal"
                            ? styles.statusIconNormal
                            : styles.statusIconWarning,
                        ]}
                      >
                        {test.status === "normal" ? (
                          <CheckCircle size={18} color="#2FB7B5" />
                        ) : (
                          <AlertTriangle size={18} color="#E63946" />
                        )}
                      </View>
                      <View>
                        <Text style={styles.testName}>{test.name}</Text>
                        <Text
                          style={[
                            styles.testStatus,
                            test.status === "normal"
                              ? styles.testStatusNormal
                              : styles.testStatusWarning,
                          ]}
                        >
                          {test.status === "normal"
                            ? "Normal"
                            : "Out of range"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.testCardRight}>
                      <Text style={styles.testValue}>{test.value}</Text>
                      <Text style={styles.testRange}>
                        Normal Range: {test.normalRange}
                      </Text>
                    </View>
                  </View>

                  {test.explanation && (
                    <Text style={styles.testExplanation}>
                      {test.explanation}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            {/* Primary CTA */}
            <TouchableOpacity 
              style={styles.primaryCTA}
              onPress={() => sendQuickMessage("What does this mean? Explain it in simple terms.")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#2FB7B5", "#5AD2C8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>What does this mean?</Text>
                <ChevronLeft
                  size={20}
                  color="#FFFFFF"
                  style={{ transform: [{ rotate: "180deg" }] }}
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* Secondary Actions */}
            <View style={styles.secondaryActions}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => sendQuickMessage("Analyze all my test results and tell me what I should focus on.")}
                activeOpacity={0.8}
              >
                <TrendingUp size={18} color="#2FB7B5" strokeWidth={1.5} />
                <Text style={styles.secondaryButtonText}>Analyze Results</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => sendQuickMessage("What medications or treatments might help with these results?")}
                activeOpacity={0.8}
              >
                <Pill size={18} color="#2FB7B5" strokeWidth={1.5} />
                <Text style={styles.secondaryButtonText}>Medication Info</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.helpButton}
                onPress={() => sendQuickMessage("I have questions about my report. Can you help me understand it better?")}
                activeOpacity={0.8}
              >
                <HelpCircle size={20} color="#2FB7B5" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>

            {/* Chat Messages */}
            {messages.length > 0 && (
              <View style={styles.chatSection}>
                <Text style={styles.chatSectionTitle}>Conversation</Text>
                {messages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageCard,
                      msg.role === "user" && styles.userMessageCard,
                    ]}
                  >
                    {msg.role === "assistant" ? (
                      <Markdown style={markdownStyles}>{msg.text}</Markdown>
                    ) : (
                      <Text style={styles.userMessageText}>{msg.text}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Activity size={48} color="#C7C7CC" strokeWidth={1.5} />
            <Text style={styles.emptyText}>No Report Selected</Text>
            <Text style={styles.emptySubtext}>
              Select a report from the Reports tab to view analysis
            </Text>
          </View>
        )}
      </ScrollView>

      {/* AI Input Section */}
      <View style={styles.inputSection}>
        <BlurView intensity={80} tint="light" style={styles.inputBlur}>
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording... Tap to stop</Text>
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={styles.attachButton}
              onPress={handleAttachFile}
              activeOpacity={0.7}
            >
              <Paperclip size={20} color="#9CA3AF" strokeWidth={1.5} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Ask about your health…"
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={setMessage}
              multiline
            />

            <TouchableOpacity 
              style={[
                styles.heartbeatButton,
                isRecording && styles.recordingButton
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              onLongPress={startRecording}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isRecording ? ["#E63946", "#FF6B6B"] : voiceMode ? ["#2FB7B5", "#5AD2C8"] : ["#9CA3AF", "#B0B0B0"]}
                style={styles.heartbeatGradient}
              >
                {isRecording ? (
                  <MicOff size={20} color="#FFFFFF" strokeWidth={2} />
                ) : (
                  <Mic size={20} color="#FFFFFF" strokeWidth={2} />
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={!message.trim() || loading}
            >
              <Send size={20} color="#2FB7B5" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>

      {/* Report Selector Modal */}
      <Modal
        visible={showReportSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReportSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={40} tint="dark" style={styles.modalBlur}>
            <TouchableOpacity
              style={styles.modalDismiss}
              onPress={() => setShowReportSelector(false)}
            />
          </BlurView>

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Report</Text>
              <TouchableOpacity
                onPress={() => setShowReportSelector(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={reports}
              keyExtractor={(item) => item.reportId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.reportItem,
                    selectedReport?.reportId === item.reportId &&
                      styles.reportItemSelected,
                  ]}
                  onPress={() => handleSelectReport(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.reportIconContainer}>
                    <FileText
                      size={20}
                      color="#2FB7B5"
                      strokeWidth={1.5}
                    />
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportLabel}>
                      {item.label || "Untitled Report"}
                    </Text>
                    <Text style={styles.reportType}>
                      {item.reportType} •{" "}
                      {new Date(item.uploadDate).toLocaleDateString()}
                    </Text>
                  </View>
                  {selectedReport?.reportId === item.reportId && (
                    <CheckCircle size={20} color="#2FB7B5" />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.reportList}
            />
          </View>
        </View>
      </Modal>

      {/* Upload Report Modal */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="slide"
        onRequestClose={() => !uploading && setShowUploadModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={40} tint="dark" style={styles.modalBlur}>
              <TouchableOpacity
                style={styles.modalDismiss}
                onPress={() => !uploading && setShowUploadModal(false)}
              />
            </BlurView>

            <View style={styles.uploadModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Report</Text>
              <TouchableOpacity
                onPress={() => !uploading && setShowUploadModal(false)}
                style={styles.modalCloseButton}
                disabled={uploading}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.uploadForm}
              contentContainerStyle={styles.uploadFormContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {selectedFile && (
                <View style={styles.filePreview}>
                  <FileText size={24} color="#2FB7B5" strokeWidth={1.5} />
                  <Text style={styles.fileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Report Label *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Annual Checkup Feb 2026"
                  placeholderTextColor="#9CA3AF"
                  value={uploadLabel}
                  onChangeText={setUploadLabel}
                  editable={!uploading}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Report Type</Text>
                <View style={styles.reportTypeButtons}>
                  {["Blood Test", "X-Ray", "ECG", "MRI", "Other"].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        uploadReportType === type && styles.typeButtonActive,
                      ]}
                      onPress={() => {
                        setUploadReportType(type);
                        Haptics.selectionAsync();
                      }}
                      disabled={uploading}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          uploadReportType === type && styles.typeButtonTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  (!uploadLabel.trim() || uploading) && styles.uploadButtonDisabled,
                ]}
                onPress={handleUploadReport}
                disabled={!uploadLabel.trim() || uploading}
                activeOpacity={0.8}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.uploadButtonText}>Upload Report</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 14,
    fontWeight: "400",
    color: "#475569",
    lineHeight: 20,
  },
  paragraph: {
    marginBottom: 8,
  },
  strong: {
    fontWeight: "600",
    color: "#1F2937",
  },
  bullet_list: {
    marginBottom: 8,
  },
  list_item: {
    marginBottom: 4,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(46, 196, 182, 0.1)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(46, 196, 182, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(47, 183, 181, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(47, 183, 181, 0.3)",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2ECC71",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  voiceModeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(47, 183, 181, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(47, 183, 181, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  voiceModeToggleActive: {
    backgroundColor: "#2FB7B5",
    borderColor: "#2FB7B5",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "400",
    color: "#2FB7B5",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  primaryCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#2FB7B5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  cardBlur: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  medicalIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(47, 183, 181, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  highlightBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(230, 57, 70, 0.1)",
    marginBottom: 12,
  },
  highlightText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E63946",
    letterSpacing: 0.3,
  },
  cardDescription: {
    fontSize: 14,
    fontWeight: "400",
    color: "#475569",
    lineHeight: 20,
  },
  expandIcon: {
    alignSelf: "center",
    marginTop: 12,
  },
  expandIconRotated: {
    transform: [{ rotate: "180deg" }],
  },
  testResultsSection: {
    gap: 12,
    marginBottom: 20,
  },
  testCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  testCardWarning: {
    backgroundColor: "rgba(255, 250, 250, 1)",
  },
  testCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  testCardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statusIconNormal: {
    backgroundColor: "rgba(47, 183, 181, 0.1)",
  },
  statusIconWarning: {
    backgroundColor: "rgba(230, 57, 70, 0.1)",
  },
  testName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  testStatus: {
    fontSize: 12,
    fontWeight: "500",
  },
  testStatusNormal: {
    color: "#2FB7B5",
  },
  testStatusWarning: {
    color: "#E63946",
  },
  testCardRight: {
    alignItems: "flex-end",
  },
  testValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  testRange: {
    fontSize: 11,
    fontWeight: "400",
    color: "#9CA3AF",
  },
  testExplanation: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    fontSize: 13,
    fontWeight: "400",
    color: "#64748B",
    lineHeight: 18,
  },
  primaryCTA: {
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#2FB7B5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(47, 183, 181, 0.2)",
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#475569",
  },
  helpButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(47, 183, 181, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  inputSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  inputBlur: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "rgba(46, 196, 182, 0.1)",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "400",
    color: "#1F2937",
    maxHeight: 100,
  },
  heartbeatButton: {
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#2FB7B5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  heartbeatGradient: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingButton: {
    transform: [{ scale: 1.1 }],
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E63946",
  },
  recordingText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#E63946",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  chatSection: {
    marginTop: 24,
    gap: 12,
  },
  chatSectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  messageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  userMessageCard: {
    backgroundColor: "rgba(47, 183, 181, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(47, 183, 181, 0.2)",
  },
  userMessageText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#1F2937",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  modalDismiss: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  modalCloseButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2FB7B5",
  },
  reportList: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  reportItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
  },
  reportItemSelected: {
    backgroundColor: "rgba(47, 183, 181, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(47, 183, 181, 0.3)",
  },
  reportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(47, 183, 181, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  reportType: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
  },
  uploadModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  uploadForm: {
    flex: 1,
  },
  uploadFormContent: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  filePreview: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(47, 183, 181, 0.1)",
    borderRadius: 12,
    gap: 12,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  formInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: "#DDE7F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },
  reportTypeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  typeButtonActive: {
    backgroundColor: "#1E88E5",
    borderColor: "#1E88E5",
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#475569",
  },
  typeButtonTextActive: {
    color: "#FFFFFF",
  },
  uploadButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#2FB7B5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2FB7B5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadButtonDisabled: {
    backgroundColor: "#C7C7CC",
    shadowOpacity: 0,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
