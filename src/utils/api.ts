import { projectId, publicAnonKey } from './supabase/info';
import { supabase } from './supabase/client';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-333e8892`;

// Helper function to make API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle 401 Unauthorized - clear session and force re-login
      if (response.status === 401) {
        console.error('Authentication failed - clearing session');
        localStorage.removeItem('subtrack_user');

        // Only reload if this is an authenticated endpoint (not auth endpoints)
        if (!endpoint.includes('/auth/')) {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }

      throw new Error(errorData.error || `API call failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Helper to make authenticated API calls
async function authenticatedApiCall(endpoint: string, accessToken: string, options: RequestInit = {}) {
  console.log(`Making authenticated API call to: ${endpoint}`);
  console.log(`Access token (first 20 chars): ${accessToken?.substring(0, 20)}...`);

  if (!accessToken) {
    console.error('No access token provided for authenticated call');
    throw new Error('Authentication required: No access token');
  }

  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  });
}

// ======================
// AUTHENTICATION API
// ======================

export async function signUp(email: string, password: string, name: string, phone: string) {
  console.log('Starting signup process for:', email);

  // Use server-side signup which auto-confirms emails
  try {
    const response = await apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, phone }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to create account');
    }

    console.log('Account created successfully, now signing in...');

    // Account created successfully with auto-confirm
    // Now sign in to get the session
    const signInResponse = await signIn(email, password);

    return {
      success: true,
      session: signInResponse.session,
      user: signInResponse.user,
      message: 'Account created and signed in successfully',
    };
  } catch (error: any) {
    console.error('Signup error:', error);

    // Handle specific error messages from server
    const errorMessage = error.message || error.toString();

    if (errorMessage.includes('already') || errorMessage.includes('registered') || errorMessage.includes('exists')) {
      throw new Error('An account with this email already exists. If this is your account, click "Sign In" instead. If you forgot your password, click "Stuck? Get help" below the sign-in button.');
    }

    if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
      throw new Error('Please enter a valid email address.');
    }

    if (errorMessage.includes('password') && (errorMessage.includes('short') || errorMessage.includes('characters'))) {
      throw new Error('Password must be at least 6 characters long.');
    }

    throw new Error(`Failed to create account: ${errorMessage}`);
  }
}

export async function signIn(email: string, password: string) {
  console.log('=== SIGN IN START ===');
  console.log('Email:', email);
  console.log('Password length:', password?.length);

  // Validate inputs
  if (!email || !password) {
    throw new Error('Please enter both email and password.');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Log for debugging but don't make it scary
      console.log('ℹ️ Sign in issue:', error.message);

      // Handle specific error cases with more actionable guidance
      if (error.message.includes('Invalid login credentials')) {
        console.log('ℹ️ Invalid credentials - user likely needs to sign up or check password');

        throw new Error(
          `⚠️ Wrong email or password.\\n\\n` +
          `✅ Quick fixes:\\n` +
          `• First time here? Click "Sign Up" below\\n` +
          `• Forgot password? Click "Stuck? Get help"\\n` +
          `• Just exploring? Try "Demo Mode" (no account needed)`
        );
      }

      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please confirm your email address before signing in. Check your inbox for a confirmation link.');
      }

      if (error.message.includes('email')) {
        throw new Error('Please enter a valid email address.');
      }

      if (error.message.includes('User not found')) {
        throw new Error('No account found with this email. Please click "Sign Up" to create an account first.');
      }

      throw new Error(`Sign in failed: ${error.message}`);
    }

    if (!data) {
      console.error('No data returned from sign in');
      throw new Error('Sign in failed. Please try again.');
    }

    if (!data.session) {
      console.error('No session returned from sign in');
      throw new Error('Failed to create session. Please try again or contact support.');
    }

    if (!data.user) {
      console.error('No user returned from sign in');
      throw new Error('User data not found. Please try again.');
    }

    console.log('✅ Sign in successful');
    console.log('User ID:', data.user.id);
    console.log('User email:', data.user.email);
    console.log('Access token (first 20 chars):', data.session.access_token.substring(0, 20) + '...');

    // Get user profile from server
    try {
      console.log('Fetching user profile from server...');
      const profile = await authenticatedApiCall('/profile', data.session.access_token);
      console.log('✅ Profile loaded:', profile.profile);

      return {
        success: true,
        session: data.session,
        user: data.user,
        profile: profile.profile,
      };
    } catch (profileError: any) {
      console.warn('⚠️ Failed to load profile (will use basic user data):', profileError);

      // Return without profile if it fails - this is OK, profile will be created on first use
      return {
        success: true,
        session: data.session,
        user: data.user,
        profile: null,
      };
    }
  } catch (error: any) {
    console.error('=== SIGN IN ERROR ===');
    console.error(error);
    throw error;
  }
}

export async function checkSession(accessToken: string) {
  try {
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      return { valid: false, user: null };
    }

    return { valid: true, user: data.user };
  } catch (error) {
    console.error('Session check error:', error);
    return { valid: false, user: null };
  }
}

// ======================
// SUBSCRIPTION API
// ======================

export async function getSubscriptions(accessToken: string) {
  return authenticatedApiCall('/subscriptions', accessToken);
}

export async function addSubscription(accessToken: string, subscriptionData: any) {
  return authenticatedApiCall('/subscriptions', accessToken, {
    method: 'POST',
    body: JSON.stringify(subscriptionData),
  });
}

export async function updateSubscription(accessToken: string, subscriptionId: string, updates: any) {
  return authenticatedApiCall(`/subscriptions/${subscriptionId}`, accessToken, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteSubscription(accessToken: string, subscriptionId: string) {
  return authenticatedApiCall(`/subscriptions/${subscriptionId}`, accessToken, {
    method: 'DELETE',
  });
}

// ======================
// ANALYTICS API
// ======================

export async function getAnalytics(accessToken: string) {
  return authenticatedApiCall('/analytics', accessToken);
}

// ======================
// FAMILY SHARING API
// ======================

export async function getFamilyGroup(accessToken: string) {
  return authenticatedApiCall('/family', accessToken);
}

export async function inviteFamilyMember(accessToken: string, email: string, role: string) {
  return authenticatedApiCall('/family/invite', accessToken, {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  });
}

export async function getPendingInvitations(accessToken: string) {
  return authenticatedApiCall('/family/invitations', accessToken);
}

export async function resendInvitation(accessToken: string, invitationId: string) {
  return authenticatedApiCall(`/family/invitations/${invitationId}/resend`, accessToken, {
    method: 'POST',
  });
}

export async function cancelInvitation(accessToken: string, invitationId: string) {
  return authenticatedApiCall(`/family/invitations/${invitationId}`, accessToken, {
    method: 'DELETE',
  });
}

export async function acceptInvitation(token: string, accessToken?: string) {
  if (accessToken) {
    return authenticatedApiCall(`/family/invitations/accept/${token}`, accessToken, {
      method: 'POST',
    });
  }
  return apiCall(`/family/invitations/accept/${token}`, {
    method: 'POST',
  });
}

export async function addFamilyMember(accessToken: string, memberData: any) {
  return authenticatedApiCall('/family/members', accessToken, {
    method: 'POST',
    body: JSON.stringify(memberData),
  });
}

export async function removeFamilyMember(accessToken: string, memberId: string) {
  return authenticatedApiCall(`/family/members/${memberId}`, accessToken, {
    method: 'DELETE',
  });
}

export async function updateMemberRole(accessToken: string, memberId: string, role: string) {
  return authenticatedApiCall(`/family/members/${memberId}/role`, accessToken, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export async function shareSubscriptionWithFamily(accessToken: string, subscriptionId: string, memberIds: string[]) {
  return authenticatedApiCall('/family/share', accessToken, {
    method: 'POST',
    body: JSON.stringify({ subscriptionId, memberIds }),
  });
}

export async function unshareSubscription(accessToken: string, subscriptionId: string, memberId: string) {
  return authenticatedApiCall('/family/unshare', accessToken, {
    method: 'POST',
    body: JSON.stringify({ subscriptionId, memberId }),
  });
}

// ======================
// REMINDERS API
// ======================

export async function getReminders(accessToken: string) {
  return authenticatedApiCall('/reminders', accessToken);
}

// ======================
// WHATSAPP API
// ======================

export async function sendWhatsAppMessage(accessToken: string, phoneNumber: string, message: string) {
  return authenticatedApiCall('/whatsapp/send', accessToken, {
    method: 'POST',
    body: JSON.stringify({ phoneNumber, message }),
  });
}

// ======================
// SETTINGS API
// ======================

export async function getSettings(accessToken: string) {
  return authenticatedApiCall('/settings', accessToken);
}

export async function updateSettings(accessToken: string, settings: any) {
  return authenticatedApiCall('/settings', accessToken, {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

export async function changePassword(accessToken: string, currentPassword: string, newPassword: string) {
  return authenticatedApiCall('/auth/change-password', accessToken, {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function exportUserData(accessToken: string) {
  return authenticatedApiCall('/user/export', accessToken);
}

export async function deleteUserAccount(accessToken: string, password: string) {
  return authenticatedApiCall('/user/delete', accessToken, {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });
}

// ======================
// HEALTH CHECK
// ======================

export async function healthCheck() {
  return apiCall('/health');
}

// ======================
// ADMIN API
// ======================

/**
 * Get system-wide admin statistics
 * @param accessToken Admin user access token
 * @returns Admin statistics including user counts, subscriptions, messages
 */
export async function getAdminStats(accessToken: string) {
  return authenticatedApiCall('/admin/stats', accessToken);
}

/**
 * Get all users in the system (admin only)
 * @param accessToken Admin user access token
 * @returns List of all users with their activity data
 */
export async function getAllUsers(accessToken: string) {
  return authenticatedApiCall('/admin/users', accessToken);
}

/**
 * Get detailed activity for a specific user (admin only)
 * @param accessToken Admin user access token
 * @param userId User ID to fetch activity for
 * @returns Detailed user activity including subscriptions, messages, logs
 */
export async function getUserActivity(accessToken: string, userId: string) {
  return authenticatedApiCall(`/admin/users/${userId}/activity`, accessToken);
}

/**
 * Get system-wide analytics data (admin only)
 * @param accessToken Admin user access token
 * @returns System analytics including growth trends, usage patterns
 */
export async function getSystemAnalytics(accessToken: string) {
  return authenticatedApiCall('/admin/analytics', accessToken);
}

// ======================
// ACCOUNT CHECK (DIAGNOSTIC)
// ======================

export async function checkAccountExists(email: string) {
  try {
    const response = await apiCall('/auth/check-account', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return response;
  } catch (error: any) {
    console.error('Check account error:', error);
    return { exists: null, error: error.message };
  }
}