# WhatsApp API Environment Variables Setup

## Overview
This guide shows exactly how to configure the environment variables needed for WhatsApp Business API integration.

## Current Status

🟢 **System Status**: Fully functional in simulation mode
🟡 **API Status**: Ready for credentials (currently simulated)
📝 **Action Required**: Add environment variables to enable real messaging

## Required Environment Variables

### 1. WHATSAPP_API_TOKEN
**Purpose**: Authentication token for WhatsApp Business API
**How to Get**:
1. Go to https://developers.facebook.com/
2. Select your app (or create one)
3. Go to WhatsApp → Getting Started
4. Generate a temporary or permanent access token
5. Copy the token

**Format**: Long string (looks like: `EAAXxx...`)

**Security**: Keep this secret! Never commit to code.

### 2. WHATSAPP_PHONE_NUMBER_ID
**Purpose**: ID of your registered WhatsApp phone number
**How to Get**:
1. In Facebook Developer Console
2. WhatsApp → Getting Started
3. Look for "Phone Number ID" in the test number section
4. Or add your own number and get its ID

**Format**: Numeric ID (looks like: `123456789012345`)

### 3. WHATSAPP_VERIFY_TOKEN
**Purpose**: Security token for webhook verification
**How to Get**: Create your own! 
**Recommendation**: Use a random string like:
```
subtrack_pro_verify_token_abc123xyz789
```

**Format**: Any string you choose (keep it secret!)

## How to Set in Supabase

### Method 1: Via Supabase Dashboard (Recommended)

1. **Login to Supabase**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to Secrets**
   - Click "Settings" in sidebar
   - Click "Edge Functions"
   - Scroll to "Secrets" section

3. **Add Each Secret**
   For each environment variable:
   - Click "Add new secret"
   - Enter name (e.g., `WHATSAPP_API_TOKEN`)
   - Enter value (paste your token)
   - Click "Add secret"

4. **Verify Secrets**
   You should see:
   ```
   WHATSAPP_API_TOKEN          ••••••••
   WHATSAPP_PHONE_NUMBER_ID    ••••••••
   WHATSAPP_VERIFY_TOKEN       ••••••••
   ```

### Method 2: Via Supabase CLI

If you're using Supabase CLI:

```bash
# Set secrets
supabase secrets set WHATSAPP_API_TOKEN=your_token_here
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_phone_id_here
supabase secrets set WHATSAPP_VERIFY_TOKEN=your_verify_token_here

# Verify secrets are set
supabase secrets list

# Deploy functions with new secrets
supabase functions deploy
```

## Verification Checklist

After setting environment variables:

### ✅ Step 1: Redeploy Edge Functions
```bash
# Redeploy to pick up new environment variables
supabase functions deploy
```

### ✅ Step 2: Test Connection
1. Go to Settings → WhatsApp Integration
2. Try connecting a number
3. You should receive REAL verification code on WhatsApp
4. Verify and connect

### ✅ Step 3: Test Messaging
1. After verifying number
2. Click "Send Test Message"
3. Check WhatsApp on your phone
4. You should receive the test message

### ✅ Step 4: Check Logs
```bash
# View function logs
supabase functions logs

# Look for:
# ✅ "Verification code sent to: +1..."
# ✅ "Message sent successfully"
# ❌ No "WhatsApp API credentials not configured" warnings
```

## Environment Variable Examples

### Development/Testing
```bash
# Use WhatsApp Test Number (provided by Meta)
WHATSAPP_API_TOKEN=EAAX...test_token
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_VERIFY_TOKEN=test_verify_token_123
```

### Production
```bash
# Use your verified business number
WHATSAPP_API_TOKEN=EAAX...production_token
WHATSAPP_PHONE_NUMBER_ID=987654321098765
WHATSAPP_VERIFY_TOKEN=prod_secure_token_xyz789
```

## Testing Without Real Credentials

The system works in **simulation mode** when credentials are not set:

### What Happens:
1. ✅ Verification codes are generated
2. ✅ Codes are logged to console (check server logs)
3. ✅ All database operations work
4. ✅ UI flow is identical
5. ✅ Message sending is simulated
6. ⚠️ No actual WhatsApp messages sent

### How to Test:
1. Set up without credentials
2. Use the system normally
3. Check console for verification codes
4. Enter codes to verify
5. "Test messages" succeed but aren't actually sent

### Logs You'll See:
```
⚠️ WhatsApp API credentials not configured
   Message would be sent to: +15551234567
   Message: Your verification code is: 123456
```

## Security Best Practices

### ✅ DO:
- Store tokens in Supabase Secrets (encrypted at rest)
- Use different tokens for dev/staging/production
- Rotate tokens periodically
- Keep verify token secret
- Monitor token usage in Facebook Dashboard
- Set token expiration if possible

### ❌ DON'T:
- Commit tokens to Git
- Share tokens in chat/email
- Use same token across environments
- Log full tokens in code
- Expose tokens in client-side code
- Use test tokens in production

## Token Rotation

When rotating tokens:

1. **Generate New Token**
   - In Facebook Developer Console
   - Create new permanent token

2. **Update in Supabase**
   ```bash
   supabase secrets set WHATSAPP_API_TOKEN=new_token_here
   ```

3. **Redeploy**
   ```bash
   supabase functions deploy
   ```

4. **Verify**
   - Test sending a message
   - Check logs for success

5. **Revoke Old Token**
   - In Facebook Developer Console
   - Only after confirming new token works

## Troubleshooting

### "Invalid access token"
- Check token is correct (no extra spaces)
- Verify token hasn't expired
- Confirm token has WhatsApp permissions
- Check token is for correct app

### "Phone number not found"
- Verify WHATSAPP_PHONE_NUMBER_ID is correct
- Check number is registered in your account
- Confirm number is verified by Meta

### "Webhook verification failed"
- WHATSAPP_VERIFY_TOKEN must match what you set in Facebook
- Check webhook URL is correct
- Verify Edge Functions are deployed
- Check logs for verification attempts

### "Messages not being delivered"
- Verify phone numbers are in correct format
- Check WhatsApp Business API status
- Review Meta Business Manager for issues
- Verify business verification is complete
- Check for API rate limits

## Cost Considerations

WhatsApp Business API has costs:

### Pricing (as of 2024):
- **Business-initiated conversations**: ~$0.005-0.10 per message (varies by country)
- **User-initiated conversations**: Free first 1,000 messages/month
- **Verification messages**: Usually user-initiated (free tier)

### Cost Control:
1. Monitor message volume
2. Set up billing alerts
3. Optimize message frequency
4. Use templates efficiently
5. Implement user preferences

## Rate Limits

WhatsApp Business API has rate limits:

### Typical Limits:
- **Tier 1 (new)**: 250 unique customers/day
- **Tier 2**: 1,000 unique customers/day
- **Tier 3**: 10,000 unique customers/day
- **Tier 4 (highest)**: 100,000+ unique customers/day

### Tips:
- Start at Tier 1, quality increases tier
- Monitor quality rating (keep > 80%)
- Avoid spamming
- Only message opted-in users
- Respond to user messages promptly

## Support Resources

### Documentation:
- WhatsApp Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api
- Getting Started: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
- API Reference: https://developers.facebook.com/docs/whatsapp/cloud-api/reference

### Dashboards:
- Business Manager: https://business.facebook.com/
- Developer Console: https://developers.facebook.com/
- WhatsApp Manager: https://business.facebook.com/wa/manage/

### Help:
- WhatsApp Business Support: https://developers.facebook.com/support/
- Community Forum: https://developers.facebook.com/community/
- Status Page: https://developers.facebook.com/status/

## Summary

The WhatsApp integration is **production-ready** and works in two modes:

### 🧪 Simulation Mode (Current)
- No credentials needed
- Full functionality for testing
- No actual messages sent
- Perfect for development

### 🚀 Production Mode (After Setup)
- Requires 3 environment variables
- Real WhatsApp messages sent
- Full delivery tracking
- Production-grade reliability

To go from simulation to production:
1. Get WhatsApp Business API access
2. Set 3 environment variables
3. Redeploy edge functions
4. Test with real number
5. Deploy to users!

The system is **ready now** - just add credentials when you're ready to send real messages.
