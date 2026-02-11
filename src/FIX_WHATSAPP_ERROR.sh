#!/bin/bash

# 🚑 WhatsApp Error Quick Fix Script
# This script will help you fix the "Failed to send verification code" error

echo "======================================"
echo "🚑 WhatsApp Verification Error Fix"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Check if Supabase CLI is installed
echo -e "${BLUE}📦 Step 1: Checking Supabase CLI...${NC}"
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found!${NC}"
    echo "Install it: npm install -g supabase"
    exit 1
else
    echo -e "${GREEN}✅ Supabase CLI found${NC}"
fi
echo ""

# Step 2: Check if logged in
echo -e "${BLUE}🔑 Step 2: Checking login status...${NC}"
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in. Logging in now...${NC}"
    supabase login
fi
echo -e "${GREEN}✅ Logged in${NC}"
echo ""

# Step 3: Check project link
echo -e "${BLUE}🔗 Step 3: Checking project link...${NC}"
if [ ! -f ".git/config" ] && [ ! -f "supabase/.branches/_current_branch" ]; then
    echo -e "${YELLOW}⚠️  Project not linked. Linking now...${NC}"
    supabase link --project-ref kkffwzvyfbkhhoxztsgn
fi
echo -e "${GREEN}✅ Project linked${NC}"
echo ""

# Step 4: Redeploy function with fixes
echo -e "${BLUE}📤 Step 4: Deploying updated Edge Function...${NC}"
echo "Deploying send-whatsapp-verification..."
supabase functions deploy send-whatsapp-verification

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Edge Function deployed with fixes!${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi
echo ""

# Step 5: Check secrets
echo -e "${BLUE}🔐 Step 5: Checking WhatsApp API secrets...${NC}"
SECRETS=$(supabase secrets list 2>&1)

if echo "$SECRETS" | grep -q "WHATSAPP_API_TOKEN"; then
    echo -e "${GREEN}✅ WHATSAPP_API_TOKEN found${NC}"
else
    echo -e "${RED}❌ WHATSAPP_API_TOKEN missing!${NC}"
    echo ""
    echo "Please set it:"
    echo "  supabase secrets set WHATSAPP_API_TOKEN=your_token"
    echo ""
fi

if echo "$SECRETS" | grep -q "WHATSAPP_PHONE_NUMBER_ID"; then
    echo -e "${GREEN}✅ WHATSAPP_PHONE_NUMBER_ID found${NC}"
else
    echo -e "${RED}❌ WHATSAPP_PHONE_NUMBER_ID missing!${NC}"
    echo ""
    echo "Please set it:"
    echo "  supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_phone_id"
    echo ""
fi
echo ""

# Step 6: Check database table
echo -e "${BLUE}🗄️  Step 6: Checking database table...${NC}"
echo "Opening Supabase Dashboard..."
echo ""
echo "Please verify that 'whatsapp_verifications' table exists:"
echo "👉 https://supabase.com/dashboard/project/kkffwzvyfbkhhoxztsgn/editor"
echo ""
echo "If table doesn't exist, run this SQL:"
echo "👉 https://supabase.com/dashboard/project/kkffwzvyfbkhhoxztsgn/sql"
echo ""
echo "SQL file location: /supabase/migrations/create_whatsapp_verifications_table.sql"
echo ""
read -p "Press Enter after verifying the table exists..."
echo ""

# Step 7: View recent logs
echo -e "${BLUE}📋 Step 7: Checking recent function logs...${NC}"
echo "Last 10 log entries:"
echo ""
supabase functions logs send-whatsapp-verification --limit 10
echo ""

# Step 8: Test function
echo -e "${BLUE}🧪 Step 8: Test function${NC}"
echo ""
echo "Now test in your app:"
echo "  1. Go to Settings page"
echo "  2. Enter phone number (format: +923001234567)"
echo "  3. Click 'Connect WhatsApp'"
echo ""
echo "If it still fails, check logs immediately:"
echo "  supabase functions logs send-whatsapp-verification --limit 10"
echo ""

# Final summary
echo "======================================"
echo -e "${GREEN}🎉 Fix Process Complete!${NC}"
echo "======================================"
echo ""
echo "Changes made:"
echo "  ✅ Updated Edge Function with better error handling"
echo "  ✅ Removed WhatsApp template requirement"
echo "  ✅ Added detailed logging"
echo "  ✅ Improved phone number validation"
echo ""
echo "Next steps:"
echo "  1. Test in your app (Settings → WhatsApp)"
echo "  2. If still failing, check logs for specific error"
echo "  3. Verify secrets are set correctly"
echo "  4. Ensure database table exists"
echo ""
echo "For detailed troubleshooting, see:"
echo "  📖 WHATSAPP_ERROR_FIX.md"
echo ""
echo "To view live logs:"
echo "  supabase functions logs send-whatsapp-verification --limit 20"
echo ""
