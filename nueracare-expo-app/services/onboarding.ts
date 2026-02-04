import { sanityClient } from './sanity';

export interface OnboardingData {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  mobileNumber: string;
  ageGroup: string;
  preferredName?: string;
  accessibilityNeeds?: string[];
  caregiverInfo?: {
    hasCaregivers: boolean;
    caregiverName?: string;
    caregiverPhone?: string;
    caregiverRelation?: string;
  };
  healthContext?: {
    hasConditions: boolean;
    conditions?: string[];
    medications?: string[];
    allergies?: string[];
    surgeries?: string[];
  };
  permissions?: {
    cameraAccess: boolean;
    locationAccess: boolean;
    notificationsAccess: boolean;
    storageAccess: boolean;
    contactsAccess: boolean;
  };
  reminders?: {
    medicationReminders: boolean;
    appointmentReminders: boolean;
    healthCheckReminders: boolean;
    reminderTime?: string;
  };
  focusAreas?: string[];
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string;
}

/**
 * Create or update onboarding data for a user
 */
export async function saveOnboardingData(
  clerkId: string,
  data: Partial<OnboardingData>
): Promise<any> {
  try {
    const now = new Date().toISOString();
    const docId = `onboarding-${clerkId}`;

    const doc = {
      _id: docId,
      _type: 'onboardingData',
      clerkId,
      ...data,
      updatedAt: now,
      ...(data.onboardingCompleted && { onboardingCompletedAt: now }),
    };

    const result = await sanityClient.createOrReplace(doc);
    return result;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Get onboarding data for a user
 */
export async function getOnboardingData(clerkId: string): Promise<OnboardingData | null> {
  try {
    const query = `*[_type == "onboardingData" && clerkId == $clerkId][0]`;
    const data = await sanityClient.fetch(query, { clerkId });
    return data || null;
  } catch (error) {
    console.error('❌ Error fetching onboarding data:', error);
    throw error;
  }
}

/**
 * Update specific onboarding field
 */
export async function updateOnboardingField(
  clerkId: string,
  fieldPath: string,
  value: any
): Promise<any> {
  try {
    const docId = `onboarding-${clerkId}`;
    const result = await sanityClient
      .patch(docId)
      .set({ [fieldPath]: value, updatedAt: new Date().toISOString() })
      .commit();
    return result;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Complete onboarding
 */
export async function completeOnboarding(clerkId: string): Promise<any> {
  try {
    const docId = `onboarding-${clerkId}`;
    const now = new Date().toISOString();
    const result = await sanityClient
      .patch(docId)
      .set({
        onboardingCompleted: true,
        onboardingCompletedAt: now,
        updatedAt: now,
      })
      .commit();
    return result;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Check if user has completed onboarding
 */
export async function isOnboardingCompleted(clerkId: string): Promise<boolean> {
  try {
    const query = `*[_type == "onboardingData" && clerkId == $clerkId][0]`;
    const doc = await sanityClient.fetch(query, { clerkId });
    
    if (!doc) {
      return false;
    }
    
    const isCompleted = doc.onboardingCompleted === true;
    return isCompleted;
  } catch (error: any) {
    return false;
  }
}
