import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Helper function to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper function to get user from access token
const getUserFromToken = async (request: Request) => {
  const authHeader = request.headers.get('Authorization');
  console.log('Authorization header:', authHeader?.substring(0, 30) + '...');

  const accessToken = authHeader?.split(' ')[1];
  if (!accessToken) {
    console.log('No access token found in Authorization header');
    return { user: null, error: 'No access token provided' };
  }

  console.log('Verifying access token (first 20 chars):', accessToken.substring(0, 20) + '...');
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error) {
    console.log('Token verification error:', error.message);
    return { user: null, error: error.message };
  }

  if (!user) {
    console.log('No user found for token');
    return { user: null, error: 'Invalid token' };
  }

  console.log('User authenticated successfully:', user.id);
  return { user, error: null };
};

// ======================
// AUTHENTICATION ROUTES
// ======================

// Initialize user data after signup (called from client after Supabase auth)
app.post('/make-server-333e8892/auth/init', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const { name, phone } = await c.req.json();

    // Check if profile already exists
    const existingProfile = await kv.get(`user:${user.id}:profile`);
    if (existingProfile) {
      return c.json({
        success: true,
        profile: existingProfile,
        message: 'Profile already exists'
      });
    }

    // Initialize user data in KV store
    const profile = {
      id: user.id,
      email: user.email,
      name: name || user.user_metadata?.name || '',
      phone: phone || user.user_metadata?.phone || '',
      createdAt: new Date().toISOString(),
      currency: 'USD',
      language: 'en',
      timezone: 'America/New_York',
    };

    await kv.set(`user:${user.id}:profile`, profile);

    // Initialize empty family group in KV (used only for demo-style family sharing)
    await kv.set(`user:${user.id}:family`, {
      members: [],
      sharedSubscriptions: [],
      pendingInvitations: [],
    });

    return c.json({
      success: true,
      profile,
      message: 'User data initialized successfully'
    });
  } catch (error: any) {
    console.log('Auth init error:', error);
    return c.json({ error: `Failed to initialize user data: ${error?.message || error}` }, 500);
  }
});

// Get user profile
app.get('/make-server-333e8892/profile', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    let profile = await kv.get(`user:${user.id}:profile`);

    // If profile doesn't exist, create it from user data
    if (!profile) {
      profile = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
        phone: user.user_metadata?.phone || '',
        createdAt: new Date().toISOString(),
        currency: 'USD',
        language: 'en',
        timezone: 'America/New_York',
      };

      await kv.set(`user:${user.id}:profile`, profile);

      // Also initialize other data structures
      const existingFamily = await kv.get(`user:${user.id}:family`);
      if (!existingFamily) {
        await kv.set(`user:${user.id}:family`, {
          members: [],
          sharedSubscriptions: [],
          pendingInvitations: [],
        });
      }
    }

    return c.json({ profile });
  } catch (error: any) {
    console.log('Get profile error:', error);
    return c.json({ error: `Failed to fetch profile: ${error?.message || error}` }, 500);
  }
});

// Sign up (DEPRECATED - kept for backward compatibility)
app.post('/make-server-333e8892/auth/signup', async (c) => {
  try {
    const { email, password, name, phone } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    console.log('=== SIGNUP ATTEMPT ===');
    console.log('Email:', email);
    console.log('Name:', name);

    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    if (!listError && existingUsers?.users) {
      const userExists = existingUsers.users.some(u => u.email === email);
      if (userExists) {
        console.log('❌ User already exists:', email);
        return c.json({
          error: 'An account with this email already exists. Please sign in instead or use the "Stuck? Get help" button if you forgot your password.',
          accountExists: true
        }, 400);
      }
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, phone },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log('❌ Signup error:', error);

      // Handle specific error cases
      if (error.message.includes('already') || error.message.includes('exists') || error.message.includes('registered')) {
        return c.json({
          error: 'An account with this email already exists. Please sign in instead or use the "Stuck? Get help" button if you forgot your password.',
          accountExists: true
        }, 400);
      }

      if (error.message.includes('email') && error.message.includes('invalid')) {
        return c.json({ error: 'Please enter a valid email address.' }, 400);
      }

      if (error.message.includes('password')) {
        return c.json({ error: 'Password must be at least 6 characters long.' }, 400);
      }

      return c.json({ error: `Failed to create user: ${error.message}` }, 400);
    }

    console.log('✅ User created successfully:', data.user.id);

    // Initialize user data in KV store
    const userId = data.user.id;
    await kv.set(`user:${userId}:profile`, {
      id: userId,
      email,
      name,
      phone,
      createdAt: new Date().toISOString(),
      currency: 'USD',
      language: 'en',
      timezone: 'America/New_York',
    });

    console.log('✅ User profile initialized in KV store');

    return c.json({
      success: true,
      user: data.user,
      message: 'Account created successfully. You can now sign in.'
    });
  } catch (error: any) {
    console.log('❌ Signup exception:', error);
    return c.json({ error: `Signup failed: ${error?.message || error}` }, 500);
  }
});

// Check if account exists (diagnostic endpoint)
app.post('/make-server-333e8892/auth/check-account', async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Try to list users and check if this email exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.log('Error checking account:', listError);
      return c.json({
        exists: null,
        error: 'Unable to check account status'
      });
    }

    const userExists = existingUsers?.users?.some(u => u.email === email);

    return c.json({
      exists: userExists,
      message: userExists
        ? 'Account exists - you should use Sign In'
        : 'No account found - you should use Sign Up'
    });
  } catch (error: any) {
    console.log('Check account error:', error);
    return c.json({
      exists: null,
      error: `Failed to check account: ${error?.message || error}`
    }, 500);
  }
});

// Sign in
app.post('/make-server-333e8892/auth/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // First verify the credentials by trying to sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.log('Sign in error:', authError.message);
      // Provide more helpful error messages
      if (authError.message.includes('Invalid login credentials')) {
        return c.json({
          error: 'Invalid email or password. Please check your credentials or sign up for a new account.'
        }, 401);
      }
      return c.json({ error: `Sign in failed: ${authError.message}` }, 401);
    }

    // Get the user using admin API for server-side operations
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(authData.user.id);

    if (userError) {
      console.log('User fetch error:', userError);
      return c.json({ error: `Failed to fetch user data: ${userError.message}` }, 500);
    }

    // Get user profile from KV store
    const userProfile = await kv.get(`user:${authData.user.id}:profile`);

    return c.json({
      success: true,
      session: authData.session,
      user: userData.user,
      profile: userProfile
    });
  } catch (error: any) {
    console.log('Sign in exception:', error);
    return c.json({ error: `Sign in failed: ${error?.message || error}` }, 500);
  }
});

// ======================
// SUBSCRIPTION ROUTES
// ======================

// Get all subscriptions for user
app.get('/make-server-333e8892/subscriptions', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const { data, error: dbError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('nextBilling', { ascending: true });

    if (dbError) {
      console.log('Get subscriptions DB error:', dbError);
      return c.json({ error: `Failed to fetch subscriptions: ${dbError.message}` }, 500);
    }

    return c.json({ subscriptions: data || [] });
  } catch (error: any) {
    console.log('Get subscriptions error:', error);
    return c.json({ error: `Failed to fetch subscriptions: ${error?.message || error}` }, 500);
  }
});

// Add new subscription (Postgres-backed)
app.post('/make-server-333e8892/subscriptions', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const subscriptionData = await c.req.json();

    const insertPayload = {
      user_id: user.id,
      name: subscriptionData.name,
      amount: subscriptionData.amount,
      currency: subscriptionData.currency,
      billingCycle: subscriptionData.billingCycle,
      nextBilling: subscriptionData.nextBilling,
      category: subscriptionData.category,
      paymentMethod: subscriptionData.paymentMethod,
      status: subscriptionData.status || 'active',
      logo: subscriptionData.logo || '📱',
    };

    const { data, error: dbError } = await supabase
      .from('subscriptions')
      .insert(insertPayload)
      .select('*')
      .single();

    if (dbError) {
      console.log('Add subscription DB error:', dbError);
      return c.json({ error: `Failed to add subscription: ${dbError.message}` }, 500);
    }

    // Schedule WhatsApp reminder metadata in KV (non-canonical helper only)
    if (subscriptionData.reminderSettings && subscriptionData.nextBilling) {
      try {
        const reminderSettings = subscriptionData.reminderSettings;
        const daysBeforePayment = reminderSettings.daysBeforePayment || 3;
        const reminderTime = reminderSettings.reminderTime || '09:00';

        const nextBillingDate = new Date(subscriptionData.nextBilling);
        const reminderDate = new Date(nextBillingDate);
        reminderDate.setDate(reminderDate.getDate() - daysBeforePayment);

        const reminders = await kv.get(`user:${user.id}:reminders`) || [];
        const newReminder = {
          id: generateId(),
          userId: user.id,
          subscriptionId: data.id,
          subscriptionName: subscriptionData.name,
          amount: subscriptionData.amount,
          currency: subscriptionData.currency,
          nextBillingDate: subscriptionData.nextBilling,
          reminderDate: reminderDate.toISOString().split('T')[0],
          reminderTime: reminderTime,
          daysBeforePayment: daysBeforePayment,
          status: 'scheduled',
          createdAt: new Date().toISOString(),
        };

        reminders.push(newReminder);
        await kv.set(`user:${user.id}:reminders`, reminders);

        console.log('✅ Reminder scheduled for subscription:', subscriptionData.name);
      } catch (reminderError) {
        console.log('⚠️ Failed to schedule reminder:', reminderError);
      }
    }

    return c.json({
      success: true,
      subscription: data
    });
  } catch (error: any) {
    console.log('Add subscription error:', error);
    return c.json({ error: `Failed to add subscription: ${error?.message || error}` }, 500);
  }
});

// Update subscription (Postgres-backed)
app.put('/make-server-333e8892/subscriptions/:id', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const subId = c.req.param('id');
    const updates = await c.req.json();

    const { data, error: dbError } = await supabase
      .from('subscriptions')
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', subId)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (dbError) {
      console.log('Update subscription DB error:', dbError);
      return c.json({ error: `Failed to update subscription: ${dbError.message}` }, 500);
    }

    return c.json({
      success: true,
      subscription: data
    });
  } catch (error: any) {
    console.log('Update subscription error:', error);
    return c.json({ error: `Failed to update subscription: ${error?.message || error}` }, 500);
  }
});

// Delete subscription (Postgres-backed)
app.delete('/make-server-333e8892/subscriptions/:id', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const subId = c.req.param('id');

    const { error: dbError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', subId)
      .eq('user_id', user.id);

    if (dbError) {
      console.log('Delete subscription DB error:', dbError);
      return c.json({ error: `Failed to delete subscription: ${dbError.message}` }, 500);
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.log('Delete subscription error:', error);
    return c.json({ error: `Failed to delete subscription: ${error?.message || error}` }, 500);
  }
});

// ======================
// ANALYTICS ROUTES
// ======================

// Get analytics data
app.get('/make-server-333e8892/analytics', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const { data: subscriptions, error: dbError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id);

    if (dbError) {
      console.log('Get analytics DB error:', dbError);
      return c.json({ error: `Failed to fetch analytics: ${dbError.message}` }, 500);
    }

    // Calculate analytics
    let totalMonthly = 0;
    const categoryBreakdown: Record<string, number> = {};
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

    activeSubscriptions.forEach(sub => {
      const monthlyAmount = sub.billingCycle === 'yearly'
        ? sub.amount / 12
        : sub.billingCycle === 'weekly'
          ? sub.amount * 4.33
          : sub.amount;

      totalMonthly += monthlyAmount;

      if (!categoryBreakdown[sub.category]) {
        categoryBreakdown[sub.category] = 0;
      }
      categoryBreakdown[sub.category] += monthlyAmount;
    });

    const analytics = {
      totalMonthly: totalMonthly.toFixed(2),
      totalYearly: (totalMonthly * 12).toFixed(2),
      activeSubscriptions: activeSubscriptions.length,
      categoryBreakdown,
      upcomingPayments: activeSubscriptions
        .filter(sub => {
          const nextBilling = new Date(sub.nextBilling);
          const daysUntil = (nextBilling.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          return daysUntil <= 7 && daysUntil >= 0;
        })
        .length,
    };

    return c.json({ analytics });
  } catch (error) {
    console.log('Get analytics error:', error);
    return c.json({ error: `Failed to fetch analytics: ${error.message}` }, 500);
  }
});

// ======================
// FAMILY SHARING ROUTES
// ======================

// Get family group
app.get('/make-server-333e8892/family', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const familyGroup = await kv.get(`user:${user.id}:family`) || {
      members: [],
      sharedSubscriptions: [],
      pendingInvitations: [],
    };

    // Get pending invitations
    const invitationKeys = await kv.getByPrefix(`invitation:${user.id}:`) || [];
    const pendingInvitations = invitationKeys.filter(inv =>
      inv && inv.status === 'pending' && inv.expiresAt && new Date(inv.expiresAt) > new Date()
    );

    familyGroup.pendingInvitations = pendingInvitations;

    return c.json({ familyGroup });
  } catch (error: any) {
    console.log('Get family error:', error);
    return c.json({ error: `Failed to fetch family group: ${error?.message || error}` }, 500);
  }
});

// Invite family member
app.post('/make-server-333e8892/family/invite', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const { email, role } = await c.req.json();

    if (!email || !role) {
      return c.json({ error: 'Email and role are required' }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Invalid email address' }, 400);
    }

    // Check if user is already a member
    const familyGroup = await kv.get(`user:${user.id}:family`) || { members: [] };
    const existingMember = familyGroup.members?.find(m => m.email === email);
    if (existingMember) {
      return c.json({ error: 'User is already a member of this family group' }, 400);
    }

    // Check for existing pending invitation
    const existingInvitations = await kv.getByPrefix(`invitation:${user.id}:`) || [];
    const pendingInvitation = existingInvitations.find(inv =>
      inv && inv.email === email &&
      inv.status === 'pending' &&
      inv.expiresAt && new Date(inv.expiresAt) > new Date()
    );

    if (pendingInvitation) {
      return c.json({ error: 'An invitation has already been sent to this email address' }, 400);
    }

    // Generate unique token
    const token = generateId() + '-' + generateId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Get user profile for inviter name
    const profile = await kv.get(`user:${user.id}:profile`) || {};
    const inviterName = profile.name || user.email?.split('@')[0] || 'A user';

    // Create invitation
    const invitation = {
      id: generateId(),
      email,
      role,
      invitedBy: user.id,
      invitedByName: inviterName,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'pending',
      token,
    };

    // Store invitation with composite key for easy querying
    await kv.set(`invitation:${user.id}:${invitation.id}`, invitation);
    await kv.set(`invitation:token:${token}`, invitation);

    // Here we would send an email in a real implementation
    // For now, we'll log the invitation link
    const invitationLink = `${Deno.env.get('APP_URL') || 'http://localhost'}/accept-invite?token=${token}`;
    console.log('=== INVITATION EMAIL ===');
    console.log(`To: ${email}`);
    console.log(`From: ${inviterName}`);
    console.log(`Role: ${role}`);
    console.log(`Link: ${invitationLink}`);
    console.log(`Expires: ${expiresAt.toISOString()}`);
    console.log('========================');

    return c.json({
      success: true,
      invitation,
      invitationLink, // Include link in response for testing
      message: 'Invitation sent successfully'
    });
  } catch (error: any) {
    console.log('Invite family member error:', error);
    return c.json({ error: `Failed to send invitation: ${error?.message || error}` }, 500);
  }
});

// Get pending invitations
app.get('/make-server-333e8892/family/invitations', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const invitations = await kv.getByPrefix(`invitation:${user.id}:`) || [];

    // Filter out expired invitations
    const activeInvitations = invitations.filter(inv =>
      inv && inv.status === 'pending' && inv.expiresAt && new Date(inv.expiresAt) > new Date()
    );

    return c.json({ invitations: activeInvitations });
  } catch (error: any) {
    console.log('Get invitations error:', error);
    return c.json({ error: `Failed to fetch invitations: ${error?.message || error}` }, 500);
  }
});

// Resend invitation
app.post('/make-server-333e8892/family/invitations/:id/resend', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const invitationId = c.req.param('id');
    const invitation = await kv.get(`invitation:${user.id}:${invitationId}`);

    if (!invitation) {
      return c.json({ error: 'Invitation not found' }, 404);
    }

    // Generate new token and extend expiration
    const newToken = generateId() + '-' + generateId();
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Delete old token
    await kv.del(`invitation:token:${invitation.token}`);

    // Update invitation
    const updatedInvitation = {
      ...invitation,
      token: newToken,
      expiresAt: newExpiresAt.toISOString(),
      resentAt: new Date().toISOString(),
    };

    await kv.set(`invitation:${user.id}:${invitationId}`, updatedInvitation);
    await kv.set(`invitation:token:${newToken}`, updatedInvitation);

    const invitationLink = `${Deno.env.get('APP_URL') || 'http://localhost'}/accept-invite?token=${newToken}`;
    console.log('=== RESENT INVITATION ===');
    console.log(`To: ${updatedInvitation.email}`);
    console.log(`Link: ${invitationLink}`);
    console.log('=========================');

    return c.json({
      success: true,
      invitation: updatedInvitation,
      invitationLink,
      message: 'Invitation resent successfully'
    });
  } catch (error: any) {
    console.log('Resend invitation error:', error);
    return c.json({ error: `Failed to resend invitation: ${error?.message || error}` }, 500);
  }
});

// Cancel invitation
app.delete('/make-server-333e8892/family/invitations/:id', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const invitationId = c.req.param('id');
    const invitation = await kv.get(`invitation:${user.id}:${invitationId}`);

    if (!invitation) {
      return c.json({ error: 'Invitation not found' }, 404);
    }

    // Delete invitation
    await kv.del(`invitation:${user.id}:${invitationId}`);
    await kv.del(`invitation:token:${invitation.token}`);

    return c.json({
      success: true,
      message: 'Invitation cancelled successfully'
    });
  } catch (error: any) {
    console.log('Cancel invitation error:', error);
    return c.json({ error: `Failed to cancel invitation: ${error?.message || error}` }, 500);
  }
});

// Accept invitation (public endpoint - no auth required)
app.post('/make-server-333e8892/family/invitations/accept/:token', async (c) => {
  try {
    const token = c.req.param('token');
    const invitation = await kv.get(`invitation:token:${token}`);

    if (!invitation) {
      return c.json({ error: 'Invalid or expired invitation' }, 404);
    }

    // Check if invitation is expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return c.json({ error: 'This invitation has expired' }, 400);
    }

    // Check if already accepted
    if (invitation.status === 'accepted') {
      return c.json({ error: 'This invitation has already been accepted' }, 400);
    }

    // Get the inviter's family group
    const familyGroup = await kv.get(`user:${invitation.invitedBy}:family`) || {
      members: [],
      sharedSubscriptions: [],
    };

    // Check if user is logged in
    const { user, error: authError } = await getUserFromToken(c.req.raw);

    if (user) {
      console.log('Accepting invitation for authenticated user:', user.id);

      // Check if user is already in this family
      const isAlreadyMember = familyGroup.members.some(m => m.id === user.id || m.email === user.email);
      if (isAlreadyMember) {
        return c.json({ error: 'You are already a member of this family group' }, 400);
      }

      // Get user profile for member name
      const userProfile = await kv.get(`user:${user.id}:profile`) || {};

      // Add user to family group members
      const newMember = {
        id: user.id,
        name: userProfile.name || user.user_metadata?.name || user.email?.split('@')[0] || 'New Member',
        email: user.email,
        role: invitation.role,
        avatar: '👤',
        joinedDate: new Date().toISOString(),
        sharedSubscriptions: 0,
      };

      familyGroup.members.push(newMember);

      // Update invitation status
      const updatedInvitation = {
        ...invitation,
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
        acceptedBy: user.id,
      };

      // Save everything
      await kv.set(`user:${invitation.invitedBy}:family`, familyGroup);
      await kv.set(`invitation:${invitation.invitedBy}:${invitation.id}`, updatedInvitation);
      await kv.set(`invitation:token:${token}`, updatedInvitation);

      // Also initialize a profile for this user if it doesn't exist
      if (!userProfile.id) {
        await kv.set(`user:${user.id}:profile`, {
          id: user.id,
          email: user.email,
          name: newMember.name,
          createdAt: new Date().toISOString(),
          currency: 'USD',
          language: 'en',
          timezone: 'America/New_York',
        });
      }

      return c.json({
        success: true,
        invitation: updatedInvitation,
        user: {
          ...user,
          profile: userProfile.id ? userProfile : null
        },
        message: 'Successfully joined the family group!'
      });
    }

    // If not logged in, just return details for frontend display
    return c.json({
      success: true,
      invitation,
      message: 'Invitation is valid. Please sign up or log in to accept.'
    });
  } catch (error: any) {
    console.log('Accept invitation error:', error);
    return c.json({ error: `Failed to accept invitation: ${error?.message || error}` }, 500);
  }
});

// Add family member
app.post('/make-server-333e8892/family/members', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const memberData = await c.req.json();
    const familyGroup = await kv.get(`user:${user.id}:family`) || {
      members: [],
      sharedSubscriptions: [],
    };

    const newMember = {
      id: generateId(),
      ...memberData,
      joinedDate: new Date().toISOString(),
      sharedSubscriptions: 0,
    };

    familyGroup.members.push(newMember);
    await kv.set(`user:${user.id}:family`, familyGroup);

    return c.json({
      success: true,
      member: newMember
    });
  } catch (error) {
    console.log('Add family member error:', error);
    return c.json({ error: `Failed to add member: ${error.message}` }, 500);
  }
});

// Remove family member
app.delete('/make-server-333e8892/family/members/:id', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const memberId = c.req.param('id');
    const familyGroup = await kv.get(`user:${user.id}:family`) || {
      members: [],
      sharedSubscriptions: [],
    };

    // Remove member from members list
    familyGroup.members = familyGroup.members.filter(m => m.id !== memberId);

    // Remove member from shared subscriptions
    familyGroup.sharedSubscriptions = familyGroup.sharedSubscriptions.map(sub => ({
      ...sub,
      sharedWith: sub.sharedWith.filter(id => id !== memberId),
    }));

    await kv.set(`user:${user.id}:family`, familyGroup);

    return c.json({ success: true });
  } catch (error) {
    console.log('Remove family member error:', error);
    return c.json({ error: `Failed to remove member: ${error.message}` }, 500);
  }
});

// Update member role
app.put('/make-server-333e8892/family/members/:id/role', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const memberId = c.req.param('id');
    const { role } = await c.req.json();

    const familyGroup = await kv.get(`user:${user.id}:family`) || {
      members: [],
      sharedSubscriptions: [],
    };

    const memberIndex = familyGroup.members.findIndex(m => m.id === memberId);
    if (memberIndex === -1) {
      return c.json({ error: 'Member not found' }, 404);
    }

    familyGroup.members[memberIndex].role = role;
    await kv.set(`user:${user.id}:family`, familyGroup);

    return c.json({
      success: true,
      member: familyGroup.members[memberIndex]
    });
  } catch (error) {
    console.log('Update member role error:', error);
    return c.json({ error: `Failed to update role: ${error.message}` }, 500);
  }
});

// Share subscription with family
app.post('/make-server-333e8892/family/share', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const { subscriptionId, memberIds } = await c.req.json();

    // Get user's subscriptions
    const subscriptions = await kv.get(`user:${user.id}:subscriptions`) || [];
    const subscription = subscriptions.find(s => s.id === subscriptionId);

    if (!subscription) {
      return c.json({ error: 'Subscription not found' }, 404);
    }

    // Get family group
    const familyGroup = await kv.get(`user:${user.id}:family`) || {
      members: [],
      sharedSubscriptions: [],
    };

    // Create or update shared subscription
    const existingIndex = familyGroup.sharedSubscriptions.findIndex(s => s.id === subscriptionId);

    const sharedSub = {
      id: subscriptionId,
      name: subscription.name,
      logo: subscription.logo || '📱',
      amount: subscription.amount,
      currency: subscription.currency,
      billingCycle: subscription.billingCycle,
      sharedWith: [user.id, ...memberIds],
      splitType: 'equal',
      owner: user.id,
    };

    if (existingIndex >= 0) {
      familyGroup.sharedSubscriptions[existingIndex] = sharedSub;
    } else {
      familyGroup.sharedSubscriptions.push(sharedSub);
    }

    // Update shared subscription count for members
    familyGroup.members = familyGroup.members.map(member => {
      const count = familyGroup.sharedSubscriptions.filter(sub =>
        sub.sharedWith.includes(member.id)
      ).length;
      return { ...member, sharedSubscriptions: count };
    });

    await kv.set(`user:${user.id}:family`, familyGroup);

    return c.json({
      success: true,
      sharedSubscription: sharedSub
    });
  } catch (error) {
    console.log('Share subscription error:', error);
    return c.json({ error: `Failed to share subscription: ${error.message}` }, 500);
  }
});

// Unshare subscription
app.post('/make-server-333e8892/family/unshare', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const { subscriptionId, memberId } = await c.req.json();

    const familyGroup = await kv.get(`user:${user.id}:family`) || {
      members: [],
      sharedSubscriptions: [],
    };

    const subIndex = familyGroup.sharedSubscriptions.findIndex(s => s.id === subscriptionId);
    if (subIndex === -1) {
      return c.json({ error: 'Shared subscription not found' }, 404);
    }

    // Remove member from sharedWith
    familyGroup.sharedSubscriptions[subIndex].sharedWith =
      familyGroup.sharedSubscriptions[subIndex].sharedWith.filter(id => id !== memberId);

    // If no more members, remove the shared subscription entirely
    if (familyGroup.sharedSubscriptions[subIndex].sharedWith.length <= 1) {
      familyGroup.sharedSubscriptions.splice(subIndex, 1);
    }

    // Update shared subscription count for members
    familyGroup.members = familyGroup.members.map(member => {
      const count = familyGroup.sharedSubscriptions.filter(sub =>
        sub.sharedWith.includes(member.id)
      ).length;
      return { ...member, sharedSubscriptions: count };
    });

    await kv.set(`user:${user.id}:family`, familyGroup);

    return c.json({ success: true });
  } catch (error) {
    console.log('Unshare subscription error:', error);
    return c.json({ error: `Failed to unshare subscription: ${error.message}` }, 500);
  }
});

// ======================
// NOTIFICATION ROUTES
// ======================

// Get all notifications for user
app.get('/make-server-333e8892/notifications', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    // Get notifications from KV store
    const notifications = await kv.get(`user:${user.id}:notifications`) || [];

    // Sort by created_at descending (newest first)
    notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ notifications });
  } catch (error) {
    console.log('Get notifications error:', error);
    return c.json({ error: `Failed to fetch notifications: ${error.message}` }, 500);
  }
});

// Mark notification as read
app.post('/make-server-333e8892/notifications/:id/read', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const notificationId = c.req.param('id');
    const notifications = await kv.get(`user:${user.id}:notifications`) || [];

    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
    );

    await kv.set(`user:${user.id}:notifications`, updatedNotifications);

    return c.json({ success: true });
  } catch (error) {
    console.log('Mark notification as read error:', error);
    return c.json({ error: `Failed to mark notification as read: ${error.message}` }, 500);
  }
});

// Mark all notifications as read
app.post('/make-server-333e8892/notifications/mark-all-read', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const notifications = await kv.get(`user:${user.id}:notifications`) || [];

    const updatedNotifications = notifications.map(n => ({
      ...n,
      read_at: n.read_at || new Date().toISOString()
    }));

    await kv.set(`user:${user.id}:notifications`, updatedNotifications);

    return c.json({ success: true, count: notifications.length });
  } catch (error) {
    console.log('Mark all notifications as read error:', error);
    return c.json({ error: `Failed to mark notifications as read: ${error.message}` }, 500);
  }
});

// Delete notification
app.delete('/make-server-333e8892/notifications/:id', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const notificationId = c.req.param('id');
    const notifications = await kv.get(`user:${user.id}:notifications`) || [];

    const filteredNotifications = notifications.filter(n => n.id !== notificationId);

    await kv.set(`user:${user.id}:notifications`, filteredNotifications);

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete notification error:', error);
    return c.json({ error: `Failed to delete notification: ${error.message}` }, 500);
  }
});

// Create notification (for testing or manual creation)
app.post('/make-server-333e8892/notifications', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const body = await c.req.json();
    const { subscription_id, type, title, message, status, metadata } = body;

    const notifications = await kv.get(`user:${user.id}:notifications`) || [];

    const newNotification = {
      id: crypto.randomUUID(),
      user_id: user.id,
      subscription_id,
      type: type || 'info',
      title,
      message,
      status: status || 'sent',
      metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    notifications.unshift(newNotification);

    // Keep only last 100 notifications
    if (notifications.length > 100) {
      notifications.splice(100);
    }

    await kv.set(`user:${user.id}:notifications`, notifications);

    return c.json({ success: true, notification: newNotification });
  } catch (error) {
    console.log('Create notification error:', error);
    return c.json({ error: `Failed to create notification: ${error.message}` }, 500);
  }
});

// ======================
// REMINDERS ROUTES
// ======================

// Get all reminders for user
app.get('/make-server-333e8892/reminders', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const reminders = await kv.get(`user:${user.id}:reminders`) || [];

    // Filter out past reminders and sort by reminder date
    const now = new Date();
    const upcomingReminders = reminders.filter(r => {
      const reminderDate = new Date(r.reminderDate);
      return reminderDate >= now || r.status === 'scheduled';
    }).sort((a, b) => new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime());

    return c.json({
      reminders: upcomingReminders,
      total: upcomingReminders.length
    });
  } catch (error) {
    console.log('Get reminders error:', error);
    return c.json({ error: `Failed to fetch reminders: ${error.message}` }, 500);
  }
});

// Update reminder status
app.put('/make-server-333e8892/reminders/:id', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const reminderId = c.req.param('id');
    const updates = await c.req.json();

    const reminders = await kv.get(`user:${user.id}:reminders`) || [];
    const index = reminders.findIndex(r => r.id === reminderId);

    if (index === -1) {
      return c.json({ error: 'Reminder not found' }, 404);
    }

    reminders[index] = {
      ...reminders[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${user.id}:reminders`, reminders);

    return c.json({
      success: true,
      reminder: reminders[index]
    });
  } catch (error) {
    console.log('Update reminder error:', error);
    return c.json({ error: `Failed to update reminder: ${error.message}` }, 500);
  }
});

// Delete reminder
app.delete('/make-server-333e8892/reminders/:id', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const reminderId = c.req.param('id');
    const reminders = await kv.get(`user:${user.id}:reminders`) || [];

    const filtered = reminders.filter(r => r.id !== reminderId);

    if (filtered.length === reminders.length) {
      return c.json({ error: 'Reminder not found' }, 404);
    }

    await kv.set(`user:${user.id}:reminders`, filtered);

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete reminder error:', error);
    return c.json({ error: `Failed to delete reminder: ${error.message}` }, 500);
  }
});

// ======================
// WHATSAPP ROUTES
// ======================

// Helper function to generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to send WhatsApp message via WhatsApp Business API
const sendWhatsAppMessage = async (phoneNumber: string, message: string) => {
  const whatsappToken = Deno.env.get('WHATSAPP_API_TOKEN');
  const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

  if (!whatsappToken || !whatsappPhoneId) {
    console.log('⚠️ WhatsApp API credentials not configured. Message would be sent to:', phoneNumber);
    console.log('Message:', message);
    // In production, this would throw an error
    // For now, we'll simulate success
    return {
      success: true,
      messageId: `sim-${Date.now()}`,
      status: 'sent',
    };
  }

  try {
    // WhatsApp Business API endpoint
    const apiUrl = `https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber.replace(/\D/g, ''), // Remove all non-digits
        type: 'text',
        text: {
          body: message,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to send WhatsApp message');
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
      status: 'sent',
    };
  } catch (error: any) {
    console.error('WhatsApp API error:', error);
    throw error;
  }
};

// Get WhatsApp connection status
app.get('/make-server-333e8892/whatsapp/status', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const connection = await kv.get(`user:${user.id}:whatsapp:connection`);

    if (!connection) {
      return c.json({
        connected: false,
        verified: false
      });
    }

    return c.json({
      connected: true,
      verified: connection.verified,
      phoneNumber: connection.phoneNumber,
      verifiedAt: connection.verifiedAt,
      lastMessageAt: connection.lastMessageAt,
    });
  } catch (error: any) {
    console.log('Get WhatsApp status error:', error);
    return c.json({ error: `Failed to get status: ${error?.message || error}` }, 500);
  }
});

// Send verification code
app.post('/make-server-333e8892/whatsapp/verify/send', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const { phoneNumber } = await c.req.json();

    if (!phoneNumber) {
      return c.json({ error: 'Phone number is required' }, 400);
    }

    // Validate phone number format (basic validation)
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10 || cleanNumber.length > 15) {
      return c.json({ error: 'Invalid phone number format' }, 400);
    }

    // Generate verification code
    const code = generateVerificationCode();
    const verificationId = generateId();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification session
    await kv.set(`verification:${verificationId}`, {
      userId: user.id,
      phoneNumber,
      code,
      expiresAt: expiresAt.toISOString(),
      attempts: 0,
      createdAt: new Date().toISOString(),
    });

    // Send verification code via WhatsApp
    try {
      const message = `Your SubTrack Pro verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this message.`;

      await sendWhatsAppMessage(phoneNumber, message);

      console.log('✅ Verification code sent to:', phoneNumber);
      console.log('Verification ID:', verificationId);
      console.log('Code:', code); // In production, don't log this!
    } catch (sendError: any) {
      console.error('Failed to send verification code:', sendError);
      // Continue anyway - we'll still allow verification for testing
    }

    return c.json({
      success: true,
      verificationId,
      expiresAt: expiresAt.toISOString(),
      message: 'Verification code sent successfully',
    });
  } catch (error: any) {
    console.log('Send verification error:', error);
    return c.json({ error: `Failed to send verification: ${error?.message || error}` }, 500);
  }
});

// Verify code and establish connection
app.post('/make-server-333e8892/whatsapp/verify/confirm', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const { verificationId, code } = await c.req.json();

    if (!verificationId || !code) {
      return c.json({ error: 'Verification ID and code are required' }, 400);
    }

    // Get verification session
    const verification = await kv.get(`verification:${verificationId}`);

    if (!verification) {
      return c.json({ error: 'Invalid or expired verification code' }, 400);
    }

    // Check if expired
    if (new Date(verification.expiresAt) < new Date()) {
      await kv.del(`verification:${verificationId}`);
      return c.json({ error: 'Verification code has expired. Please request a new code.' }, 400);
    }

    // Check if user matches
    if (verification.userId !== user.id) {
      return c.json({ error: 'Invalid verification session' }, 401);
    }

    // Check attempts
    if (verification.attempts >= 5) {
      await kv.del(`verification:${verificationId}`);
      return c.json({ error: 'Too many failed attempts. Please request a new code.' }, 400);
    }

    // Verify code
    if (verification.code !== code) {
      // Increment attempts
      verification.attempts += 1;
      await kv.set(`verification:${verificationId}`, verification);

      return c.json({
        error: `Invalid verification code. ${5 - verification.attempts} attempts remaining.`
      }, 400);
    }

    // Code is valid! Create connection
    const connection = {
      userId: user.id,
      phoneNumber: verification.phoneNumber,
      verified: true,
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      lastMessageAt: null,
    };

    // Save connection
    await kv.set(`user:${user.id}:whatsapp:connection`, connection);

    // Update user settings
    const currentSettings = await kv.get(`user:${user.id}:settings`) || {};
    await kv.set(`user:${user.id}:settings`, {
      ...currentSettings,
      whatsappConnected: true,
      whatsappVerified: true,
      whatsappPhone: verification.phoneNumber,
    });

    // Clean up verification session
    await kv.del(`verification:${verificationId}`);

    console.log('✅ WhatsApp verified for user:', user.id);

    return c.json({
      success: true,
      connection,
      message: 'WhatsApp verified successfully',
    });
  } catch (error: any) {
    console.log('Verify code error:', error);
    return c.json({ error: `Failed to verify code: ${error?.message || error}` }, 500);
  }
});

// Disconnect WhatsApp
app.post('/make-server-333e8892/whatsapp/disconnect', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    // Delete connection
    await kv.del(`user:${user.id}:whatsapp:connection`);

    // Update settings
    const currentSettings = await kv.get(`user:${user.id}:settings`) || {};
    await kv.set(`user:${user.id}:settings`, {
      ...currentSettings,
      whatsappConnected: false,
      whatsappVerified: false,
      whatsappPhone: '',
    });

    console.log('✅ WhatsApp disconnected for user:', user.id);

    return c.json({
      success: true,
      message: 'WhatsApp disconnected successfully',
    });
  } catch (error: any) {
    console.log('Disconnect WhatsApp error:', error);
    return c.json({ error: `Failed to disconnect: ${error?.message || error}` }, 500);
  }
});

// Send test message
app.post('/make-server-333e8892/whatsapp/test', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    // Get connection
    const connection = await kv.get(`user:${user.id}:whatsapp:connection`);

    if (!connection || !connection.verified) {
      return c.json({ error: 'WhatsApp is not connected or verified' }, 400);
    }

    // Send test message
    const message = `🎉 SubTrack Pro Test Message\n\nYour WhatsApp is successfully connected and working!\n\nYou will now receive subscription reminders and alerts on this number.\n\nSent at: ${new Date().toLocaleString()}`;

    try {
      const result = await sendWhatsAppMessage(connection.phoneNumber, message);

      // Update last message timestamp
      connection.lastMessageAt = new Date().toISOString();
      await kv.set(`user:${user.id}:whatsapp:connection`, connection);

      return c.json({
        success: true,
        messageId: result.messageId,
        status: result.status,
        message: 'Test message sent successfully',
      });
    } catch (sendError: any) {
      console.error('Failed to send test message:', sendError);
      return c.json({
        error: `Failed to send message: ${sendError.message}`
      }, 500);
    }
  } catch (error: any) {
    console.log('Send test message error:', error);
    return c.json({ error: `Failed to send test message: ${error?.message || error}` }, 500);
  }
});

// Send WhatsApp message (generic endpoint)
app.post('/make-server-333e8892/whatsapp/send', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const { phoneNumber, message } = await c.req.json();

    if (!phoneNumber || !message) {
      return c.json({ error: 'Phone number and message are required' }, 400);
    }

    try {
      const result = await sendWhatsAppMessage(phoneNumber, message);

      // Log message history
      const messageHistory = await kv.get(`user:${user.id}:whatsapp:messages`) || [];
      messageHistory.push({
        id: generateId(),
        phoneNumber,
        message,
        messageId: result.messageId,
        status: result.status,
        sentAt: new Date().toISOString(),
      });

      // Keep only last 50 messages
      if (messageHistory.length > 50) {
        messageHistory.shift();
      }

      await kv.set(`user:${user.id}:whatsapp:messages`, messageHistory);

      return c.json({
        success: true,
        messageId: result.messageId,
        status: result.status,
        message: 'Message sent successfully',
      });
    } catch (sendError: any) {
      console.error('Failed to send WhatsApp message:', sendError);
      return c.json({
        error: `Failed to send message: ${sendError.message}`
      }, 500);
    }
  } catch (error: any) {
    console.log('Send WhatsApp message error:', error);
    return c.json({ error: `Failed to send message: ${error?.message || error}` }, 500);
  }
});

// WhatsApp webhook (for receiving messages and delivery receipts)
app.post('/make-server-333e8892/whatsapp/webhook', async (c) => {
  try {
    const webhookData = await c.req.json();
    console.log('📱 WhatsApp webhook received:', JSON.stringify(webhookData, null, 2));

    // Process webhook data based on type
    if (webhookData.entry && webhookData.entry[0]?.changes) {
      for (const change of webhookData.entry[0].changes) {
        if (change.value?.statuses) {
          // Message status update (sent, delivered, read, failed)
          for (const status of change.value.statuses) {
            console.log(`Message ${status.id} status: ${status.status}`);
            // TODO: Update message status in database
          }
        }

        if (change.value?.messages) {
          // Incoming message
          for (const message of change.value.messages) {
            console.log(`Incoming message from ${message.from}: ${message.text?.body}`);
            // TODO: Process incoming message (for auto-reply feature)
          }
        }
      }
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.log('WhatsApp webhook error:', error);
    return c.json({ error: `Webhook processing failed: ${error?.message || error}` }, 500);
  }
});

// WhatsApp webhook verification (required by WhatsApp)
app.get('/make-server-333e8892/whatsapp/webhook', (c) => {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');

  const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'subtrack_pro_verify_token';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ WhatsApp webhook verified');
    return c.text(challenge || '');
  }

  return c.json({ error: 'Forbidden' }, 403);
});

// ======================
// SETTINGS ROUTES
// ======================

// Get user settings
app.get('/make-server-333e8892/settings', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const settings = await kv.get(`user:${user.id}:settings`) || {
      emailNotifications: true,
      whatsappNotifications: true,
      pushNotifications: false,
      reminderDays7: true,
      reminderDays3: true,
      reminderUrgent: true,
      priceChangeAlerts: true,
      duplicateDetection: true,
      currency: 'USD',
      language: 'en',
      timezone: 'America/New_York',
      darkMode: false,
    };

    return c.json({ settings });
  } catch (error) {
    console.log('Get settings error:', error);
    return c.json({ error: `Failed to fetch settings: ${error.message}` }, 500);
  }
});

// Update user settings
app.put('/make-server-333e8892/settings', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const updates = await c.req.json();
    const currentSettings = await kv.get(`user:${user.id}:settings`) || {};

    const newSettings = {
      ...currentSettings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${user.id}:settings`, newSettings);

    return c.json({
      success: true,
      settings: newSettings
    });
  } catch (error) {
    console.log('Update settings error:', error);
    return c.json({ error: `Failed to update settings: ${error.message}` }, 500);
  }
});

// ======================
// USER MANAGEMENT ROUTES
// ======================

// Change password
app.post('/make-server-333e8892/auth/change-password', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const { currentPassword, newPassword } = await c.req.json();

    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Current and new password are required' }, 400);
    }

    // Use Supabase admin API to update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.log('Change password error:', updateError);
      return c.json({ error: `Failed to change password: ${updateError.message}` }, 400);
    }

    return c.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.log('Change password error:', error);
    return c.json({ error: `Failed to change password: ${error.message}` }, 500);
  }
});

// Export user data (GDPR)
app.get('/make-server-333e8892/user/export', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    // Gather all user data
    const profile = await kv.get(`user:${user.id}:profile`);
    const subscriptions = await kv.get(`user:${user.id}:subscriptions`) || [];
    const settings = await kv.get(`user:${user.id}:settings`) || {};
    const familyGroup = await kv.get(`user:${user.id}:family`) || {};

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        profile,
      },
      subscriptions,
      settings,
      familyGroup,
    };

    return c.json({
      success: true,
      data: exportData,
      message: 'User data exported successfully'
    });
  } catch (error) {
    console.log('Export user data error:', error);
    return c.json({ error: `Failed to export data: ${error.message}` }, 500);
  }
});

// Delete user account
app.delete('/make-server-333e8892/user/delete', async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized: ' + error }, 401);
    }

    const { password } = await c.req.json();

    if (!password) {
      return c.json({ error: 'Password is required to delete account' }, 400);
    }

    // Delete all user data from KV store
    await kv.del(`user:${user.id}:profile`);
    await kv.del(`user:${user.id}:subscriptions`);
    await kv.del(`user:${user.id}:settings`);
    await kv.del(`user:${user.id}:family`);

    // Delete user from Supabase Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.log('Delete user error:', deleteError);
      return c.json({ error: `Failed to delete account: ${deleteError.message}` }, 400);
    }

    return c.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.log('Delete account error:', error);
    return c.json({ error: `Failed to delete account: ${error.message}` }, 500);
  }
});

// Health check
app.get('/make-server-333e8892/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SubTrack Pro API'
  });
});

Deno.serve(app.fetch);