# 🚀 WhatsApp Verification - Deployment Guide

## Quick Start (Sabse Aasan Tarika)

### Option 1: Automated Script (Recommended) ⭐

#### **For Mac/Linux:**
```bash
chmod +x QUICK_DEPLOY.sh
./QUICK_DEPLOY.sh
```

#### **For Windows:**
```bash
QUICK_DEPLOY.bat
```

Script automatically:
- ✅ Supabase CLI check karega
- ✅ Login karayega
- ✅ Project link karega
- ✅ Dono functions deploy karega
- ✅ Secrets verify karega

---

### Option 2: Manual Commands

Agar script kaam nahi kar rahi toh manually ye commands run karein:

```bash
# 1. Supabase CLI install karein (agar nahi hai)
npm install -g supabase

# 2. Login karein
supabase login

# 3. Project link karein
supabase link --project-ref kkffwzvyfbkhhoxztsgn

# 4. Functions deploy karein
supabase functions deploy send-whatsapp-verification
supabase functions deploy verify-whatsapp-code

# 5. Secrets check karein
supabase secrets list

# 6. Agar secrets nahi hain toh set karein
supabase secrets set WHATSAPP_API_TOKEN=your_token
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_id
supabase secrets set WHATSAPP_VERIFY_TOKEN=your_verify_token
```

---

## 📋 Complete Step-by-Step Guide

Detailed guide ke liye ye file padhen: **[DEPLOY_GUIDE_URDU.md](./DEPLOY_GUIDE_URDU.md)**

Usme milega:
- ✅ Har step ki detailed explanation
- ✅ Screenshots aur examples
- ✅ Common errors aur unke solutions
- ✅ Troubleshooting guide
- ✅ Testing instructions

---

## 🗄️ Database Setup (Important!)

Functions deploy hone ke **baad** database table bhi create karna zaroori hai:

### Method 1: Supabase Dashboard (Easy)

1. Open: https://supabase.com/dashboard/project/kkffwzvyfbkhhoxztsgn/sql
2. "New Query" click karein
3. Copy-paste SQL from: `/supabase/migrations/create_whatsapp_verifications_table.sql`
4. "Run" button click karein

### Method 2: CLI

```bash
supabase db push
```

---

## ✅ Verification Checklist

Deployment complete hone ke baad ye check karein:

```bash
# Functions deployed hain?
supabase functions list

# Output mein ye dikhna chahiye:
# - send-whatsapp-verification
# - verify-whatsapp-code
```

```bash
# Secrets set hain?
supabase secrets list

# Output mein ye dikhna chahiye:
# - WHATSAPP_API_TOKEN
# - WHATSAPP_PHONE_NUMBER_ID
# - WHATSAPP_VERIFY_TOKEN
```

```bash
# Functions kaam kar rahe hain?
supabase functions logs send-whatsapp-verification --limit 10

# Koi error nahi dikhna chahiye
```

---

## 🧪 Testing

### Test in App:

1. Start app: `npm run dev`
2. Go to Settings page
3. Enter phone number
4. Click "Connect WhatsApp"
5. Check WhatsApp for code
6. Enter code and verify

### Test with curl:

```bash
curl -X POST \
  https://kkffwzvyfbkhhoxztsgn.supabase.co/functions/v1/send-whatsapp-verification \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZmZ3enZ5ZmJraGhveHp0c2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjA4MDEsImV4cCI6MjA3NzQ5NjgwMX0.pJtQlX6dF7j8kAniWPDUNkT_MQfrJluvwacNKFqlfCQ" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "923001234567", "userId": "test-123"}'
```

Expected response:
```json
{"success": true, "message": "Verification code sent successfully"}
```

---

## 🐛 Common Issues

### Issue: "supabase: command not found"
**Fix:**
```bash
npm install -g supabase
```

### Issue: "Failed to fetch" in app
**Possible reasons:**
1. Functions not deployed → Run deployment script
2. Secrets not set → Run `supabase secrets set ...`
3. Database table not created → Run SQL migration

**Debug:**
```bash
supabase functions logs send-whatsapp-verification
```

### Issue: "Project not linked"
**Fix:**
```bash
supabase link --project-ref kkffwzvyfbkhhoxztsgn
```

### Issue: Database password bhool gaye
**Fix:**
1. Go to Supabase Dashboard
2. Settings → Database
3. Reset Database Password

---

## 📚 Documentation Files

- **[README_DEPLOYMENT.md](./README_DEPLOYMENT.md)** ← You are here
- **[DEPLOY_GUIDE_URDU.md](./DEPLOY_GUIDE_URDU.md)** - Complete Urdu/Hindi guide
- **[WHATSAPP_QUICK_START.md](./WHATSAPP_QUICK_START.md)** - Quick reference
- **[WHATSAPP_VERIFICATION_SETUP.md](./WHATSAPP_VERIFICATION_SETUP.md)** - Technical docs
- **[QUICK_DEPLOY.sh](./QUICK_DEPLOY.sh)** - Mac/Linux deployment script
- **[QUICK_DEPLOY.bat](./QUICK_DEPLOY.bat)** - Windows deployment script

---

## 🎯 Quick Reference

### Essential Commands:

```bash
# Login
supabase login

# Link project
supabase link --project-ref kkffwzvyfbkhhoxztsgn

# Deploy all functions
supabase functions deploy send-whatsapp-verification
supabase functions deploy verify-whatsapp-code

# Set secrets
supabase secrets set KEY=value

# View logs
supabase functions logs FUNCTION_NAME

# List functions
supabase functions list

# List secrets
supabase secrets list
```

---

## 💡 Pro Tips

1. **Hamesha logs check karein** agar koi issue ho:
   ```bash
   supabase functions logs send-whatsapp-verification --limit 50
   ```

2. **Secrets update karne ke baad** functions ko re-deploy karein:
   ```bash
   supabase functions deploy send-whatsapp-verification
   ```

3. **Local testing** ke liye:
   ```bash
   supabase start
   supabase functions serve
   ```

---

## 🆘 Help Needed?

1. Check **[DEPLOY_GUIDE_URDU.md](./DEPLOY_GUIDE_URDU.md)** for detailed instructions
2. View function logs: `supabase functions logs FUNCTION_NAME`
3. Check Supabase Dashboard for errors
4. Verify all steps completed

---

## 🎉 Success!

Agar sab kuch sahi se deploy ho gaya toh:
- ✅ App mein phone number enter kar sakte hain
- ✅ WhatsApp par verification code aayega
- ✅ Code verify hoga successfully
- ✅ WhatsApp notifications kaam karenge

**Happy coding! 🚀**
