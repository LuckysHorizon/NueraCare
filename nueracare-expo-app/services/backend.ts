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
