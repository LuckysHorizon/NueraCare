#!/usr/bin/env node

/**
 * NueraCare Sanity Configuration Validator
 * Run: node verify-sanity-config.js
 */

const fs = require("fs");
const path = require("path");

console.log("\n🔍 NueraCare Sanity Configuration Checker\n");
console.log("=".repeat(50));

// Check .env.local exists
const envPath = path.join(__dirname, ".env.local");
if (!fs.existsSync(envPath)) {
  console.log("\n❌ .env.local file NOT FOUND");
  console.log("   Create it by copying .env.local.example:");
  console.log("   cp .env.local.example .env.local\n");
  process.exit(1);
}

console.log("\n✅ .env.local file found");

// Read .env.local
const envContent = fs.readFileSync(envPath, "utf-8");
const envLines = envContent
  .split("\n")
  .filter((line) => line && !line.startsWith("#"));

let projectId = "";
let dataset = "";
let token = "";

envLines.forEach((line) => {
  const [key, value] = line.split("=");
  if (key === "EXPO_PUBLIC_SANITY_PROJECT_ID") {
    projectId = value?.trim() || "";
  }
  if (key === "EXPO_PUBLIC_SANITY_DATASET") {
    dataset = value?.trim() || "";
  }
  if (key === "EXPO_PUBLIC_SANITY_TOKEN") {
    token = value?.trim() || "";
  }
});

console.log("\n📋 Configuration Found:");
console.log(`   Project ID: ${projectId || "❌ MISSING"}`);
console.log(`   Dataset: ${dataset || "❌ MISSING"}`);
console.log(`   Token: ${token ? "✅ Set" : "❌ MISSING"}`);

// Validate projectId format
console.log("\n🔎 Validating Project ID Format:");

if (!projectId) {
  console.log("   ❌ Project ID is empty");
  process.exit(1);
}

const validFormat = /^[a-z0-9-]+$/.test(projectId);

if (!validFormat) {
  console.log(`   ❌ Invalid characters detected in: "${projectId}"`);
  console.log("   ℹ️  Project ID must only contain: lowercase letters, numbers, dashes");

  // Show what's wrong
  const invalidChars = projectId.match(/[^a-z0-9-]/g);
  if (invalidChars) {
    console.log(`   Invalid characters: ${invalidChars.join(", ")}`);
  }

  console.log("\n   Examples of valid project IDs:");
  console.log("   - abc123def456");
  console.log("   - my-project-id");
  console.log("   - nura-care-2026");
  process.exit(1);
}

console.log(`   ✅ Format is valid: "${projectId}"`);

// Check dataset
if (!dataset) {
  console.log("   ⚠️  Dataset is missing (using default: production)");
} else {
  console.log(`   ✅ Dataset: "${dataset}"`);
}

// Check token
if (!token) {
  console.log("   ⚠️  API Token is missing - you may not be able to write data");
} else {
  console.log("   ✅ API Token is set");
}

console.log("\n✅ Configuration is valid!");
console.log("\nNext steps:");
console.log("1. Run: npx expo start --clear");
console.log("2. Check Expo logs for Sanity errors");
console.log("3. Complete onboarding to create user profile\n");
