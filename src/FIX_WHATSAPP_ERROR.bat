@echo off
REM WhatsApp Error Quick Fix Script (Windows)

echo ======================================
echo 🚑 WhatsApp Verification Error Fix
echo ======================================
echo.

REM Step 1: Check if Supabase CLI is installed
echo 📦 Step 1: Checking Supabase CLI...
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Supabase CLI not found!
    echo Install it: npm install -g supabase
    pause
    exit /b 1
) else (
    echo ✅ Supabase CLI found
)
echo.

REM Step 2: Check if logged in
echo 🔑 Step 2: Checking login status...
supabase projects list >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Not logged in. Logging in now...
    supabase login
)
echo ✅ Logged in
echo.

REM Step 3: Check project link
echo 🔗 Step 3: Ensuring project is linked...
supabase link --project-ref kkffwzvyfbkhhoxztsgn
echo ✅ Project linked
echo.

REM Step 4: Redeploy function with fixes
echo 📤 Step 4: Deploying updated Edge Function...
echo Deploying send-whatsapp-verification...
supabase functions deploy send-whatsapp-verification

if %errorlevel% neq 0 (
    echo ❌ Deployment failed
    pause
    exit /b 1
) else (
    echo ✅ Edge Function deployed with fixes!
)
echo.

REM Step 5: Check secrets
echo 🔐 Step 5: Checking WhatsApp API secrets...
echo.
echo Current secrets:
supabase secrets list
echo.
echo Make sure these exist:
echo   - WHATSAPP_API_TOKEN
echo   - WHATSAPP_PHONE_NUMBER_ID
echo   - WHATSAPP_VERIFY_TOKEN
echo.
echo If missing, set them:
echo   supabase secrets set WHATSAPP_API_TOKEN=your_token
echo   supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_phone_id
echo   supabase secrets set WHATSAPP_VERIFY_TOKEN=your_verify_token
echo.
pause
echo.

REM Step 6: Check database table
echo 🗄️  Step 6: Checking database table...
echo.
echo Please verify that 'whatsapp_verifications' table exists:
echo 👉 https://supabase.com/dashboard/project/kkffwzvyfbkhhoxztsgn/editor
echo.
echo If table doesn't exist, run this SQL:
echo 👉 https://supabase.com/dashboard/project/kkffwzvyfbkhhoxztsgn/sql
echo.
echo SQL file location: /supabase/migrations/create_whatsapp_verifications_table.sql
echo.
pause
echo.

REM Step 7: View recent logs
echo 📋 Step 7: Checking recent function logs...
echo Last 10 log entries:
echo.
supabase functions logs send-whatsapp-verification --limit 10
echo.
pause

REM Step 8: Test function
echo 🧪 Step 8: Test function
echo.
echo Now test in your app:
echo   1. Go to Settings page
echo   2. Enter phone number (format: +923001234567)
echo   3. Click 'Connect WhatsApp'
echo.
echo If it still fails, check logs immediately:
echo   supabase functions logs send-whatsapp-verification --limit 10
echo.

REM Final summary
echo ======================================
echo 🎉 Fix Process Complete!
echo ======================================
echo.
echo Changes made:
echo   ✅ Updated Edge Function with better error handling
echo   ✅ Removed WhatsApp template requirement
echo   ✅ Added detailed logging
echo   ✅ Improved phone number validation
echo.
echo Next steps:
echo   1. Test in your app (Settings → WhatsApp)
echo   2. If still failing, check logs for specific error
echo   3. Verify secrets are set correctly
echo   4. Ensure database table exists
echo.
echo For detailed troubleshooting, see:
echo   📖 WHATSAPP_ERROR_FIX.md
echo.
echo To view live logs:
echo   supabase functions logs send-whatsapp-verification --limit 20
echo.
pause
