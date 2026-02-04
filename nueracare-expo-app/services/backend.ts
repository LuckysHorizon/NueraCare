type ChatMode = "normal" | "explain_simple";

export interface ChatPayload {
  reportId: string;
  userId: string;
  message: string;
  mode?: ChatMode;
  voiceMode?: boolean;
}

export interface ChatResponse {
  report_id: string;
  user_id: string;
  response: string;
  used_model?: string | null;
  disclaimers?: string[] | null;
}

export interface ErrorResponse {
  detail: string;
}

export interface UploadReportPayload {
  userId: string;
  reportType?: string;
  label?: string;
  file: {
    uri: string;
    name: string;
    mimeType?: string | null;
  };
}

export interface ParsedValue {
  test_name: string;
  value: string;
  unit?: string | null;
  reference_range?: string | null;
  classification: string;
}

export interface UploadReportResponse {
  report_id: string;
  user_id: string;
  file_url?: string | null;
  extracted_text: string;
  parsed_values: ParsedValue[];
  report_type?: string | null;
  upload_date: string;
}

import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_BASE_URL = "http://127.0.0.1:8000";

function getDevServerHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri || Constants.hostUri;
  if (!hostUri) return null;
  const host = hostUri.split(":")[0];
  return host || null;
}

export function getBackendBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (configured) return configured;

  const devHost = getDevServerHost();
  if (devHost) {
    return `http://${devHost}:8000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }

  return DEFAULT_BASE_URL;
}

/**
 * Send a chat message to the backend AI service.
 * @throws Error with detailed message on failure
 */
export async function sendChatMessage(payload: ChatPayload): Promise<ChatResponse> {
  // Validate inputs before sending
  if (!payload.reportId?.trim()) {
    throw new Error("Report ID is required");
  }
  
  if (!payload.userId?.trim()) {
    throw new Error("User ID is required");
  }
  
  if (!payload.message?.trim()) {
    throw new Error("Message cannot be empty");
  }
  
  const baseUrl = getBackendBaseUrl();
  const endpoint = payload.voiceMode ? "/api/voice-chat" : "/api/chat-with-report";

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        report_id: payload.reportId,
        user_id: payload.userId,
        message: payload.message,
        mode: payload.mode || "normal",
        voice_mode: Boolean(payload.voiceMode),
      }),
    });

    if (!response.ok) {
      // Try to parse error response
      try {
        const errorData = (await response.json()) as ErrorResponse;
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      } catch (jsonError) {
        // If JSON parsing fails, use text
        const text = await response.text();
        throw new Error(text || `Server error: ${response.status}`);
      }
    }

    return (await response.json()) as ChatResponse;
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw with more context if it's a network error
      if (error.message === "Failed to fetch" || error.message.includes("Network")) {
        throw new Error(
          `Cannot reach the backend server at ${baseUrl}. Please ensure the server is running.`
        );
      }
      throw error;
    }
    throw new Error("An unexpected error occurred while contacting the server");
  }
}

/**
 * Upload a medical report (PDF/image/text) to the backend.
 * @throws Error with detailed message on failure
 */
export async function uploadMedicalReport(
  payload: UploadReportPayload
): Promise<UploadReportResponse> {
  if (!payload.userId?.trim()) {
    throw new Error("User ID is required");
  }

  if (!payload.file?.uri) {
    throw new Error("Please select a report file to upload");
  }

  const baseUrl = getBackendBaseUrl();
  const formData = new FormData();
  formData.append("user_id", payload.userId.trim());
  if (payload.reportType?.trim()) {
    formData.append("report_type", payload.reportType.trim());
  }
  if (payload.label?.trim()) {
    formData.append("label", payload.label.trim());
  }

  formData.append("file", {
    uri: payload.file.uri,
    name: payload.file.name || "report.pdf",
    type: payload.file.mimeType || "application/octet-stream",
  } as unknown as Blob);

  try {
    const response = await fetch(`${baseUrl}/api/upload-report`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      try {
        const errorData = (await response.json()) as ErrorResponse;
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      } catch {
        const text = await response.text();
        throw new Error(text || `Server error: ${response.status}`);
      }
    }

    return (await response.json()) as UploadReportResponse;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Failed to fetch" || error.message.includes("Network")) {
        throw new Error(
          `Cannot reach the backend server at ${baseUrl}. Please ensure the server is running.`
        );
      }
      throw error;
    }
    throw new Error("An unexpected error occurred while uploading the report");
  }
}
export interface UserReport {
  _id: string;
  reportId: string;
  userId: string;
  label?: string;
  reportType?: string;
  uploadDate: string;
  extractedText?: string;
  summary?: string | null;
  summaryGeneratedAt?: string | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

export async function fetchUserReports(userId: string): Promise<UserReport[]> {
  const baseUrl = getBackendBaseUrl();
  const endpoint = `/api/user-reports/${userId}`;

  try {
    console.log(`📊 Fetching reports for user: ${userId}`);
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reports: ${response.status}`);
    }

    const data = (await response.json()) as { reports: UserReport[] };
    console.log(`✓ Fetched ${data.reports?.length || 0} reports:`, data.reports);
    return data.reports || [];
  } catch (error) {
    console.error("Error fetching user reports:", error);
    return [];
  }
}

export async function saveChat(
  reportId: string,
  userId: string,
  messages: ChatMessage[],
  summary: string = ""
): Promise<boolean> {
  const baseUrl = getBackendBaseUrl();
  const endpoint = "/api/save-chat";

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        report_id: reportId,
        user_id: userId,
        messages,
        summary,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error saving chat:", error);
    return false;
  }
}

export async function fetchChatHistory(
  reportId: string,
  userId: string
): Promise<ChatMessage[] | null> {
  const baseUrl = getBackendBaseUrl();
  const endpoint = `/api/chat-history/${reportId}/${userId}`;

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { chat?: { messages?: ChatMessage[] } };
    return data.chat?.messages || null;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return null;
  }
}

export async function transcribeAudio(audioUri: string): Promise<string> {
  const baseUrl = getBackendBaseUrl();
  const endpoint = "/api/transcribe-audio";

  try {
    const formData = new FormData();
    
    // Create file object from audio URI
    formData.append("audio_file", {
      uri: audioUri,
      name: "recording.m4a",
      type: "audio/m4a",
    } as unknown as Blob);

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to transcribe audio");
    }

    const data = await response.json();
    return data.transcription || "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
}
export interface SummaryResponse {
  report_id: string;
  summary: string | null;
  cached: boolean;
  generated_at: string | null;
  source?: string | null;
  error?: string | null;
  wait_time?: number | null;
}

export async function generateReportSummary(
  reportId: string,
  userId: string,
  forceRegenerate: boolean = false
): Promise<SummaryResponse> {
  const baseUrl = getBackendBaseUrl();
  const endpoint = "/api/generate-summary";

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        report_id: reportId,
        user_id: userId,
        force_regenerate: forceRegenerate,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to generate summary");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
}

export async function getReportSummary(
  reportId: string,
  userId: string
): Promise<{ summary: string | null; generated_at: string | null }> {
  const baseUrl = getBackendBaseUrl();
  const endpoint = `/api/report-summary/${reportId}?user_id=${userId}`;

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return { summary: null, generated_at: null };
    }

    const data = await response.json();
    return {
      summary: data.summary || null,
      generated_at: data.generated_at || null,
    };
  } catch (error) {
    console.error("Error fetching summary:", error);
    return { summary: null, generated_at: null };
  }
}
