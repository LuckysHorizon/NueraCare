# ⚡ Sanity Setup - Quick Action Guide (Do This Now!)

## 🎯 Your Project
**Project ID:** `q5maqr3y`  
**Manage:** https://manage.sanity.io/projects/q5maqr3y

---

## 📋 Do These 5 Things (In Order)

### ✅ ACTION 1: Create Production Dataset (3 min)

**Go to:** https://manage.sanity.io/projects/q5maqr3y

**Steps:**
1. Click: **Settings** ⚙️
2. Click: **Datasets**
3. Click: **+ Create dataset**
4. Name: `production`
5. Click: **Create**

**✓ Done:** You now have a dataset

---

### ✅ ACTION 2: Generate API Token (3 min)

**Go to:** https://manage.sanity.io/projects/q5maqr3y

**Steps:**
1. Click: **Settings** ⚙️
2. Go to: **API** → **Tokens**
3. Click: **+ Add API Token**
4. Name: `NuraCare Mobile App`
5. Permissions: Select **Editor** ✅
6. Click: **Create Token**
7. **COPY THE TOKEN** (starts with `sk_`)

**✓ Done:** Token is ready to use

---

### ✅ ACTION 3: Add Token to .env.local (2 min)

**Open:** `nueracare-expo-app/.env.local`

**Replace with:**
```env
EXPO_PUBLIC_SANITY_PROJECT_ID=q5maqr3y
EXPO_PUBLIC_SANITY_DATASET=production
EXPO_PUBLIC_SANITY_TOKEN=sk_YOUR_TOKEN_HERE
```

**Where YOUR_TOKEN_HERE =** The token you copied in ACTION 2

**✓ Done:** Environment configured

---

### ✅ ACTION 4: Configure CORS (2 min)

**Go to:** https://manage.sanity.io/projects/q5maqr3y

**Steps:**
1. Click: **Settings** ⚙️
2. Go to: **API** → **CORS Origins**
3. Click: **+ Add CORS Origin**
4. Paste: `http://localhost:*`
5. Click: **Add**
6. Click: **+ Add CORS Origin**
7. Paste: `exp://*`
8. Click: **Add**

**✓ Done:** CORS configured

---

### ✅ ACTION 5: Restart Expo (1 min)

**Open Terminal:**
```bash
cd nueracare-expo-app
npx expo start --clear
```

**Check Console:**
- ✅ If no red errors = SUCCESS!
- ❌ If CORS error = Go back to ACTION 4
- ❌ If auth error = Check token in .env.local

**✓ Done:** App connected to Sanity

---

## 🎉 That's It! You're Done!

You now have:
- ✅ Production dataset
- ✅ API token with write access
- ✅ CORS configured
- ✅ App connected

---

## 📚 Now Use These GROQ Queries

### Fetch User Profile
```typescript
const user = await sanityClient.fetch(
  `*[_type == "userProfile" && clerkId == $clerkId][0]`,
  { clerkId: "user_123" }
);
```

### Fetch All Users
```typescript
const users = await sanityClient.fetch(
  `*[_type == "userProfile"]`
);
```

### Search by Name
```typescript
const results = await sanityClient.fetch(
  `*[_type == "userProfile" && firstName match $query]`,
  { query: "John" }
);
```

### Count Users
```typescript
const count = await sanityClient.fetch(
  `count(*[_type == "userProfile"])`
);
```

### Get Stats
```typescript
const stats = await sanityClient.fetch(`{
  "total": count(*[_type == "userProfile"]),
  "avgAge": avg(*[_type == "userProfile"].age)
}`);
```

---

## 🔑 APIs Enabled

| API | Status | Use Case |
|-----|--------|----------|
| **Content API** | ✅ ENABLED | Read/write documents |
| **Assets API** | ⚠️ Optional | Upload files (not needed yet) |
| **Webhooks** | ⚠️ Optional | Real-time alerts (not needed yet) |

---

## 🧪 Test Your Setup

### Option 1: In Vision Tool
1. Open: https://q5maqr3y.sanity.studio
2. Click: **Vision** (top menu)
3. Paste: `*[_type == "userProfile"][0]`
4. Press: **Ctrl+Enter**
5. Should show user data

### Option 2: In Your App
```typescript
useEffect(() => {
  testSanity();
}, []);

const testSanity = async () => {
  const user = await sanityClient.fetch(
    `*[_type == "userProfile"][0]`
  );
  console.log("✅ Works!", user);
};
```

### Option 3: Via cURL
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://q5maqr3y.api.sanity.io/v2024-01-01/data/query/production?query=*[_type==\"userProfile\"][0]"
```

---

## ❌ If Something Goes Wrong

### Error: "CORS policy: No 'Access-Control-Allow-Origin'"
**Fix:** Go back to ACTION 4, add `exp://*` to CORS

### Error: "Invalid token"
**Fix:** Go back to ACTION 2, generate new token, update .env.local

### Error: "Dataset not found"
**Fix:** Go back to ACTION 1, verify dataset is named `production`

### Error: "Cannot read documents"
**Fix:** Go back to ACTION 2, make sure token has "Editor" permission

---

## 📞 Helpful Links

| Link | Purpose |
|------|---------|
| https://manage.sanity.io | Sanity Dashboard |
| https://q5maqr3y.sanity.studio | Your Sanity Studio |
| https://www.sanity.io/docs/groq | GROQ Documentation |
| https://groq-playground.sanity.dev/ | GROQ Tester |

---

## ✨ What You Can Do Now

✅ Create user profiles  
✅ Save health data  
✅ Fetch user information  
✅ Update settings  
✅ Search users  
✅ Get statistics  

---

## 🚀 Next: Complete Onboarding Flow

1. User completes onboarding
2. App saves to Sanity (automatically via `upsertUserProfile`)
3. Profile page loads from Sanity (via `getUserProfile`)
4. User updates accessibility → syncs to Sanity (via `updateUserProfile`)

**Everything is ready!**

---

## 📝 Quick Checklist

- [ ] Dataset created: `production`
- [ ] API token generated and copied
- [ ] Token added to `.env.local`
- [ ] CORS origins added: `exp://*`
- [ ] Expo restarted
- [ ] No console errors
- [ ] Can test GROQ query

---

**You're all set!** 🎉

Your Sanity dataset is live and ready to use.
All GROQ queries are available.
Your app is connected and authenticated.

Start building! 🚀
