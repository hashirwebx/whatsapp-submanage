// Supabase Edge Function for Verifying WhatsApp Code
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface VerifyRequest {
  phoneNumber: string;
  verificationCode: string;
  userId: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Parse request body
    const { phoneNumber, verificationCode, userId }: VerifyRequest = await req.json();

    if (!phoneNumber || !verificationCode || !userId) {
      return new Response(
        JSON.stringify({ error: 'Phone number, verification code, and userId are required' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Get Supabase client
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get verification record
    const { data: verification, error: fetchError } = await supabase
      .from('whatsapp_verifications')
      .select('*')
      .eq('user_id', userId)
      .eq('phone_number', phoneNumber)
      .single();

    if (fetchError || !verification) {
      return new Response(
        JSON.stringify({ error: 'Verification request not found' }),
        { 
          status: 404,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Check if already verified
    if (verification.verified) {
      return new Response(
        JSON.stringify({ error: 'Phone number already verified' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Check if code is expired
    const expiresAt = new Date(verification.expires_at);
    const now = new Date();
    
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ error: 'Verification code has expired. Please request a new code.' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Check if code matches
    if (verification.verification_code !== verificationCode) {
      // Increment failed attempts
      const failedAttempts = (verification.failed_attempts || 0) + 1;
      
      await supabase
        .from('whatsapp_verifications')
        .update({ failed_attempts: failedAttempts })
        .eq('user_id', userId);

      // Block after 5 failed attempts
      if (failedAttempts >= 5) {
        return new Response(
          JSON.stringify({ error: 'Too many failed attempts. Please request a new verification code.' }),
          { 
            status: 429,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: 'Invalid verification code',
          attemptsRemaining: 5 - failedAttempts
        }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from('whatsapp_verifications')
      .update({ 
        verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      throw new Error('Failed to update verification status');
    }

    // Update user settings with verified WhatsApp number
    const { error: settingsError } = await supabase
      .from('user_settings')
      .update({
        whatsapp_phone: phoneNumber,
        whatsapp_connected: true,
        whatsapp_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (settingsError) {
      console.error('Settings update error:', settingsError);
      // Don't fail the request, verification is complete
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'WhatsApp number verified successfully',
        phoneNumber: phoneNumber
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
});
