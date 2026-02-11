#!/bin/bash

# WhatsApp Verification Test Script
# This script tests the WhatsApp verification flow

set -e

echo "🧪 WhatsApp Verification Test Script"
echo "====================================="
echo ""

# Configuration
SUPABASE_URL="https://kkffwzvyfbkhhoxztsgn.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZmZ3enZ5ZmJraGhveHp0c2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjA4MDEsImV4cCI6MjA3NzQ5NjgwMX0.pJtQlX6dF7j8kAniWPDUNkT_MQfrJluvwacNKFqlfCQ"

# Get phone number from user
read -p "Enter phone number (with country code, e.g., +12345678900): " PHONE_NUMBER

# Generate a test user ID
USER_ID="test-user-$(date +%s)"

echo ""
echo "📱 Testing with:"
echo "   Phone: $PHONE_NUMBER"
echo "   User ID: $USER_ID"
echo ""

# Step 1: Send verification code
echo "📤 Step 1: Sending verification code..."
echo ""

SEND_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${SUPABASE_URL}/functions/v1/send-whatsapp-verification" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"${PHONE_NUMBER}\",\"userId\":\"${USER_ID}\"}")

HTTP_CODE=$(echo "$SEND_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$SEND_RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $RESPONSE_BODY"
echo ""

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ Failed to send verification code!"
  echo ""
  echo "Common issues:"
  echo "  1. WhatsApp API credentials not set in Supabase"
  echo "  2. Edge Functions not deployed"
  echo "  3. Invalid phone number format"
  echo "  4. WhatsApp API token expired"
  echo ""
  echo "Check the deployment guide: /WHATSAPP_DEPLOYMENT_GUIDE.md"
  exit 1
fi

echo "✅ Verification code sent successfully!"
echo ""

# Step 2: Get verification code from user
read -p "Enter the 6-digit code you received on WhatsApp: " VERIFICATION_CODE

echo ""
echo "🔐 Step 2: Verifying code..."
echo ""

VERIFY_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${SUPABASE_URL}/functions/v1/verify-whatsapp-code" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"${PHONE_NUMBER}\",\"verificationCode\":\"${VERIFICATION_CODE}\",\"userId\":\"${USER_ID}\"}")

HTTP_CODE=$(echo "$VERIFY_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$VERIFY_RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $RESPONSE_BODY"
echo ""

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ Verification failed!"
  echo ""
  echo "Common issues:"
  echo "  1. Incorrect code entered"
  echo "  2. Code expired (10 minute limit)"
  echo "  3. Too many failed attempts (5 max)"
  echo ""
  exit 1
fi

echo "✅ Phone number verified successfully!"
echo ""
echo "🎉 WhatsApp verification is working correctly!"
echo ""
echo "Next steps:"
echo "  1. Test from the SubTrack Pro UI"
echo "  2. Test with different phone numbers"
echo "  3. Deploy to production"
echo ""
