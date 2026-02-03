# 🎯 Sanity Project ID - Visual Guide

## The Error You're Seeing

```
ERROR  [Error: `projectId` can only contain only a-z, 0-9 and dashes]
```

This happens because your `EXPO_PUBLIC_SANITY_PROJECT_ID` has **invalid characters**.

---

## What Makes a Valid Project ID?

### ✅ VALID Examples

```
abc123def456
├─ Contains: lowercase letters + numbers ✓

my-project-id
├─ Contains: lowercase letters + dashes ✓

nura-care-2026
├─ Contains: lowercase letters + dashes + numbers ✓

proj123abc456
├─ Contains: lowercase letters + numbers ✓

sanity-app-v2
├─ Contains: lowercase letters + dashes + numbers ✓
```

### ❌ INVALID Examples (Will Fail)

```
My_Project_ID
├─ ❌ Uppercase letters (My, P, I, D)
├─ ❌ Underscores (_)

nura-care_app
├─ ❌ Underscores (_)

NuraCAre
├─ ❌ Uppercase letters (N, C, C)

nura.care
├─ ❌ Periods (.)

my project id
├─ ❌ Spaces

myproject!
├─ ❌ Special character (!)

my project-2026-app
├─ ❌ Spaces

my_project_id_v2
├─ ❌ Underscores
```

---

## Character-by-Character Breakdown

### ✅ Valid Characters

| Character | Examples | Usage |
|-----------|----------|-------|
| **a-z** | `abcdefghijklmnopqrstuvwxyz` | Use lowercase letters |
| **0-9** | `0123456789` | Use any digit |
| **-** | `-` | Use dashes to separate words |

### ❌ Invalid Characters

| Character | Examples | Why Not |
|-----------|----------|---------|
| **A-Z** | `ABCDEFGHIJKLMNOPQRSTUVWXYZ` | Must be lowercase |
| **_** | `_` | Not allowed |
| **.** | `.` | Not allowed |
| **/** | `/` | Not allowed |
| **space** | ` ` | Not allowed |
| **!** | `!` | Not allowed |
| **@** | `@` | Not allowed |
| **#** | `#` | Not allowed |

---

## Finding Your Real Project ID

### 📍 Location 1: Sanity Dashboard
1. Go to https://manage.sanity.io
2. Click on your project (e.g., "NuraCare")
3. Click **Settings** (gear icon)
4. Look for **Project ID**
5. Copy the exact value shown

Example Dashboard:
```
Project Name: NuraCare
Project ID: abc123def456xyz789  ← COPY THIS
Dataset: production
Created: Feb 3, 2026
```

### 📍 Location 2: sanity.json File
Your project folder should have `sanity.json`:
```json
{
  "projectId": "abc123def456xyz789",
  "dataset": "production"
}
```

### 📍 Location 3: Sanity CLI
Run this command:
```bash
sanity projects list
```

Output:
```
Available projects:
  abc123def456xyz789  NuraCare
  xyz789abc123def456  AnotherProject
```

---

## How to Fix It

### Current Setup (Broken)
```env
EXPO_PUBLIC_SANITY_PROJECT_ID=My-Project-ID
                               ^^^^^^^^ ❌ Uppercase letters
```

### Fixed Setup (Working)
```env
EXPO_PUBLIC_SANITY_PROJECT_ID=my-project-id
                               ^^ ✅ Lowercase letters
```

---

## Step-by-Step Fix

### 1. Open `.env.local`
```
nueracare-expo-app/
├── .env.local  ← Open this file
├── package.json
└── app/
```

### 2. Current (Wrong)
```env
EXPO_PUBLIC_SANITY_PROJECT_ID=My_Real_ProjectId
                               ❌ ❌ ❌ (uppercase + underscores)
```

### 3. Fixed (Right)
```env
EXPO_PUBLIC_SANITY_PROJECT_ID=my-real-projectid
                               ✓✓✓ (lowercase + dashes)
```

### 4. Save & Restart
```bash
# In terminal
npx expo start --clear
```

---

## Real-World Example

### Before (Your Current Error)
```
Error from .env.local:
EXPO_PUBLIC_SANITY_PROJECT_ID=NuraCAre_Project_2026
                               ^^^^^^^^^^^ All Invalid!

Result in Logs:
❌ ERROR [Error: `projectId` can only contain only a-z, 0-9 and dashes]
```

### After (Fixed)
```
Fixed in .env.local:
EXPO_PUBLIC_SANITY_PROJECT_ID=nura-care-project-2026
                               ✓✓✓ Valid!

Result in Logs:
✅ LOG Sanity client initialized successfully
✅ Waiting for Clerk to load...
```

---

## 🔍 How to Check Your Current Value

### Option 1: Print It
```bash
echo $EXPO_PUBLIC_SANITY_PROJECT_ID
```

### Option 2: Run Validator
```bash
node verify-sanity-config.js
```

Output will show:
```
✅ Format is valid: "my-project-id"
```
or
```
❌ Invalid characters detected in: "My_Project_ID"
Invalid characters: M, _, P, I
```

---

## 📋 Checklist

- [ ] Opened `nueracare-expo-app/.env.local`
- [ ] Found line: `EXPO_PUBLIC_SANITY_PROJECT_ID=...`
- [ ] Verified NO uppercase letters
- [ ] Verified NO underscores
- [ ] Verified NO special characters (except dashes)
- [ ] Verified NO spaces
- [ ] Saved the file
- [ ] Ran `npx expo start --clear`
- [ ] Check Expo logs - error gone? ✅

---

## When You See This ✅

```
LOG  Auth state: {...}
LOG  OAuth redirect URL: exp://10.12.13.250:8081/--/auth/callback
LOG  Waiting for Clerk to load...
```

No errors about projectId = **SUCCESS!** 🎉

