# 🔧 NueraCare Sanity Setup - Quick Fix Guide

## Current Error
```
[Error: `projectId` can only contain only a-z, 0-9 and dashes]
```

This means your `EXPO_PUBLIC_SANITY_PROJECT_ID` has invalid characters.

---

## ✅ Step 1: Verify Your Sanity Project ID Format

Your projectId should:
- ✅ Only contain **lowercase letters (a-z)**
- ✅ Only contain **numbers (0-9)**
- ✅ Only contain **dashes (-)**
- ❌ NOT contain underscores (_)
- ❌ NOT contain uppercase letters
- ❌ NOT contain spaces or special characters

### Examples

**Valid Project IDs:**
```
abc123def456
my-project-id
nura-care-project
proj-2026-01
```

**Invalid Project IDs (will fail):**
```
My_Project_ID  ❌ (underscores + uppercase)
nura-care_app  ❌ (contains underscore)
NuraCAre       ❌ (contains uppercase)
nura.care      ❌ (contains period)
my project id  ❌ (contains spaces)
```

---

## ✅ Step 2: Get Your Real Sanity Project ID

1. Go to **https://manage.sanity.io**
2. Log in with your Sanity account
3. Select your project (e.g., "NuraCare")
4. In project settings, find your **Project ID**
5. **COPY THE EXACT VALUE** (it's usually lowercase-with-dashes format)

Example from Sanity Dashboard:
```
Project ID: abc123def456xyz789
```

---

## ✅ Step 3: Update Your .env.local

1. Open `nueracare-expo-app/.env.local`
2. Replace the projectId with your ACTUAL value:

```env
# BEFORE (placeholder):
EXPO_PUBLIC_SANITY_PROJECT_ID=your_project_id_here

# AFTER (your real value):
EXPO_PUBLIC_SANITY_PROJECT_ID=abc123def456xyz789
```

3. Make sure `EXPO_PUBLIC_SANITY_DATASET=production`
4. Make sure `EXPO_PUBLIC_SANITY_TOKEN=your_token_here`

---

## ✅ Step 4: Restart Expo

```bash
cd nueracare-expo-app
npx expo start --clear
```

---

## ✅ Step 5: Verify Setup Works

Look for this log in Expo Terminal:
```
LOG  Auth state: {"email": "...", "isLoaded": true, ...}
✅ If you see profile data loading = SUCCESS
```

Look for errors like:
```
ERROR  [Error: `projectId` can only contain...
❌ Still has invalid characters
```

---

## 🆘 Still Getting Errors?

### Troubleshooting

**1. "projectId is undefined"**
- Your `.env.local` file is missing
- Create it with the template: `.env.local.example`
- Restart Expo

**2. "Cannot find module or projectId still invalid"**
- Clear Expo cache: `npx expo start --clear`
- Delete `node_modules` and reinstall: `npm install`
- Restart expo CLI

**3. "Sanity fetch failed"**
- Verify your API token is correct
- Check CORS settings in Sanity Studio:
  - Settings → API → CORS Origins
  - Add: `http://localhost:*` and `exp://*`

**4. "Profile shows empty/undefined"**
- Go through onboarding first (Welcome → Health Info → Accessibility)
- This creates your user profile in Sanity
- Then check Profile page

---

## 📋 Checklist

- [ ] Sanity project created at https://manage.sanity.io
- [ ] Project ID copied (lowercase, numbers, dashes only)
- [ ] `.env.local` file created with correct projectId
- [ ] API token generated in Sanity → Settings → API
- [ ] Token added to `.env.local`
- [ ] Expo restarted with `npx expo start --clear`
- [ ] No "projectId" error in Expo logs
- [ ] Can view profile page without crashes

---

## 🎯 Expected Behavior After Setup

1. **App starts** → Clerk auth loads
2. **If not logged in** → Login screen
3. **If logged in but no profile** → Onboarding flow starts
4. **Complete onboarding** → Health data saves to Sanity
5. **Navigate to Profile tab** → Shows your health data
6. **Toggle accessibility** → Updates save instantly to Sanity
7. **Click logout** → Clear session + back to login

---

## 📝 Notes

- Your projectId is NOT your workspace ID
- Your projectId is NOT your dataset name
- It's found in: **Project Settings → Project ID**
- Keep your API token private (never commit `.env.local`)
- The format MUST be all lowercase with dashes

