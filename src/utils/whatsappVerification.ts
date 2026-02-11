// Supabase configuration
const SUPABASE_URL = 'https://kkffwzvyfbkhhoxztsgn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZmZ3enZ5ZmJraGhveHp0c2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjA4MDEsImV4cCI6MjA3NzQ5NjgwMX0.pJtQlX6dF7j8kAniWPDUNkT_MQfrJluvwacNKFqlfCQ';

// Types
interface SendVerificationResponse {
  success: boolean;
  message: string;
  error?: string;
}

interface VerifyCodeResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Send WhatsApp verification code
 */
export async function sendWhatsAppVerification(
  phoneNumber: string,
  userId: string,
  accessToken?: string
): Promise<SendVerificationResponse> {
  try {
    // Format phone number (remove all non-digits)
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    
    // Validate phone number (should be 10-15 digits)
    if (formattedPhone.length < 10 || formattedPhone.length > 15) {
      throw new Error('Invalid phone number format. Please include country code.');
    }

    console.log('Sending verification to:', formattedPhone);

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/send-whatsapp-verification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          userId: userId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send verification code');
    }

    return {
      success: true,
      message: data.message || 'Verification code sent successfully',
    };
  } catch (error: any) {
    console.error('Send verification error:', error);
    
    // Check if it's a network/fetch error (functions not deployed)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      return {
        success: false,
        message: '⚠️ WhatsApp verification functions not deployed yet. Please deploy Supabase Edge Functions first.',
        error: 'Edge Functions not deployed. Run: supabase functions deploy send-whatsapp-verification',
      };
    }
    
    return {
      success: false,
      message: error.message || 'Failed to send verification code',
      error: error.message,
    };
  }
}

/**
 * Verify WhatsApp code
 */
export async function verifyWhatsAppCode(
  phoneNumber: string,
  verificationCode: string,
  userId: string,
  accessToken?: string
): Promise<VerifyCodeResponse> {
  try {
    // Format phone number
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    
    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(verificationCode)) {
      throw new Error('Verification code must be 6 digits');
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/verify-whatsapp-code`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          verificationCode: verificationCode,
          userId: userId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Invalid verification code');
    }

    return {
      success: true,
      message: data.message || 'Phone number verified successfully',
    };
  } catch (error: any) {
    console.error('Verify code error:', error);
    
    // Check if it's a network/fetch error (functions not deployed)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      return {
        success: false,
        message: '⚠️ WhatsApp verification functions not deployed yet. Please deploy Supabase Edge Functions first.',
        error: 'Edge Functions not deployed. Run: supabase functions deploy verify-whatsapp-code',
      };
    }
    
    return {
      success: false,
      message: error.message || 'Failed to verify code',
      error: error.message,
    };
  }
}
