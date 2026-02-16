#!/usr/bin/env node

/**
 * WhatsApp Verification Test Script
 * Tests the WhatsApp verification flow using Node.js
 */

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Configuration
const SUPABASE_URL = 'https://kkffwzvyfbkhhoxztsgn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZmZ3enZ5ZmJraGhveHp0c2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjA4MDEsImV4cCI6MjA3NzQ5NjgwMX0.pJtQlX6dF7j8kAniWPDUNkT_MQfrJluvwacNKFqlfCQ';

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function sendVerificationCode(phoneNumber, userId) {
    console.log('\n📤 Step 1: Sending verification code...\n');

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/send-whatsapp-verification`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phoneNumber, userId })
        });

        const data = await response.json();

        console.log(`HTTP Status: ${response.status}`);
        console.log(`Response:`, data);
        console.log('');

        if (response.status !== 200) {
            console.log('❌ Failed to send verification code!\n');
            console.log('Common issues:');
            console.log('  1. WhatsApp API credentials not set in Supabase');
            console.log('  2. Edge Functions not deployed');
            console.log('  3. Invalid phone number format');
            console.log('  4. WhatsApp API token expired\n');
            console.log('Check the deployment guide: /WHATSAPP_DEPLOYMENT_GUIDE.md\n');
            return false;
        }

        console.log('✅ Verification code sent successfully!\n');
        return true;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

async function verifyCode(phoneNumber, verificationCode, userId) {
    console.log('\n🔐 Step 2: Verifying code...\n');

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-whatsapp-code`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phoneNumber, verificationCode, userId })
        });

        const data = await response.json();

        console.log(`HTTP Status: ${response.status}`);
        console.log(`Response:`, data);
        console.log('');

        if (response.status !== 200) {
            console.log('❌ Verification failed!\n');
            console.log('Common issues:');
            console.log('  1. Incorrect code entered');
            console.log('  2. Code expired (10 minute limit)');
            console.log('  3. Too many failed attempts (5 max)\n');
            return false;
        }

        console.log('✅ Phone number verified successfully!\n');
        return true;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

async function main() {
    console.log('🧪 WhatsApp Verification Test Script');
    console.log('=====================================\n');

    const phoneNumber = await question('Enter phone number (with country code, e.g., +12345678900): ');
    const userId = `test-user-${Date.now()}`;

    console.log('\n📱 Testing with:');
    console.log(`   Phone: ${phoneNumber}`);
    console.log(`   User ID: ${userId}\n`);

    const sendSuccess = await sendVerificationCode(phoneNumber, userId);

    if (!sendSuccess) {
        rl.close();
        process.exit(1);
    }

    const verificationCode = await question('Enter the 6-digit code you received on WhatsApp: ');

    const verifySuccess = await verifyCode(phoneNumber, verificationCode, userId);

    if (verifySuccess) {
        console.log('🎉 WhatsApp verification is working correctly!\n');
        console.log('Next steps:');
        console.log('  1. Test from the SubTrack Pro UI');
        console.log('  2. Test with different phone numbers');
        console.log('  3. Deploy to production\n');
    }

    rl.close();
    process.exit(verifySuccess ? 0 : 1);
}

main().catch(error => {
    console.error('Fatal error:', error);
    rl.close();
    process.exit(1);
});
