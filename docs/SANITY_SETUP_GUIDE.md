# Sanity CMS Integration Setup Guide

## Overview
NueraCare now uses **Sanity CMS** as the database for managing user health profiles, medical reports, and app data. This guide walks you through the setup process.

---

## 🚀 Quick Start

### 1. **Create a Sanity Project**

If you don't have a Sanity account:
- Visit [https://www.sanity.io](https://www.sanity.io)
- Sign up for a free account
- Create a new project

### 2. **Get Your Credentials**

Once your project is created:
1. Go to **Settings > API**
2. Copy your **Project ID** and **Dataset name** (usually "production")
3. Go to **Settings > Tokens**
4. Create a new API token with "Editor" permissions
5. Copy the token

### 3. **Add Environment Variables**

Create a `.env.local` file in `nueracare-expo-app/` with:

```env
EXPO_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
EXPO_PUBLIC_SANITY_DATASET=production

```

> ⚠️ Never commit `.env.local` to version control. Add it to `.gitignore`.

### 4. **Verify Configuration**

Restart your Expo app:
```bash
npx expo start --clear
```

---

## 📋 Sanity Schema Setup

The app uses the following Sanity document type:

### **userProfile Document**

```groq
{
  _id: "user-{clerkId}",
  _type: "userProfile",
  clerkId: "string",
  firstName: "string",
  lastName: "string", 
  email: "string",
  imageUrl: "string",
  
  // Health Data
  bloodGroup: "string",
  age: "number",
  height: "number", // cm
  weight: "number", // kg
  chronicDiseases: "string",
  primaryLanguage: "string",
  
  // Caregiver Info
  caregiverName: "string",
  caregiverPhone: "string",
  
  // Accessibility Settings
  highContrast: "boolean",
  largeTextMode: "boolean",
  reducedMotion: "boolean",
  
  // Metadata
  createdAt: "datetime",
  updatedAt: "datetime"
}
```

---

## 🔄 Data Flow

### **Onboarding Flow**
```
Welcome Screen
    ↓
Health Info Screen (Collect: blood group, age, height, weight, chronic diseases)
    ↓
Accessibility Screen (Collect: high contrast, large text, reduced motion)
    ↓
Complete Screen
    ↓
Save to Sanity (upsertUserProfile)
```

### **Profile Page**
```
Load Profile (useEffect on component mount)
    ↓
Fetch from Sanity (getUserProfile)
    ↓
Display all health data dynamically
    ↓
Allow updates (updateUserProfile)
    ↓
Save changes back to Sanity
```

### **Logout**
```
Click "Log Out" button
    ↓
Clear Clerk session (signOut)
    ↓
Navigate to login screen
```

---

## 🛠️ Available Functions

All Sanity operations are in `services/sanity.ts`:

### **1. Upsert User Profile** (Create or Update)
```typescript
await upsertUserProfile(clerkId, {
  firstName: "John",
  bloodGroup: "O+",
  age: 28,
  height: 175,
  weight: 70,
  chronicDiseases: "None",
  highContrast: false,
  largeTextMode: true,
});
```

### **2. Get User Profile**
```typescript
const profile = await getUserProfile(clerkId);
// Returns UserHealthProfile object or null
```

### **3. Update Specific Fields**
```typescript
await updateUserProfile(clerkId, {
  highContrast: true,
  weight: 72,
});
```

### **4. Delete User Profile**
```typescript
await deleteUserProfile(clerkId);
```

---

## 📱 Components Updated

### **`app/(tabs)/profile.tsx`** (Fully Dynamic)
- ✅ Loads user data from Sanity
- ✅ Shows loading state while fetching
- ✅ Functional logout button
- ✅ Updates accessibility settings in real-time
- ✅ Displays all health metrics from database

### **`app/(onboarding)/welcome.tsx`** (Redesigned)
- ✅ Glassmorphism cards
- ✅ Lucide-react-native icons
- ✅ Gradient background

### **`app/(onboarding)/health-info.tsx`** (Redesigned & Connected)
- ✅ Saves to Sanity on continue
- ✅ Glassmorphism input fields
- ✅ Icon-based form labels
- ✅ Fetches Clerk user data automatically
- ✅ Skip option (no data loss)

---

## 🔐 Security Notes

1. **API Token**: Store in `.env.local` only (never in Git)
2. **Read-Only Tokens**: For public queries, use read-only tokens
3. **CORS**: Configure Sanity project CORS settings to allow your app domain
4. **Data Privacy**: User health data is sensitive - implement field-level access control

### **Update Sanity CORS** (if needed)
In Sanity Studio Settings:
```
Settings → API → CORS Origins
Add: http://localhost:19006 (Expo)
Add: Your production domain
```

---

## 🧪 Testing the Integration

### **Test 1: Create User Profile**
1. Run the app
2. Go through onboarding (welcome → health-info → accessibility → complete)
3. Check Sanity Studio for the new user document

### **Test 2: Load Profile**
1. Navigate to Profile tab
2. Verify all health data displays correctly
3. Check console for no errors

### **Test 3: Update Accessibility**
1. Toggle "High Contrast" switch
2. Check console for update confirmation
3. Verify Sanity Studio shows updated data

### **Test 4: Logout**
1. Click "Log Out" button
2. Should navigate to login screen
3. Clerk session should be cleared

---

## 🐛 Troubleshooting

### **Error: "Cannot find module '@sanity/client'"**
```bash
npm install @sanity/client --legacy-peer-deps
```

### **Error: "EXPO_PUBLIC_SANITY_PROJECT_ID is undefined"**
1. Create `.env.local` in project root
2. Add your Sanity credentials
3. Restart Expo: `npx expo start --clear`

### **Error: "Sanity fetch failed"**
1. Verify Internet connection
2. Check Sanity project status at [https://manage.sanity.io](https://manage.sanity.io)
3. Verify API token is valid (not expired)
4. Check CORS settings in Sanity Studio

### **Profile shows "—" for all fields**
1. Make sure onboarding saved data to Sanity
2. Check Sanity Studio for user document
3. Verify Clerk ID matches between app and Sanity

---

## 📚 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_SANITY_PROJECT_ID` | Your Sanity project ID | `abc12def` |
| `EXPO_PUBLIC_SANITY_DATASET` | Sanity dataset name | `production` |
| `EXPO_PUBLIC_SANITY_TOKEN` | API token for authenticated requests | `skXXXXXXX` |

---

## 🚀 Next Steps

1. ✅ Set up Sanity project
2. ✅ Add environment variables
3. ✅ Test onboarding flow
4. ✅ Test profile data loading
5. ⏳ Add medical report storage
6. ⏳ Create report query functionality
7. ⏳ Implement caregiver management
8. ⏳ Add health analytics

---

## 📖 Useful Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [Sanity API Reference](https://www.sanity.io/docs/api-reference)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Clerk Documentation](https://clerk.com/docs)

---

## ✨ Features Implemented

✅ **Dynamic User Profiles** - All data from Sanity, no hardcoding
✅ **Functional Logout** - Uses Clerk signOut with navigation
✅ **Redesigned Onboarding** - Glassmorphism cards with icons
✅ **Real-time Updates** - Accessibility settings sync to Sanity
✅ **Loading States** - Smooth UX while fetching data
✅ **Error Handling** - Console logs for debugging
✅ **Type Safety** - Full TypeScript integration

---

## 📞 Support

For issues:
1. Check the console logs (`npx expo start`)
2. Verify Sanity credentials in `.env.local`
3. Check Sanity Studio for data existence
4. Review the troubleshooting section above
