# Quick Fix Commands - WhatsApp Verification Issue 🚀

## ⚡ Run These Commands in Order

### 1️⃣ Check Current Status
```bash
# Login to Supabase (if not already)
supabase login

# Link your project
supabase link --project-ref kkffwzvyfbkhhoxztsgn

# Check if secrets are set
supabase secrets list
```

**Expected Output:**
```
WHATSAPP_API_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_VERIFY_TOKEN
```

---

### 2️⃣ Check Edge Function Logs (MOST IMPORTANT!)
```bash
# See last 50 logs
supabase functions logs send-whatsapp-verification --limit 50
```

**Look for these errors:**
- ❌ `Invalid OAuth access token` → Token expired/wrong
- ❌ `Phone number not found` → Wrong Phone Number ID
- ❌ `Recipient not on WhatsApp` → Test number not added
- ❌ `WHATSAPP_API_TOKEN is not defined` → Secret not set
- ❌ `Database error` → Table missing or RLS issue

---

### 3️⃣ If Secrets Not Set Properly

**Option A: Set One by One**
```bash
# Replace with your ACTUAL values from Meta Developer Console
supabase secrets set WHATSAPP_API_TOKEN=EAAxxxxxxxxxxxxx
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=1234567890123456
supabase secrets set WHATSAPP_VERIFY_TOKEN=any_random_secure_string_here
```

**Option B: Use Environment File**
```bash
# Create .env.supabase file:
cat > .env.supabase << EOF
WHATSAPP_API_TOKEN=your_actual_token_from_meta
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=random_secure_string
EOF

# Set all at once
supabase secrets set --env-file .env.supabase
```

---

### 4️⃣ Verify Database Table
```bash
# Open SQL Editor
# Go to: https://supabase.com/dashboard/project/kkffwzvyfbkhhoxztsgn/sql
```

**Run this SQL:**
```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'whatsapp_verifications'
) as table_exists;

-- If FALSE, create table:
CREATE TABLE IF NOT EXISTS public.whatsapp_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_verifications_user_id 
ON public.whatsapp_verifications(user_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_verifications_phone_number 
ON public.whatsapp_verifications(phone_number);

ALTER TABLE public.whatsapp_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verifications" 
ON public.whatsapp_verifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verifications" 
ON public.whatsapp_verifications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verifications" 
ON public.whatsapp_verifications FOR UPDATE 
USING (auth.uid() = user_id);
```

---

### 5️⃣ Re-deploy Edge Function
```bash
# Deploy with latest code
supabase functions deploy send-whatsapp-verification

# Verify deployment
supabase functions list
```

**Expected Output:**
```
send-whatsapp-verification | deployed | <timestamp>
verify-whatsapp-code       | deployed | <timestamp>
```

---

### 6️⃣ Test WhatsApp API Directly

**Get your credentials from Meta Console:**
1. Go to: https://developers.facebook.com/apps
2. Select your app
3. WhatsApp → API Setup
4. Copy: Phone Number ID and Access Token

**Test API:**
```bash
# Replace YOUR_TOKEN and YOUR_PHONE_ID with actual values
curl -X POST \
  'https://graph.facebook.com/v21.0/YOUR_PHONE_ID/messages' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "messaging_product": "whatsapp",
    "to": "923163416117",
    "type": "text",
    "text": {
      "body": "Test from SubTrack Pro"
    }
  }'
```

**Success Response:**
```json
{
  "messaging_product": "whatsapp",
  "contacts": [{"input": "923163416117", "wa_id": "923163416117"}],
  "messages": [{"id": "wamid.HBgNOTIzMTYzNDE2MTE3FQIAERgSMEY1..."}]
}
```

**Error Response (Token Invalid):**
```json
{
  "error": {
    "message": "Invalid OAuth access token - Cannot parse access token",
    "type": "OAuthException",
    "code": 190
  }
}
```

---

### 7️⃣ Real-time Debugging

**Terminal 1:** Watch logs in real-time
```bash
supabase functions logs send-whatsapp-verification --follow
```

**Terminal 2 / Browser:** Try verification
1. Open app: http://localhost:5173
2. Go to Settings → WhatsApp
3. Enter phone number: +923163416117
4. Click "Send Code"

**Terminal 1** will show detailed logs!

---

## 🔍 Common Error Solutions

### Error: "Invalid OAuth access token"
```bash
# Token expired - generate new one
# 1. Go to Meta Developer Console
# 2. WhatsApp → API Setup → Generate Access Token
# 3. Copy new token
# 4. Update in Supabase:
supabase secrets set WHATSAPP_API_TOKEN=new_token_here

# 5. Redeploy function (required after secret change!)
supabase functions deploy send-whatsapp-verification
```

---

### Error: "Phone number not found" 
```bash
# Wrong Phone Number ID
# 1. Meta Console → WhatsApp → API Setup
# 2. Copy correct "Phone Number ID" (16 digits)
# 3. Update:
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=correct_id_here

# 4. Redeploy:
supabase functions deploy send-whatsapp-verification
```

---

### Error: "Recipient phone number not on WhatsApp"
```bash
# Add test number to Meta Console
# 1. Meta Console → WhatsApp → API Setup
# 2. Scroll to "To" field
# 3. Click "Manage phone number list"
# 4. Add: +923163416117
# 5. Verify via WhatsApp OTP
```

---

### Error: Database connection failed
```bash
# Check if table exists and RLS is correct
# Run in Supabase SQL Editor:

-- Disable RLS temporarily for testing
ALTER TABLE public.whatsapp_verifications DISABLE ROW LEVEL SECURITY;

-- Test again, then re-enable:
ALTER TABLE public.whatsapp_verifications ENABLE ROW LEVEL SECURITY;
```

---

## 📊 Step-by-Step Verification Checklist

Run each command and verify output:

```bash
# ✅ 1. Secrets exist
supabase secrets list
# Should show: WHATSAPP_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_VERIFY_TOKEN

# ✅ 2. Functions deployed
supabase functions list
# Should show: send-whatsapp-verification (deployed)

# ✅ 3. No recent errors
supabase functions logs send-whatsapp-verification --limit 10
# Should NOT show: "Invalid token" or "Phone not found"

# ✅ 4. WhatsApp API works
curl -X POST \
  'https://graph.facebook.com/v21.0/YOUR_PHONE_ID/messages' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"messaging_product": "whatsapp", "to": "923163416117", "type": "text", "text": {"body": "Test"}}'
# Should return: {"messages": [{"id": "wamid..."}]}
```

---

## 🎯 Most Likely Issue

Based on your error, **90% chance** it's one of these:

### Issue #1: Access Token Expired (MOST COMMON)
```bash
# WhatsApp temporary tokens expire in 24 hours
# Generate permanent token:

# 1. Meta Console → WhatsApp → Configuration
# 2. System Users → Create System User
# 3. Add Permissions → WhatsApp (Full Control)
# 4. Generate Token → Never Expires
# 5. Copy and set:
supabase secrets set WHATSAPP_API_TOKEN=permanent_token_here
supabase functions deploy send-whatsapp-verification
```

### Issue #2: Phone Number Not Added to Test Recipients
```bash
# For development, you must add recipient numbers
# 1. Meta Console → WhatsApp → API Setup
# 2. "Send and receive messages" section
# 3. Click "Manage phone number list"
# 4. Add +923163416117
# 5. Verify via OTP sent to WhatsApp
```

### Issue #3: Wrong Phone Number ID
```bash
# Using test phone number's ID instead of sender's
# 1. Meta Console → WhatsApp → API Setup
# 2. Find "From" section (not "To")
# 3. Copy the Phone Number ID below your business number
# 4. Update:
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=correct_sender_id
```

---

## 🚀 Complete Fresh Setup

If nothing works, start fresh:

```bash
# 1. Clear all secrets
supabase secrets unset WHATSAPP_API_TOKEN
supabase secrets unset WHATSAPP_PHONE_NUMBER_ID
supabase secrets unset WHATSAPP_VERIFY_TOKEN

# 2. Get fresh credentials from Meta Console
# Go to: https://developers.facebook.com/apps
# Your App → WhatsApp → API Setup

# 3. Set new secrets with CORRECT values
supabase secrets set WHATSAPP_API_TOKEN=EAAxxxxxxxxxx
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=1234567890123456
supabase secrets set WHATSAPP_VERIFY_TOKEN=my_secure_random_string_123

# 4. Verify they're set
supabase secrets list

# 5. Deploy functions
supabase functions deploy send-whatsapp-verification
supabase functions deploy verify-whatsapp-code

# 6. Test API directly first (before testing in app)
curl -X POST \
  'https://graph.facebook.com/v21.0/1234567890123456/messages' \
  -H 'Authorization: Bearer EAAxxxxxxxxxx' \
  -H 'Content-Type: application/json' \
  -d '{
    "messaging_product": "whatsapp",
    "to": "923163416117",
    "type": "text",
    "text": {"body": "Test message"}
  }'

# 7. If curl succeeds, then test in app
# If curl fails, credentials are wrong - fix them first!
```

---

## 📞 Get Help

If still not working, collect this info:

```bash
# 1. Edge function logs
supabase functions logs send-whatsapp-verification --limit 20 > logs.txt

# 2. Secrets list (redacted)
supabase secrets list > secrets.txt

# 3. cURL test result
curl -X POST 'https://graph.facebook.com/v21.0/YOUR_PHONE_ID/messages' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"messaging_product": "whatsapp", "to": "923163416117", "type": "text", "text": {"body": "Test"}}' \
  > curl_test.txt 2>&1

# Share: logs.txt, secrets.txt, curl_test.txt
```

---

**Pro Tip:** 99% of WhatsApp API issues are due to:
1. ❌ Expired/Invalid Access Token
2. ❌ Wrong Phone Number ID (using test number's ID instead of sender's)
3. ❌ Test recipient not added to allowed list
4. ❌ Secrets not properly set in Supabase

Fix these first! 🎯
