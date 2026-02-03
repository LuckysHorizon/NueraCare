# 🎯 GROQ Queries Quick Reference - NuraCare

## Your Dataset Info
```
Project ID: q5maqr3y
Dataset: production
Test Tool: https://q5maqr3y.sanity.studio (Vision button)
```

---

## 🔍 Basic Query Patterns

### Get First Document
```groq
*[_type == "userProfile"][0]
```

### Get All Documents
```groq
*[_type == "userProfile"]
```

### Filter with Condition
```groq
*[_type == "userProfile" && age > 30]
```

### Order by Field
```groq
*[_type == "userProfile"] | order(createdAt desc)
```

### Limit Results
```groq
*[_type == "userProfile"][0..10]
```

### Count Documents
```groq
count(*[_type == "userProfile"])
```

---

## 💊 NuraCare Specific Queries

### 1. Get User Profile
```groq
*[_type == "userProfile" && clerkId == "user_123"][0] {
  _id,
  firstName,
  lastName,
  bloodGroup,
  age,
  height,
  weight
}
```

### 2. Get All Users
```groq
*[_type == "userProfile"] {
  _id,
  firstName,
  lastName,
  email,
  bloodGroup
} | order(createdAt desc)
```

### 3. Search by Name
```groq
*[_type == "userProfile" && firstName match "John"] {
  firstName,
  lastName,
  email
}
```

### 4. Get Users by Blood Group
```groq
*[_type == "userProfile" && bloodGroup == "O+"] {
  _id,
  firstName,
  lastName,
  age,
  weight
}
```

### 5. Get Users with Chronic Diseases
```groq
*[_type == "userProfile" && chronicDiseases != null] {
  firstName,
  lastName,
  chronicDiseases,
  age
}
```

### 6. Get Accessibility Users
```groq
*[_type == "userProfile" && highContrast == true] {
  firstName,
  largeTextMode,
  reducedMotion
}
```

### 7. Check if User Exists
```groq
count(*[_type == "userProfile" && clerkId == "user_123"]) > 0
```

### 8. Get Recent Updates
```groq
*[_type == "userProfile"] | order(updatedAt desc)[0..5] {
  firstName,
  lastName,
  updatedAt
}
```

### 9. Average Age
```groq
avg(*[_type == "userProfile"].age)
```

### 10. Get Statistics
```groq
{
  "totalUsers": count(*[_type == "userProfile"]),
  "avgAge": avg(*[_type == "userProfile"].age),
  "avgWeight": avg(*[_type == "userProfile"].weight)
}
```

---

## 📊 Query Templates (Copy-Paste)

### Template 1: Get Single User
```groq
*[_type == "userProfile" && clerkId == $clerkId][0]
```
**Usage:**
```typescript
const user = await sanityClient.fetch(
  `*[_type == "userProfile" && clerkId == $clerkId][0]`,
  { clerkId: "user_123" }
);
```

### Template 2: Search Users
```groq
*[_type == "userProfile" && (firstName match $query || lastName match $query)]
```
**Usage:**
```typescript
const results = await sanityClient.fetch(
  `*[_type == "userProfile" && (firstName match $query || lastName match $query)]`,
  { query: "John" }
);
```

### Template 3: Filter with Multiple Conditions
```groq
*[_type == "userProfile" && age >= $minAge && age <= $maxAge && bloodGroup == $group]
```
**Usage:**
```typescript
const users = await sanityClient.fetch(
  `*[_type == "userProfile" && age >= $minAge && age <= $maxAge]`,
  { minAge: 20, maxAge: 40 }
);
```

### Template 4: Order and Limit
```groq
*[_type == "userProfile"] | order(createdAt desc)[0..$limit]
```
**Usage:**
```typescript
const latest = await sanityClient.fetch(
  `*[_type == "userProfile"] | order(createdAt desc)[0..$limit]`,
  { limit: 10 }
);
```

### Template 5: Projection (Select Fields)
```groq
*[_type == "userProfile"][0] {
  firstName,
  lastName,
  email,
  bloodGroup,
  age
}
```

### Template 6: Computed Fields
```groq
*[_type == "userProfile"][0] {
  firstName,
  lastName,
  age,
  "ageGroup": age < 18 ? "Minor" : age < 30 ? "Young" : "Adult"
}
```

### Template 7: Array Operations
```groq
*[_type == "userProfile" && accessibilityFeatures != null] {
  firstName,
  accessibilityFeatures[]
}
```

### Template 8: Conditional Logic
```groq
*[_type == "userProfile"][0] {
  firstName,
  age,
  "isAdult": age >= 18
}
```

---

## 🛠️ Operators Reference

### Comparison Operators
```groq
== (equal)
!= (not equal)
> (greater than)
< (less than)
>= (greater than or equal)
<= (less than or equal)
```

### Logical Operators
```groq
&& (AND)
|| (OR)
! (NOT)
```

### String Operators
```groq
match       // "John" match "oh" → true
startsWith  // "John" startsWith "J" → true
endsWith    // "John" endsWith "n" → true
```

### Array Operators
```groq
[]          // Select all array items
[0]         // First item
[0..5]      // Items 0 to 5
```

---

## 🔄 Common Patterns

### Pattern 1: Fetch and Transform
```groq
*[_type == "userProfile"][0] {
  firstName,
  lastName,
  "fullName": firstName + " " + lastName
}
```

### Pattern 2: Fetch with Count
```groq
{
  "users": *[_type == "userProfile"],
  "count": count(*[_type == "userProfile"])
}
```

### Pattern 3: Fetch and Filter
```groq
*[_type == "userProfile" && age > 25 && bloodGroup == "O+"]
```

### Pattern 4: Fetch and Sort
```groq
*[_type == "userProfile"] | order(age desc)
```

### Pattern 5: Fetch and Limit
```groq
*[_type == "userProfile"] | order(createdAt desc)[0..9]
```

### Pattern 6: Group and Count
```groq
*[_type == "userProfile"] {
  bloodGroup
} | group(bloodGroup) | map({
  blood_group: .[0].bloodGroup,
  count: length(.)
})
```

---

## 🧪 Test Queries in Vision

### How to Use Vision Tool
1. Open: https://q5maqr3y.sanity.studio
2. Click: **Vision** button (top menu)
3. Paste any query below
4. Press: **Ctrl+Enter**
5. See results in panel

### Test These Queries

**Test 1: Simple fetch**
```groq
*[_type == "userProfile"][0]
```

**Test 2: Count all**
```groq
count(*[_type == "userProfile"])
```

**Test 3: Get recent**
```groq
*[_type == "userProfile"] | order(createdAt desc)[0]
```

---

## 🚀 Advanced Queries

### Aggregation
```groq
*[_type == "userProfile"] {
  age, weight
} | {
  "avgAge": avg(.[].age),
  "avgWeight": avg(.[].weight),
  "minAge": min(.[].age),
  "maxAge": max(.[].age)
}
```

### Grouping
```groq
*[_type == "userProfile"] {
  bloodGroup
} | group(bloodGroup) | map({
  type: .[0].bloodGroup,
  users: length(.)
})
```

### Nested Projections
```groq
*[_type == "userProfile"][0] {
  firstName,
  lastName,
  "profile": {
    age,
    bloodGroup,
    weight
  }
}
```

### Conditional Selection
```groq
*[_type == "userProfile"][0] {
  firstName,
  lastName,
  age,
  "ageCategory": age < 18 ? "Minor" : age < 30 ? "Young Adult" : age < 60 ? "Adult" : "Senior"
}
```

---

## ⚡ Performance Tips

### ✅ Good (Fast)
```groq
*[_type == "userProfile" && clerkId == "user_123"][0]
```

### ❌ Bad (Slow)
```groq
*[_type == "userProfile"] | filter(clerkId == "user_123")[0]
```

### Why?
- Filter in query (`&&`) is faster than filter in pipe
- Use specific conditions in first clause
- Limit results early: `[0..10]`

---

## 🐛 Common Errors & Fixes

### Error: "Unknown variable $var"
```groq
❌ *[_type == "userProfile" && age == $age]
   // Missing variable in fetch()

✅ Use in code:
   sanityClient.fetch(query, { age: 30 })
```

### Error: "Unknown field"
```groq
❌ *[_type == "userProfile"].firstName
   // Field doesn't exist

✅ Check schema:
   *[_type == "userProfile"][0]
```

### Error: "Cannot compare..."
```groq
❌ *[_type == "userProfile" && name == 123]
   // Type mismatch

✅ Use correct type:
   *[_type == "userProfile" && name == "John"]
```

---

## 📚 TypeScript Usage Examples

### Example 1: Simple Fetch
```typescript
const user = await sanityClient.fetch(
  `*[_type == "userProfile"][0]`
);
```

### Example 2: With Variables
```typescript
const user = await sanityClient.fetch(
  `*[_type == "userProfile" && clerkId == $clerkId][0]`,
  { clerkId: "user_123" }
);
```

### Example 3: With Projection
```typescript
const user = await sanityClient.fetch(
  `*[_type == "userProfile"][0] {
    firstName,
    lastName,
    bloodGroup
  }`
);
```

### Example 4: Multiple Variables
```typescript
const users = await sanityClient.fetch(
  `*[_type == "userProfile" && age >= $minAge && age <= $maxAge]`,
  { minAge: 20, maxAge: 50 }
);
```

### Example 5: Error Handling
```typescript
try {
  const user = await sanityClient.fetch(
    `*[_type == "userProfile" && clerkId == $clerkId][0]`,
    { clerkId }
  );
  console.log("User:", user);
} catch (error) {
  console.error("Sanity error:", error);
}
```

---

## 🔗 Resources

- **GROQ Playground:** https://groq-playground.sanity.dev/
- **GROQ Docs:** https://www.sanity.io/docs/groq
- **Vision Tool:** In your Sanity Studio
- **API Docs:** https://www.sanity.io/docs/api-reference

---

## ✨ Quick Copy-Paste Templates

**Get user:**
```groq
*[_type == "userProfile" && clerkId == $clerkId][0]
```

**Get all:**
```groq
*[_type == "userProfile"]
```

**Search:**
```groq
*[_type == "userProfile" && firstName match $query]
```

**Count:**
```groq
count(*[_type == "userProfile"])
```

**Stats:**
```groq
{ "total": count(*[_type == "userProfile"]), "avgAge": avg(*[_type == "userProfile"].age) }
```

---

**Ready to Query!** 🎉
