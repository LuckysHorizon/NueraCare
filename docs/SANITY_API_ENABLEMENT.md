# ✅ Sanity APIs - Quick Enablement Checklist

## 🎯 Your Project
**Project ID:** `q5maqr3y`  
**Manage Dashboard:** https://manage.sanity.io/projects/q5maqr3y

---

## 📋 APIs You Need

### 1️⃣ **Content API** (Core - Always Enabled)
- **Status:** ✅ **ENABLED BY DEFAULT**
- **Purpose:** Read/write documents
- **Endpoint:** `https://[projectId].api.sanity.io/v2024-01-01`
- **What it does:**
  - ✅ Fetch user profiles
  - ✅ Create/update documents
  - ✅ Delete documents
  - ✅ GROQ queries
- **No setup needed** - automatically available

---

### 2️⃣ **Assets API** (Optional - For File Uploads)
- **Status:** ⚠️ **Optional** (only if uploading medical reports)
- **Purpose:** Upload images/files
- **How to enable:**
  1. Go: https://manage.sanity.io → Your Project (q5maqr3y)
  2. Click: **Settings** ⚙️
  3. Go to: **API**
  4. Find: **Assets API**
  5. Toggle: **Enable**
- **What it does:**
  - Upload medical report PDFs
  - Store images
  - Manage files

---

### 3️⃣ **Webhooks** (Optional - For Real-Time Updates)
- **Status:** ⚠️ **Optional** (for alerts/notifications)
- **Purpose:** Trigger events when data changes
- **How to enable:**
  1. Settings → **Webhooks**
  2. Click: **+ Create webhook**
  3. Set trigger: Document updates
  4. Set URL: Your backend endpoint
  5. **Create**
- **What it does:**
  - Alert when user profile changes
  - Send notifications
  - Sync with external systems

---

## 🔑 API Token Setup

### Generate Token (Required for Mobile App)
1. **Go to:** https://manage.sanity.io/projects/q5maqr3y
2. **Click:** Settings ⚙️
3. **Navigate:** API → Tokens
4. **Click:** **+ Add API Token**
5. **Fill in:**
   - **Name:** `NuraCare Mobile App`
   - **Permissions:** **Editor** (read + write)
6. **Create Token**
7. **Copy the token**
8. **Add to `.env.local`:**
   ```env
   EXPO_PUBLIC_SANITY_TOKEN=sk_YOUR_TOKEN_HERE
   ```

### Token Permissions Explained

| Permission | Access | Use Case |
|------------|--------|----------|
| **Viewer** | Read-only | Public website (not for mobile) |
| **Editor** | Read + Write + Delete | Mobile app (your use case) ✅ |
| **Admin** | Full access | Never use in mobile (security risk) |

---

## 🌐 CORS Configuration (Critical!)

### What is CORS?
CORS (Cross-Origin Resource Sharing) controls which apps can access your Sanity dataset.

### Configure CORS Origins

1. **Go to:** https://manage.sanity.io/projects/q5maqr3y
2. **Settings** → **API**
3. **Find:** **CORS Origins**
4. **Click:** **+ Add CORS Origin**
5. **Add these origins:**

```
http://localhost:*
http://127.0.0.1:*
exp://*
https://your-production-domain.com
```

### Explanation of Each

| Origin | Purpose |
|--------|---------|
| `http://localhost:*` | Local development (web) |
| `http://127.0.0.1:*` | Local development (IP) |
| `exp://*` | Expo app development |
| `https://your-domain.com` | Production app |

### ✅ After Adding CORS
- Reload your Expo app
- Should connect to Sanity without CORS errors

---

## 📝 Step-by-Step: Complete API Setup

### Step 1: Enable Content API ✅
- Status: Already enabled
- No action needed

### Step 2: Generate API Token
```
Settings → API → Tokens → + Add API Token
Name: NuraCare Mobile App
Permissions: Editor
Copy token → .env.local
```

### Step 3: Configure CORS
```
Settings → API → CORS Origins
Add: http://localhost:*
Add: exp://*
Add: https://your-production-domain.com
```

### Step 4: Test Connection
```bash
cd nueracare-expo-app
npx expo start --clear
# Check console for Sanity connection logs
```

### Step 5: (Optional) Enable Assets API
```
Settings → API → Assets API → Toggle On
(Only if uploading medical reports)
```

---

## 🔍 Verify Setup

### Check Content API is working
```typescript
// In your app code
useEffect(() => {
  testSanity();
}, []);

const testSanity = async () => {
  try {
    const result = await sanityClient.fetch(
      '*[_type == "userProfile"][0]'
    );
    console.log("✅ Sanity connected:", result);
  } catch (error) {
    console.error("❌ Sanity error:", error);
  }
};
```

### Check Token is Valid
```bash
# Using curl (macOS/Linux)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://q5maqr3y.api.sanity.io/v2024-01-01/data/query/production

# Should return JSON without auth errors
```

### Check CORS is Configured
Look in browser/Expo console:
```
✅ No CORS errors = Successfully configured
❌ CORS error = Need to add origin to CORS list
```

---

## 🚨 Common API Errors

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"
**Cause:** Your app's origin not in CORS list  
**Fix:** Add `exp://*` to CORS Origins in Settings → API

### Error: "Invalid token"
**Cause:** Wrong/expired token  
**Fix:** 
1. Generate new token in Settings → API → Tokens
2. Copy to `.env.local`
3. Restart Expo

### Error: "Dataset not found"
**Cause:** Wrong dataset name  
**Fix:** 
1. Check dataset name: `EXPO_PUBLIC_SANITY_DATASET=production`
2. Verify dataset exists in Settings → Datasets

### Error: "Cannot read documents"
**Cause:** Token doesn't have Editor permission  
**Fix:** Generate new token with "Editor" permission

---

## 📊 API Endpoints Reference

### Your Specific Endpoints

```
Base URL: https://q5maqr3y.api.sanity.io/v2024-01-01

Content API Endpoints:
├─ Query: /data/query/production
├─ Documents: /data/docs/production
└─ Mutations: /data/mutate/production

Assets API Endpoint (if enabled):
└─ Upload: /assets/images/production
```

---

## ✨ What Each API Does

### Content API (✅ You need this)
```
✅ Fetch user profiles
✅ Save health data
✅ Update accessibility settings
✅ Run GROQ queries
✅ Delete user data
```

### Assets API (⚠️ Optional)
```
✅ Upload medical report PDFs
✅ Store user profile images
✅ Manage image transformations
⚠️ Only needed if storing files
```

### Webhooks (⚠️ Optional)
```
✅ Alert when profile changes
✅ Send real-time notifications
✅ Trigger external actions
⚠️ Requires backend server
```

---

## 🎯 Recommended Setup for NuraCare

```
✅ Content API: ENABLED (default)
✅ API Token: GENERATED with Editor permission
✅ CORS Origins: CONFIGURED
   - http://localhost:*
   - exp://*
   - https://production-domain.com

⚠️ Assets API: OPTIONAL (enable if needed)
⚠️ Webhooks: OPTIONAL (enable if needed)
```

---

## 🚀 Final Checklist

- [ ] Visited https://manage.sanity.io/projects/q5maqr3y
- [ ] Content API confirmed enabled
- [ ] API Token generated
- [ ] Token copied to `.env.local`
- [ ] CORS origins added:
  - [ ] http://localhost:*
  - [ ] exp://*
  - [ ] Your production domain
- [ ] Expo app restarted: `npx expo start --clear`
- [ ] No CORS errors in console
- [ ] Can fetch data from Sanity

---

## 📞 Testing Commands

### Test Content API with cURL
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://q5maqr3y.api.sanity.io/v2024-01-01/data/query/production?query=*[_type==\"userProfile\"][0]"
```

### Test in Sanity Studio
1. Open: https://q5maqr3y.sanity.studio
2. Click: **Vision** (top menu)
3. Paste: `*[_type == "userProfile"][0]`
4. Press: **Ctrl+Enter**
5. See results

---

## 🔐 Security Notes

| Item | Do | Don't |
|------|----|----|
| **API Token** | Store in `.env.local` | Commit to Git |
| **Token Type** | Use Editor for mobile | Use Admin token |
| **CORS** | Limit to specific origins | Allow all (*) |
| **Dataset** | Set to Private | Make public |

---

**Status:** APIs Configured ✅  
**Content API:** Enabled ✅  
**Authentication:** Ready ✅  
**CORS:** Configured ✅  

