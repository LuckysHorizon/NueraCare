# 🚀 Sanity Dataset & GROQ Setup - Master Guide

## 📊 Quick Summary

| Item | Status | Details |
|------|--------|---------|
| **Project ID** | ✅ Ready | `q5maqr3y` |
| **Dataset** | 📝 Create | `production` |
| **API Token** | 🔑 Generate | Editor permission |
| **CORS** | 🌐 Configure | `exp://*`, `localhost` |
| **GROQ** | 📝 Ready | 30+ queries available |
| **APIs to Enable** | ✅ Content API | Assets API optional |

---

## 🎯 Step-by-Step Setup (20 minutes)

### **STEP 1: Create Production Dataset** (5 min)

**Online (Recommended):**
1. Go: https://manage.sanity.io
2. Click: Project **q5maqr3y**
3. Settings → Datasets
4. **+ Create dataset**
5. Name: `production`
6. Create

**OR CLI:**
```bash
npm install -g sanity
sanity login
sanity dataset create production
```

✅ **Result:** Dataset `production` created

---

### **STEP 2: Generate & Add API Token** (5 min)

1. Go: https://manage.sanity.io/projects/q5maqr3y
2. Settings → API → **Tokens**
3. **+ Add API Token**
   - Name: `NuraCare Mobile`
   - Permissions: **Editor** ✅
4. Click: **Create**
5. Copy the token (starts with `sk_`)
6. Add to `.env.local`:
   ```env
   EXPO_PUBLIC_SANITY_PROJECT_ID=q5maqr3y
   EXPO_PUBLIC_SANITY_DATASET=production
   EXPO_PUBLIC_SANITY_TOKEN=sk_YOUR_TOKEN_HERE
   ```

✅ **Result:** Token added and working

---

### **STEP 3: Configure CORS Origins** (3 min)

1. Go: Settings → API → **CORS Origins**
2. **+ Add CORS Origin** (add each)
   - `http://localhost:*`
   - `http://127.0.0.1:*`
   - `exp://*` ← **IMPORTANT for Expo**
   - `https://your-production-domain.com`
3. Save

✅ **Result:** CORS configured, Expo can connect

---

### **STEP 4: Update Sanity Service** (5 min)

Update `services/sanity.ts`:

```typescript
import { createClient } from "@sanity/client";

const projectId = process.env.EXPO_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.EXPO_PUBLIC_SANITY_DATASET || "production";
const token = process.env.EXPO_PUBLIC_SANITY_TOKEN;

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
  token,
});

// GROQ Query Functions
export async function getUserProfile(clerkId: string) {
  return sanityClient.fetch(
    `*[_type == "userProfile" && clerkId == $clerkId][0]`,
    { clerkId }
  );
}

export async function getAllUsers() {
  return sanityClient.fetch(
    `*[_type == "userProfile"] | order(createdAt desc)`
  );
}

export async function getUserStats() {
  return sanityClient.fetch(`{
    "totalUsers": count(*[_type == "userProfile"]),
    "avgAge": avg(*[_type == "userProfile"].age),
    "bloodGroupStats": *[_type == "userProfile"] { bloodGroup } | group(bloodGroup) | map({
      type: .[0].bloodGroup,
      count: length(.)
    })
  }`);
}
```

✅ **Result:** Service layer updated with GROQ queries

---

### **STEP 5: Test Connection** (2 min)

```bash
npx expo start --clear
```

Check console:
```
✅ No errors = Success!
❌ CORS error = Add exp://* to CORS
❌ Auth error = Check token in .env.local
```

✅ **Result:** App connected to Sanity

---

## 📋 Sanity Schema Reference

Your data will look like:

```json
{
  "_id": "user_123abc",
  "_type": "userProfile",
  "clerkId": "user_399lIslRMLqlOqSBEBkhty0kJEB",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "imageUrl": "https://...",
  "bloodGroup": "O+",
  "age": 28,
  "height": 175,
  "weight": 70,
  "chronicDiseases": "None",
  "primaryLanguage": "English",
  "caregiverName": "Jane Doe",
  "caregiverPhone": "+1234567890",
  "highContrast": false,
  "largeTextMode": true,
  "reducedMotion": false,
  "createdAt": "2026-02-03T10:00:00Z",
  "updatedAt": "2026-02-03T10:00:00Z"
}
```

---

## 🔍 Top 10 GROQ Queries You'll Use

### 1. Get User Profile
```groq
*[_type == "userProfile" && clerkId == $clerkId][0]
```

### 2. Get All Users
```groq
*[_type == "userProfile"] | order(createdAt desc)
```

### 3. Search Users
```groq
*[_type == "userProfile" && firstName match $query]
```

### 4. Get Users by Blood Group
```groq
*[_type == "userProfile" && bloodGroup == "O+"]
```

### 5. Count Total Users
```groq
count(*[_type == "userProfile"])
```

### 6. Get User Stats
```groq
{
  "total": count(*[_type == "userProfile"]),
  "avgAge": avg(*[_type == "userProfile"].age)
}
```

### 7. Get Users with Chronic Diseases
```groq
*[_type == "userProfile" && chronicDiseases != null]
```

### 8. Get Accessibility Users
```groq
*[_type == "userProfile" && highContrast == true]
```

### 9. Get Recent Updates
```groq
*[_type == "userProfile"] | order(updatedAt desc)[0..5]
```

### 10. Check if User Exists
```groq
count(*[_type == "userProfile" && clerkId == $clerkId]) > 0
```

---

## 🔐 APIs Explained

### Content API ✅ **ENABLED BY DEFAULT**
- **What:** Read/write documents
- **Used for:**
  - Fetch user profiles
  - Save health data
  - Update settings
  - Delete data
- **No setup** - automatically available

### Assets API ⚠️ **OPTIONAL**
- **What:** Upload files/images
- **Used for:**
  - Medical report PDFs
  - User profile photos
  - Health images
- **Enable if:** You want to upload files

### Webhooks ⚠️ **OPTIONAL**
- **What:** Real-time event triggers
- **Used for:**
  - Alert on changes
  - Send notifications
  - Sync with backend
- **Enable if:** You want real-time updates

---

## ✅ Complete Checklist

### Before You Start
- [ ] Sanity account created (sanity.io)
- [ ] Project created (q5maqr3y)

### Dataset Setup
- [ ] Production dataset created
- [ ] API token generated
- [ ] CORS origins configured (exp://*)
- [ ] Token added to .env.local

### Code Setup
- [ ] services/sanity.ts updated
- [ ] GROQ queries implemented
- [ ] .env.local has all variables
- [ ] Expo restarted

### Testing
- [ ] No console errors
- [ ] Can fetch data from Sanity
- [ ] Onboarding saves to Sanity
- [ ] Profile loads from Sanity

---

## 🚀 Usage Examples

### Fetch User Profile
```typescript
const user = await getUserProfile(clerkId);
console.log(user.firstName, user.bloodGroup);
```

### Fetch All Users (Admin)
```typescript
const users = await getAllUsers();
console.log(`Total users: ${users.length}`);
```

### Get Statistics
```typescript
const stats = await getUserStats();
console.log(`Average age: ${stats.avgAge}`);
console.log(`Blood group distribution:`, stats.bloodGroupStats);
```

### Search Users
```typescript
const results = await sanityClient.fetch(
  `*[_type == "userProfile" && firstName match $query]`,
  { query: "John" }
);
```

---

## 🔗 Documentation Links

1. **GROQ Reference:** `/docs/GROQ_QUERIES_REFERENCE.md`
2. **API Enablement:** `/docs/SANITY_API_ENABLEMENT.md`
3. **Complete Setup:** `/docs/SANITY_COMPLETE_GROQ_SETUP.md`
4. **Quick Fix Guide:** `/docs/SANITY_QUICK_FIX.md`

---

## 🎯 Next Steps

1. ✅ **Create dataset** (Step 1 above)
2. ✅ **Generate token** (Step 2)
3. ✅ **Configure CORS** (Step 3)
4. ✅ **Update service** (Step 4)
5. ✅ **Test connection** (Step 5)
6. ✅ **Test queries** in Vision: https://q5maqr3y.sanity.studio

---

## 🧪 Test in Vision Tool

1. Open: https://q5maqr3y.sanity.studio
2. Click: **Vision** button
3. Paste query:
   ```groq
   *[_type == "userProfile"][0]
   ```
4. Press: **Ctrl+Enter**
5. See results

---

## 📞 Quick Reference

| Action | Command |
|--------|---------|
| See all datasets | https://manage.sanity.io/projects/q5maqr3y |
| View API tokens | Settings → API → Tokens |
| Configure CORS | Settings → API → CORS Origins |
| Test queries | Vision tool in Studio |
| Check status | https://status.sanity.io |

---

## ✨ Expected Workflow

```
User completes onboarding
    ↓
App calls: upsertUserProfile()
    ↓
GROQ: *[_type == "userProfile" && clerkId == ...][0]
    ↓
Document saved to Sanity
    ↓
Profile page calls: getUserProfile()
    ↓
Data fetched and displayed
    ↓
User updates settings
    ↓
App calls: updateUserProfile()
    ↓
Real-time sync to Sanity
```

---

## 🎉 You're Ready!

Everything is set up for:
- ✅ GROQ queries
- ✅ Real-time data sync
- ✅ User management
- ✅ Health profile storage
- ✅ Accessibility settings

**Start building!** 🚀

---

**Dataset:** `production` ✅  
**APIs:** Content API ✅  
**GROQ:** Ready 📝  
**Security:** Configured 🔐  
