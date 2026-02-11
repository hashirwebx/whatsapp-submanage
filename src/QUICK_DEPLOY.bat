@echo off
REM SubTrack Pro - WhatsApp Edge Functions Deployment Script (Windows)
REM Ye script automatically saari deployment steps execute karega

echo ==================================
echo 🚀 SubTrack Pro WhatsApp Deployment
echo ==================================
echo.

REM Step 1: Check if Supabase CLI is installed
echo 📦 Step 1: Checking Supabase CLI...
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Supabase CLI not found!
    echo.
    echo Please install it first:
    echo   npm install -g supabase
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Supabase CLI installed
)
echo.

REM Step 2: Login to Supabase
echo 🔑 Step 2: Logging in to Supabase...
echo ⚠️  This will open your browser for authentication
echo.
supabase login
if %errorlevel% neq 0 (
    echo ❌ Login failed. Please try again.
    pause
    exit /b 1
) else (
    echo ✅ Login successful!
)
echo.

REM Step 3: Link project
echo 🔗 Step 3: Linking to your Supabase project...
echo Project ID: kkffwzvyfbkhhoxztsgn
echo.
echo You may be asked for your database password.
echo This is the password you set when creating your Supabase project.
echo.
supabase link --project-ref kkffwzvyfbkhhoxztsgn
if %errorlevel% neq 0 (
    echo ❌ Failed to link project.
    echo Please check your project ID and database password.
    pause
    exit /b 1
) else (
    echo ✅ Project linked successfully!
)
echo.

REM Step 4: Deploy Functions
echo 📤 Step 4: Deploying Edge Functions...
echo.

echo Deploying send-whatsapp-verification...
supabase functions deploy send-whatsapp-verification
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy send-whatsapp-verification
    pause
    exit /b 1
) else (
    echo ✅ send-whatsapp-verification deployed!
)
echo.

echo Deploying verify-whatsapp-code...
supabase functions deploy verify-whatsapp-code
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy verify-whatsapp-code
    pause
    exit /b 1
) else (
    echo ✅ verify-whatsapp-code deployed!
)
echo.

REM Step 5: Check secrets
echo 🔐 Step 5: Checking WhatsApp API secrets...
echo.
echo Current secrets:
supabase secrets list
echo.
echo ⚠️  Make sure these secrets are set:
echo   - WHATSAPP_API_TOKEN
echo   - WHATSAPP_PHONE_NUMBER_ID
echo   - WHATSAPP_VERIFY_TOKEN
echo.
echo If not set, run these commands:
echo   supabase secrets set WHATSAPP_API_TOKEN=your_token
echo   supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_id
echo   supabase secrets set WHATSAPP_VERIFY_TOKEN=your_verify_token
echo.

REM Step 6: Verify deployment
echo ✅ Step 6: Verifying deployment...
echo.
echo Deployed functions:
supabase functions list
echo.

REM Step 7: Database reminder
echo 🗄️  Step 7: Database Table Setup
echo.
echo ⚠️  IMPORTANT: You still need to create the database table!
echo.
echo Go to: https://supabase.com/dashboard/project/kkffwzvyfbkhhoxztsgn/sql
echo.
echo And run the SQL from:
echo   /supabase/migrations/create_whatsapp_verifications_table.sql
echo.

REM Final message
echo ==================================
echo 🎉 Deployment Complete!
echo ==================================
echo.
echo Next steps:
echo   1. Create database table (see above)
echo   2. Ensure WhatsApp API secrets are set
echo   3. Test in your app: npm run dev
echo.
echo To view logs:
echo   supabase functions logs send-whatsapp-verification
echo   supabase functions logs verify-whatsapp-code
echo.
echo Happy coding! 🚀
echo.
pause
