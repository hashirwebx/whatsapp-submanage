// Supabase Edge Function for WhatsApp Verification
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";

interface VerificationRequest {
  phoneNumber: string;
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
    // Get environment variables
    const WHATSAPP_API_TOKEN = Deno.env.get('WHATSAPP_API_TOKEN');
    const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

    if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      console.error('Missing credentials:', {
        hasToken: !!WHATSAPP_API_TOKEN,
        hasPhoneId: !!WHATSAPP_PHONE_NUMBER_ID
      });
      throw new Error('WhatsApp API credentials not configured in Supabase');
    }

    // Parse request body
    const { phoneNumber, userId }: VerificationRequest = await req.json();

    if (!phoneNumber || !userId) {
      return new Response(
        JSON.stringify({ error: 'Phone number and userId are required' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    console.log('Processing verification for:', phoneNumber);

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store verification code in Supabase (with expiry)
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store verification code with 10 minute expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    
    const { error: dbError } = await supabase
      .from('whatsapp_verifications')
      .upsert({
        user_id: userId,
        phone_number: phoneNumber,
        verification_code: verificationCode,
        expires_at: expiresAt,
        verified: false,
        failed_attempts: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to store verification code: ${dbError.message}`);
    }

    console.log('Verification code stored in database');

    // Send verification code via WhatsApp (REQUIRED - must succeed)
    console.log('Sending WhatsApp message to:', phoneNumber);
    
    const messageBody = `*SubTrack Pro Verification*\n\nYour verification code is:\n\n*${verificationCode}*\n\nThis code will expire in 10 minutes.\n\n⚠️ Do not share this code with anyone.`;

    const whatsappResponse = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phoneNumber,
          type: 'text',
          text: {
            preview_url: false,
            body: messageBody
          }
        }),
      }
    );

    const whatsappData = await whatsappResponse.json();
    console.log('WhatsApp API response:', whatsappResponse.status, whatsappData);

    if (!whatsappResponse.ok) {
      console.error('WhatsApp API error:', {
        status: whatsappResponse.status,
        data: whatsappData
      });
      
      // DELETE the stored verification code since WhatsApp sending failed
      await supabase
        .from('whatsapp_verifications')
        .delete()
        .eq('user_id', userId);
      
      // Return detailed error for debugging
      const errorMessage = whatsappData.error?.message || 'Unknown WhatsApp API error';
      const errorCode = whatsappData.error?.code || 'UNKNOWN';
      const errorType = whatsappData.error?.type || '';
      
      // Provide user-friendly error messages based on error type
      let userMessage = `Failed to send WhatsApp message: ${errorMessage}`;
      
      if (errorCode === 131047 || errorMessage.includes('recipient')) {
        userMessage = 'Unable to send WhatsApp message. Please make sure:\n1. The phone number is correct and includes country code\n2. WhatsApp is installed on this number\n3. The number has not blocked our WhatsApp Business account';
      } else if (errorCode === 131026 || errorMessage.includes('template')) {
        userMessage = 'WhatsApp template error. Please contact support.';
      } else if (errorCode === 100 || errorMessage.includes('parameter')) {
        userMessage = 'Invalid phone number format. Please include country code (e.g., +1234567890)';
      }
      
      throw new Error(userMessage);
    }

    console.log('✅ Verification code sent successfully via WhatsApp');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification code sent successfully',
        messageId: whatsappData.messages?.[0]?.id || 'sent'
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
    console.error('Error in send-whatsapp-verification:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error',
        details: error.toString(),
        timestamp: new Date().toISOString()
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