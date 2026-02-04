/**
 * Groq Task Generation Integration
 * 
 * This utility integrates with Groq AI to generate daily tasks for users.
 * Usage example:
 * 
 * import { generateGroqTasks } from '@/utils/groqTaskGenerator';
 * 
 * const newTasks = await generateGroqTasks(userHealthData);
 * await createMultipleTasks(clerkId, newTasks);
 */

interface UserHealthData {
  firstName?: string;
  conditions?: string[];
  medications?: string[];
  allergies?: string[];
  bloodPressure?: string;
  bloodSugar?: number;
  weight?: number;
  age?: number;
  activityLevel?: string;
}

interface GeneratedTask {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'medication' | 'exercise' | 'appointment' | 'health-check' | 'nutrition' | 'general';
  dueDate?: string;
  generatedByGroq: boolean;
  isCompleted: boolean;
  clerkId: string;
}

/**
 * Generate personalized daily tasks using Groq AI
 * This function calls a backend endpoint that uses Groq to generate tasks
 * based on user health data
 */
export async function generateGroqTasks(
  clerkId: string,
  userHealthData: UserHealthData,
  apiUrl: string = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'
): Promise<GeneratedTask[]> {
  try {
    const response = await fetch(`${apiUrl}/api/tasks/generate-groq`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clerkId,
        userHealthData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate tasks: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Ensure tasks have required fields
    return data.tasks.map((task: any) => ({
      ...task,
      clerkId,
      generatedByGroq: true,
      isCompleted: false,
    }));
  } catch (error) {
    console.error('Error generating Groq tasks:', error);
    // Return default fallback tasks if Groq generation fails
    return getDefaultTasks(clerkId);
  }
}

/**
 * Fallback tasks when Groq generation fails
 */
function getDefaultTasks(clerkId: string): GeneratedTask[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return [
    {
      title: 'Take morning medication',
      description: 'Take prescribed medications with water',
      priority: 'high',
      category: 'medication',
      dueDate: today.toISOString(),
      generatedByGroq: false,
      isCompleted: false,
      clerkId,
    },
    {
      title: 'Drink 8 glasses of water',
      description: 'Stay hydrated throughout the day',
      priority: 'medium',
      category: 'health-check',
      dueDate: today.toISOString(),
      generatedByGroq: false,
      isCompleted: false,
      clerkId,
    },
    {
      title: '30-minute walk or exercise',
      description: 'Light physical activity for the day',
      priority: 'medium',
      category: 'exercise',
      dueDate: today.toISOString(),
      generatedByGroq: false,
      isCompleted: false,
      clerkId,
    },
  ];
}

/**
 * Generate tasks and save to Sanity
 * This is a convenience function that combines generation and saving
 */
export async function generateAndSaveGroqTasks(
  clerkId: string,
  userHealthData: UserHealthData,
  saveFunction: (clerkId: string, tasks: any[]) => Promise<any>
) {
  try {
    const tasks = await generateGroqTasks(clerkId, userHealthData);
    const result = await saveFunction(clerkId, tasks);
    return result;
  } catch (error) {
    console.error('Error generating and saving tasks:', error);
    throw error;
  }
}
