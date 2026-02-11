# Authentication Troubleshooting Guide

## Common Login Errors and Solutions

### Error: "Invalid login credentials"

**What it means:** The email/password combination doesn't match any account in the system.

**Solutions:**

1. **Make sure you have an account**
   - If you're a new user, you need to **Sign Up** first before you can sign in
   - Click "Don't have an account? Sign Up" on the login page

2. **Check your credentials**
   - Verify your email address is spelled correctly
   - Make sure your password is correct (passwords are case-sensitive)
   - Try resetting your password if you've forgotten it

3. **Try Demo Mode first**
   - Click "Try Demo Mode" to explore the app without signing in
   - This helps verify the app is working correctly

### Error: "Email not confirmed"

**What it means:** Your account was created but the email hasn't been verified yet.

**Solutions:**

1. **Check your email inbox**
   - Look for a confirmation email from Supabase
   - Click the confirmation link in the email

2. **Check spam folder**
   - The confirmation email might be in your spam/junk folder

3. **Wait a moment and try again**
   - Sometimes there's a slight delay in email confirmation

### Error: "Password must be at least 6 characters long"

**What it means:** Your password is too short.

**Solutions:**

1. **Use a longer password**
   - Create a password with at least 6 characters
   - We recommend using 8+ characters for better security

2. **Include variety**
   - Mix uppercase and lowercase letters
   - Add numbers and special characters
   - Example: `SecurePass123!`

## Sign Up Issues

### Account Creation Steps

1. Click "Don't have an account? Sign Up"
2. Fill in all required fields:
   - **Full Name**: Your real name or preferred display name
   - **Email**: A valid email address you have access to
   - **WhatsApp Phone**: Your phone number (with country code, e.g., +1 234 567 8900)
   - **Password**: At least 6 characters
3. Click "Create Account"
4. Wait for the success message
5. You'll be automatically signed in

### Common Sign Up Errors

**"A user with this email address has already been registered"**
- This email is already in use
- Try signing in instead of signing up
- Or use a different email address

**"Please enter a valid email address"**
- Check that your email is properly formatted
- Example: `user@example.com`

**"Password must be at least 6 characters long"**
- Your password is too short
- Create a password with 6+ characters

## Sign In Issues

### Sign In Steps

1. Enter your **registered email address**
2. Enter your **password**
3. Click "Sign In"
4. Wait for authentication to complete

### Common Sign In Errors

**"Invalid email or password"**
- **Most common cause:** You haven't created an account yet
- **Solution:** Click "Sign Up" to create an account first
- Or verify you're using the correct email and password

**"Failed to create session"**
- This is a temporary error
- Try signing in again
- If it persists, try clearing your browser cache

## Demo Mode

If you're having trouble with authentication, try Demo Mode:

1. Click the "Try Demo Mode" button
2. You'll see the app with sample data
3. This doesn't require any authentication
4. Perfect for exploring features before signing up

## Browser Issues

### Clear Cache and Cookies

If you're experiencing persistent issues:

1. **Chrome/Edge:**
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Select "Cookies and other site data" and "Cached images and files"
   - Click "Clear data"

2. **Firefox:**
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Select "Cookies" and "Cache"
   - Click "Clear Now"

3. **Safari:**
   - Safari → Preferences → Privacy → Manage Website Data
   - Find the app's URL and remove data
   - Or click "Remove All"

### Try Incognito/Private Mode

1. Open an incognito/private browser window
2. Navigate to the app
3. Try signing up or signing in
4. This helps identify if browser extensions or cache are causing issues

## Advanced Troubleshooting

### Check Your Internet Connection

- Make sure you have a stable internet connection
- Try refreshing the page
- Check if other websites are loading

### Verify Supabase is Working

1. Open browser developer tools (F12)
2. Go to the Console tab
3. Look for error messages
4. Common errors:
   - Network errors: Check your internet connection
   - 401 Unauthorized: Your session expired, try logging in again
   - 500 Server errors: Temporary backend issue, try again in a moment

### Use Debug Mode

Access the debug page to check your authentication status:

1. Add `#debug` to the URL
   - Example: `https://yourapp.com/#debug`
2. Check the authentication status indicators:
   - ✅ User object exists
   - ✅ Email present
   - ✅ Access token present
3. If you see ❌ marks, you need to sign in again

### Check localStorage

1. Open browser developer tools (F12)
2. Go to Application → Local Storage
3. Find `subtrack_user`
4. If it's corrupted or missing, you need to sign in again
5. You can clear it by running in Console:
   ```javascript
   localStorage.removeItem('subtrack_user');
   location.reload();
   ```

## Step-by-Step: First Time User

### For New Users (Never Used the App Before)

1. **Start with Demo Mode** (Optional)
   - Click "Try Demo Mode" to explore the app
   - See how it works with sample data
   - No account needed

2. **Create Your Account**
   - Click "Don't have an account? Sign Up"
   - Fill in all fields:
     - Full Name: `John Doe`
     - Email: `john@example.com`
     - Phone: `+1 234 567 8900`
     - Password: `SecurePass123` (or stronger)
   - Click "Create Account"

3. **Automatic Sign In**
   - After successful signup, you're automatically signed in
   - You'll see your dashboard

4. **Start Using the App**
   - Add your first subscription
   - Explore features
   - Customize settings

### For Returning Users

1. **Sign In**
   - Enter your registered email
   - Enter your password
   - Click "Sign In"

2. **Session Persistence**
   - Your session is saved in your browser
   - You won't need to sign in every time
   - Session lasts for 7 days (or until you log out)

## Security Best Practices

### Strong Passwords

- Use at least 8 characters
- Include uppercase and lowercase letters
- Add numbers and special characters
- Don't reuse passwords from other sites
- Consider using a password manager

### Account Security

- Never share your password
- Sign out when using shared computers
- Update your password regularly
- Enable 2FA when available (coming soon)

## Still Having Issues?

### Quick Checklist

- [ ] Have you created an account? (Sign Up)
- [ ] Are you using the correct email?
- [ ] Is your password at least 6 characters?
- [ ] Have you tried clearing browser cache?
- [ ] Have you tried Demo Mode?
- [ ] Have you checked the browser console for errors?
- [ ] Have you tried a different browser?

### Contact Support

If you've tried everything above and still can't sign in:

1. Take a screenshot of any error messages
2. Note what you were doing when the error occurred
3. Check the browser console (F12) for error messages
4. Try accessing the debug page (`#debug` in URL)
5. Report the issue with:
   - Error message
   - Steps to reproduce
   - Browser and version
   - Screenshot of debug page (if possible)

## Understanding Error Messages

### Frontend Errors (Browser)

These appear in the UI with colored boxes:

- **Red box (Error):** Something went wrong, read the message carefully
- **Green box (Success):** Action completed successfully
- **Blue box (Info):** Helpful information or tips
- **Yellow box (Warning):** Caution or upcoming issue

### Console Errors (Developer Tools)

Open browser console (F12) to see technical errors:

- **401 Unauthorized:** Need to sign in or session expired
- **400 Bad Request:** Invalid data submitted
- **404 Not Found:** Resource doesn't exist
- **500 Server Error:** Backend issue, try again later
- **Network Error:** Internet connection issue

## Prevention Tips

### To Avoid Future Issues

1. **Use a password manager**
   - Stores your credentials securely
   - Auto-fills login forms
   - Prevents typos

2. **Keep session active**
   - Don't clear browser data frequently
   - Stay logged in if it's your personal device

3. **Use a modern browser**
   - Chrome, Firefox, Safari, or Edge
   - Keep your browser updated
   - Disable aggressive ad blockers that might interfere

4. **Bookmark the app**
   - Easy access to the login page
   - Avoid typos in the URL

## FAQ

**Q: Do I need to verify my email?**
A: In development mode, emails are auto-confirmed. In production, you may need to verify your email.

**Q: How long does my session last?**
A: Sessions last for 7 days or until you manually log out.

**Q: Can I use the same email for multiple accounts?**
A: No, each email can only be associated with one account.

**Q: What if I forget my password?**
A: Password reset functionality will be added soon. For now, create a new account with a different email if needed.

**Q: Is my data secure?**
A: Yes, we use Supabase authentication with industry-standard security. All data is encrypted.

**Q: Can I change my email address?**
A: Account email changes will be available in Settings (coming soon).

**Q: Why do I need to provide a phone number?**
A: For WhatsApp integration and notifications. This will be used for subscription reminders.

---

**Last Updated:** December 3, 2024
**Version:** 1.0
**Status:** Active
