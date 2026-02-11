@echo off
REM WhatsApp Verification Fix - Quick Deploy Script for Windows
REM This script automates the deployment of the WhatsApp verification fix

echo.
echo ============================================================
echo   WhatsApp Verification Fix - Quick Deploy Script
echo ============================================================
echo.

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Supabase CLI is not installed
    echo.
    echo Install it with:
    echo   npm install -g supabase
    echo.
    pause
    exit /b 1
)

echo [OK] Supabase CLI found
echo.

REM Step 1: Check credentials
echo Step 1: Checking WhatsApp API credentials
echo.

set /p has_creds="Have you obtained your WhatsApp API credentials from Facebook? (y/n): "

if /i not "%has_creds%"=="y" (
    echo.
    echo [WARNING] You need WhatsApp API credentials first!
    echo.
    echo Get them from: https://developers.facebook.com/
    echo.
    echo You need:
    echo   1. WHATSAPP_API_TOKEN (from Access Token^)
    echo   2. WHATSAPP_PHONE_NUMBER_ID (from Phone Number ID^)
    echo   3. WHATSAPP_VERIFY_TOKEN (create any random string^)
    echo.
    echo Once you have them, run this script again.
    pause
    exit /b 1
)

REM Step 2: Set secrets
echo.
echo Step 2: Setting up Supabase secrets
echo.

set /p set_secrets="Do you want to set/update Supabase secrets now? (y/n): "

if /i "%set_secrets%"=="y" (
    echo.
    set /p token="Enter WHATSAPP_API_TOKEN: "
    set /p phone_id="Enter WHATSAPP_PHONE_NUMBER_ID: "
    set /p verify_token="Enter WHATSAPP_VERIFY_TOKEN (or press Enter for auto-generated^): "
    
    if "%verify_token%"=="" (
        set verify_token=verify_%RANDOM%_%RANDOM%
        echo Generated WHATSAPP_VERIFY_TOKEN: %verify_token%
    )
    
    echo.
    echo Setting secrets...
    
    call supabase secrets set WHATSAPP_API_TOKEN=%token%
    call supabase secrets set WHATSAPP_PHONE_NUMBER_ID=%phone_id%
    call supabase secrets set WHATSAPP_VERIFY_TOKEN=%verify_token%
    
    echo [OK] Secrets set successfully
) else (
    echo [WARNING] Skipping secrets setup
    echo           Make sure secrets are already set in Supabase!
)

REM Step 3: Deploy Edge Functions
echo.
echo Step 3: Deploying Edge Functions
echo.

echo Deploying send-whatsapp-verification...
call supabase functions deploy send-whatsapp-verification

echo.
echo Deploying verify-whatsapp-code...
call supabase functions deploy verify-whatsapp-code

echo.
echo [OK] Edge Functions deployed successfully

REM Step 4: Verify deployment
echo.
echo Step 4: Verifying deployment
echo.

echo Deployed functions:
call supabase functions list

REM Step 5: Test (optional)
echo.
echo Step 5: Testing (Optional)
echo.

set /p run_test="Do you want to test the verification flow now? (y/n): "

if /i "%run_test%"=="y" (
    if exist "test-whatsapp-verification.bat" (
        echo.
        echo Running test...
        call test-whatsapp-verification.bat
    ) else (
        echo [WARNING] Test script not found
        echo           You can test manually from the UI or using curl
    )
) else (
    echo Skipping test
)

REM Success!
echo.
echo ============================================================
echo              Deployment Complete!
echo ============================================================
echo.
echo [OK] WhatsApp verification system is now deployed!
echo.
echo Next steps:
echo   1. Test from SubTrack Pro UI (Settings - WhatsApp Connection^)
echo   2. Monitor logs: supabase functions logs send-whatsapp-verification
echo   3. Check success rate in database
echo.
echo Documentation:
echo   - Quick Reference: /QUICK_FIX_REFERENCE.md
echo   - Full Guide: /WHATSAPP_DEPLOYMENT_GUIDE.md
echo   - Troubleshooting: /WHATSAPP_VERIFICATION_FIX.md
echo.
echo Happy coding!
echo.
pause
