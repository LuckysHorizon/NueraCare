# Task Creation & Auto-Generation Feature

## Overview

The NueraCare app now supports two ways to manage daily tasks:

1. **User-Created Tasks** - Users can manually create custom tasks with their own titles, descriptions, categories, and priorities
2. **Auto-Generated Tasks** - Groq AI automatically generates 3 personalized daily tasks based on user health data when no tasks exist for the day

## Features Implemented

### 1. User Task Creation

**User Interface:**
- Modal dialog accessible via "Create Task" button in "Today's Focus" card
- Form fields:
  - **Task Title** (required) - Text input for task name
  - **Description** (optional) - Multi-line text area for details
  - **Category** - Button selection from:
    - General
    - Medication
    - Exercise
    - Appointment
    - Health Check
    - Nutrition
  - **Priority** - Radio button selection:
    - Low
    - Medium (default)
    - High

**Functionality:**
- Validates task title is not empty
- Saves to Sanity database with user's clerk ID
- Reloads task list to show newly created task
- Shows success/error alerts
- Disables form during submission

**Location:** [app/(tabs)/home.tsx](../nueracare-expo-app/app/(tabs)/home.tsx)

### 2. Auto-Generation on App Load

**Trigger Condition:**
- When home screen loads AND no tasks exist for the current day
- Only generates once per day (tracked via `tasksGeneratedToday` state)

**Generation Process:**
1. Checks if today has any tasks
2. If empty, calls backend endpoint: `POST /api/tasks/generate-groq`
3. Backend sends user health data to Groq API
4. Groq generates exactly 3 personalized health tasks
5. Backend returns structured task data
6. Frontend saves all 3 tasks to Sanity using `createMultipleTasks()`
7. Tasks automatically appear in "Today's Focus"

**Default Tasks (Fallback):**
If Groq API fails, these 3 default tasks are shown:
- Take morning medication (High priority)
- 30-minute walk or exercise (Medium priority)
- Drink 8 glasses of water (Medium priority)

### 3. Backend Groq Integration

**Endpoint:** `POST /api/tasks/generate-groq`

**Request Format:**
```json
{
  "user_id": "clerk_user_id",
  "health_data": {
    "age": 45,
    "gender": "unknown",
    "conditions": ["general"],
    "medications": [],
    "activity_level": "moderate"
  }
}
```

**Response Format:**
```json
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Task description",
      "priority": "high|medium|low",
      "category": "medication|exercise|appointment|health-check|nutrition|general",
      "clerkId": "user_id",
      "isCompleted": false,
      "generatedByGroq": true,
      "dueDate": "2024-01-15T09:00:00Z"
    }
  ],
  "message": "Generated 3 personalized tasks using Groq AI"
}
```

**Backend Code:** [backend/routers/tasks.py](../backend/routers/tasks.py)

## Code Changes Summary

### Frontend Changes

**File:** [app/(tabs)/home.tsx](../nueracare-expo-app/app/(tabs)/home.tsx)

**Imports Added:**
```typescript
import { createTask, createMultipleTasks } from "@/services/sanity";
```

**State Variables Added:**
```typescript
const [showCreateModal, setShowCreateModal] = useState(false);
const [newTaskTitle, setNewTaskTitle] = useState("");
const [newTaskDescription, setNewTaskDescription] = useState("");
const [newTaskCategory, setNewTaskCategory] = useState<"general" | "medication" | "exercise" | "appointment" | "health-check" | "nutrition">("general");
const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
const [newTaskDueDate, setNewTaskDueDate] = useState(new Date());
const [creatingTask, setCreatingTask] = useState(false);
const [autoGenerating, setAutoGenerating] = useState(false);
const [tasksGeneratedToday, setTasksGeneratedToday] = useState(false);
```

**Functions Added:**
- `autoGenerateGroqTasks()` - Calls backend Groq endpoint and saves results
- `handleCreateTask()` - Validates form and saves user-created task
- Updated `loadTasks()` - Triggers auto-generation if no tasks exist

**UI Components:**
- Modal dialog for task creation
- "Create Task" button in Today's Focus card
- Category selection (6 categories)
- Priority selection (3 levels)
- Loading states and error handling

### Backend Changes

**File:** [backend/routers/tasks.py](../backend/routers/tasks.py)

**Prompt Updated:**
- Changed from "5 personalized daily health tasks" to "exactly 3 personalized daily health tasks"
- Added explicit requirement: "Generate exactly 3 tasks. No more, no less."

**Default Tasks Function:**
- Reduced from 5 to 3 fallback tasks
- Tasks: medication reminder, exercise, water intake

## User Flow

### Creating a Custom Task

1. User opens app home screen
2. Clicks "Create Task" button in "Today's Focus" card
3. Modal opens with form fields
4. User fills in:
   - Task title (required)
   - Description (optional)
   - Selects category
   - Selects priority
5. Clicks "Create Task" button
6. Task saves to Sanity database
7. Modal closes and task appears in list
8. Success alert shows

### Auto-Generated Tasks

1. User opens app for first time today (or no tasks exist)
2. App detects no tasks for today
3. Calls backend Groq endpoint with user health data
4. Backend queries Groq AI
5. Groq generates 3 personalized tasks
6. Tasks saved to Sanity automatically
7. Tasks appear in "Today's Focus" with:
   - Title and description
   - Category badge
   - Priority color indicator (red=high, yellow=medium, green=low)
8. User can mark done or create additional custom tasks

## Database Schema

**Collection:** `dailyTask` (in Sanity)

**Fields:**
- `_id` - Unique document ID
- `_type` - Document type ("dailyTask")
- `clerkId` - User ID from Clerk auth
- `title` - Task title (string)
- `description` - Task description (string, optional)
- `isCompleted` - Completion status (boolean)
- `priority` - Priority level ("low", "medium", "high")
- `category` - Task category (string)
- `dueDate` - Due date (ISO string)
- `completedAt` - Completion timestamp (ISO string, optional)
- `generatedByGroq` - Whether auto-generated (boolean)
- `createdAt` - Creation timestamp (auto)
- `updatedAt` - Update timestamp (auto)

## API Endpoints

### Generate Tasks
- **URL:** `POST {API_URL}/api/tasks/generate-groq`
- **Parameters:** User health data
- **Returns:** 3 auto-generated tasks

### Fetch Today's Tasks
- **URL:** `GET {API_URL}/api/tasks/today/{clerk_id}`
- **Returns:** All tasks for today (from Sanity)

### Create Task (Sanity)
- **Function:** `createTask(clerkId, taskData)`
- **Saves:** Individual task to Sanity

### Mark Done (Sanity)
- **Function:** `markTaskAsDone(taskId)`
- **Updates:** Sets `isCompleted: true` and `completedAt` timestamp

## Error Handling

**Scenarios:**
1. **Groq API Fails** → Falls back to default 3 tasks
2. **Sanity Connection Fails** → Tries backend API fallback
3. **User Title Empty** → Shows alert, prevents submission
4. **Network Error** → Shows error alert, task not created

**Logging:**
- Console logs with emoji prefixes for debugging
- Info: ✅ Success messages
- Warnings: ⚠️ Fallback scenarios
- Errors: ❌ Failures

## Testing Checklist

- [x] TypeScript compilation passes (no type errors)
- [x] Imports resolved correctly
- [ ] Task creation modal renders
- [ ] Category buttons toggle properly
- [ ] Priority buttons toggle properly
- [ ] Form validation works
- [ ] Tasks save to Sanity
- [ ] Auto-generation triggers on empty task list
- [ ] Groq API generates 3 tasks exactly
- [ ] Tasks display with correct styling
- [ ] Mark done functionality works
- [ ] Loading states show correctly

## Dependencies

**Frontend:**
- React Native/Expo
- @clerk/clerk-expo (authentication)
- @sanity/client (database)
- react-native-safe-area-context
- expo-blur
- @expo/vector-icons

**Backend:**
- FastAPI
- Groq SDK
- Pydantic
- Python requests

## Next Steps

1. Test task creation modal UI
2. Test auto-generation on app load
3. Verify Groq integration generates valid tasks
4. Test mark done functionality with new tasks
5. Performance testing with network latency
6. Error handling edge cases
7. Accessibility testing for modal

## Configuration

**Environment Variables Required:**
- `EXPO_PUBLIC_API_URL` - Backend API base URL
- `SANITY_PROJECT_ID` - Sanity project ID
- `SANITY_DATASET` - Sanity dataset name (production)
- `SANITY_API_TOKEN` - Sanity API token (backend only)
- `GROQ_API_KEY` - Groq API key (backend only)

## Performance Notes

- Auto-generation only triggers once per app session when tasks are empty
- Modal uses native React Native components for performance
- Tasks cached in local state to reduce API calls
- Dual-source fetching (Sanity primary, backend fallback)
