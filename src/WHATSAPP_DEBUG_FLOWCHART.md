# WhatsApp Verification Debug Flowchart 🔍

```
START: User clicks "Send Verification Code"
│
├─> Frontend sends request to Edge Function
│   │
│   └─> Check Browser Console
│       ├─> ❌ Error: "Network Error"
│       │   └─> FIX: Check internet connection
│       │       Check Supabase project is running
│       │
│       ├─> ❌ Error: "Unauthorized"
│       │   └─> FIX: User not logged in
│       │       Refresh auth token
│       │
│       └─> ✅ Request sent successfully
│           │
│           ├─> Check Edge Function Logs
│           │   Command: supabase functions logs send-whatsapp-verification --limit 10
│           │   │
│           │   ├─> ❌ "WHATSAPP_API_TOKEN is not defined"
│           │   │   └─> FIX:
│           │   │       supabase secrets set WHATSAPP_API_TOKEN=your_token
│           │   │       supabase functions deploy send-whatsapp-verification
│           │   │
│           │   ├─> ❌ "Invalid OAuth access token"
│           │   │   └─> FIX:
│           │   │       1. Go to Meta Developer Console
│           │   │       2. Generate new permanent token
│           │   │       3. supabase secrets set WHATSAPP_API_TOKEN=new_token
│           │   │       4. supabase functions deploy send-whatsapp-verification
│           │   │
│           │   ├─> ❌ "Phone number not found"
│           │   │   └─> FIX:
│           │   │       1. Meta Console → WhatsApp → API Setup
│           │   │       2. Copy correct Phone Number ID (from "From" section)
│           │   │       3. supabase secrets set WHATSAPP_PHONE_NUMBER_ID=correct_id
│           │   │       4. supabase functions deploy send-whatsapp-verification
│           │   │
│           │   ├─> ❌ "Recipient phone number not on WhatsApp"
│           │   │   └─> FIX:
│           │   │       1. Meta Console → WhatsApp → API Setup
│           │   │       2. Click "Manage phone number list"
│           │   │       3. Add +923163416117
│           │   │       4. Verify via WhatsApp OTP
│           │   │
│           │   ├─> ❌ "Rate limit exceeded"
│           │   │   └─> FIX:
│           │   │       Wait 2-5 minutes
│           │   │       Try again
│           │   │       Check Meta Console for limits
│           │   │
│           │   ├─> ❌ "Database error"
│           │   │   └─> FIX:
│           │   │       1. Check if table exists:
│           │   │          SELECT * FROM whatsapp_verifications LIMIT 1;
│           │   │       2. If not exists, create table (see SQL below)
│           │   │       3. Check RLS policies
│           │   │
│           │   └─> ✅ "Message sent successfully"
│           │       │
│           │       ├─> Check WhatsApp
│           │       │   │
│           │       │   ├─> ❌ No message received
│           │       │   │   └─> Possible causes:
│           │       │   │       - Phone not on WhatsApp
│           │       │   │       - Wrong phone number format
│           │       │   │       - WhatsApp blocked the sender
│           │       │   │       - Network delay (wait 1-2 minutes)
│           │       │   │
│           │       │   └─> ✅ Message received!
│           │       │       │
│           │       │       └─> Enter verification code
│           │       │           │
│           │       │           ├─> ❌ "Invalid code"
│           │       │           │   └─> Check:
│           │       │           │       - Code expired (10 min limit)
│           │       │           │       - Typed wrong code
│           │       │           │       - Database not updated
│           │       │           │
│           │       │           └─> ✅ Code verified!
│           │       │               │
│           │       │               └─> SUCCESS! WhatsApp Connected ✅
│           │       │
│           │       └─> Check Database
│           │           Command: SELECT * FROM whatsapp_verifications 
│           │                    WHERE phone_number = '+923163416117' 
│           │                    ORDER BY created_at DESC LIMIT 1;
│           │           │
│           │           ├─> ❌ No entry found
│           │           │   └─> FIX:
│           │           │       - Check RLS policies
│           │           │       - Check user authentication
│           │           │       - Review edge function code
│           │           │
│           │           └─> ✅ Entry created
│           │               Fields:
│           │               - verification_code: "123456"
│           │               - expires_at: <timestamp>
│           │               - verified: false
│           │
│           └─> Check Network Tab (Browser DevTools)
│               │
│               ├─> Status: 500 Internal Server Error
│               │   └─> Check edge function logs (error in function)
│               │
│               ├─> Status: 401 Unauthorized
│               │   └─> User token expired/invalid
│               │
│               ├─> Status: 400 Bad Request
│               │   └─> Invalid phone number format
│               │       Should be: +923163416117
│               │
│               └─> Status: 200 OK
│                   Response: {"success": true, "message": "..."}
│                   └─> Check WhatsApp for message
│
└─> END
```

---

## 🎯 Quick Diagnostic Commands

### 1. Check Everything at Once
```bash
echo "=== Supabase Secrets ==="
supabase secrets list
echo ""

echo "=== Edge Functions ==="
supabase functions list
echo ""

echo "=== Recent Logs ==="
supabase functions logs send-whatsapp-verification --limit 5
echo ""

echo "=== Database Check ==="
# Run in Supabase SQL Editor:
# SELECT COUNT(*) FROM whatsapp_verifications;
```

---

## 🔧 Most Common Fix (90% Success Rate)

```bash
# This fixes most issues:

# 1. Get fresh token from Meta Console (valid permanently)
# https://developers.facebook.com/apps → Your App → WhatsApp → Configuration
# Create System User → Generate Token

# 2. Get correct Phone Number ID
# WhatsApp → API Setup → Look at "From" field

# 3. Set both secrets
supabase secrets set WHATSAPP_API_TOKEN=your_permanent_token
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id

# 4. Deploy function
supabase functions deploy send-whatsapp-verification

# 5. Test with cURL first (before testing in app)
curl -X POST \
  'https://graph.facebook.com/v21.0/YOUR_PHONE_ID/messages' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"messaging_product": "whatsapp", "to": "923163416117", "type": "text", "text": {"body": "Test"}}'

# If cURL works → App will work
# If cURL fails → Fix credentials first!
```

---

## 📊 Error Code Reference

| Error Code | Meaning | Fix |
|------------|---------|-----|
| 190 | Invalid OAuth token | Generate new token |
| 100 | Invalid parameter | Check phone number format |
| 368 | Temporarily blocked | Wait or verify business |
| 131031 | Recipient not on WhatsApp | Add to test recipients |
| 80007 | Rate limit exceeded | Wait 5 minutes |
| 33 | Phone number not found | Check Phone Number ID |

---

## 🧪 Test Sequence (Run in Order)

```bash
# Test 1: Secrets exist
supabase secrets list
# ✅ PASS: Shows 3 secrets
# ❌ FAIL: Missing secrets → Set them

# Test 2: Function deployed
supabase functions list | grep send-whatsapp-verification
# ✅ PASS: Shows "deployed"
# ❌ FAIL: Not found → Deploy it

# Test 3: WhatsApp API works
curl -X POST \
  'https://graph.facebook.com/v21.0/YOUR_PHONE_ID/messages' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"messaging_product": "whatsapp", "to": "923163416117", "type": "text", "text": {"body": "Test"}}'
# ✅ PASS: Returns message ID
# ❌ FAIL: Error → Fix credentials

# Test 4: Database table exists
# Run in Supabase SQL Editor:
SELECT COUNT(*) FROM whatsapp_verifications;
# ✅ PASS: Returns number (even 0)
# ❌ FAIL: Table doesn't exist → Create it

# Test 5: App test
# Open app → Settings → WhatsApp → Enter +923163416117
# ✅ PASS: Message received on WhatsApp
# ❌ FAIL: Check edge function logs
```

---

## 🚨 Emergency Reset (Nuclear Option)

If NOTHING works:

```bash
# 1. Delete all secrets
supabase secrets unset WHATSAPP_API_TOKEN
supabase secrets unset WHATSAPP_PHONE_NUMBER_ID
supabase secrets unset WHATSAPP_VERIFY_TOKEN

# 2. Delete and recreate functions
supabase functions delete send-whatsapp-verification
supabase functions delete verify-whatsapp-code

# 3. Deploy fresh
supabase functions deploy send-whatsapp-verification
supabase functions deploy verify-whatsapp-code

# 4. Get FRESH credentials from Meta
# Don't use old ones!

# 5. Set secrets
supabase secrets set WHATSAPP_API_TOKEN=fresh_token
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=fresh_id
supabase secrets set WHATSAPP_VERIFY_TOKEN=new_random_string

# 6. Redeploy
supabase functions deploy send-whatsapp-verification

# 7. Test with cURL
curl -X POST \
  'https://graph.facebook.com/v21.0/YOUR_PHONE_ID/messages' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"messaging_product": "whatsapp", "to": "923163416117", "type": "text", "text": {"body": "Reset test"}}'
```

---

## 📋 SQL: Create Database Table

```sql
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/kkffwzvyfbkhhoxztsgn/sql

-- Create table
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_verifications_user_id 
ON public.whatsapp_verifications(user_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_verifications_phone_number 
ON public.whatsapp_verifications(phone_number);

-- Enable RLS
ALTER TABLE public.whatsapp_verifications ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own verifications" ON public.whatsapp_verifications;
CREATE POLICY "Users can view their own verifications" 
ON public.whatsapp_verifications FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own verifications" ON public.whatsapp_verifications;
CREATE POLICY "Users can create their own verifications" 
ON public.whatsapp_verifications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own verifications" ON public.whatsapp_verifications;
CREATE POLICY "Users can update their own verifications" 
ON public.whatsapp_verifications FOR UPDATE 
USING (auth.uid() = user_id);

-- Verify
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'whatsapp_verifications') as column_count,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'whatsapp_verifications') as index_count
FROM information_schema.tables 
WHERE table_name = 'whatsapp_verifications';
```

---

## ✅ Success Checklist

Before testing in app, verify:

- [ ] `supabase secrets list` shows all 3 secrets
- [ ] `supabase functions list` shows function deployed
- [ ] cURL test returns message ID (not error)
- [ ] Database table exists (SELECT query works)
- [ ] RLS policies created
- [ ] Test phone number added to Meta Console
- [ ] Access token is permanent (not temporary)
- [ ] Phone Number ID is from sender (not recipient)

**If all ✅, app will work!**

---

## 🎬 Video Walkthrough Steps

1. **Open Terminal** → Run: `supabase link --project-ref kkffwzvyfbkhhoxztsgn`

2. **Open Meta Console** → Get fresh token & phone ID

3. **Set Secrets** → `supabase secrets set ...`

4. **Deploy Function** → `supabase functions deploy ...`

5. **Test cURL** → Verify API works

6. **Open App** → Settings → WhatsApp → Test

7. **Check Logs** → `supabase functions logs ... --follow`

8. **Success!** → Receive message on WhatsApp

---

**Remember:** Test with cURL FIRST before testing in app!  
If cURL fails, app will fail too. Fix cURL first! 🎯
