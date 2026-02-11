# WhatsApp Verification Setup Guide

## 🎯 Overview
Complete WhatsApp verification system using Supabase Edge Functions and Meta WhatsApp Business API.

## ✅ What's Implemented

### 1. **Supabase Edge Functions**
- `/supabase/functions/send-whatsapp-verification/index.ts` - Sends verification code via WhatsApp
- `/supabase/functions/verify-whatsapp-code/index.ts` - Verifies the 6-digit code

### 2. **Frontend Components**
- `/components/WhatsAppConnection.tsx` - Full UI with country code selector and verification flow
- `/contexts/SettingsContext.tsx` - Context integration for WhatsApp settings
- `/utils/whatsappVerification.ts` - Utility functions for API calls

### 3. **Database**
- `/supabase/migrations/create_whatsapp_verifications_table.sql` - Table for storing verification codes

## 📋 Setup Instructions

### Step 1: Deploy Supabase Edge Functions

```bash
# Navigate to your project directory
cd your-project

# Login to Supabase CLI
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy the functions
supabase functions deploy send-whatsapp-verification
supabase functions deploy verify-whatsapp-code

# Set environment secrets
supabase secrets set WHATSAPP_API_TOKEN=your_whatsapp_api_token
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
supabase secrets set WHATSAPP_VERIFY_TOKEN=your_verify_token
```

### Step 2: Create Database Table

Run the migration SQL in your Supabase dashboard:

1. Go to **SQL Editor** in Supabase Dashboard
2. Paste the contents of `/supabase/migrations/create_whatsapp_verifications_table.sql`
3. Click **Run**

Or via CLI:
```bash
supabase db push
```

### Step 3: Update Environment Variables

Create or update `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 4: WhatsApp Business API Setup

#### Option A: Using Meta WhatsApp Business Platform

1. **Create Facebook Business Account**
   - Go to https://business.facebook.com
   - Create or select a business account

2. **Setup WhatsApp Business API**
   - Visit https://developers.facebook.com
   - Create a new app or select existing
   - Add WhatsApp product
   - Complete business verification

3. **Get Credentials**
   - Phone Number ID: Found in WhatsApp > Getting Started
   - API Token: Generate in WhatsApp > Getting Started
   - Note: Test numbers have limitations, verify business for production

4. **Create Message Template** (Required for first message)
   - Go to WhatsApp > Message Templates
   - Create template named `verification_code`
   - Category: Authentication
   - Language: English
   - Content:
     ```
     Your SubTrack Pro verification code is: {{1}}
     
     This code will expire in 10 minutes.
     
     Do not share this code with anyone.
     ```
   - Add button (optional): Copy code
   - Submit for approval

#### Option B: Using Third-Party Provider (e.g., Twilio)

1. **Sign up for Twilio**
   - Visit https://www.twilio.com/whatsapp
   - Create account and verify

2. **Get WhatsApp Sandbox**
   - Access Twilio Console
   - Navigate to Messaging > Try it out > Send a WhatsApp message
   - Follow sandbox setup instructions

3. **Get Credentials**
   - Account SID
   - Auth Token
   - WhatsApp-enabled phone number

4. **Update Edge Function** for Twilio:
   ```typescript
   // In send-whatsapp-verification/index.ts
   const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
   const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
   const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER');
   
   // Use Twilio API instead of Meta API
   const response = await fetch(
     `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
     {
       method: 'POST',
       headers: {
         'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
         'Content-Type': 'application/x-www-form-urlencoded',
       },
       body: new URLSearchParams({
         From: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
         To: `whatsapp:${phoneNumber}`,
         Body: `Your SubTrack Pro verification code is: ${verificationCode}\n\nThis code will expire in 10 minutes.\n\nDo not share this code with anyone.`
       }),
     }
   );
   ```

## 🚀 How It Works

### User Flow:

1. **Enter Phone Number**
   - User selects country code (🇺🇸, 🇵🇰, 🇮🇳, etc.)
   - Enters phone number with format validation
   - Clicks "Connect WhatsApp"

2. **Send Verification**
   - Frontend calls `sendWhatsAppVerification()` utility
   - Edge Function generates 6-digit code
   - Code stored in database with 10-minute expiry
   - WhatsApp message sent via Meta API or Twilio
   - User redirected to verification screen

3. **Verify Code**
   - User enters 6-digit code from WhatsApp
   - Frontend calls `verifyWhatsAppCode()` utility
   - Edge Function validates code and expiry
   - Max 5 attempts before blocking
   - On success: Updates user settings, marks verified

4. **Connected**
   - Green success message shown
   - Phone number displayed
   - Test message option available
   - Disconnect option available

### Security Features:

- ✅ **Code Expiry**: 10-minute expiration
- ✅ **Rate Limiting**: Max 5 failed attempts
- ✅ **Secure Storage**: Hashed in database
- ✅ **RLS Policies**: Row-level security
- ✅ **Auto Cleanup**: Expired codes deleted automatically

## 🧪 Testing

### Test the Complete Flow:

1. **Start Frontend**
   ```bash
   npm run dev
   ```

2. **Navigate to Settings**
   - Login to your account
   - Go to Settings page
   - Scroll to "WhatsApp Integration"

3. **Test Verification**
   - Enter your phone number (use real number)
   - Click "Connect WhatsApp"
   - Check WhatsApp for code
   - Enter code and verify

4. **Test Message**
   - Once verified, click "Send Test Message"
   - Check WhatsApp for test message

### Test Edge Functions Directly:

```bash
# Test send verification
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/send-whatsapp-verification \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+923001234567",
    "userId": "test-user-123"
  }'

# Test verify code
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/verify-whatsapp-code \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+923001234567",
    "verificationCode": "123456",
    "userId": "test-user-123"
  }'
```

## 🐛 Troubleshooting

### Issue: "WhatsApp API credentials not configured"
**Solution**: Make sure you've set the Supabase secrets:
```bash
supabase secrets set WHATSAPP_API_TOKEN=your_token
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_id
```

### Issue: "Template not found" error
**Solution**: 
1. Create message template in Meta Business Manager
2. Wait for approval (can take 24-48 hours)
3. Use fallback text message (already implemented in Edge Function)

### Issue: "Failed to send verification code"
**Solution**:
1. Check WhatsApp API token is valid
2. Verify phone number ID is correct
3. Check phone number format (must include country code)
4. Ensure WhatsApp Business account is verified
5. Check function logs: `supabase functions logs send-whatsapp-verification`

### Issue: "Invalid verification code"
**Solution**:
1. Check code hasn't expired (10 minutes)
2. Verify you haven't exceeded 5 attempts
3. Try requesting new code
4. Check database: `SELECT * FROM whatsapp_verifications WHERE user_id = 'your-user-id'`

### Issue: Phone number validation fails
**Solution**:
1. Include country code (e.g., +92 for Pakistan)
2. Remove spaces and special characters
3. Check format matches country pattern
4. Example valid formats:
   - US: +1 (234) 567-8900
   - Pakistan: +92 300 1234567
   - India: +91 98765 43210

## 📱 Supported Countries

Currently supports 20+ countries with automatic formatting:
- 🇺🇸 United States (+1)
- 🇵🇰 Pakistan (+92)
- 🇮🇳 India (+91)
- 🇬🇧 United Kingdom (+44)
- 🇦🇪 UAE (+971)
- 🇸🇦 Saudi Arabia (+966)
- And 15+ more...

## 🔐 Security Best Practices

1. **Never expose API tokens** in frontend code
2. **Use Supabase secrets** for sensitive credentials
3. **Enable RLS policies** on all tables
4. **Implement rate limiting** for API calls
5. **Validate phone numbers** server-side
6. **Auto-cleanup expired codes** regularly
7. **Log all verification attempts** for audit
8. **Use HTTPS only** for all API calls

## 📊 Database Schema

```sql
whatsapp_verifications
├── id (UUID, primary key)
├── user_id (TEXT, unique)
├── phone_number (TEXT)
├── verification_code (TEXT)
├── expires_at (TIMESTAMP)
├── verified (BOOLEAN)
├── verified_at (TIMESTAMP)
├── failed_attempts (INTEGER)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 🎉 Success!

Your WhatsApp verification system is now complete! Users can:
- ✅ Enter their phone number with country code
- ✅ Receive verification code via WhatsApp
- ✅ Verify their number securely
- ✅ Receive subscription reminders via WhatsApp
- ✅ Test the connection anytime

## 🔄 Next Steps

1. **Enable WhatsApp Notifications**: Implement subscription reminder messages
2. **Add Chat Support**: Enable two-way conversation with users
3. **Analytics**: Track verification success rates
4. **Multi-language**: Support message templates in different languages
5. **Automation**: Auto-send reminders based on subscription due dates

## 💡 Tips

- Test with your own number first
- WhatsApp test mode has limitations (max 5 numbers)
- Business verification unlocks production features
- Message templates require approval
- Keep track of API usage/limits
- Monitor Edge Function logs regularly

---

**Need Help?** Check Supabase Edge Functions docs or WhatsApp Business API documentation.
