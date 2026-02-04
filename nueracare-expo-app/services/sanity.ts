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

// Initialize Sanity client
export const sanityClient = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
  token,
});

// Export types
export type { UserProfile, OnboardingProgress, MedicalReport };

// Alias for backwards compatibility
export type UserHealthProfile = UserProfile;

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