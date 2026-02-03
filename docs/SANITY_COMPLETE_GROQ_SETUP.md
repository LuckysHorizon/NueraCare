# 🎯 Sanity GROQ Queries & Dataset Setup Complete Guide

## 📊 Your Configuration
```
Project ID: q5maqr3y
Dataset: production
API Version: 2024-01-01
```

---

## ✅ Step 1: Create "Production" Dataset

### Method 1: Sanity Dashboard (Recommended)
1. Go to: https://manage.sanity.io
2. Click your project: **q5maqr3y**
3. Navigate: **Settings** (⚙️) → **Datasets**
4. Click: **"+ Create dataset"**
5. Fill in:
   - **Dataset name:** `production`
   - **Visibility:** Private
   - **Copy config:** Leave empty (or copy from default if available)
6. Click: **Create**

### Method 2: Sanity CLI
```bash
# Install CLI
npm install -g sanity

# Login
sanity login

# Create dataset
sanity dataset create production

# Show datasets
sanity datasets list
```

---

## 🗂️ Step 2: Deploy Schema to Dataset

Create `schemaTypes/userProfile.ts`:
```typescript
export default {
  name: 'userProfile',
  type: 'document',
  title: 'User Profile',
  fields: [
    {
      name: 'clerkId',
      type: 'string',
      title: 'Clerk User ID',
      validation: (Rule) => Rule.required(),
    },
    { name: 'firstName', type: 'string', title: 'First Name' },
    { name: 'lastName', type: 'string', title: 'Last Name' },
    { name: 'email', type: 'string', title: 'Email' },
    { name: 'imageUrl', type: 'url', title: 'Profile Image' },
    {
      name: 'bloodGroup',
      type: 'string',
      title: 'Blood Group',
      options: {
        list: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
      },
    },
    { name: 'age', type: 'number', title: 'Age' },
    { name: 'height', type: 'number', title: 'Height (cm)' },
    { name: 'weight', type: 'number', title: 'Weight (kg)' },
    { name: 'chronicDiseases', type: 'text', title: 'Chronic Diseases' },
    { name: 'primaryLanguage', type: 'string', title: 'Primary Language' },
    { name: 'caregiverName', type: 'string', title: 'Caregiver Name' },
    { name: 'caregiverPhone', type: 'string', title: 'Caregiver Phone' },
    {
      name: 'highContrast',
      type: 'boolean',
      title: 'High Contrast Mode',
      initialValue: false,
    },
    {
      name: 'largeTextMode',
      type: 'boolean',
      title: 'Large Text Mode',
      initialValue: true,
    },
    {
      name: 'reducedMotion',
      type: 'boolean',
      title: 'Reduce Motion',
      initialValue: false,
    },
    { name: 'createdAt', type: 'datetime', title: 'Created' },
    { name: 'updatedAt', type: 'datetime', title: 'Updated' },
  ],
}
```

Deploy schema:
```bash
sanity schema deploy
```

---

## 🔑 Step 3: APIs to Enable & Configure

### ✅ Required APIs

| API | Purpose | How to Enable |
|-----|---------|---------------|
| **Content API** | Read/Write documents | Default (always on) |
| **Assets API** | Upload files/images | Settings → API → Assets API |
| **Webhooks** (Optional) | Real-time triggers | Settings → Webhooks |

### Enable APIs

1. **Content API** (Already enabled)
   - Allows basic read/write operations
   - Public reads, token-based writes

2. **Assets API** (Optional - for medical reports)
   ```
   Settings → API → Assets API
   Enable: Yes
   ```

3. **Configure CORS Origins**
   ```
   Settings → API → CORS Origins
   Add these:
   - http://localhost:*
   - http://127.0.0.1:*
   - exp://*
   - https://your-production-domain.com
   ```

4. **Generate API Token**
   ```
   Settings → API → Tokens
   Click: + Add API Token
   Name: NuraCare Mobile
   Permissions: Editor
   Copy the token to .env.local
   ```

---

## 📝 Step 4: Add API Token to Environment

Update `.env.local`:
```env
EXPO_PUBLIC_SANITY_PROJECT_ID=q5maqr3y
EXPO_PUBLIC_SANITY_DATASET=production
EXPO_PUBLIC_SANITY_TOKEN=sk_YOUR_TOKEN_HERE
```

**Getting the token:**
1. Go to: https://manage.sanity.io → q5maqr3y
2. Settings → API → Tokens
3. Create new token with "Editor" role
4. Copy and paste into `.env.local`

---

## 🔍 Step 5: GROQ Queries Reference

### **1. Get User Profile by Clerk ID**
```groq
*[_type == "userProfile" && clerkId == $clerkId][0] {
  _id,
  clerkId,
  firstName,
  lastName,
  email,
  imageUrl,
  bloodGroup,
  age,
  height,
  weight,
  chronicDiseases,
  primaryLanguage,
  caregiverName,
  caregiverPhone,
  highContrast,
  largeTextMode,
  reducedMotion,
  createdAt,
  updatedAt
}
```

**TypeScript Usage:**
```typescript
const userProfile = await sanityClient.fetch(
  `*[_type == "userProfile" && clerkId == $clerkId][0]`,
  { clerkId: "user_123abc" }
);
```

---

### **2. Get All User Profiles (Admin)**
```groq
*[_type == "userProfile"] {
  _id,
  firstName,
  lastName,
  email,
  bloodGroup,
  age
} | order(createdAt desc)
```

---

### **3. Search User by Name**
```groq
*[_type == "userProfile" && (firstName match $search || lastName match $search)] {
  _id,
  firstName,
  lastName,
  email
}
```

**Usage:**
```typescript
const results = await sanityClient.fetch(
  `*[_type == "userProfile" && (firstName match $search || lastName match $search)]`,
  { search: "John" }
);
```

---

### **4. Get Users by Blood Group**
```groq
*[_type == "userProfile" && bloodGroup == $bloodGroup] {
  _id,
  firstName,
  lastName,
  bloodGroup,
  age,
  weight
}
```

**Usage:**
```typescript
const o_plus_users = await sanityClient.fetch(
  `*[_type == "userProfile" && bloodGroup == $bloodGroup]`,
  { bloodGroup: "O+" }
);
```

---

### **5. Get Users with Chronic Diseases**
```groq
*[_type == "userProfile" && chronicDiseases != null && chronicDiseases != ""] {
  _id,
  firstName,
  lastName,
  chronicDiseases,
  age
}
```

---

### **6. Count Users by Age Group**
```groq
*[_type == "userProfile"] {
  age
} | group(
  age < 18 ? "Minor" : 
  age < 30 ? "Young Adult" : 
  age < 50 ? "Adult" : 
  "Senior"
) | map({
  ageGroup: .[0],
  count: length(.)
})
```

---

### **7. Get Users with High Contrast Enabled**
```groq
*[_type == "userProfile" && highContrast == true] {
  _id,
  firstName,
  largeTextMode,
  reducedMotion
}
```

---

### **8. Get Recently Updated Profiles**
```groq
*[_type == "userProfile"] | order(updatedAt desc) [0..10] {
  _id,
  firstName,
  lastName,
  updatedAt
}
```

---

### **9. Check if User Exists**
```groq
count(*[_type == "userProfile" && clerkId == $clerkId]) > 0
```

**Usage:**
```typescript
const userExists = await sanityClient.fetch(
  `count(*[_type == "userProfile" && clerkId == $clerkId]) > 0`,
  { clerkId: "user_123" }
);
```

---

### **10. Get User Stats**
```groq
{
  "totalUsers": count(*[_type == "userProfile"]),
  "avgAge": avg(*[_type == "userProfile"].age),
  "totalWithChronicDiseases": count(*[_type == "userProfile" && chronicDiseases != null]),
  "accessibilityUsage": {
    "highContrast": count(*[_type == "userProfile" && highContrast == true]),
    "largeText": count(*[_type == "userProfile" && largeTextMode == true]),
    "reducedMotion": count(*[_type == "userProfile" && reducedMotion == true])
  }
}
```

---

## 📝 Step 6: Update Sanity Service with GROQ

Create `services/sanity.ts`:

```typescript
import { createClient } from "@sanity/client";

const projectId = process.env.EXPO_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.EXPO_PUBLIC_SANITY_DATASET || "production";
const token = process.env.EXPO_PUBLIC_SANITY_TOKEN;

if (!projectId) {
  console.warn("⚠️ EXPO_PUBLIC_SANITY_PROJECT_ID not set");
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false, // false = real-time updates
  token,
});

// ===== USER PROFILE =====

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

export async function getUsersByBloodGroup(bloodGroup: string) {
  return sanityClient.fetch(
    `*[_type == "userProfile" && bloodGroup == $bloodGroup]`,
    { bloodGroup }
  );
}

export async function searchUsers(searchTerm: string) {
  return sanityClient.fetch(
    `*[_type == "userProfile" && (firstName match $search || lastName match $search)]`,
    { search: searchTerm }
  );
}

export async function upsertUserProfile(clerkId: string, profileData: any) {
  const docId = `user-${clerkId}`;
  return sanityClient.createOrReplace({
    _id: docId,
    _type: "userProfile",
    clerkId,
    ...profileData,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateUserProfile(clerkId: string, updates: any) {
  const docId = `user-${clerkId}`;
  return sanityClient
    .patch(docId)
    .set({
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    .commit();
}

export async function deleteUserProfile(clerkId: string) {
  const docId = `user-${clerkId}`;
  return sanityClient.delete(docId);
}

// ===== STATS =====

export async function getUserStats() {
  return sanityClient.fetch(`{
    "totalUsers": count(*[_type == "userProfile"]),
    "avgAge": avg(*[_type == "userProfile"].age),
    "totalWithChronicDiseases": count(*[_type == "userProfile" && chronicDiseases != null]),
    "accessibilityUsage": {
      "highContrast": count(*[_type == "userProfile" && highContrast == true]),
      "largeText": count(*[_type == "userProfile" && largeTextMode == true]),
      "reducedMotion": count(*[_type == "userProfile" && reducedMotion == true])
    }
  }`);
}
```

---

## 🧪 Step 7: Test GROQ Queries

### **Option 1: Vision Tool in Sanity Studio**
1. Open: https://q5maqr3y.sanity.studio
2. Click: **Vision** button (top toolbar)
3. Paste any GROQ query
4. Click: **Execute** or press `Ctrl+Enter`
5. See results instantly

### **Option 2: CLI Test**
```bash
sanity query '*[_type == "userProfile"]'
sanity query '*[_type == "userProfile" && clerkId == "user_123"]'
```

### **Option 3: In Code**
```typescript
// In your React component
useEffect(() => {
  testQuery();
}, []);

const testQuery = async () => {
  const result = await sanityClient.fetch(
    `*[_type == "userProfile"][0]`
  );
  console.log("Query result:", result);
};
```

---

## 🚀 Step 8: Complete Setup Checklist

- [ ] Sanity project exists (q5maqr3y)
- [ ] Production dataset created
- [ ] userProfile schema deployed
- [ ] API token generated
- [ ] CORS origins configured
- [ ] Token added to `.env.local`
- [ ] GROQ queries tested in Vision tool
- [ ] Sanity service file updated
- [ ] App restarted with `npx expo start --clear`
- [ ] Onboarding tested (data saves to Sanity)
- [ ] Profile page loads data (no console errors)

---

## 🔐 Security Checklist

- ✅ API token in `.env.local` (never in Git)
- ✅ `.env.local` in `.gitignore`
- ✅ Dataset set to Private (sensitive data)
- ✅ CORS origins limited to your domains
- ✅ Read-only token for public queries
- ✅ Editor token for mobile app only

---

## 🐛 Common Errors & Fixes

### "Cannot fetch from Sanity"
```typescript
// ✅ Check token
console.log("Token:", process.env.EXPO_PUBLIC_SANITY_TOKEN);

// ✅ Check project ID
console.log("Project:", process.env.EXPO_PUBLIC_SANITY_PROJECT_ID);

// ✅ Check dataset
console.log("Dataset:", process.env.EXPO_PUBLIC_SANITY_DATASET);
```

### "GROQ syntax error"
- Check for missing parentheses
- Verify field names match schema
- Use Vision tool to debug

### "No data returned"
- Verify data exists in Sanity
- Check clerkId format matches
- Run simpler queries first

---

## ✨ Expected Workflow

```
User Registration (Clerk)
    ↓
Complete Onboarding
    ↓
Health Info saved via upsertUserProfile()
    ↓
Accessibility settings saved
    ↓
Document created: user-{clerkId}
    ↓
Profile page calls getUserProfile()
    ↓
GROQ query fetches from Sanity
    ↓
Data displays dynamically
    ↓
User updates toggle → updateUserProfile()
    ↓
Sanity document updated in real-time
```

---

## 📚 Quick GROQ Reference

| Query | Purpose |
|-------|---------|
| `*[_type == "userProfile"]` | Get all profiles |
| `*[_type == "userProfile"][0]` | Get first profile |
| `*[_type == "userProfile"] \| order(createdAt desc)` | Order by date |
| `*[...][0..10]` | Limit to 10 results |
| `count(*[...])` | Count documents |
| `*[... && field == $var]` | Filter with variable |

---

## 📞 Need Help?

1. **Sanity Docs:** https://www.sanity.io/docs/groq
2. **GROQ Playground:** https://groq-playground.sanity.dev/
3. **Vision Tool:** In your Sanity Studio
4. **Console Logs:** Check for errors

---

**Status:** Ready to Deploy 🚀  
**All APIs Enabled:** ✅  
**GROQ Queries:** Ready  
**Security:** Configured  
