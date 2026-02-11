# WhatsApp Verification Troubleshooting Guide 🔧

## Issue: "Failed to send verification code via WhatsApp"

Agar aapko ye error aa raha hai, toh is step-by-step guide ko follow karein.

---

## 📋 Step 1: Edge Function Logs Check Karein

### Option A: Supabase Dashboard se
```bash
1. Supabase Dashboard kholen: https://supabase.com/dashboard/project/kkffwzvyfbkhhoxztsgn
2. Left sidebar se "Edge Functions" pe click karein
3. "send-whatsapp-verification" function pe click karein
4. "Logs" tab kholen
5. Recent errors dekhen
```

### Option B: CLI se (Recommended)
```bash
# Real-time logs dekhen
supabase functions serve send-whatsapp-verification --debug

# Ya phir deployed function ke logs
supabase functions logs send-whatsapp-verification --limit 50
```

---

## 📋 Step 2: Secrets Verify Karein

### 2.1 Check Existing Secrets
```bash
# Supabase project link karein (agar nahi kiya toh)
supabase link --project-ref kkffwzvyfbkhhoxztsgn

# Secrets list karein
supabase secrets list
```

**Expected Output:**
```
WHATSAPP_API_TOKEN
WHATSAPP_PHONE_NUMBER_ID  
WHATSAPP_VERIFY_TOKEN
```

### 2.2 Set Secrets (Agar Missing Hain)
```bash
# Set karne se pehle, aapke WhatsApp Business API credentials chahiye

# Option 1: Interactive
supabase secrets set WHATSAPP_API_TOKEN=your_actual_token
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_actual_phone_id
supabase secrets set WHATSAPP_VERIFY_TOKEN=your_verify_token

# Option 2: From .env file
supabase secrets set --env-file .env.local
```

**⚠️ Important:** Placeholder values se kaam nahi chalega! Real API credentials chahiye.

---

## 📋 Step 3: WhatsApp API Credentials Verify Karein

### 3.1 Meta Developer Console Check
```bash
1. Meta for Developers open karein: https://developers.facebook.com/
2. Your app select karein
3. "WhatsApp" → "API Setup" pe jaayen
4. Verify karein:
   ✅ Phone Number ID (16-digit number)
   ✅ Access Token (starts with "EAA...")
   ✅ Business Account verified hai
```

### 3.2 Test API Connection
```bash
# Terminal se test karein (replace YOUR_TOKEN and YOUR_PHONE_ID)
curl -X POST \
  'https://graph.facebook.com/v21.0/YOUR_PHONE_ID/messages' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "messaging_product": "whatsapp",
    "to": "923163416117",
    "type": "text",
    "text": {
      "body": "Test message from SubTrack"
    }
  }'
```

**Expected Response (Success):**
```json
{
  "messaging_product": "whatsapp",
  "contacts": [{"input": "923163416117", "wa_id": "923163416117"}],
  "messages": [{"id": "wamid.xxx"}]
}
```

**Error Response Examples:**
```json
// Invalid token
{"error": {"message": "Invalid OAuth access token"}}

// Invalid phone number ID
{"error": {"message": "Phone number not found"}}

// Number not registered
{"error": {"message": "Recipient phone number not on WhatsApp"}}
```

---

## 📋 Step 4: Database Table Check Karein

### 4.1 Supabase SQL Editor se
```bash
1. Dashboard kholen: https://supabase.com/dashboard/project/kkffwzvyfbkhhoxztsgn/sql
2. New query run karein:
```

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'whatsapp_verifications'
);

-- If exists, check structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'whatsapp_verifications';

-- Check recent entries
SELECT * FROM whatsapp_verifications 
ORDER BY created_at DESC 
LIMIT 10;
```

### 4.2 Create Table (Agar Nahi Hai)
```sql
-- Run this SQL in Supabase SQL Editor

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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_verifications_user_id 
ON public.whatsapp_verifications(user_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_verifications_phone_number 
ON public.whatsapp_verifications(phone_number);

-- Enable RLS
ALTER TABLE public.whatsapp_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own verifications" 
ON public.whatsapp_verifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verifications" 
ON public.whatsapp_verifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verifications" 
ON public.whatsapp_verifications 
FOR UPDATE 
USING (auth.uid() = user_id);
```

---

## 📋 Step 5: Edge Function Re-deploy Karein

```bash
# Fresh deployment with latest code
supabase functions deploy send-whatsapp-verification --no-verify-jwt

# Check deployment status
supabase functions list
```

---

## 📋 Step 6: Frontend Code Check Karein

### 6.1 Check Edge Function URL
Open `/utils/whatsappVerification.ts` and verify:

```typescript
const { data, error } = await supabase.functions.invoke('send-whatsapp-verification', {
  body: { phoneNumber: formattedNumber }
});
```

### 6.2 Check Phone Number Format
```typescript
// Should be in E.164 format: +923163416117
// Not: 923163416117 or 03163416117
```

---

## 📋 Step 7: Common Issues & Solutions

### Issue 1: "Invalid OAuth access token"
**Solution:**
```bash
# Token expired hai, new token generate karein
1. Meta Developer Console → WhatsApp → API Setup
2. "Generate Access Token" click karein
3. New token copy karein
4. Supabase me set karein:
supabase secrets set WHATSAPP_API_TOKEN=new_token_here
```

### Issue 2: "Phone number not found"
**Solution:**
```bash
# Phone Number ID wrong hai
1. Meta Console me correct Phone Number ID copy karein
2. Update karein:
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=correct_id_here
```

### Issue 3: "Recipient phone number not on WhatsApp"
**Solution:**
```bash
# Number WhatsApp pe registered nahi hai
1. Verify karein number WhatsApp pe active hai
2. Format check karein: +923163416117 (country code ke saath)
3. Test number use karein (Meta Console se add kiya hua)
```

### Issue 4: Rate Limiting
**Solution:**
```bash
# Too many requests bheje hain
1. 1-2 minute wait karein
2. Phir dobara try karein
3. Edge function logs check karein for rate limit errors
```

### Issue 5: Database Connection Error
**Solution:**
```bash
# Supabase database not accessible
1. Check Supabase project status (dashboard)
2. Verify database is running
3. Check RLS policies (might be blocking)
```

---

## 📋 Step 8: End-to-End Test

### 8.1 Manual Test with cURL
```bash
# Get your Supabase anon key from dashboard
export SUPABASE_ANON_KEY="your-anon-key"
export USER_TOKEN="your-user-jwt-token"

# Call edge function directly
curl -X POST \
  'https://kkffwzvyfbkhhoxztsgn.supabase.co/functions/v1/send-whatsapp-verification' \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+923163416117"
  }'
```

### 8.2 Check Response
**Success Response:**
```json
{
  "success": true,
  "message": "Verification code sent via WhatsApp"
}
```

**Error Response:**
```json
{
  "error": "Failed to send verification code",
  "details": "Detailed error message"
}
```

---

## 📋 Step 9: Enable Debug Logging

### Update Edge Function for Better Logs

Edit `/supabase/functions/send-whatsapp-verification/index.ts`:

```typescript
console.log('=== WhatsApp Verification Request ===');
console.log('Phone Number:', phoneNumber);
console.log('User ID:', user.id);
console.log('Has API Token:', !!WHATSAPP_API_TOKEN);
console.log('Has Phone ID:', !!WHATSAPP_PHONE_NUMBER_ID);
console.log('API Token length:', WHATSAPP_API_TOKEN?.length);
console.log('Phone Number ID:', WHATSAPP_PHONE_NUMBER_ID);
```

Then redeploy:
```bash
supabase functions deploy send-whatsapp-verification
```

---

## 📋 Step 10: Quick Checklist

Before testing again, verify:

- [ ] Supabase secrets set properly (`supabase secrets list`)
- [ ] WhatsApp API credentials valid (test with cURL)
- [ ] Database table exists and has correct schema
- [ ] Edge function deployed successfully
- [ ] Phone number in correct format (+923163416117)
- [ ] User is authenticated (has valid JWT)
- [ ] No rate limiting (wait 1-2 minutes between tests)
- [ ] Edge function logs checked for detailed errors

---

## 🆘 Still Not Working?

### Get Detailed Logs

```bash
# Terminal 1: Watch edge function logs
supabase functions logs send-whatsapp-verification --follow

# Terminal 2: Test from app
# Click "Connect WhatsApp" and enter number

# Terminal 1 me detailed error dikhega
```

### Share These Details:

1. **Edge Function Logs:**
   ```bash
   supabase functions logs send-whatsapp-verification --limit 20
   ```

2. **Secrets Status:**
   ```bash
   supabase secrets list
   ```

3. **Database Check:**
   ```sql
   SELECT * FROM whatsapp_verifications 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

4. **Network Request (Browser DevTools):**
   - Open DevTools → Network tab
   - Try verification
   - Check request/response for `send-whatsapp-verification`

---

## 📞 WhatsApp Business API Setup (From Scratch)

Agar aapke paas WhatsApp credentials nahi hain:

### Step 1: Create Meta Developer Account
```
1. Go to: https://developers.facebook.com/
2. Create account / Login
3. Click "My Apps" → "Create App"
4. Select "Business" type
5. Fill app details
```

### Step 2: Add WhatsApp Product
```
1. Dashboard → Your App → "Add Product"
2. Select "WhatsApp" → "Set Up"
3. Create/Select Business Account
4. Complete verification
```

### Step 3: Get Test Credentials
```
1. WhatsApp → Getting Started
2. Note down:
   - Temporary Access Token (valid 24h)
   - Phone Number ID
3. Add test recipients (your number)
```

### Step 4: Generate Permanent Token
```
1. WhatsApp → Configuration → "System User"
2. Create system user
3. Generate permanent token
4. Save token securely
```

### Step 5: Set in Supabase
```bash
supabase secrets set WHATSAPP_API_TOKEN=your_permanent_token
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_phone_id
supabase secrets set WHATSAPP_VERIFY_TOKEN=any_random_string
```

---

## 🎯 Expected Flow (When Everything Works)

1. User enters phone number: `+923163416117`
2. Frontend calls Edge Function
3. Edge Function:
   - Validates user authentication
   - Generates 6-digit code (e.g., 123456)
   - Saves to database
   - Calls WhatsApp API
   - Sends message: "Your SubTrack verification code is: 123456"
4. User receives WhatsApp message
5. User enters code in app
6. Code verified against database
7. WhatsApp connected! ✅

---

## 📝 Quick Commands Reference

```bash
# Login & Link
supabase login
supabase link --project-ref kkffwzvyfbkhhoxztsgn

# Set Secrets
supabase secrets set WHATSAPP_API_TOKEN=your_token
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_phone_id
supabase secrets set WHATSAPP_VERIFY_TOKEN=random_string

# Deploy Functions
supabase functions deploy send-whatsapp-verification
supabase functions deploy verify-whatsapp-code

# Check Logs
supabase functions logs send-whatsapp-verification --limit 50
supabase functions logs send-whatsapp-verification --follow

# List Everything
supabase secrets list
supabase functions list
```

---

## 🔍 Debugging Tips

### 1. Console Logs
Browser console me ye dikhna chahiye:
```
Sending verification to: +923163416117
✅ Verification sent successfully
```

### 2. Network Tab
DevTools → Network → Filter "send-whatsapp":
- Status: 200 OK
- Response: `{"success": true}`

### 3. Edge Function Logs
```
Received verification request
Phone number: +923163416117
Code generated: 123456
WhatsApp API response: 200 OK
Message sent successfully
```

### 4. Database Entry
```sql
SELECT * FROM whatsapp_verifications 
WHERE phone_number = '+923163416117' 
ORDER BY created_at DESC LIMIT 1;
```

Should show recent entry with code and expiry.

---

## ✅ Success Indicators

Sab kuch sahi hai agar:

1. ✅ Edge function logs me "Message sent successfully"
2. ✅ Database me new entry create hui
3. ✅ WhatsApp pe message aya
4. ✅ Browser console me no errors
5. ✅ Network request 200 OK

---

**Last Updated:** January 2026  
**SubTrack Pro Version:** 1.0  
**Supabase Project:** kkffwzvyfbkhhoxztsgn

---

**Need More Help?**
- Check Supabase Dashboard Logs
- Check Meta for Developers Console
- Review Edge Function Code
- Test WhatsApp API directly with cURL
