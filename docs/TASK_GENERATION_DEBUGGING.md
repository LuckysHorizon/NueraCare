# Task Generation Debugging Guide

## Issue: "No tasks for today" Still Showing

### Root Causes Fixed

1. **Incorrect API Parameter Names**
   - **Was:** Sending `user_id` and `health_data`
   - **Fixed:** Now sends `clerkId` and `userHealthData` (matches backend model)

2. **Flow Control Issue**
   - **Was:** Auto-generation happened but didn't reload tasks after saving
   - **Fixed:** Now calls `getTodaysTasks()` again after saving to Sanity

3. **Missing Error Fallback**
   - **Was:** If API failed, no tasks displayed
   - **Fixed:** Now shows 3 default fallback tasks when Groq fails

## How to Debug

### Check Console Logs
Open the Expo app's console and look for these patterns:

**Success Flow:**
```
✅ Fetched tasks from Sanity: 0
🤖 No tasks found, generating Groq tasks...
🚀 Calling Groq API to generate tasks...
📝 Groq generated 3 tasks
💾 Saving generated tasks to Sanity...
✅ Auto-generated and saved tasks to Sanity
🔄 Re-fetching tasks from Sanity...
📋 Displaying 3 generated tasks
```

**Error Flow (with Fallback):**
```
✅ Fetched tasks from Sanity: 0
🤖 No tasks found, generating Groq tasks...
🚀 Calling Groq API to generate tasks...
⚠️ API responded with status 400|500
❌ Error auto-generating tasks: Error: API responded with status...
⚠️ Falling back to default tasks...
```

### Common Issues

#### 1. "No tasks for today" Empty State
- Check if `tasksGeneratedToday` is being set correctly
- Verify `autoGenerateGroqTasks()` is being called
- Check console for error messages
- Ensure API_URL is correctly set in environment

#### 2. API Returning 400 Error
- **Cause:** Incorrect parameter names or format
- **Check:** Request body matches `GenerateTasksRequest` model:
  ```json
  {
    "clerkId": "user_id_string",
    "userHealthData": {
      "age": 45,
      "conditions": ["general"],
      "medications": [],
      "activityLevel": "moderate"
    }
  }
  ```

#### 3. Tasks Generated but Not Saving to Sanity
- Check SANITY_API_TOKEN is valid
- Verify Sanity project ID and dataset
- Check `createMultipleTasks()` logs in console
- Look for Sanity-specific error messages

#### 4. Tasks Saved but Not Displaying
- Verify `getTodaysTasks()` returns the fresh tasks
- Check if tasks have `isCompleted: false`
- Ensure tasks are from today (date filter working)
- Check `slice(0, 3)` is limiting correctly

## Testing Steps

### 1. Clear All Tasks (Fresh Start)
```bash
# In Sanity Studio, delete all dailyTask documents for the user
```

### 2. Force App Reload
```bash
# Stop Expo and restart with cache clear
expo start --clear
```

### 3. Watch Console Output
Open Expo console (press `j` in terminal) and monitor logs

### 4. Check Network Tab
In Expo dev tools, verify:
- `POST /api/tasks/generate-groq` returns 200 OK
- Response includes 3 tasks in `tasks` array
- All required fields present

### 5. Verify Sanity Save
In Sanity Studio:
1. Go to Content
2. Filter by your user's clerkId
3. Should see 3 new dailyTask documents
4. Check `generatedByGroq: true` field

## Environment Variables Needed

```env
# Frontend (.env or app.json)
EXPO_PUBLIC_API_URL=http://localhost:8000

# Backend (.env)
SANITY_PROJECT_ID=q5maqr3y
SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token
GROQ_API_KEY=your_groq_api_key
```

## Quick Fixes Checklist

- [ ] Verify `EXPO_PUBLIC_API_URL` matches backend URL
- [ ] Confirm backend is running (`uvicorn main:app --reload`)
- [ ] Check SANITY_API_TOKEN is valid and has write access
- [ ] Verify GROQ_API_KEY is correct
- [ ] Ensure Sanity dailyTask schema is deployed
- [ ] Check user is authenticated (Clerk)
- [ ] Look at console logs for exact error messages

## Network Request Example

### POST /api/tasks/generate-groq

**Request:**
```bash
curl -X POST http://localhost:8000/api/tasks/generate-groq \
  -H "Content-Type: application/json" \
  -d '{
    "clerkId": "user_clerk_id_here",
    "userHealthData": {
      "age": 45,
      "conditions": ["general"],
      "medications": [],
      "activityLevel": "moderate"
    }
  }'
```

**Expected Response (200):**
```json
{
  "tasks": [
    {
      "title": "Task 1",
      "description": "Description",
      "priority": "high",
      "category": "medication",
      "dueDate": "2024-02-04T10:00:00Z",
      "generatedByGroq": true,
      "isCompleted": false,
      "clerkId": "user_clerk_id_here"
    },
    ...
  ],
  "message": "Generated 3 personalized tasks using Groq AI"
}
```

## Feature Flow Chart

```
App Opens
  ↓
loadTasks() called
  ↓
Fetch from Sanity
  ↓
  ├─ Tasks Found → Display top 3 ✓
  │
  └─ No Tasks Found
      ↓
      tasksGeneratedToday = false?
      ↓
      YES → Call autoGenerateGroqTasks()
      │     ↓
      │     POST /api/tasks/generate-groq
      │     ↓
      │     Success → Save to Sanity
      │     ↓
      │     Re-fetch from Sanity
      │     ↓
      │     Display 3 generated tasks ✓
      │     
      │     ERROR → Show 3 default tasks ✓
      │
      NO → Do nothing (already generated once)
```
