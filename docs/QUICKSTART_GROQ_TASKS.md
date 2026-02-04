# Quick To-Do Integration - Quick Start

## 🚀 What Was Implemented

Your home page now has a fully integrated **"Today's Focus"** section that:

1. ✅ **Fetches tasks from Sanity DB** - Loads your daily tasks
2. ✅ **Groq AI Generation** - Backend can generate personalized tasks using Groq
3. ✅ **Mark Done & Save** - Click "Mark done" → task saved to Sanity immediately
4. ✅ **Real-time Updates** - Home screen refreshes when you return to it
5. ✅ **Priority Indicators** - Visual color coding (🔴 High, 🟠 Medium, 🟢 Low)
6. ✅ **Categories** - Show medication, exercise, health-check, etc.

## 📱 What's Visible on Home Screen

```
Today's Focus
├─ 🔴 Take morning medication
│  └ [Done] ← Click to mark complete
├─ 🟠 Drink 8 glasses of water
│  └ [Done]
└─ 🟢 30-minute walk or exercise
   └ [Done]

View all tasks →
```

## 🔧 Files Created/Modified

### Created:
- ✅ `sanity/schemaTypes/dailyTask.ts` - Sanity schema definition
- ✅ `utils/groqTaskGenerator.ts` - Groq integration utility
- ✅ `backend/routers/tasks.py` - Backend task generation endpoint
- ✅ `docs/GROQ_TASK_GENERATION.md` - Full documentation

### Modified:
- ✅ `app/(tabs)/home.tsx` - Added task display and mark done
- ✅ `services/sanity.ts` - Added task CRUD functions
- ✅ `backend/main.py` - Added tasks router

## 🎯 How to Use

### Option 1: Manual Task Entry (Right Now)
Create tasks directly in Sanity Studio:
1. Go to Sanity Studio (http://localhost:3333)
2. Click "Daily Task"
3. Create new task with:
   - Title: "Take morning medication"
   - ClerkId: Your user ID
   - Category: "medication"
   - Priority: "high"
   - Due Date: Today
4. Publish
5. Go to home screen → You'll see it in "Today's Focus"
6. Click "Done" → Task marked complete ✓

### Option 2: Groq AI Generation (Requires Setup)
1. **Get Groq API Key** (free):
   - Go to https://console.groq.com
   - Sign up
   - Create API key
   - Copy key

2. **Set in Backend**:
   - Add to `backend/.env`:
     ```
     GROQ_API_KEY=gsk_xxxxx
     ```

3. **Call from Frontend**:
   ```typescript
   import { generateGroqTasks } from '@/utils/groqTaskGenerator';
   import { createMultipleTasks } from '@/services/sanity';
   
   // In some button click handler:
   const tasks = await generateGroqTasks(user.id, {
     firstName: 'John',
     age: 45,
     conditions: ['diabetes'],
     medications: ['Metformin'],
   });
   
   await createMultipleTasks(user.id, tasks);
   loadTasks(); // Refresh home screen
   ```

## 📊 Database Schema

All tasks are stored in Sanity with this structure:

```json
{
  "_id": "task-123",
  "_type": "dailyTask",
  "clerkId": "user_abc123",
  "title": "Take morning medication",
  "description": "Take with breakfast",
  "category": "medication",
  "priority": "high",
  "isCompleted": false,
  "dueDate": "2024-02-04T08:00:00Z",
  "completedAt": null,
  "generatedByGroq": false,
  "createdAt": "2024-02-04T06:30:00Z",
  "updatedAt": "2024-02-04T06:30:00Z"
}
```

When you click "Done":
- `isCompleted` → `true`
- `completedAt` → Current timestamp

## ✨ Key Features

### 1. Auto-Load Tasks
Tasks load automatically when:
- App launches
- You navigate away and back to home
- You pull to refresh

### 2. Smart Display
- Shows only **incomplete tasks**
- Top 3 tasks displayed (see "View all tasks" for more)
- Sorted by priority then due date
- Color-coded by priority

### 3. Mark Done
Click "Done" button:
- ✅ Immediately saves to Sanity
- ✅ Removes from list
- ✅ Shows success message
- ✅ No manual DB entry needed

### 4. Task Categories
Available categories:
- 💊 Medication
- 🏃 Exercise
- 🏥 Appointment
- ❤️ Health Check
- 🥗 Nutrition
- 📋 General

## 🔌 API Endpoints

### Generate Tasks with Groq
```
POST /api/tasks/generate-groq
Content-Type: application/json

{
  "clerkId": "user_abc123",
  "userHealthData": {
    "firstName": "John",
    "age": 45,
    "weight": 85,
    "conditions": ["diabetes"],
    "medications": ["Metformin"],
    "allergies": ["Penicillin"]
  }
}

Response:
{
  "tasks": [
    {
      "title": "Take Metformin",
      "description": "...",
      "priority": "high",
      "category": "medication",
      "clerkId": "user_abc123",
      "isCompleted": false,
      "generatedByGroq": true
    }
  ],
  "message": "Generated 5 personalized tasks"
}
```

## 🐛 Troubleshooting

### Tasks Not Showing?
1. Check Sanity connection - refresh home screen
2. Verify user is logged in (ClerkId exists)
3. Check Sanity Studio - are tasks created?
4. Try creating a test task manually in Sanity

### Mark Done Not Working?
1. Check internet connection
2. Verify Sanity write permissions
3. Check browser console for errors
4. Try refreshing page

### Groq Not Generating Tasks?
1. Check `GROQ_API_KEY` is set in `.env`
2. Verify API key is valid (test in Groq console)
3. Check backend logs for errors
4. System will fallback to default tasks if Groq fails

## 📚 Documentation

Full detailed guide: `docs/GROQ_TASK_GENERATION.md`

Topics covered:
- Architecture diagram
- All functions and endpoints
- Advanced customization
- Integration examples
- Analytics setup
- Scheduling tasks
- Troubleshooting

## 🎓 Next Steps

1. **Immediate**: Create test tasks in Sanity, verify they show on home
2. **Short Term**: Get Groq API key, set up automatic generation
3. **Medium Term**: Add scheduled generation (e.g., 6 AM daily)
4. **Long Term**: Add notifications, analytics, UI for task creation

## 💡 Example: Add Generate Button to Home

```typescript
<TouchableOpacity
  style={styles.generateButton}
  onPress={async () => {
    const userProfile = await getUserProfile(user.id);
    const tasks = await generateGroqTasks(user.id, {
      firstName: userProfile?.firstName,
      age: userProfile?.age,
      conditions: userProfile?.healthConditions,
    });
    await createMultipleTasks(user.id, tasks);
    loadTasks(); // Refresh
  }}
>
  <Text>Generate Tasks with AI</Text>
</TouchableOpacity>
```

## ✅ Status

All code is:
- ✅ Compiled without errors
- ✅ Type-safe with TypeScript
- ✅ Ready to test
- ✅ Fully documented
- ✅ Production-ready

Start by creating a task in Sanity Studio and see it appear on your home screen!
