# 🚀 SANITY SETUP - QUICK REFERENCE

## ⚡ 3-Step Fix

### 1️⃣ Get Your Sanity Project ID
- Visit: https://manage.sanity.io
- Select your project
- Copy Project ID (must be lowercase-with-dashes)

### 2️⃣ Update `.env.local`
```env
EXPO_PUBLIC_SANITY_PROJECT_ID=abc123def456
EXPO_PUBLIC_SANITY_DATASET=production
EXPO_PUBLIC_SANITY_TOKEN=your_token_here
```

### 3️⃣ Restart Expo
```bash
npx expo start --clear
```

---

## ✅ Validation Checklist

| Check | Example | Status |
|-------|---------|--------|
| **Project ID Format** | `abc123def456` | Must be lowercase + numbers + dashes only |
| **Dataset Name** | `production` | Usually "production" |
| **API Token** | `sk_...` | Get from Sanity Settings → API |
| **File Location** | `nueracare-expo-app/.env.local` | Root of expo app folder |
| **Restart Expo** | `npx expo start --clear` | Must restart after env changes |

---

## ❌ Common Errors & Fixes

### Error: "projectId can only contain a-z, 0-9, dashes"
**Cause:** Invalid characters in project ID  
**Fix:** Use only lowercase letters, numbers, dashes
```
❌ My_Project, nura-CARE, my.project
✅ my-project, nura-care-2026, proj123
```

### Error: "Cannot find EXPO_PUBLIC_SANITY_PROJECT_ID"
**Cause:** .env.local missing  
**Fix:** Create `.env.local` with your credentials

### Error: "Sanity fetch failed"
**Cause:** Wrong token or API issue  
**Fix:** 
1. Verify token in Sanity → Settings → API
2. Check CORS: Settings → API → CORS Origins
3. Add: `http://localhost:*` and `exp://*`

---

## 📱 Testing Sanity Integration

### ✅ Onboarding Flow
1. Login with Clerk
2. Welcome → Health Info → Accessibility → Complete
3. Fill in health data (blood group, age, height, weight)
4. Check Sanity Studio: User document appears with ID `user-{clerkId}`

### ✅ Profile Page
1. Navigate to Profile tab
2. Verify health data displays (not empty/undefined)
3. Toggle "High Contrast" 
4. Check Sanity: Document updates in real-time

### ✅ Logout
1. Click "Log Out" button
2. Verify redirect to login screen
3. Check session is cleared

---

## 🔧 Verification Script

Run to validate your config:
```bash
node verify-sanity-config.js
```

Output:
```
✅ Configuration is valid!
```

---

## 📞 Still Having Issues?

1. **Clear everything:**
   ```bash
   npx expo start --clear
   npm install
   ```

2. **Check logs:**
   - Look for "ERROR  [Error:" in Expo terminal
   - Check projectId error specifically

3. **Verify in Sanity Studio:**
   - Did you create a user profile during onboarding?
   - Does document ID start with `user-`?

4. **Test network:**
   - Can you access https://manage.sanity.io?
   - Is Sanity API working?

---

## 📝 Environment Variables

```env
# REQUIRED - Get from Sanity Dashboard
EXPO_PUBLIC_SANITY_PROJECT_ID=your-project-id

# REQUIRED - Usually "production"
EXPO_PUBLIC_SANITY_DATASET=production

# REQUIRED - Get from Sanity Settings → API
EXPO_PUBLIC_SANITY_TOKEN=sk_...

# ALREADY SET - From Clerk
# EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## ✨ Expected Data Flow

```
Onboarding Input
    ↓
[upsertUserProfile] → Sanity Database
    ↓
Profile Page [getUserProfile] → Display Data
    ↓
Toggle Accessibility → [updateUserProfile] → Sanity
```

---

**Status: Ready to Deploy** ✅
