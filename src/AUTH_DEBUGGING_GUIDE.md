# Authentication Debugging Guide

## Current Issue: 401 Unauthorized Errors

The application is experiencing 401 errors when making API calls to `/subscriptions` and `/analytics` endpoints.

## Debugging Steps Added

### 1. Frontend Logging
Added console logging at multiple points to trace the authentication flow:

#### In AuthPage.tsx
- Logs sign-in response
- Logs access token (first 20 characters)
- Logs user data being passed to onLogin

#### In App.tsx (handleLogin)
- Logs user data received
- Logs access token presence
- Logs when data is stored in localStorage

#### In App.tsx (useEffect - session restore)
- Logs restored user data from localStorage
- Shows if access token is present after page refresh

#### In utils/api.ts
- Logs every authenticated API call
- Shows endpoint being called
- Shows access token (first 20 characters)
- Validates token exists before making call

#### In Backend (index.tsx)
- Logs Authorization header received
- Logs token verification process
- Logs user authentication success/failure

### 2. How to Debug

#### Step 1: Open Browser Console
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Clear console (Ctrl+L)

#### Step 2: Sign In
1. Enter credentials and sign in
2. Watch console for:
   ```
   Sign in response: { success: true, session: {...}, user: {...} }
   Access token (first 20 chars): eyJhbGciOiJIUzI1Ni...
   User data being passed to onLogin: { email: "...", accessToken: "eyJhbGci..." }
   handleLogin called with userData: { email: "...", accessToken: "eyJhbGci..." }
   Stored user data in localStorage
   ```

#### Step 3: Check API Calls
1. Navigate to Subscriptions page
2. Watch console for:
   ```
   Making authenticated API call to: /subscriptions
   Access token (first 20 chars): eyJhbGciOiJIUzI1Ni...
   ```

#### Step 4: Check Backend Logs
1. Go to Supabase Dashboard
2. Go to Edge Functions > server > Logs
3. Look for:
   ```
   Authorization header: Bearer eyJhbGci...
   Verifying access token (first 20 chars): eyJhbGci...
   User authenticated successfully: <user-id>
   ```

### 3. Common Issues & Solutions

#### Issue 1: Access Token is Missing
**Symptom:** 
```
Access token (first 20 chars): undefined...
No access token provided for authenticated call
```

**Cause:** Sign-in response doesn't contain session.access_token

**Solution:**
- Check backend sign-in endpoint returns session
- Verify AuthPage.tsx extracts access_token correctly
- Check response structure matches expected format

#### Issue 2: Access Token is Invalid
**Symptom:**
```
API Error: 401 Unauthorized
Backend: Token verification error: Invalid JWT
```

**Cause:** Token format is wrong or expired

**Solution:**
- Verify token is a valid JWT (has 3 parts separated by dots)
- Check token hasn't expired
- Ensure using correct Supabase keys (SUPABASE_SERVICE_ROLE_KEY in backend)

#### Issue 3: Token Not Sent to Backend
**Symptom:**
```
Frontend: Making authenticated API call to: /subscriptions
Backend: No access token found in Authorization header
```

**Cause:** Authorization header not being sent

**Solution:**
- Check api.ts authenticatedApiCall function
- Verify headers are being merged correctly
- Check CORS settings allow Authorization header

#### Issue 4: Session Not Persisting
**Symptom:** Works on login, but fails after refresh

**Cause:** localStorage not storing or loading correctly

**Solution:**
- Check localStorage in DevTools > Application > Local Storage
- Verify 'subtrack_user' key exists
- Check accessToken is in stored object
- Verify useEffect in App.tsx runs on mount

### 4. Manual Testing Checklist

- [ ] Console shows "Sign in response" with session object
- [ ] Console shows access_token (not undefined)
- [ ] Console shows "handleLogin called" with accessToken
- [ ] Console shows "Stored user data in localStorage"
- [ ] localStorage contains 'subtrack_user' with accessToken
- [ ] On refresh, console shows "Restored user from localStorage"
- [ ] Restored user has accessToken
- [ ] API calls show "Making authenticated API call"
- [ ] API calls show valid access_token
- [ ] Backend logs show "User authenticated successfully"

### 5. Expected Console Output (Successful Flow)

```javascript
// On Sign In
Sign in response: {
  success: true,
  session: {
    access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    refresh_token: "...",
    expires_in: 3600
  },
  user: {
    id: "uuid-here",
    email: "user@example.com",
    user_metadata: { name: "User Name" }
  }
}

Access token (first 20 chars): eyJhbGciOiJIUzI1NiIs...

User data being passed to onLogin: {
  id: "uuid-here",
  email: "user@example.com",
  name: "User Name",
  accessToken: "eyJhbGciOiJIUzI1NiIs..."
}

handleLogin called with userData: {
  id: "uuid-here",
  email: "user@example.com",
  accessToken: "eyJhbGciOiJIUzI1NiIs..."
}

Stored user data in localStorage

// On Page Load (after refresh)
Restored user from localStorage: {
  id: "uuid-here",
  email: "user@example.com",
  accessToken: "eyJhbGciOiJIUzI1NiIs..."
}

// When Loading Subscriptions
Making authenticated API call to: /subscriptions
Access token (first 20 chars): eyJhbGciOiJIUzI1NiIs...
```

### 6. Backend Logs (Expected)

```
Authorization header: Bearer eyJhbGci...
Verifying access token (first 20 chars): eyJhbGciOiJIUzI1Ni...
User authenticated successfully: uuid-here
GET /make-server-333e8892/subscriptions 200
```

### 7. Quick Fix Commands

#### Clear All Data and Start Fresh
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

#### Check Stored Session
```javascript
// In browser console:
const user = JSON.parse(localStorage.getItem('subtrack_user'));
console.log('Stored user:', user);
console.log('Has accessToken:', !!user?.accessToken);
console.log('Access token:', user?.accessToken?.substring(0, 50));
```

#### Test API Call Manually
```javascript
// In browser console:
const user = JSON.parse(localStorage.getItem('subtrack_user'));
fetch('https://YOUR_PROJECT.supabase.co/functions/v1/make-server-333e8892/subscriptions', {
  headers: {
    'Authorization': `Bearer ${user.accessToken}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### 8. Next Steps Based on Console Output

#### If you see: "No access token provided for authenticated call"
→ Check sign-in response structure
→ Verify response.session.access_token exists
→ Check AuthPage.tsx line 68

#### If you see: "API Error: 401"
→ Check backend logs for token verification
→ Verify Supabase keys are correct
→ Check token format (should be JWT)

#### If you see: "MISSING" for accessToken
→ Session not being created properly
→ Check backend /auth/signin endpoint
→ Verify Supabase auth is configured

### 9. Environment Variables to Check

In Supabase Dashboard → Project Settings → Edge Functions:

- [ ] SUPABASE_URL is set
- [ ] SUPABASE_SERVICE_ROLE_KEY is set (not anon key)
- [ ] SUPABASE_ANON_KEY is set

### 10. Demo Mode vs Real Auth

Remember:
- **Demo Mode**: No API calls, uses local data only
- **Real Auth**: Requires valid access token for all API calls

To test:
1. Try Demo Mode first (should work without 401 errors)
2. Then test Real Auth (check console for token flow)

---

## Current Status

✅ Logging added throughout authentication flow  
✅ Frontend validation for access tokens  
✅ Backend logging for token verification  
⏳ Awaiting console output to diagnose issue  

## Report Back

Please run the application and provide:
1. Console output from sign-in
2. Console output from first API call
3. Any error messages
4. Backend logs from Supabase if possible

This will help identify exactly where the authentication is failing.
