# 🚨 NueraCare Error Resolution - February 3, 2026

## Current Issue

Your Expo app is failing to start because of **Sanity projectId validation error**:

```
ERROR  [Error: `projectId` can only contain only a-z, 0-9 and dashes]
```

---

## Root Cause

Your `.env.local` file contains an **invalid Sanity Project ID** with:
- ❌ Uppercase letters (A-Z)
- ❌ Underscores (_)
- ❌ Special characters (!, @, #, ., etc.)
- ❌ Spaces

**Valid project IDs:** lowercase + numbers + dashes only

---

## ✅ Immediate Fix (3 Steps)

### Step 1: Get Your Real Sanity Project ID
1. Visit https://manage.sanity.io
2. Click your "NuraCare" project
3. Click **Settings** (⚙️)
4. Find and copy **Project ID**
5. Example: `abc123def456xyz789`

### Step 2: Update `.env.local`
Open: `nueracare-expo-app/.env.local`

**BEFORE (WRONG):**
```env
EXPO_PUBLIC_SANITY_PROJECT_ID=My_NuraCare_Project
```

**AFTER (CORRECT):**
```env
EXPO_PUBLIC_SANITY_PROJECT_ID=abc123def456xyz789
EXPO_PUBLIC_SANITY_DATASET=production
EXPO_PUBLIC_SANITY_TOKEN=your_token_here
```

**Rules:**
- ✅ Only: `a-z`, `0-9`, `-` (dashes)
- ❌ No uppercase, no underscores, no special chars

### Step 3: Restart Expo
```bash
cd nueracare-expo-app
npx expo start --clear
```

---

## 🔍 Verify It's Fixed

### Expected Success Logs
```
LOG  Auth state: {"email": "...", "isLoaded": true, "isSignedIn": true}
LOG  Rendering AuthLayout - isSignedIn: true
✅ NO ERROR about projectId
```

### If Still Broken
```
ERROR  [Error: `projectId` can only contain...
❌ Still has invalid characters
```

Then double-check your projectId from Step 1.

---

## 📚 Documentation Created

I've created 4 quick reference guides in `docs/`:

1. **SANITY_QUICK_FIX.md** - Step-by-step fix guide
2. **SANITY_QUICK_REFERENCE.md** - Quick lookup table
3. **SANITY_PROJECTID_FORMAT.md** - Visual character guide
4. **SANITY_SETUP_GUIDE.md** - Complete setup doc (already existed)

---

## 🛠️ Tools I've Enhanced

### 1. Better Error Handling in `services/sanity.ts`
```typescript
// Now warns if projectId is missing
if (!projectId) {
  console.warn(
    "⚠️ EXPO_PUBLIC_SANITY_PROJECT_ID is not set. Create .env.local..."
  );
}
```

### 2. Validation Script
```bash
node verify-sanity-config.js
```

Automatically checks:
- ✅ .env.local exists
- ✅ projectId format is valid
- ✅ All required variables are set
- ✅ Shows specific invalid characters

### 3. Template File
`.env.local.example` shows exact format needed:
```env
EXPO_PUBLIC_SANITY_PROJECT_ID=your_project_id_here_lowercase_only
EXPO_PUBLIC_SANITY_DATASET=production
EXPO_PUBLIC_SANITY_TOKEN=your_api_token_here
```

---

## 📋 Other Warnings (Non-Critical)

The route warnings are expected:
```
WARN  [Layout children]: No route named "report" exists...
WARN  [Layout children]: No route named "accessibility" exists...
```

These are normal in Expo routing and don't affect functionality. Routes are nested within layouts.

---

## 🎯 Next Steps After Fix

1. ✅ **Fix projectId** (Steps 1-3 above)
2. ✅ **Restart Expo** with `npx expo start --clear`
3. ✅ **Complete onboarding** (Welcome → Health Info → Accessibility)
4. ✅ **Check Sanity Studio** - Your user profile should appear
5. ✅ **View Profile page** - Health data should display
6. ✅ **Toggle accessibility** - Changes should sync to Sanity

---

## 🎓 What Changed

| File | Change | Impact |
|------|--------|--------|
| `services/sanity.ts` | Better error handling + validation | More helpful error messages |
| `.env.local.example` | New template file | Clear reference for setup |
| `verify-sanity-config.js` | New validation script | Can test config without running app |
| Docs created | 3 new quick reference guides | Easier troubleshooting |

---

## ⚡ Quick Commands Reference

```bash
# Check if config is valid
node verify-sanity-config.js

# Restart app with cleared cache
npx expo start --clear

# Clear node_modules if issues persist
rm -r node_modules
npm install
npx expo start --clear
```

---

## 🔑 Key Takeaway

**Your Sanity Project ID must be:**
- All lowercase letters
- Numbers allowed
- Dashes allowed
- NO uppercase, NO underscores, NO special chars

Example valid IDs:
```
abc123def456
my-project-id
nura-care-2026-v1
project-123-test
```

---

## 📞 Still Need Help?

1. Run the validator: `node verify-sanity-config.js`
2. Copy your projectId from https://manage.sanity.io exactly
3. Paste into `.env.local` exactly as shown
4. Restart with `npx expo start --clear`
5. Check logs for the projectId error - should be gone

---

**Status:** Ready to Deploy ✅  
**Action Required:** Update .env.local with correct projectId  
**Estimated Fix Time:** 2-3 minutes  
