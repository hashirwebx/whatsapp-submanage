# WhatsApp Business API Setup Guide

## Overview
The WhatsApp integration system is now fully implemented with verification, messaging, and delivery tracking. This guide explains how to complete the setup with real WhatsApp Business API credentials.

## Current Implementation Status

### ✅ Fully Implemented Features
1. **Country Code Selection** - 20+ countries with flags and validation patterns
2. **Phone Number Validation** - Country-specific format validation
3. **Verification Flow** - 6-digit code generation and validation
4. **Database Persistence** - All connections and messages stored in KV store
5. **Connection Management** - Connect, verify, disconnect functionality
6. **Test Messaging** - Send test messages to verified numbers
7. **Message History** - Track all sent messages with delivery status
8. **Error Handling** - Comprehensive error messages and recovery options

### 🔧 Configuration Required
To enable actual WhatsApp message sending (currently simulated), you need to:

1. **Get WhatsApp Business API Access**
   - Go to: https://business.facebook.com/
   - Create a WhatsApp Business Account
   - Apply for WhatsApp Business API access
   - Complete business verification

2. **Set Up Your Phone Number**
   - Add a phone number to your WhatsApp Business Account
   - Verify the phone number ownership
   - Enable the WhatsApp Business API for that number

3. **Get API Credentials**
   You'll receive:
   - **Phone Number ID**: Your WhatsApp phone number identifier
   - **Business Account ID**: Your business account identifier
   - **Access Token**: Authentication token for API calls
   - **Verify Token**: Token for webhook verification

4. **Configure Environment Variables in Supabase**
   
   In your Supabase project dashboard:
   - Go to: Settings → Edge Functions → Secrets
   - Add these environment variables:

   ```bash
   WHATSAPP_API_TOKEN=your_access_token_here
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
   WHATSAPP_VERIFY_TOKEN=your_custom_verify_token
   ```

5. **Set Up Webhooks (Optional but Recommended)**
   - In Facebook Developer Console → WhatsApp → Configuration
   - Set webhook URL to:
     ```
     https://[your-project-id].supabase.co/functions/v1/make-server-333e8892/whatsapp/webhook
     ```
   - Set verify token to match `WHATSAPP_VERIFY_TOKEN`
   - Subscribe to: `messages` and `message_status` events

## How It Works Without Configuration

The system is designed to work without WhatsApp API credentials:

1. **Development Mode**: When credentials are not set, the system:
   - Generates verification codes normally
   - Logs codes to server console (for testing)
   - Simulates successful message sending
   - Allows full testing of the UI and flow
   - Stores all data in database as if messages were sent

2. **User Experience**: Users can:
   - Enter and validate phone numbers with country codes
   - Request verification codes
   - Enter codes to verify their number
   - See "connected and verified" status
   - Send test messages (simulated)
   - Disconnect their number

## Testing the System

### Without WhatsApp API (Current State)
1. Go to Settings → WhatsApp Integration
2. Select country code (e.g., 🇺🇸 +1)
3. Enter a phone number (any valid format for that country)
4. Click "Connect WhatsApp"
5. Check server logs for the 6-digit code
6. Enter the code to verify
7. Status shows "Connected & Verified"
8. Click "Send Test Message" (simulated)

### With WhatsApp API (Production)
1. Configure environment variables (see above)
2. Redeploy edge functions
3. Follow same steps as above
4. Real verification codes sent via WhatsApp
5. Real test messages delivered to WhatsApp
6. Delivery receipts tracked via webhooks

## API Endpoints

All endpoints are implemented and functional:

### Connection Management
- `GET /whatsapp/status` - Get current connection status
- `POST /whatsapp/disconnect` - Disconnect WhatsApp

### Verification Flow
- `POST /whatsapp/verify/send` - Send verification code
- `POST /whatsapp/verify/confirm` - Verify code and establish connection

### Messaging
- `POST /whatsapp/test` - Send test message to verified number
- `POST /whatsapp/send` - Send custom message (generic endpoint)

### Webhooks
- `GET /whatsapp/webhook` - Webhook verification (for WhatsApp setup)
- `POST /whatsapp/webhook` - Receive delivery receipts and incoming messages

## Database Schema

Data is stored in the KV store with the following structure:

### Connection Data
```typescript
user:{userId}:whatsapp:connection
{
  userId: string,
  phoneNumber: string, // Full number with country code
  verified: boolean,
  verifiedAt: ISO timestamp,
  createdAt: ISO timestamp,
  lastMessageAt: ISO timestamp | null
}
```

### Verification Sessions (temporary)
```typescript
verification:{verificationId}
{
  userId: string,
  phoneNumber: string,
  code: string, // 6-digit code
  expiresAt: ISO timestamp, // 10 minutes from creation
  attempts: number, // Max 5 attempts
  createdAt: ISO timestamp
}
```

### Message History
```typescript
user:{userId}:whatsapp:messages
[
  {
    id: string,
    phoneNumber: string,
    message: string,
    messageId: string, // From WhatsApp API
    status: 'sent' | 'delivered' | 'read' | 'failed',
    sentAt: ISO timestamp
  }
]
// Last 50 messages kept
```

### Settings Integration
```typescript
user:{userId}:settings
{
  ...other settings,
  whatsappConnected: boolean,
  whatsappVerified: boolean,
  whatsappPhone: string,
  whatsappNotifications: boolean,
  autoReply: boolean
}
```

## Security Features

1. **Rate Limiting**: Max 5 verification attempts per code
2. **Code Expiration**: Codes expire after 10 minutes
3. **User Authentication**: All endpoints require valid access token
4. **Phone Validation**: Country-specific format validation
5. **Secure Storage**: All data encrypted at rest in Supabase

## Country Support

Currently supporting 20+ countries with proper validation:
- 🇺🇸 United States (+1)
- 🇨🇦 Canada (+1)
- 🇬🇧 United Kingdom (+44)
- 🇮🇳 India (+91)
- 🇵🇰 Pakistan (+92)
- 🇨🇳 China (+86)
- 🇯🇵 Japan (+81)
- 🇰🇷 South Korea (+82)
- 🇦🇺 Australia (+61)
- 🇳🇿 New Zealand (+64)
- 🇩🇪 Germany (+49)
- 🇫🇷 France (+33)
- 🇪🇸 Spain (+34)
- 🇮🇹 Italy (+39)
- 🇦🇪 UAE (+971)
- 🇸🇦 Saudi Arabia (+966)
- 🇿🇦 South Africa (+27)
- 🇧🇷 Brazil (+55)
- 🇲🇽 Mexico (+52)
- 🇳🇬 Nigeria (+234)

Each country has:
- Country flag emoji
- Country code
- Local number validation pattern
- Format example for user guidance

## Future Enhancements

Potential improvements for production:
1. SMS fallback for countries without WhatsApp
2. Multi-language message templates
3. Scheduled message delivery
4. Rich media support (images, documents)
5. Message templates with variables
6. Conversation history tracking
7. Auto-reply rules engine
8. Multiple number support per user
9. Bulk messaging capabilities
10. Advanced analytics and reporting

## Troubleshooting

### "Verification code not received"
- Check if phone number format is correct for country
- Verify WhatsApp is installed on the phone
- Check server logs for the code (development mode)
- Ensure WhatsApp API credentials are configured correctly

### "Invalid verification code"
- Code expires after 10 minutes - request a new one
- Max 5 attempts per code - request a new one if exceeded
- Check for typos in the 6-digit code

### "Failed to send message"
- Verify WhatsApp API credentials are set
- Check phone number is verified
- Ensure phone has WhatsApp installed
- Review server logs for specific error messages

### "Connection not persisting"
- Check if settings are being saved to database
- Verify user is authenticated properly
- Clear browser cache and try again
- Check network connectivity

## Support Resources

- WhatsApp Business API Docs: https://developers.facebook.com/docs/whatsapp
- WhatsApp Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api
- Business Manager: https://business.facebook.com/
- Developer Console: https://developers.facebook.com/

## Compliance & Legal

When using WhatsApp Business API, ensure compliance with:
1. WhatsApp Business Policy
2. WhatsApp Commerce Policy
3. GDPR (for EU users)
4. CCPA (for California users)
5. Local telecommunications regulations

Users must opt-in to receive messages and can opt-out at any time.
