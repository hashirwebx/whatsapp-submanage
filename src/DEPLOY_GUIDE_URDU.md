# 🚀 Supabase Edge Functions Deploy Karne Ka Complete Guide

## ✅ Prerequisites (Pehle ye check karein)

- [ ] Node.js installed hai (v16 ya usse upar)
- [ ] npm ya yarn installed hai
- [ ] Supabase account hai (https://supabase.com)
- [ ] Project already create ho chuka hai Supabase mein

---

## 📦 Step 1: Supabase CLI Install Karein

### Windows:

**Option 1: NPM se install (Recommended)**
```bash
npm install -g supabase
```

**Option 2: Scoop se install**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Mac:

```bash
brew install supabase/tap/supabase
```

### Linux:

```bash
npm install -g supabase
```

### ✅ Verify Installation:
```bash
supabase --version
```
Output: `1.x.x` ya koi version number aana chahiye

---

## 🔑 Step 2: Supabase Login Karein

Terminal/Command Prompt mein ye command run karein:

```bash
supabase login
```

**Kya hoga:**
1. Browser mein ek tab khulega
2. Aapko Supabase login page dikhega
3. Login karein aur "Authorize" click karein
4. Terminal mein success message aayega

**Output:**
```
✓ Logged in successfully!
```

---

## 🔗 Step 3: Apne Project Ko Link Karein

**Aapka Project ID:** `kkffwzvyfbkhhoxztsgn`

Is command ko run karein:

```bash
supabase link --project-ref kkffwzvyfbkhhoxztsgn
```

**Agar password mange:**
Database password enter karein (wo password jo aapne Supabase project create karte waqt set kiya tha)

**Output:**
```
✓ Linked to project kkffwzvyfbkhhoxztsgn
```

---

## 📁 Step 4: Functions Deploy Karein

### Option A: Dono Functions Ek Saath Deploy

```bash
# Pehle ensure karein ke aap apne project folder mein hain
cd /path/to/your/project

# Dono functions deploy karein
supabase functions deploy send-whatsapp-verification
supabase functions deploy verify-whatsapp-code
```

### Option B: Ek-Ek Karke Deploy (Recommended)

**Function 1: Send Verification**
```bash
supabase functions deploy send-whatsapp-verification
```

Wait karein jab tak ye complete ho...

**Output:**
```
Deploying send-whatsapp-verification (project ref: kkffwzvyfbkhhoxztsgn)
Bundling send-whatsapp-verification
✓ send-whatsapp-verification deployed successfully
```

**Function 2: Verify Code**
```bash
supabase functions deploy verify-whatsapp-code
```

**Output:**
```
Deploying verify-whatsapp-code (project ref: kkffwzvyfbkhhoxztsgn)
Bundling verify-whatsapp-code
✓ verify-whatsapp-code deployed successfully
```

---

## 🔐 Step 5: Secrets Set Karein (WhatsApp API Credentials)

Aapne kaha tha ke aapne already secrets add kar diye hain. Verify karne ke liye:

```bash
supabase secrets list
```

**Output mein ye dikhna chahiye:**
```
WHATSAPP_API_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_VERIFY_TOKEN
```

**Agar nahi dikhe toh set karein:**

```bash
supabase secrets set WHATSAPP_API_TOKEN=your_actual_token_here
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_phone_id_here
supabase secrets set WHATSAPP_VERIFY_TOKEN=your_verify_token_here
```

**Note:** `your_actual_token_here` ko apne real token se replace karein (bina quotes ke)

---

## 🗄️ Step 6: Database Table Create Karein

### Method 1: Supabase Dashboard (Easy)

1. **Open Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/kkffwzvyfbkhhoxztsgn
   ```

2. **Left sidebar mein "SQL Editor" click karein**

3. **"New Query" button click karein**

4. **Is SQL ko copy-paste karein:**

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
CREATE INDEX idx_whatsapp_verifications_user_id ON public.whatsapp_verifications(user_id);
CREATE INDEX idx_whatsapp_verifications_phone ON public.whatsapp_verifications(phone_number);
CREATE INDEX idx_whatsapp_verifications_expires ON public.whatsapp_verifications(expires_at);

-- Enable RLS
ALTER TABLE public.whatsapp_verifications ENABLE ROW LEVEL SECURITY;

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

-- Grant permissions
GRANT ALL ON public.whatsapp_verifications TO service_role;
GRANT ALL ON public.whatsapp_verifications TO authenticated;
```

5. **"Run" button click karein (ya Ctrl+Enter)**

6. **Success message aayega:** `Success. No rows returned`

### Method 2: CLI se (Advanced)

```bash
supabase db push
```

---

## ✅ Step 7: Verify Deployment

### Check Functions:

```bash
supabase functions list
```

**Output:**
```
send-whatsapp-verification
verify-whatsapp-code
```

### Test Functions (Optional):

```bash
# Test send verification
curl -X POST \
  https://kkffwzvyfbkhhoxztsgn.supabase.co/functions/v1/send-whatsapp-verification \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZmZ3enZ5ZmJraGhveHp0c2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjA4MDEsImV4cCI6MjA3NzQ5NjgwMX0.pJtQlX6dF7j8kAniWPDUNkT_MQfrJluvwacNKFqlfCQ" \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZmZ3enZ5ZmJraGhveHp0c2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjA4MDEsImV4cCI6MjA3NzQ5NjgwMX0.pJtQlX6dF7j8kAniWPDUNkT_MQfrJluvwacNKFqlfCQ" \
  -d '{"phoneNumber": "923001234567", "userId": "test-123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Verification code sent successfully"
}
```

---

## 🎉 Step 8: Test in Your App!

1. **Start your app:**
   ```bash
   npm run dev
   ```

2. **Open browser:** `http://localhost:5173` (ya jo port ho)

3. **Go to Settings page**

4. **Scroll to "WhatsApp Integration"**

5. **Enter your phone number** (apna real WhatsApp number)

6. **Click "Connect WhatsApp"**

7. **Check WhatsApp** for 6-digit code

8. **Enter code** and verify!

---

## 🐛 Common Issues & Solutions

### Issue 1: "supabase: command not found"

**Solution:**
```bash
# NPM se phir se install karein
npm install -g supabase

# Path check karein
echo $PATH  # Mac/Linux
echo %PATH%  # Windows
```

### Issue 2: "Project not linked"

**Solution:**
```bash
# Link command phir se run karein
supabase link --project-ref kkffwzvyfbkhhoxztsgn
```

### Issue 3: "Permission denied" during deployment

**Solution:**
```bash
# Logout aur phir login karein
supabase logout
supabase login
```

### Issue 4: Database password bhool gaye

**Solution:**
1. Supabase Dashboard mein jao
2. Settings → Database
3. "Reset Database Password" click karein
4. Naya password set karein

### Issue 5: Functions deploy ho gaye but kaam nahi kar rahe

**Solution:**
```bash
# Logs check karein
supabase functions logs send-whatsapp-verification --limit 50
supabase functions logs verify-whatsapp-code --limit 50
```

### Issue 6: "Failed to fetch" error still coming

**Reasons:**
1. Functions deploy nahi hue → Deploy karein (Step 4)
2. Secrets set nahi hain → Set karein (Step 5)
3. Table create nahi hui → Create karein (Step 6)
4. WhatsApp API token invalid → Check karein aur update karein

**Debug:**
```bash
# Check deployment status
supabase functions list

# Check secrets
supabase secrets list

# Check function logs
supabase functions logs send-whatsapp-verification
```

---

## 📋 Quick Command Reference

```bash
# Login
supabase login

# Link project
supabase link --project-ref kkffwzvyfbkhhoxztsgn

# Deploy functions
supabase functions deploy send-whatsapp-verification
supabase functions deploy verify-whatsapp-code

# Set secrets
supabase secrets set WHATSAPP_API_TOKEN=your_token
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_id
supabase secrets set WHATSAPP_VERIFY_TOKEN=your_verify_token

# List functions
supabase functions list

# List secrets
supabase secrets list

# View logs
supabase functions logs send-whatsapp-verification
supabase functions logs verify-whatsapp-code

# Logout
supabase logout
```

---

## 🎯 Final Checklist

Deployment complete hone ke baad ye check karein:

- [ ] `supabase functions list` mein dono functions dikhai de rahe hain
- [ ] `supabase secrets list` mein teeno secrets hain
- [ ] Database table create ho gaya hai
- [ ] Test API call successful hai
- [ ] App mein phone number enter karne par error nahi aa raha
- [ ] WhatsApp par verification code aa raha hai
- [ ] Code verify ho raha hai successfully

---

## 💡 Pro Tips

1. **Always check logs** agar kuch kaam nahi kar raha:
   ```bash
   supabase functions logs send-whatsapp-verification --limit 50
   ```

2. **Secrets update karne ke baad** functions ko re-deploy karein:
   ```bash
   supabase functions deploy send-whatsapp-verification
   ```

3. **Local testing** ke liye Supabase local development use kar sakte hain:
   ```bash
   supabase start
   supabase functions serve
   ```

4. **Backup lein** important secrets ka somewhere safe

---

## 📞 Need Help?

Agar koi issue aa raha hai toh:

1. **Check logs first:**
   ```bash
   supabase functions logs send-whatsapp-verification --limit 50
   ```

2. **Verify all steps** complete hue hain

3. **Check Supabase Dashboard** for any errors

4. **Test with simple curl** command to isolate issue

---

**Ab aap ready hain! Functions deploy kar dein aur WhatsApp verification use karein! 🚀**
