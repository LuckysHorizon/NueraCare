import { createClient } from "@sanity/client";
import type { UserProfile, OnboardingProgress, MedicalReport } from "@/sanity/types";

// Validate Sanity configuration
const projectId = process.env.EXPO_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.EXPO_PUBLIC_SANITY_DATASET || "production";
const token = process.env.EXPO_PUBLIC_SANITY_TOKEN;

if (!projectId) {
  console.warn(
    "⚠️ EXPO_PUBLIC_SANITY_PROJECT_ID is not set. Create .env.local with your Sanity credentials."
  );
}

if (!token) {
  console.warn(
    "⚠️ EXPO_PUBLIC_SANITY_TOKEN is not set. Sanity writes will fail!"
  );
} else {
  console.log("🔑 Sanity Token loaded (length:", token.length, ")");
}

// Initialize Sanity client
export const sanityClient = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
  token,
});

console.log("🎯 Sanity Client initialized:");
console.log("   Project:", projectId);
console.log("   Dataset:", dataset);
console.log("   Has Token:", !!token);

// Export types
export type { UserProfile, OnboardingProgress, MedicalReport };

// Alias for backwards compatibility
export type UserHealthProfile = UserProfile;

// Test Sanity connection
export async function testSanityConnection(): Promise<boolean> {
  try {
    console.log("🧪 Testing Sanity connection...");
    
    // Try to fetch a simple document
    const result = await sanityClient.fetch('*[_type == "onboardingData"][0]');
    console.log("✅ Sanity connection test passed");
    console.log("Sample document:", result);
    return true;
  } catch (error: any) {
    console.error("❌ Sanity connection test failed:");
    console.error("Error:", error?.message);
    console.error("Status:", error?.statusCode);
    
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      console.error("🔐 PERMISSION ERROR: Token does not have write permissions!");
      console.error("   This is likely a read-only token.");
      console.error("   You need a full API token with Editor/Admin role.");
    }
    
    return false;
  }
}

// Create or update user profile
export async function upsertUserProfile(
  clerkId: string,
  profileData: Partial<UserHealthProfile>
) {
  const docId = `user-${clerkId}`;
  const now = new Date().toISOString();

  const doc = {
    _id: docId,
    _type: "userProfile",
    clerkId,
    ...profileData,
    updatedAt: now,
  };

  try {
    const result = await sanityClient.createOrReplace(doc);
    return result;
  } catch (error) {
    console.error("Error upserting user profile:", error);
    throw error;
  }
}

// Fetch user profile
export async function getUserProfile(clerkId: string) {
  const query = `*[_type == "userProfile" && clerkId == $clerkId][0]`;
  try {
    const profile = await sanityClient.fetch(query, { clerkId });
    return profile as UserHealthProfile | null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

// Update specific user fields
export async function updateUserProfile(
  clerkId: string,
  updates: Partial<UserHealthProfile>
) {
  const docId = `user-${clerkId}`;
  const now = new Date().toISOString();

  try {
    const result = await sanityClient
      .patch(docId)
      .set({ ...updates, updatedAt: now })
      .commit();
    return result;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

// Delete user profile
export async function deleteUserProfile(clerkId: string) {
  const docId = `user-${clerkId}`;
  try {
    const result = await sanityClient.delete(docId);
    return result;
  } catch (error) {
    console.error("Error deleting user profile:", error);
    throw error;
  }
}
// ===== GROQ QUERIES =====

// Get all users
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const users = await sanityClient.fetch(
      `*[_type == "userProfile"] | order(createdAt desc)`
    );
    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
}

// Search users by name
export async function searchUsersByName(query: string): Promise<UserProfile[]> {
  try {
    const results = await sanityClient.fetch(
      `*[_type == "userProfile" && (firstName match $q || lastName match $q)]`,
      { q: query }
    );
    return results;
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
}

// Get users by blood group
export async function getUsersByBloodGroup(bloodGroup: string): Promise<UserProfile[]> {
  try {
    const users = await sanityClient.fetch(
      `*[_type == "userProfile" && bloodGroup == $bloodGroup]`,
      { bloodGroup }
    );
    return users;
  } catch (error) {
    console.error("Error fetching users by blood group:", error);
    throw error;
  }
}

// Check if user exists
export async function userExists(clerkId: string): Promise<boolean> {
  try {
    const count = await sanityClient.fetch(
      `count(*[_type == "userProfile" && clerkId == $clerkId])`,
      { clerkId }
    );
    return count > 0;
  } catch (error) {
    console.error("Error checking user existence:", error);
    throw error;
  }
}

// Get user statistics
export async function getUserStatistics() {
  try {
    const stats = await sanityClient.fetch(`{
      "totalUsers": count(*[_type == "userProfile"]),
      "avgAge": avg(*[_type == "userProfile"].age),
      "avgWeight": avg(*[_type == "userProfile"].weight),
      "highContrastUsers": count(*[_type == "userProfile" && highContrast == true]),
      "largeTextUsers": count(*[_type == "userProfile" && largeTextMode == true]),
      "reducedMotionUsers": count(*[_type == "userProfile" && reducedMotion == true]),
      "bloodGroupDistribution": *[_type == "userProfile"] { bloodGroup } | group(bloodGroup) | map({
        type: .[0].bloodGroup,
        count: length(.)
      })
    }`);
    return stats;
  } catch (error) {
    console.error("Error fetching statistics:", error);
    throw error;
  }
}

// ===== ONBOARDING PROGRESS =====

// Create onboarding progress
export async function createOnboardingProgress(clerkId: string) {
  const docId = `onboarding-${clerkId}`;
  const doc = {
    _id: docId,
    _type: "onboardingProgress",
    clerkId,
    welcomeCompleted: false,
    healthInfoCompleted: false,
    accessibilityCompleted: false,
    permissionsCompleted: false,
    onboardingCompleted: false,
    currentStep: "welcome" as const,
    startedAt: new Date().toISOString(),
  };

  try {
    return await sanityClient.createOrReplace(doc);
  } catch (error) {
    console.error("Error creating onboarding progress:", error);
    throw error;
  }
}

// Get onboarding progress
export async function getOnboardingProgress(clerkId: string): Promise<OnboardingProgress | null> {
  try {
    const progress = await sanityClient.fetch(
      `*[_type == "onboardingProgress" && clerkId == $clerkId][0]`,
      { clerkId }
    );
    return progress;
  } catch (error) {
    console.error("Error fetching onboarding progress:", error);
    throw error;
  }
}

// Update onboarding step
export async function updateOnboardingStep(
  clerkId: string,
  step: 'welcome' | 'health-info' | 'accessibility' | 'permissions' | 'complete',
  updates: Partial<OnboardingProgress>
) {
  const docId = `onboarding-${clerkId}`;

  try {
    return await sanityClient.patch(docId).set({
      currentStep: step,
      ...updates,
    }).commit();
  } catch (error) {
    console.error("Error updating onboarding step:", error);
    throw error;
  }
}

// Complete onboarding
export async function completeOnboarding(clerkId: string) {
  const docId = `onboarding-${clerkId}`;

  try {
    return await sanityClient.patch(docId).set({
      currentStep: "complete",
      onboardingCompleted: true,
      completedAt: new Date().toISOString(),
    }).commit();
  } catch (error) {
    console.error("Error completing onboarding:", error);
    throw error;
  }
}

// ===== MEDICAL REPORTS =====

export async function getMedicalReports(userId: string): Promise<MedicalReport[]> {
  try {
    const reports = await sanityClient.fetch(
      `*[_type == "medicalReport" && userId == $userId] | order(uploadDate desc)`,
      { userId }
    );
    return reports;
  } catch (error) {
    console.error("Error fetching medical reports:", error);
    throw error;
  }
}

export async function getMedicalReportByIds(userId: string, reportId: string) {
  try {
    const report = await sanityClient.fetch(
      `*[_type == "medicalReport" && userId == $userId && reportId == $reportId][0]`,
      { userId, reportId }
    );
    return report as MedicalReport | null;
  } catch (error) {
    console.error("Error fetching medical report:", error);
    throw error;
  }
}

export async function createMedicalReport(
  userId: string,
  reportId: string,
  reportData: Partial<MedicalReport>
) {
  try {
    const existing = await sanityClient.fetch(
      `*[_type == "medicalReport" && userId == $userId && reportId == $reportId][0]{_id}`,
      { userId, reportId }
    );

    if (existing?._id) {
      return await sanityClient
        .patch(existing._id)
        .set({
          ...reportData,
          userId,
          reportId,
        })
        .commit();
    }

    const doc = {
      _type: "medicalReport" as const,
      userId,
      reportId,
      ...reportData,
    };

    return await sanityClient.create(doc);
  } catch (error) {
    console.error("Error creating medical report:", error);
    throw error;
  }
}

// ===== DAILY TASKS =====

export interface DailyTask {
  _id: string;
  _type: 'dailyTask';
  clerkId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'medication' | 'exercise' | 'appointment' | 'health-check' | 'nutrition' | 'general';
  dueDate?: string;
  completedAt?: string;
  generatedByGroq: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get today's tasks for user
export async function getTodaysTasks(clerkId: string): Promise<DailyTask[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log(`🔍 Fetching tasks for user: ${clerkId}`);
    console.log(`📅 Date range: ${today.toISOString()} to ${tomorrow.toISOString()}`);

    // First, get ALL tasks to debug
    const allTasks = await sanityClient.fetch(
      `*[_type == "dailyTask" && clerkId == $clerkId] | order(dueDate desc)`,
      { clerkId }
    );
    console.log(`📊 Total tasks for user: ${allTasks.length}`);
    if (allTasks.length > 0) {
      console.log(`📋 All task dates:`, allTasks.map((t: any) => ({
        title: t.title,
        dueDate: t.dueDate,
        isCompleted: t.isCompleted,
      })));
    }

    // Now get tasks for today
    const tasks = await sanityClient.fetch(
      `*[_type == "dailyTask" && clerkId == $clerkId && dueDate >= $today && dueDate < $tomorrow] | order(priority desc, dueDate asc)`,
      { 
        clerkId,
        today: today.toISOString(),
        tomorrow: tomorrow.toISOString(),
      }
    );

    console.log(`✅ Today's tasks: ${tasks.length}`);
    if (tasks.length > 0) {
      console.log(`📌 Today's task details:`, tasks.map((t: any) => ({
        _id: t._id,
        title: t.title,
        dueDate: t.dueDate,
        isCompleted: t.isCompleted,
        priority: t.priority,
      })));
    }

    return tasks;
  } catch (error) {
    console.error("Error fetching today's tasks:", error);
    throw error;
  }
}

// Get all pending tasks for user
export async function getPendingTasks(clerkId: string): Promise<DailyTask[]> {
  try {
    const tasks = await sanityClient.fetch(
      `*[_type == "dailyTask" && clerkId == $clerkId && isCompleted == false] | order(priority desc, dueDate asc)`,
      { clerkId }
    );
    return tasks;
  } catch (error) {
    console.error("Error fetching pending tasks:", error);
    throw error;
  }
}

// Create a new task
export async function createTask(
  clerkId: string,
  taskData: Omit<DailyTask, '_id' | '_type' | 'createdAt' | 'updatedAt'>
) {
  try {
    const now = new Date().toISOString();
    const doc = {
      _type: "dailyTask" as const,
      ...taskData,
      createdAt: now,
      updatedAt: now,
    };

    const result = await sanityClient.create(doc);
    return result;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

// Create multiple tasks (for Groq-generated tasks)
export async function createMultipleTasks(
  clerkId: string,
  tasks: Omit<DailyTask, '_id' | '_type' | 'createdAt' | 'updatedAt'>[]
) {
  try {
    const now = new Date().toISOString();
    const docs = tasks.map(task => ({
      _type: "dailyTask" as const,
      ...task,
      createdAt: now,
      updatedAt: now,
    }));

    const results = await sanityClient.create(docs as any);
    return results;
  } catch (error) {
    console.error("Error creating multiple tasks:", error);
    throw error;
  }
}

// Mark task as done
export async function markTaskAsDone(taskId: string) {
  try {
    const now = new Date().toISOString();
    const result = await sanityClient
      .patch(taskId)
      .set({
        isCompleted: true,
        completedAt: now,
        updatedAt: now,
      })
      .commit();
    return result;
  } catch (error) {
    console.error("Error marking task as done:", error);
    throw error;
  }
}

// Mark task as not done
export async function markTaskAsNotDone(taskId: string) {
  try {
    const now = new Date().toISOString();
    const result = await sanityClient
      .patch(taskId)
      .set({
        isCompleted: false,
        completedAt: null,
        updatedAt: now,
      })
      .commit();
    return result;
  } catch (error) {
    console.error("Error marking task as not done:", error);
    throw error;
  }
}

// Update task
export async function updateTask(
  taskId: string,
  updates: Partial<Omit<DailyTask, '_id' | '_type' | 'createdAt'>>
) {
  try {
    const now = new Date().toISOString();
    const result = await sanityClient
      .patch(taskId)
      .set({
        ...updates,
        updatedAt: now,
      })
      .commit();
    return result;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}

// Delete task
export async function deleteTask(taskId: string) {
  try {
    const result = await sanityClient.delete(taskId);
    return result;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}