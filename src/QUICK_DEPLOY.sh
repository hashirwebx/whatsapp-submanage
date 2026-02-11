#!/bin/bash

# 🚀 SubTrack Pro - WhatsApp Edge Functions Deployment Script
# Ye script automatically saari deployment steps execute karega

echo "=================================="
echo "🚀 SubTrack Pro WhatsApp Deployment"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if Supabase CLI is installed
echo "📦 Step 1: Checking Supabase CLI..."
if ! command -v supabase &> /dev/null
then
    echo -e "${RED}❌ Supabase CLI not found!${NC}"
    echo ""
    echo "Please install it first:"
    echo "  npm install -g supabase"
    echo ""
    echo "Or on Mac:"
    echo "  brew install supabase/tap/supabase"
    echo ""
    exit 1
else
    SUPABASE_VERSION=$(supabase --version)
    echo -e "${GREEN}✅ Supabase CLI installed: $SUPABASE_VERSION${NC}"
fi
echo ""

# Step 2: Login to Supabase
echo "🔑 Step 2: Logging in to Supabase..."
echo -e "${YELLOW}This will open your browser for authentication${NC}"
supabase login

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Login successful!${NC}"
else
    echo -e "${RED}❌ Login failed. Please try again.${NC}"
    exit 1
fi
echo ""

# Step 3: Link project
echo "🔗 Step 3: Linking to your Supabase project..."
echo -e "${YELLOW}Project ID: kkffwzvyfbkhhoxztsgn${NC}"
echo ""
echo "You may be asked for your database password."
echo "This is the password you set when creating your Supabase project."
echo ""
supabase link --project-ref kkffwzvyfbkhhoxztsgn

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Project linked successfully!${NC}"
else
    echo -e "${RED}❌ Failed to link project.${NC}"
    echo "Please check your project ID and database password."
    exit 1
fi
echo ""

# Step 4: Deploy Functions
echo "📤 Step 4: Deploying Edge Functions..."
echo ""

echo "Deploying send-whatsapp-verification..."
supabase functions deploy send-whatsapp-verification

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ send-whatsapp-verification deployed!${NC}"
else
    echo -e "${RED}❌ Failed to deploy send-whatsapp-verification${NC}"
    exit 1
fi
echo ""

echo "Deploying verify-whatsapp-code..."
supabase functions deploy verify-whatsapp-code

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ verify-whatsapp-code deployed!${NC}"
else
    echo -e "${RED}❌ Failed to deploy verify-whatsapp-code${NC}"
    exit 1
fi
echo ""

# Step 5: Check secrets
echo "🔐 Step 5: Checking WhatsApp API secrets..."
echo ""
echo "Current secrets:"
supabase secrets list
echo ""

echo -e "${YELLOW}⚠️  Make sure these secrets are set:${NC}"
echo "  - WHATSAPP_API_TOKEN"
echo "  - WHATSAPP_PHONE_NUMBER_ID"
echo "  - WHATSAPP_VERIFY_TOKEN"
echo ""
echo "If not set, run these commands:"
echo "  supabase secrets set WHATSAPP_API_TOKEN=your_token"
echo "  supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_id"
echo "  supabase secrets set WHATSAPP_VERIFY_TOKEN=your_verify_token"
echo ""

# Step 6: Verify deployment
echo "✅ Step 6: Verifying deployment..."
echo ""
echo "Deployed functions:"
supabase functions list
echo ""

# Step 7: Database reminder
echo "🗄️  Step 7: Database Table Setup"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: You still need to create the database table!${NC}"
echo ""
echo "Go to: https://supabase.com/dashboard/project/kkffwzvyfbkhhoxztsgn/sql"
echo ""
echo "And run the SQL from:"
echo "  /supabase/migrations/create_whatsapp_verifications_table.sql"
echo ""

# Final message
echo "=================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=================================="
echo ""
echo "Next steps:"
echo "  1. Create database table (see above)"
echo "  2. Ensure WhatsApp API secrets are set"
echo "  3. Test in your app: npm run dev"
echo ""
echo "To view logs:"
echo "  supabase functions logs send-whatsapp-verification"
echo "  supabase functions logs verify-whatsapp-code"
echo ""
echo "Happy coding! 🚀"
