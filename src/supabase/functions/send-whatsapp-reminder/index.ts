// Supabase Edge Function for Sending WhatsApp Reminders
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";

interface ReminderRequest {
  userId?: string; // Optional: if not provided, check all users
  subscriptionId?: string; // Optional: specific subscription
  force?: boolean; // Force send regardless of schedule
}

interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: string;
  nextBilling: string;
  category: string;
  paymentMethod: string;
  user_id: string;
}

interface UserSettings {
  whatsappNotifications: boolean;
  whatsappNumber?: string;
  whatsappVerified?: boolean;
  reminderDays7: boolean;
  reminderDays3: boolean;
  reminderUrgent: boolean;
  timezone: string;
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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error('WhatsApp API credentials not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Parse request body (if any)
    let requestData: ReminderRequest = {};
    if (req.method === 'POST') {
      try {
        requestData = await req.json();
      } catch {
        // No body provided, check all users
      }
    }

    console.log('Starting WhatsApp reminder check...', requestData);

    // Get all users with WhatsApp enabled
    const { data: allUsers, error: usersError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('whatsappNotifications', true)
      .eq('whatsappVerified', true)
      .not('whatsappNumber', 'is', null);

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    if (!allUsers || allUsers.length === 0) {
      console.log('No users with WhatsApp notifications enabled');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No users with WhatsApp notifications enabled',
          remindersSent: 0
        }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    console.log(`Found ${allUsers.length} users with WhatsApp enabled`);

    let totalRemindersSent = 0;
    const notificationsToCreate: any[] = [];

    // Process each user
    for (const userSettings of allUsers) {
      const userId = userSettings.user_id;
      const whatsappNumber = userSettings.whatsappNumber;

      // Skip if filtering by specific user
      if (requestData.userId && requestData.userId !== userId) {
        continue;
      }

      // Get user's subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (subsError || !subscriptions || subscriptions.length === 0) {
        console.log(`No active subscriptions for user ${userId}`);
        continue;
      }

      console.log(`Processing ${subscriptions.length} subscriptions for user ${userId}`);

      // Check each subscription for upcoming billing
      for (const sub of subscriptions) {
        // Skip if filtering by specific subscription
        if (requestData.subscriptionId && requestData.subscriptionId !== sub.id) {
          continue;
        }

        const nextBilling = new Date(sub.nextBilling);
        const today = new Date();
        const daysUntil = Math.ceil((nextBilling.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        console.log(`Subscription ${sub.name}: ${daysUntil} days until billing`);

        let shouldSendReminder = false;
        let reminderType = '';

        // Check reminder settings
        if (daysUntil === 7 && userSettings.reminderDays7) {
          shouldSendReminder = true;
          reminderType = '7_days';
        } else if (daysUntil === 3 && userSettings.reminderDays3) {
          shouldSendReminder = true;
          reminderType = '3_days';
        } else if (daysUntil === 0 && userSettings.reminderUrgent) {
          shouldSendReminder = true;
          reminderType = 'urgent';
        }

        // Force send if requested
        if (requestData.force && (daysUntil >= 0 && daysUntil <= 7)) {
          shouldSendReminder = true;
          reminderType = 'manual';
        }

        if (!shouldSendReminder) {
          continue;
        }

        // Check if we already sent this reminder today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { data: existingNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('subscription_id', sub.id)
          .eq('type', 'reminder')
          .gte('created_at', todayStart.toISOString())
          .single();

        if (existingNotification && !requestData.force) {
          console.log(`Reminder already sent today for ${sub.name}`);
          continue;
        }

        // Format reminder message
        let message = '';
        const currencySymbol = getCurrencySymbol(sub.currency);
        const amount = `${currencySymbol}${sub.amount}`;

        if (daysUntil === 0) {
          message = `🚨 *URGENT REMINDER*\n\n` +
                   `Your *${sub.name}* subscription is being charged *TODAY*!\n\n` +
                   `💰 Amount: *${amount}*\n` +
                   `💳 Payment: ${sub.paymentMethod}\n` +
                   `📁 Category: ${sub.category}\n\n` +
                   `Make sure you have sufficient funds in your account.\n\n` +
                   `_This is a reminder from SubTrack Pro_`;
        } else if (daysUntil === 3) {
          message = `⏰ *Payment Reminder*\n\n` +
                   `Your *${sub.name}* subscription will renew in *3 days*.\n\n` +
                   `📅 Billing Date: ${nextBilling.toLocaleDateString()}\n` +
                   `💰 Amount: *${amount}*\n` +
                   `💳 Payment: ${sub.paymentMethod}\n\n` +
                   `If you want to cancel, do it before ${nextBilling.toLocaleDateString()}.\n\n` +
                   `_This is a reminder from SubTrack Pro_`;
        } else if (daysUntil === 7) {
          message = `📢 *Upcoming Subscription Renewal*\n\n` +
                   `Your *${sub.name}* subscription will renew in *7 days*.\n\n` +
                   `📅 Billing Date: ${nextBilling.toLocaleDateString()}\n` +
                   `💰 Amount: *${amount}*\n` +
                   `📁 Category: ${sub.category}\n\n` +
                   `You have time to review or cancel if needed.\n\n` +
                   `_This is a reminder from SubTrack Pro_`;
        } else {
          message = `📬 *Subscription Reminder*\n\n` +
                   `Your *${sub.name}* subscription will renew in *${daysUntil} days*.\n\n` +
                   `📅 Billing Date: ${nextBilling.toLocaleDateString()}\n` +
                   `💰 Amount: *${amount}*\n\n` +
                   `_This is a reminder from SubTrack Pro_`;
        }

        // Send WhatsApp message
        console.log(`Sending reminder to ${whatsappNumber} for ${sub.name}`);

        try {
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
                to: whatsappNumber.replace(/\D/g, ''),
                type: 'text',
                text: {
                  preview_url: false,
                  body: message
                }
              }),
            }
          );

          const whatsappData = await whatsappResponse.json();

          if (whatsappResponse.ok) {
            console.log(`✅ Reminder sent successfully for ${sub.name}`);
            totalRemindersSent++;

            // Create notification record
            notificationsToCreate.push({
              user_id: userId,
              subscription_id: sub.id,
              type: 'reminder',
              title: `${sub.name} Reminder`,
              message: `Reminder sent: ${daysUntil} day(s) until billing`,
              status: 'sent',
              whatsapp_message_id: whatsappData.messages?.[0]?.id,
              metadata: {
                reminderType,
                daysUntil,
                amount: sub.amount,
                currency: sub.currency,
              },
              created_at: new Date().toISOString(),
            });
          } else {
            console.error(`❌ Failed to send reminder for ${sub.name}:`, whatsappData);

            // Create failed notification record
            notificationsToCreate.push({
              user_id: userId,
              subscription_id: sub.id,
              type: 'reminder',
              title: `${sub.name} Reminder Failed`,
              message: `Failed to send reminder: ${whatsappData.error?.message || 'Unknown error'}`,
              status: 'failed',
              metadata: {
                error: whatsappData.error,
                reminderType,
                daysUntil,
              },
              created_at: new Date().toISOString(),
            });
          }
        } catch (error: any) {
          console.error(`❌ Error sending reminder for ${sub.name}:`, error);

          notificationsToCreate.push({
            user_id: userId,
            subscription_id: sub.id,
            type: 'reminder',
            title: `${sub.name} Reminder Failed`,
            message: `Failed to send reminder: ${error.message}`,
            status: 'failed',
            metadata: {
              error: error.toString(),
              reminderType,
              daysUntil,
            },
            created_at: new Date().toISOString(),
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Insert all notifications at once
    if (notificationsToCreate.length > 0) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notificationsToCreate);

      if (notifError) {
        console.error('Error creating notifications:', notifError);
      } else {
        console.log(`Created ${notificationsToCreate.length} notification records`);
      }
    }

    console.log(`✅ Reminder check complete. Sent ${totalRemindersSent} reminders.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Reminder check complete`,
        remindersSent: totalRemindersSent,
        notificationsCreated: notificationsToCreate.length,
        timestamp: new Date().toISOString(),
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
    console.error('Error in send-whatsapp-reminder:', error);
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

// Helper function to get currency symbol
function getCurrencySymbol(currency: string): string {
  const symbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'PKR': 'Rs.',
    'INR': '₹',
    'JPY': '¥',
    'CAD': 'CA$',
    'AUD': 'AU$',
  };
  return symbols[currency] || currency;
}
