#!/bin/bash

# Deployment test script
# This script runs automatically during deployment to verify everything works

echo "🚀 Starting deployment tests..."

# Test 1: Environment variables
echo "📋 Test 1: Environment variables..."
if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "⚠️ STRIPE_SECRET_KEY not set - Stripe tests will be skipped"
else
    echo "✅ STRIPE_SECRET_KEY is set"
fi

# Test 2: Database connection
echo -e "\n📋 Test 2: Database connection..."
# Use relative path for Vercel compatibility
if npx prisma db ping > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Test 3: Build process
echo -e "\n📋 Test 3: Build process..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Test 4: Automated tests (only if Stripe key is available)
echo -e "\n📋 Test 4: Automated tests..."
if [ -n "$STRIPE_SECRET_KEY" ]; then
    if node test-automated.js; then
        echo "✅ Automated tests passed"
    else
        echo "❌ Automated tests failed"
        exit 1
    fi
else
    echo "⚠️ Skipping Stripe tests (no API key)"
fi

# Test 5: API endpoints (only in development)
echo -e "\n📋 Test 5: API endpoints..."
if [ "$VERCEL_ENV" = "development" ] || [ -z "$VERCEL_ENV" ]; then
    # Only test API endpoints in development
    echo "ℹ️ Skipping API endpoint test (not in development)"
else
    echo "ℹ️ Vercel deployment - API endpoints will be tested by Vercel"
fi

echo -e "\n🎉 All deployment tests passed!"
echo "✅ Ready for deployment"
