@echo off
REM WhatsApp Verification Test Script for Windows
REM This script tests the WhatsApp verification flow

echo.
echo WhatsApp Verification Test Script
echo =====================================
echo.

REM Configuration
set SUPABASE_URL=https://kkffwzvyfbkhhoxztsgn.supabase.co
set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZmZ3enZ5ZmJraGhveHp0c2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjA4MDEsImV4cCI6MjA3NzQ5NjgwMX0.pJtQlX6dF7j8kAniWPDUNkT_MQfrJluvwacNKFqlfCQ

REM Get phone number from user
set /p PHONE_NUMBER="Enter phone number (with country code, e.g., +12345678900): "

REM Generate a test user ID
set USER_ID=test-user-%RANDOM%

echo.
echo Testing with:
echo    Phone: %PHONE_NUMBER%
echo    User ID: %USER_ID%
echo.

REM Step 1: Send verification code
echo Step 1: Sending verification code...
echo.

curl -X POST "%SUPABASE_URL%/functions/v1/send-whatsapp-verification" ^
  -H "Authorization: Bearer %SUPABASE_ANON_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"phoneNumber\":\"%PHONE_NUMBER%\",\"userId\":\"%USER_ID%\"}"

echo.
echo.

if %ERRORLEVEL% neq 0 (
  echo Failed to send verification code!
  echo.
  echo Common issues:
  echo   1. WhatsApp API credentials not set in Supabase
  echo   2. Edge Functions not deployed
  echo   3. Invalid phone number format
  echo   4. WhatsApp API token expired
  echo.
  echo Check the deployment guide: /WHATSAPP_DEPLOYMENT_GUIDE.md
  pause
  exit /b 1
)

echo Verification code sent successfully!
echo.

REM Step 2: Get verification code from user
set /p VERIFICATION_CODE="Enter the 6-digit code you received on WhatsApp: "

echo.
echo Step 2: Verifying code...
echo.

curl -X POST "%SUPABASE_URL%/functions/v1/verify-whatsapp-code" ^
  -H "Authorization: Bearer %SUPABASE_ANON_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"phoneNumber\":\"%PHONE_NUMBER%\",\"verificationCode\":\"%VERIFICATION_CODE%\",\"userId\":\"%USER_ID%\"}"

echo.
echo.

if %ERRORLEVEL% neq 0 (
  echo Verification failed!
  echo.
  echo Common issues:
  echo   1. Incorrect code entered
  echo   2. Code expired (10 minute limit)
  echo   3. Too many failed attempts (5 max)
  echo.
  pause
  exit /b 1
)

echo Phone number verified successfully!
echo.
echo WhatsApp verification is working correctly!
echo.
echo Next steps:
echo   1. Test from the SubTrack Pro UI
echo   2. Test with different phone numbers
echo   3. Deploy to production
echo.
pause
