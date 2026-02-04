# Quick To-Do System - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     NueraCare Application                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │           FRONTEND (React Native/Expo)                    │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Home Screen (home.tsx)                             │  │  │
│  │  │  - Display "Today's Focus" section                  │  │  │
│  │  │  - Show tasks from Sanity                           │  │  │
│  │  │  - Mark done button (saves to DB)                   │  │  │
│  │  │  - Auto-load on screen focus                        │  │  │
│  │  └──────────────────┬──────────────────────────────────┘  │  │
│  │                     │                                        │  │
│  │  ┌──────────────────┴──────────────────────────────────┐  │  │
│  │  │  Sanity Service (sanity.ts)                         │  │  │
│  │  │                                                       │  │  │
│  │  │  Functions:                                          │  │  │
│  │  │  • getTodaysTasks(clerkId)                          │  │  │
│  │  │  • markTaskAsDone(taskId)                           │  │  │
│  │  │  • createTask(clerkId, taskData)                    │  │  │
│  │  │  • createMultipleTasks(clerkId, tasks)              │  │  │
│  │  │  • updateTask(taskId, updates)                      │  │  │
│  │  └──────────────────┬──────────────────────────────────┘  │  │
│  │                     │                                        │  │
│  │  ┌──────────────────┴──────────────────────────────────┐  │  │
│  │  │  Groq Task Generator (groqTaskGenerator.ts)        │  │  │
│  │  │                                                       │  │  │
│  │  │  • generateGroqTasks(clerkId, healthData)          │  │  │
│  │  │  • generateAndSaveGroqTasks(...)                    │  │  │
│  │  │  • getDefaultTasks() [fallback]                     │  │  │
│  │  └──────────────────┬──────────────────────────────────┘  │  │
│  │                     │ (HTTPS)                                │  │
│  └─────────────────────┼────────────────────────────────────┬──┘  │
│                        │                                    │       │
└────────────────────────┼────────────────────────────────────┼───────┘
                         │                                    │
                ┌────────▼────────┐            ┌─────────────▼────┐
                │   Backend API   │            │  Sanity Content  │
                │   (FastAPI)     │            │  Platform        │
                │                 │            │                  │
          ┌─────┴────────────┐    │            │  ┌──────────────┐│
          │ GET /health      │    │            │  │ dailyTask    ││
          ├─────────────────┤    │            │  │ documents    ││
          │ POST /tasks/    │    │            │  │              ││
          │ generate-groq   │    │            │  │ • title      ││
          └────────┬────────┘    │            │  │ • clerkId    ││
                   │             │            │  │ • category   ││
          ┌────────▼────────┐    │            │  │ • priority   ││
          │ Groq Integration│    │            │  │ • isCompleted││
          │                 │    │            │  │ • dueDate    ││
          │ • Prompt       │    │            │  │ • completedAt││
          │   engineering   │    │            │  └──────────────┘│
          │ • Task         │    │            │                  │
          │   generation    │    │            │  ┌──────────────┐│
          │ • Fallback      │    │            │  │ GROQ Queries ││
          │   defaults      │    │            │  │              ││
          └────────────────┘    │            │  │ Filter by:   ││
                                 │            │  │ • clerkId    ││
               ┌─────────────────┴────────┐   │  │ • dueDate    ││
               │                          │   │  │ • isCompleted││
               ▼                          │   │  │ • priority   ││
        ┌────────────────┐               │   │  └──────────────┘│
        │  Groq API      │               │   └──────────────────┘
        │                │               │
        │ • OpenAI Models│               │
        │ • Task        │               │
        │   generation   │               │
        └────────────────┘               │
                                         │
                                    ┌────▼─────┐
                                    │ Sanity    │
                                    │ Database  │
                                    │ (Cloud)   │
                                    └───────────┘
```

## Data Flow Diagram

### Flow 1: Display Tasks

```
User Opens App
     │
     ▼
Home Screen Mounts
     │
     ▼
useFocusEffect Hook Triggers
     │
     ▼
loadTasks() Function Called
     │
     ▼
getTodaysTasks(clerkId) Called
     │
     ▼
GROQ Query Executed:
*[_type == "dailyTask" && 
  clerkId == $clerkId && 
  dueDate >= $today && 
  dueDate < $tomorrow &&
  isCompleted == false]
| order(priority desc, dueDate asc)
     │
     ▼
Sanity Returns Task Data
     │
     ▼
Filter Top 3 Incomplete Tasks
     │
     ▼
Update UI State
     │
     ▼
Render Tasks in "Today's Focus"
├── Task 1 (High priority)
│   └─ [Mark done] button
├── Task 2 (Medium priority)
│   └─ [Mark done] button
└── Task 3 (Low priority)
    └─ [Mark done] button
```

### Flow 2: Mark Task as Done

```
User Clicks "Mark done" Button
     │
     ▼
handleMarkDone(taskId) Triggered
     │
     ├─ setMarkingDoneId(taskId) [Show loading]
     │
     ▼
markTaskAsDone(taskId) Called
     │
     ▼
Sanity.patch(taskId) Executed:
{
  set: {
    isCompleted: true,
    completedAt: now,
    updatedAt: now
  }
}
     │
     ▼
Sanity Updates Document
     │
     ▼
Success Response Returned
     │
     ├─ Remove Task from Local State
     │
     ├─ UI Immediately Updates (no refetch needed)
     │
     ├─ Show Success Alert: "✓ Task marked as done!"
     │
     └─ Clear Loading State
          │
          ▼
Task Disappears from "Today's Focus"
```

### Flow 3: Generate Tasks with Groq

```
User Clicks "Generate Tasks" Button (optional)
     │
     ▼
generateGroqTasks(clerkId, userHealthData) Called
     │
     ▼
Build Health Profile from User Data:
├── Name
├── Age
├── Weight
├── Blood Pressure
├── Blood Sugar
├── Health Conditions
├── Medications
├── Allergies
└── Activity Level
     │
     ▼
Create Prompt for Groq:
"Generate 5 personalized daily health tasks
based on this health profile..."
     │
     ▼
Call Groq API:
POST https://api.groq.com/openai/v1/chat/completions
├── Model: mixtral-8x7b-32768
├── Max tokens: 1024
└── Message: [prompt]
     │
     ▼
Groq Generates Tasks:
[
  {
    "title": "Take Metformin",
    "description": "500mg with breakfast",
    "priority": "high",
    "category": "medication"
  },
  ...
]
     │
     ▼
Parse JSON Response
     │
     ├─ On Success:
     │  └─ Return tasks with clerkId & dueDate
     │
     └─ On Error:
        └─ Return fallback default tasks
             │
             ▼
Frontend Receives Tasks:
[
  {
    title: "...",
    priority: "...",
    category: "...",
    clerkId: "user_123",
    isCompleted: false,
    generatedByGroq: true,
    dueDate: "2024-02-04T..."
  },
  ...
]
             │
             ▼
createMultipleTasks(clerkId, tasks) Called
             │
             ▼
Sanity.create(tasks) Executed
             │
             ▼
All Tasks Saved to Sanity Database
             │
             ▼
loadTasks() Called to Refresh UI
             │
             ▼
Home Screen Shows New Generated Tasks
```

## Component Relationship Diagram

```
┌──────────────────────────────────────────┐
│      home.tsx (Home Screen)              │
│                                          │
│  State:                                  │
│  • tasks: DailyTask[]                   │
│  • tasksLoading: boolean                │
│  • markingDoneId: string | null         │
│                                          │
│  Hooks:                                  │
│  • useFocusEffect → loadTasks()         │
│                                          │
│  Functions:                              │
│  • loadTasks()                          │
│  • handleMarkDone(taskId)               │
│                                          │
└────────────┬──────────────────────────┬──┘
             │                          │
             ▼                          ▼
    ┌──────────────────┐      ┌──────────────────┐
    │  sanity.ts       │      │  groq...tor.ts   │
    │  (Service)       │      │  (Utility)       │
    │                  │      │                  │
    │ • getTodaysTasks │      │ • generateGroq   │
    │   (GROQ query)   │      │   Tasks()        │
    │                  │      │                  │
    │ • markTaskAsDone │      │ • generate       │
    │   (patch)        │      │   AndSave...()   │
    │                  │      │                  │
    │ • createMultiple │      │ • getDefault     │
    │   Tasks()        │      │   Tasks()        │
    │                  │      │                  │
    └────────┬─────────┘      └────────┬─────────┘
             │                         │
             └────────────┬────────────┘
                          │
                          ▼
              ┌──────────────────────┐
              │  sanityClient        │
              │  (Sanity SDK)        │
              │                      │
              │  HTTPS Requests:     │
              │  • GROQ Queries      │
              │  • Patches (update)  │
              │  • Creates (new)     │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Sanity API          │
              │  (Cloud)             │
              │                      │
              │  Project: q5maqr3y   │
              │  Dataset: production │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Sanity Database     │
              │                      │
              │  Collections:        │
              │  • dailyTask         │
              │  • userProfile       │
              │  • medicalReport     │
              │  • ...               │
              └──────────────────────┘
```

## Task State Transitions

```
                    Created
                      │
                      ▼
            ┌─────────────────────┐
            │   PENDING TASK      │
            │                     │
            │ • isCompleted: false│
            │ • completedAt: null │
            │                     │
            └──────────┬──────────┘
                       │
        User clicks "Mark done"
                       │
                       ▼
            ┌─────────────────────┐
            │  COMPLETING TASK    │
            │ (API call in flight)│
            │                     │
            │ • showLoading: true │
            └──────────┬──────────┘
                       │
            Sanity API responds
                       │
                       ▼
            ┌─────────────────────┐
            │  COMPLETED TASK     │
            │                     │
            │ • isCompleted: true │
            │ • completedAt: now  │
            │                     │
            └─────────────────────┘
                       │
            (Removed from home display)
```

## Priority Color Mapping

```
High Priority (🔴)
├─ Color: #EF4444 (Red)
├─ Example: "Take morning medication"
└─ UI: Red bullet + border button

Medium Priority (🟠)
├─ Color: #F59E0B (Orange)
├─ Example: "Drink 8 glasses of water"
└─ UI: Orange bullet + border button

Low Priority (🟢)
├─ Color: #10B981 (Green)
├─ Example: "Light stretching"
└─ UI: Green bullet + border button
```

## Category Icon Mapping (Suggested)

```
💊 Medication
   Category: "medication"
   Examples: "Take medication", "Check dosage"

🏃 Exercise
   Category: "exercise"
   Examples: "30-minute walk", "Yoga session"

🏥 Appointment
   Category: "appointment"
   Examples: "Doctor visit", "Lab tests"

❤️ Health Check
   Category: "health-check"
   Examples: "Check blood pressure", "Measure weight"

🥗 Nutrition
   Category: "nutrition"
   Examples: "Eat healthy meal", "Drink water"

📋 General
   Category: "general"
   Examples: "Call family", "Rest well"
```

## Error Handling Flow

```
User Action (fetch/save/generate)
     │
     ├─ Try Block
     │  └─ Execute API/Database Call
     │
     ├─ On Success ✓
     │  ├─ Update UI State
     │  ├─ Show Success Message
     │  └─ Clear Loading State
     │
     └─ On Error ✗
        ├─ Catch Error
        ├─ Log to Console
        ├─ Show Error Alert to User
        ├─ Fallback Behavior:
        │  • Tasks: Show "Loading tasks..." or empty
        │  • Mark Done: "Failed to mark. Try again."
        │  • Generate: Use default tasks instead
        └─ Clear Loading State
```

## Sanity Schema Relationships

```
userProfile (Document)
├─ _id: "user-clerk_id"
├─ _type: "userProfile"
├─ clerkId: "user_abc123"
├─ firstName: "John"
├─ age: 45
├─ conditions: ["diabetes", "hypertension"]
├─ medications: ["Metformin", "Lisinopril"]
└─ ...

dailyTask (Document)
├─ _id: "task-123"
├─ _type: "dailyTask"
├─ clerkId: "user_abc123"  ◄─── References user
├─ title: "Take Metformin"
├─ category: "medication"
├─ priority: "high"
├─ isCompleted: false
└─ ...
```

## Performance Characteristics

```
Operations                  | Latency      | Storage
────────────────────────────┼──────────────┼────────
getTodaysTasks()            | ~200-500ms   | N/A
markTaskAsDone()            | ~100-300ms   | +1 field
createTask()                | ~200-400ms   | +1 doc
createMultipleTasks() (5)   | ~400-700ms   | +5 docs
generateGroqTasks()         | ~3-8 secs    | N/A
generateAndSaveGroqTasks()  | ~3.5-8.5s    | +5 docs

Notes:
• Times depend on network condition
• Sanity uses global CDN (fast queries)
• Groq has 3-8s latency (AI generation)
• Mutations (updates/creates) are slightly slower
```

---

This visual architecture makes it easy to understand:
- How components communicate
- Where data flows
- What happens at each step
- How errors are handled
- Performance expectations
