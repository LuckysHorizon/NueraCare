#!/bin/bash

# NuraCare Sanity Dataset & Schema Setup Script
# This script automates the Sanity setup process

echo "🚀 NuraCare Sanity Setup"
echo "================================"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing Sanity packages..."
npm install sanity @sanity/structure @sanity/vision

# Step 2: Create dataset
echo "📊 Step 2: Creating production dataset..."
npm run sanity:dataset:create

# Step 3: Deploy schema
echo "📝 Step 3: Deploying schema to Sanity..."
npm run sanity:deploy

# Step 4: Generate TypeScript types
echo "✅ Step 4: Generating TypeScript types..."
npm run sanity:typegen

echo ""
echo "✨ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Go to https://manage.sanity.io/projects/q5maqr3y"
echo "2. Create API token with 'Editor' permission"
echo "3. Add token to .env.local: EXPO_PUBLIC_SANITY_TOKEN=sk_..."
echo "4. Configure CORS Origins:"
echo "   - http://localhost:*"
echo "   - exp://*"
echo ""
echo "✅ Ready to use!"
echo ""
echo "📱 Start developing:"
echo "   npm start"
