# SubTrack Pro - Troubleshooting Guide

## Authentication Issues

### "Invalid login credentials" Error

**Problem**: You see the error "Invalid login credentials" when trying to sign in.

**Solutions**:

1. **You haven't created an account yet**
   - Click "Don't have an account? Sign Up" to create a new account
   - Fill in all required fields (name, email, phone, password)
   - After signup, you'll be automatically signed in

2. **Incorrect email or password**
   - Double-check your email address for typos
   - Ensure your password is correct (passwords are case-sensitive)
   - Use the "Demo Mode" button to explore the app without an account

3. **Demo Mode**
   - Click the "Try Demo Mode" button on the login page
   - This lets you explore all features with sample data
   - No account creation required
   - Perfect for testing before committing

### Using Demo Mode

Demo Mode is the easiest way to explore SubTrack Pro:

1. On the login page, click "Try Demo Mode"
2. You'll see a "🎭 Demo Mode" badge in the sidebar
3. All features are available with sample data
4. Your changes won't be saved (demo only)
5. To create a real account, logout and sign up

### Creating Your First Account

**Step-by-step**:

1. Click "Don't have an account? Sign Up"
2. Enter your information:
   - **Full Name**: Your name (e.g., "John Doe")
   - **Email**: A valid email address
   - **WhatsApp Phone**: Your phone number with country code (e.g., "+1 234 567 8900")
   - **Password**: At least 6 characters (choose a strong password)
3. Click "Create Account"
4. You'll be automatically signed in
5. A welcome guide will appear - take the tour or skip it

### Session Management

**How sessions work**:

- Your session is saved in browser localStorage
- You'll stay logged in even after closing the browser
- Click "Logout" in the sidebar to end your session
- Demo mode sessions are not saved

**If you're unexpectedly logged out**:
- Your session may have expired
- Simply sign in again with your credentials
- Or use Demo Mode for quick access

## Common Issues

### 1. Can't see my subscriptions

**If you just signed up**:
- New accounts start with no subscriptions
- Click "Subscriptions" in the sidebar
- Click "Add Subscription" to create your first one
- Or try the WhatsApp Chat interface to add subscriptions conversationally

**If you're in Demo Mode**:
- Demo accounts have pre-populated sample data
- Your changes won't persist between sessions

### 2. Forgot password

Currently, password reset is not implemented in this prototype. If you forget your password:
- Use Demo Mode to access the app
- Contact support for assistance
- Or create a new account with a different email

### 3. WhatsApp integration not working

The WhatsApp Business API integration requires:
- WhatsApp Business API account
- Verified business profile
- Webhook configuration
- API credentials

**For this prototype**:
- The chat interface is simulated
- Real WhatsApp messages are not sent
- The conversational UI demonstrates the intended UX
- Full integration requires production WhatsApp API setup

### 4. Features not loading

**Try these steps**:
1. Refresh the browser page
2. Check browser console for errors (F12 → Console)
3. Clear browser cache and cookies
4. Try a different browser
5. Check your internet connection

### 5. Data not saving

**If in Demo Mode**:
- Demo data is not saved between sessions
- This is intentional for demo purposes
- Create a real account to save data

**If you have an account**:
- Ensure you're connected to the internet
- Check the browser console for error messages
- Your data is stored securely in Supabase

## Feature-Specific Issues

### Subscription Manager

**Adding subscriptions**:
1. Go to "Subscriptions" in the sidebar
2. Click "Add Subscription"
3. Fill in all required fields:
   - Service Name (e.g., "Netflix")
   - Amount (e.g., "15.99")
   - Currency (e.g., "USD")
   - Billing Cycle (Monthly, Yearly, or Weekly)
   - Next Billing Date
   - Category
   - Payment Method
4. Click "Add Subscription"

**Editing or deleting**:
- Click the three dots (⋮) on any subscription card
- Select Edit or Delete

### Chat Interface

The WhatsApp-style chat is currently simulated:
- Type messages to interact with the bot
- Use quick reply buttons for fast actions
- Try phrases like:
  - "View my subscriptions"
  - "Add new subscription"
  - "Show analytics"
  - "Find savings"
  - "Netflix $15.99 on the 5th"

### Family Sharing

**Inviting members**:
1. Go to "Family Sharing"
2. Click "Invite Member"
3. Enter email and select role
4. Click "Send Invitation"

**Note**: Email delivery is not configured in this prototype

### Analytics

Analytics are calculated in real-time based on your subscriptions:
- Total monthly/yearly spending
- Category breakdown
- Top subscriptions
- AI-powered insights
- Savings recommendations

## Browser Compatibility

**Supported browsers**:
- Chrome (recommended)
- Firefox
- Safari
- Edge

**Not supported**:
- Internet Explorer
- Very old browser versions

## Data & Privacy

**Your data is**:
- Stored securely in Supabase
- Encrypted in transit (HTTPS)
- GDPR compliant
- Never sold or shared with third parties

**Demo mode**:
- Uses sample data only
- Nothing is stored on servers
- Completely private and anonymous

## Getting Help

### In-App Support

1. Check the Settings page for preferences
2. Review this troubleshooting guide
3. Try Demo Mode to test features

### Technical Support

For production deployment issues:
- Check server logs in Supabase dashboard
- Review browser console for errors
- Verify API endpoints are accessible
- Ensure environment variables are set

### Feature Requests

This is a prototype application. For production use:
- Additional features can be implemented
- Custom integrations can be added
- Enterprise features are available
- WhatsApp API can be fully integrated

## Quick Tips

### For New Users

1. **Start with Demo Mode** - Explore without commitment
2. **Take the Welcome Tour** - Learn the interface
3. **Add one subscription** - Test the workflow
4. **Try the Chat Interface** - Experience conversational management
5. **Check Analytics** - See insights in action

### For Power Users

1. **Use keyboard shortcuts** - Navigate faster
2. **Set up reminders** - Never miss a payment
3. **Invite family** - Share and split costs
4. **Review insights** - Optimize spending monthly
5. **Export data** - Keep records (Settings → Export)

### Best Practices

1. **Use strong passwords** - Keep your account secure
2. **Enable all reminders** - Stay on top of payments
3. **Review spending monthly** - Track your budget
4. **Act on AI insights** - Save money automatically
5. **Keep subscriptions updated** - Maintain accurate data

## Still Having Issues?

If you're still experiencing problems:

1. **Try Demo Mode** - Bypass authentication entirely
2. **Create a new account** - Fresh start
3. **Different browser** - Rule out browser issues
4. **Clear cache** - Remove old data
5. **Check console logs** - Look for error messages

---

**Remember**: This is a prototype application. For production deployment with full features, additional setup and configuration is required.

## Version Information

- **Application**: SubTrack Pro v1.0
- **Framework**: React 18 + TypeScript
- **Backend**: Supabase + Deno Edge Functions
- **Authentication**: Supabase Auth
- **Database**: Supabase KV Store

---

**Need more help?** Check the README.md file for complete documentation.
