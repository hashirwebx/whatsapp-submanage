# 🚀 WhatsApp Verification - Quick Fix Reference

## ✅ What Was Fixed

**Issue**: Verification codes stored in Supabase but NOT sent to WhatsApp.

**Solution**: Edge Function now REQUIRES WhatsApp message to send successfully before returning success. If sending fails, the database record is deleted and an error is returned.

---

## 🔧 Quick Setup (3 Steps)

### 1️⃣ Get WhatsApp Credentials

Go to [Facebook Developers](https://developers.facebook.com/) → Your App → WhatsApp → Getting Started

Copy these 3 values:
```
WHATSAPP_API_TOKEN=<from "Temporary access token" or create System User token>
WHATSAPP_PHONE_NUMBER_ID=<from "Phone number ID">
WHATSAPP_VERIFY_TOKEN=<create any random string, e.g., "my_secret_123">
```

### 2️⃣ Set Secrets in Supabase

**Option A - CLI:**
```bash
supabase secrets set WHATSAPP_API_TOKEN=your_token
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_phone_id
supabase secrets set WHATSAPP_VERIFY_TOKEN=your_verify_token
```

**Option B - Dashboard:**
1. Settings → Edge Functions → Manage Secrets
2. Add each secret

### 3️⃣ Deploy Functions

```bash
supabase functions deploy send-whatsapp-verification
supabase functions deploy verify-whatsapp-code
```

---

## 🧪 Test It

### Quick Test (UI):
1. Open SubTrack Pro
2. Settings → WhatsApp Connection
3. Enter phone number → Click "Connect WhatsApp"
4. You should receive code on WhatsApp
5. Enter code to verify

### Command Line Test:
```bash
# Linux/Mac
./test-whatsapp-verification.sh

# Windows
test-whatsapp-verification.bat
```

---

## ⚠️ Common Issues

| Error | Solution |
|-------|----------|
| "Credentials not configured" | Set secrets in Supabase and redeploy |
| "Edge Functions not deployed" | Run `supabase functions deploy send-whatsapp-verification` |
| "Failed to send WhatsApp message" | 1. Check token is valid<br>2. Add phone to test numbers in FB Console<br>3. Verify phone has WhatsApp |
| "Invalid phone number format" | Must include country code: `+12345678900` |
| Temporary token expired | Create System User token (permanent) |

---

## 📱 Phone Number Format

✅ **Correct**: `+12345678900` (country code + number, no spaces)  
❌ **Wrong**: `(234) 567-8900`, `+1 234-567-8900`, `2345678900`

---

## 🔍 Debug Commands

```bash
# Check if functions are deployed
supabase functions list

# Check if secrets are set
supabase secrets list

# View function logs
supabase functions logs send-whatsapp-verification

# Test with curl
curl -X POST "https://kkffwzvyfbkhhoxztsgn.supabase.co/functions/v1/send-whatsapp-verification" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+12345678900","userId":"test-123"}'
```

---

## 📚 Full Documentation

- **Complete Guide**: `/WHATSAPP_DEPLOYMENT_GUIDE.md`
- **Fix Summary**: `/WHATSAPP_VERIFICATION_FIX.md`
- **Test Scripts**: 
  - `/test-whatsapp-verification.sh` (Linux/Mac)
  - `/test-whatsapp-verification.bat` (Windows)

---

## ✨ Key Changes

1. ✅ WhatsApp sending is now REQUIRED (not optional)
2. ✅ Database cleanup on WhatsApp failure
3. ✅ Better error messages with actionable guidance
4. ✅ Loading states and toast notifications in UI
5. ✅ Comprehensive test scripts

---

## 🎯 Production Checklist

- [ ] WhatsApp Business Account verified
- [ ] System User token created (not temporary 24h token)
- [ ] Secrets set in production Supabase
- [ ] Edge Functions deployed to production
- [ ] Tested with real phone numbers
- [ ] Test numbers added to FB Console (if in test mode)

---

**Need Help?** Check `/WHATSAPP_DEPLOYMENT_GUIDE.md` for detailed troubleshooting.
