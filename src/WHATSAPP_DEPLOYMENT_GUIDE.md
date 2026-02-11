# WhatsApp Verification Deployment Guide

## 🎯 Overview
This guide will help you deploy and configure the WhatsApp verification system for SubTrack Pro.

---

## ✅ Prerequisites

Before you begin, ensure you have:
1. ✅ A Supabase project
2. ✅ A Facebook Business Account
3. ✅ A WhatsApp Business Account
4. ✅ Supabase CLI installed (`npm install -g supabase`)

---

## 📋 Step 1: Set Up WhatsApp Business API

### 1.1 Create WhatsApp Business Account

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add **WhatsApp** product to your app
4. Follow the setup wizard to:
   - Link your WhatsApp Business Account
   - Get a test phone number (or use your own verified number)
   - Get your **Phone Number ID**
   - Generate an **Access Token**

### 1.2 Get Your Credentials

You need three pieces of information:

```bash
WHATSAPP_API_TOKEN=<Your WhatsApp Access Token>
WHATSAPP_PHONE_NUMBER_ID=<Your Phone Number ID>
WHATSAPP_VERIFY_TOKEN=<Any random string you create>
```

**Where to find these:**

- **WHATSAPP_API_TOKEN**: 
  - Go to WhatsApp > Getting Started
  - Generate a temporary token OR create a permanent System User token
  - **Important**: Temporary tokens expire in 24 hours - use System User tokens for production

- **WHATSAPP_PHONE_NUMBER_ID**:
  - Go to WhatsApp > Getting Started
  - Look for "Phone number ID" under your test number

- **WHATSAPP_VERIFY_TOKEN**:
  - This is ANY random string you create (e.g., `my_secure_verify_token_123`)
  - Used for webhook verification

---

## 📋 Step 2: Set Environment Variables in Supabase

### 2.1 Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **Edge Functions** > **Manage Secrets**
3. Add these secrets:

```bash
WHATSAPP_API_TOKEN=your_actual_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_VERIFY_TOKEN=your_verify_token_here
```

### 2.2 Using Supabase CLI

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_ID

# Set the secrets
supabase secrets set WHATSAPP_API_TOKEN=your_actual_token_here
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
supabase secrets set WHATSAPP_VERIFY_TOKEN=your_verify_token_here
```

---

## 📋 Step 3: Deploy Edge Functions

### 3.1 Deploy the Functions

```bash
# Deploy send verification function
supabase functions deploy send-whatsapp-verification

# Deploy verify code function
supabase functions deploy verify-whatsapp-code
```

### 3.2 Verify Deployment

Check if functions are deployed:

```bash
supabase functions list
```

You should see:
- ✅ `send-whatsapp-verification`
- ✅ `verify-whatsapp-code`

---

## 📋 Step 4: Create Database Table

The table should already be created from the migration, but verify it exists:

```sql
-- Check if table exists
SELECT * FROM whatsapp_verifications LIMIT 1;
```

If the table doesn't exist, create it:

```sql
CREATE TABLE whatsapp_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  failed_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_whatsapp_verifications_user_id ON whatsapp_verifications(user_id);
CREATE INDEX idx_whatsapp_verifications_phone ON whatsapp_verifications(phone_number);
```

---

## 📋 Step 5: Test the System

### 5.1 Test from Frontend

1. Open your SubTrack Pro application
2. Navigate to Settings > WhatsApp Connection
3. Enter your phone number (with country code)
4. Click "Connect WhatsApp"
5. You should receive a 6-digit code on WhatsApp
6. Enter the code to verify

### 5.2 Test Using cURL

```bash
# Replace with your actual values
SUPABASE_URL="https://kkffwzvyfbkhhoxztsgn.supabase.co"
SUPABASE_ANON_KEY="your_anon_key_here"
PHONE_NUMBER="+1234567890"
USER_ID="test-user-123"

# Send verification code
curl -X POST \
  "${SUPABASE_URL}/functions/v1/send-whatsapp-verification" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"${PHONE_NUMBER}\",\"userId\":\"${USER_ID}\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Verification code sent successfully",
  "messageId": "wamid.xxx..."
}
```

### 5.3 Verify the Code

```bash
# Replace CODE with the 6-digit code you received
CODE="123456"

curl -X POST \
  "${SUPABASE_URL}/functions/v1/verify-whatsapp-code" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"${PHONE_NUMBER}\",\"verificationCode\":\"${CODE}\",\"userId\":\"${USER_ID}\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "WhatsApp number verified successfully",
  "phoneNumber": "+1234567890"
}
```

---

## 🔍 Troubleshooting

### Issue: "WhatsApp API credentials not configured in Supabase"

**Solution:**
- Verify secrets are set: `supabase secrets list`
- Redeploy functions after setting secrets
- Check secret names match exactly (case-sensitive)

### Issue: "Failed to send WhatsApp message"

**Possible causes:**

1. **Invalid Access Token**
   - Generate a new System User token (not temporary token)
   - Update the secret: `supabase secrets set WHATSAPP_API_TOKEN=new_token`

2. **Invalid Phone Number Format**
   - Must include country code (e.g., `+12345678900`)
   - No spaces, dashes, or parentheses
   - Valid format: `+[country_code][number]`

3. **Phone Number Not Opted In (Test Mode)**
   - In test mode, you can only send to verified numbers
   - Add test numbers in Facebook Developer Console
   - Go to WhatsApp > Configuration > Test Numbers

4. **Rate Limiting**
   - Check your WhatsApp Business Account limits
   - Free tier has message limits
   - Upgrade to Standard tier for production

### Issue: "Verification code not received"

**Check:**

1. **Phone number has WhatsApp installed**
   - The number must have an active WhatsApp account

2. **Number is not blocked**
   - The recipient hasn't blocked your WhatsApp Business number

3. **Check Supabase Logs**
   ```bash
   supabase functions logs send-whatsapp-verification
   ```

4. **Check WhatsApp Business Console**
   - Go to WhatsApp > Insights
   - Check message delivery status

---

## 🚀 Production Checklist

Before going live, ensure:

- [ ] Using System User Access Token (not temporary)
- [ ] WhatsApp Business Account verified
- [ ] Phone number verified and production-ready
- [ ] Message templates approved (if using templates)
- [ ] Rate limits understood and appropriate for your needs
- [ ] Database table has proper indexes
- [ ] Edge Functions deployed to production
- [ ] Secrets set in production environment
- [ ] Error monitoring set up
- [ ] Tested with multiple phone numbers
- [ ] Tested from different countries (if international)

---

## 📊 Monitoring

### Check Function Logs

```bash
# View logs for send verification
supabase functions logs send-whatsapp-verification --follow

# View logs for verify code
supabase functions logs verify-whatsapp-code --follow
```

### Monitor Database

```sql
-- Check verification attempts
SELECT 
  phone_number,
  verified,
  failed_attempts,
  created_at,
  expires_at
FROM whatsapp_verifications
ORDER BY created_at DESC
LIMIT 10;

-- Check verification success rate
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN verified THEN 1 END) as verified_count,
  ROUND(COUNT(CASE WHEN verified THEN 1 END)::NUMERIC / COUNT(*) * 100, 2) as success_rate
FROM whatsapp_verifications
WHERE created_at > NOW() - INTERVAL '24 hours';
```

---

## 🔐 Security Best Practices

1. **Never log verification codes in production**
   - Remove or comment out any `console.log(verificationCode)` statements

2. **Use short expiry times**
   - Default: 10 minutes
   - Consider 5 minutes for higher security

3. **Implement rate limiting**
   - Limit verification requests per phone number
   - Limit requests per IP address

4. **Monitor for abuse**
   - Track failed attempts
   - Alert on suspicious patterns

5. **Rotate tokens regularly**
   - Update WhatsApp Access Token periodically
   - Use System User tokens with expiration policies

---

## 📞 Support

If you encounter issues:

1. Check the [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
2. Review Supabase Edge Function logs
3. Check your WhatsApp Business Console for message status
4. Verify all environment variables are set correctly

---

## 🎉 Success!

Once everything is working:
- Users can verify their WhatsApp numbers
- Codes are sent directly to WhatsApp
- Verification is stored in Supabase for later confirmation
- The system is ready for production use!

---

**Last Updated:** January 30, 2026
