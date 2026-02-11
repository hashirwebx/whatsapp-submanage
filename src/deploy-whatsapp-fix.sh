#!/bin/bash

# WhatsApp Verification Fix - Quick Deploy Script
# This script automates the deployment of the WhatsApp verification fix

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  WhatsApp Verification Fix - Quick Deploy Script          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI is not installed${NC}"
    echo ""
    echo "Install it with:"
    echo "  npm install -g supabase"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"
echo ""

# Step 1: Check credentials
echo -e "${BLUE}📋 Step 1: Checking WhatsApp API credentials${NC}"
echo ""

read -p "Have you obtained your WhatsApp API credentials from Facebook? (y/n): " has_creds

if [ "$has_creds" != "y" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  You need WhatsApp API credentials first!${NC}"
    echo ""
    echo "Get them from: https://developers.facebook.com/"
    echo ""
    echo "You need:"
    echo "  1. WHATSAPP_API_TOKEN (from Access Token)"
    echo "  2. WHATSAPP_PHONE_NUMBER_ID (from Phone Number ID)"
    echo "  3. WHATSAPP_VERIFY_TOKEN (create any random string)"
    echo ""
    echo "Once you have them, run this script again."
    exit 1
fi

# Step 2: Set secrets
echo ""
echo -e "${BLUE}📋 Step 2: Setting up Supabase secrets${NC}"
echo ""

read -p "Do you want to set/update Supabase secrets now? (y/n): " set_secrets

if [ "$set_secrets" = "y" ]; then
    echo ""
    read -p "Enter WHATSAPP_API_TOKEN: " token
    read -p "Enter WHATSAPP_PHONE_NUMBER_ID: " phone_id
    read -p "Enter WHATSAPP_VERIFY_TOKEN (or press Enter for auto-generated): " verify_token
    
    # Generate verify token if not provided
    if [ -z "$verify_token" ]; then
        verify_token="verify_$(date +%s)_$(openssl rand -hex 8)"
        echo -e "${GREEN}Generated WHATSAPP_VERIFY_TOKEN: $verify_token${NC}"
    fi
    
    echo ""
    echo "Setting secrets..."
    
    supabase secrets set WHATSAPP_API_TOKEN="$token"
    supabase secrets set WHATSAPP_PHONE_NUMBER_ID="$phone_id"
    supabase secrets set WHATSAPP_VERIFY_TOKEN="$verify_token"
    
    echo -e "${GREEN}✅ Secrets set successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping secrets setup${NC}"
    echo "   Make sure secrets are already set in Supabase!"
fi

# Step 3: Deploy Edge Functions
echo ""
echo -e "${BLUE}📋 Step 3: Deploying Edge Functions${NC}"
echo ""

echo "Deploying send-whatsapp-verification..."
supabase functions deploy send-whatsapp-verification

echo ""
echo "Deploying verify-whatsapp-code..."
supabase functions deploy verify-whatsapp-code

echo ""
echo -e "${GREEN}✅ Edge Functions deployed successfully${NC}"

# Step 4: Verify deployment
echo ""
echo -e "${BLUE}📋 Step 4: Verifying deployment${NC}"
echo ""

echo "Deployed functions:"
supabase functions list

# Step 5: Test (optional)
echo ""
echo -e "${BLUE}📋 Step 5: Testing (Optional)${NC}"
echo ""

read -p "Do you want to test the verification flow now? (y/n): " run_test

if [ "$run_test" = "y" ]; then
    if [ -f "./test-whatsapp-verification.sh" ]; then
        chmod +x ./test-whatsapp-verification.sh
        echo ""
        echo "Running test..."
        ./test-whatsapp-verification.sh
    else
        echo -e "${YELLOW}⚠️  Test script not found${NC}"
        echo "   You can test manually from the UI or using curl"
    fi
else
    echo -e "${YELLOW}Skipping test${NC}"
fi

# Success!
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              🎉 Deployment Complete!                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ WhatsApp verification system is now deployed!${NC}"
echo ""
echo "Next steps:"
echo "  1. Test from SubTrack Pro UI (Settings → WhatsApp Connection)"
echo "  2. Monitor logs: supabase functions logs send-whatsapp-verification"
echo "  3. Check success rate in database"
echo ""
echo "📚 Documentation:"
echo "  - Quick Reference: /QUICK_FIX_REFERENCE.md"
echo "  - Full Guide: /WHATSAPP_DEPLOYMENT_GUIDE.md"
echo "  - Troubleshooting: /WHATSAPP_VERIFICATION_FIX.md"
echo ""
echo -e "${BLUE}Happy coding! 🚀${NC}"
echo ""
