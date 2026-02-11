# 🔧 WhatsApp Error Fix Guide

## ❌ Error: "Failed to send verification code via WhatsApp"

### 🎯 Ye Error Kyun Aa Raha Hai?

Is error ka matlab hai ki:
- ✅ Edge Functions deploy ho gaye hain
- ✅ Code reach ho raha hai Edge Function tak
- ❌ **WhatsApp API call fail ho rahi hai**

---

## 🔍 Possible Reasons & Solutions

### 1️⃣ Database Table Missing

**Check karein:**
```bash
# Supabase CLI se check karein
supabase db remote list
```

**Solution: Create the table**

Go to: https://supabase.com/dashboard/project/kkffwzvyfbkhhoxztsgn/sql

Run this SQL:

```sql
-- Create whatsapp_verifications table
CREATE TABLE IF NOT EXISTS public.whatsapp_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    verification_code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    failed_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_verification UNIQUE (user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_verifications_user_id 
    ON public.whatsapp_verifications(user_id);
    
CREATE INDEX IF NOT EXISTS idx_whatsapp_verifications_phone 
    ON public.whatsapp_verifications(phone_number);
    
CREATE INDEX IF NOT EXISTS idx_whatsapp_verifications_expires 
    ON public.whatsapp_verifications(expires_at);

-- Enable RLS
ALTER TABLE public.whatsapp_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own verifications" ON public.whatsapp_verifications;
DROP POLICY IF EXISTS "Users can create own verifications" ON public.whatsapp_verifications;
DROP POLICY IF EXISTS "Users can update own verifications" ON public.whatsapp_verifications;

-- Create policies
CREATE POLICY "Users can view own verifications"
    ON public.whatsapp_verifications FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own verifications"
    ON public.whatsapp_verifications FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own verifications"
    ON public.whatsapp_verifications FOR UPDATE
    USING (auth.uid()::text = user_id);

-- Create policy for service role
CREATE POLICY "Service role has full access"
    ON public.whatsapp_verifications FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.whatsapp_verifications TO service_role;
GRANT ALL ON public.whatsapp_verifications TO authenticated;
GRANT SELECT ON public.whatsapp_verifications TO anon;
```

---

### 2️⃣ WhatsApp API Credentials Invalid/Missing

**Check karein:**
```bash
supabase secrets list
```

**Should show:**
- WHATSAPP_API_TOKEN
- WHATSAPP_PHONE_NUMBER_ID
- WHATSAPP_VERIFY_TOKEN

**Problem?: Re-set karein:**

```bash
# Delete old secrets
supabase secrets unset WHATSAPP_API_TOKEN
supabase secrets unset WHATSAPP_PHONE_NUMBER_ID
supabase secrets unset WHATSAPP_VERIFY_TOKEN

# Set new ones (replace with your actual values)
supabase secrets set WHATSAPP_API_TOKEN=EAAKjvoZxxxxx
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=123456789012345
supabase secrets set WHATSAPP_VERIFY_TOKEN=your_verify_token_123
```

**After setting secrets, REDEPLOY:**
```bash
supabase functions deploy send-whatsapp-verification
```

---

### 3️⃣ Phone Number Format Wrong

WhatsApp requires phone numbers in international format WITHOUT spaces or special characters:

**❌ Wrong formats:**
- `03001234567` (missing country code)
- `+92 300 1234567` (has spaces)
- `+92-300-1234567` (has dashes)

**✅ Correct format:**
- `923001234567` (just digits with country code)

**Auto-fix: I've updated the code to handle this**

---

### 4️⃣ WhatsApp Business Number Not Verified

Your WhatsApp Business number needs to be:
- ✅ Verified with Meta
- ✅ Has messaging permission
- ✅ Not restricted

**Check here:**
https://business.facebook.com/wa/manage/phone-numbers/

---

### 5️⃣ WhatsApp API Template Not Approved

**I've fixed this!** The updated Edge Function now sends **simple text messages** instead of templates (no approval needed).

---

## 🚀 Complete Fix Steps

### Step 1: Re-deploy Updated Edge Function

```bash
# I've updated the code to be more robust
# Re-deploy it:
supabase functions deploy send-whatsapp-verification
```

**What's new in updated function:**
- ✅ Better error logging
- ✅ Sends simple text (no template needed)
- ✅ More detailed error messages
- ✅ Better credential checking

---

### Step 2: Check Function Logs

```bash
# View real-time logs
supabase functions logs send-whatsapp-verification --limit 50
```

**Look for:**
- "Missing credentials" → Secrets not set
- "Database error" → Table not created
- "WhatsApp API Error" → Check credentials/phone number

---

### Step 3: Test Again

1. Go to Settings page
2. Enter phone number (format: +923001234567)
3. Click "Connect WhatsApp"
4. Check logs immediately:
   ```bash
   supabase functions logs send-whatsapp-verification --limit 10
   ```

---

## 🐛 Advanced Debugging

### Method 1: Test Edge Function Directly

```bash
# Replace with your actual token
curl -X POST \
  https://kkffwzvyfbkhhoxztsgn.supabase.co/functions/v1/send-whatsapp-verification \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZmZ3enZ5ZmJraGhveHp0c2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjA4MDEsImV4cCI6MjA3NzQ5NjgwMX0.pJtQlX6dF7j8kAniWPDUNkT_MQfrJluvwacNKFqlfCQ" \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZmZ3enZ5ZmJraGhveHp0c2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjA4MDEsImV4cCI6MjA3NzQ5NjgwMX0.pJtQlX6dF7j8kAniWPDUNkT_MQfrJluvwacNKFqlfCQ" \
  -d '{"phoneNumber": "923001234567", "userId": "test-123"}' \
  --verbose
```

**Good response:**
```json
{
  "success": true,
  "message": "Verification code sent successfully"
}
```

**Error response will show exact problem**

---

### Method 2: Check Database

```bash
# Connect to Supabase
supabase db remote connect

# Check if table exists
\dt whatsapp_verifications

# See records
SELECT * FROM whatsapp_verifications ORDER BY created_at DESC LIMIT 5;

# Exit
\q
```

---

### Method 3: Test WhatsApp API Directly

```bash
# Test your WhatsApp credentials (replace values)
curl -X POST \
  https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "923001234567",
    "type": "text",
    "text": {
      "body": "Test message from SubTrack Pro"
    }
  }'
```

**If this fails, your WhatsApp credentials are the problem**

---

## 📋 Troubleshooting Checklist

Go through this checklist:

- [ ] **Database table created?**
  - Go to Supabase Dashboard → Table Editor
  - `whatsapp_verifications` should exist

- [ ] **Secrets set correctly?**
  ```bash
  supabase secrets list
  ```

- [ ] **Edge Function redeployed after fixes?**
  ```bash
  supabase functions deploy send-whatsapp-verification
  ```

- [ ] **Phone number format correct?**
  - Use: `923001234567` (no +, no spaces)

- [ ] **WhatsApp Business number active?**
  - Check Meta Business Manager

- [ ] **Check logs for specific error?**
  ```bash
  supabase functions logs send-whatsapp-verification
  ```

---

## 🎯 Most Common Solutions

### 90% of times, it's ONE of these:

1. **Database table missing** → Run SQL migration
2. **Secrets not set** → Set secrets and redeploy
3. **Wrong phone format** → Use 923001234567 format
4. **WhatsApp token expired** → Get new token from Meta

---

## 📞 Quick Fix Commands

```bash
# 1. Check current status
supabase functions list
supabase secrets list

# 2. Redeploy with updated code
supabase functions deploy send-whatsapp-verification

# 3. Check logs immediately
supabase functions logs send-whatsapp-verification --limit 20

# 4. Test in app
# Go to Settings → WhatsApp → Try again

# 5. If still failing, test directly
curl -X POST https://kkffwzvyfbkhhoxztsgn.supabase.co/functions/v1/send-whatsapp-verification \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "923001234567", "userId": "test"}'
```

---

## 💡 What I Fixed

1. **Removed WhatsApp template requirement** (no approval needed now)
2. **Added better error logging**
3. **Added detailed error messages**
4. **Better credential validation**
5. **Improved phone number handling**

Now the function will give you **exact error messages** instead of generic "failed to send" error.

---

## ✅ Expected Output After Fix

### In Function Logs:
```
Processing verification for: 923001234567
Verification code stored in database
Sending WhatsApp message to: 923001234567
WhatsApp API response: 200 { messages: [...] }
Verification code sent successfully
```

### In App:
```
✅ Verification code sent! Check your WhatsApp.
```

---

## 🆘 Still Not Working?

Share the **exact error** from:
```bash
supabase functions logs send-whatsapp-verification --limit 20
```

The new error messages will be much more specific!

---

**Next Steps:**
1. Redeploy function: `supabase functions deploy send-whatsapp-verification`
2. Create database table (SQL above)
3. Check logs: `supabase functions logs send-whatsapp-verification`
4. Try again in app
