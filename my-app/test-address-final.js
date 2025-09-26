#!/usr/bin/env node

/**
 * Test script to verify address saving functionality
 * Run this after setting up your environment variables
 */

const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil'
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAddressSaving() {
  console.log('🧪 Testing address saving functionality...\n');

  // Check if environment variables are set
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('❌ STRIPE_SECRET_KEY not found in environment variables');
    console.log('💡 Please add your Stripe secret key to .env file or set it as environment variable');
    console.log('   Example: STRIPE_SECRET_KEY=sk_live_...');
    return;
  }

  const sessionId = 'cs_live_a1peedSXDD3qp1ZeAxvRWCfKdODESsaJl4yRWqA5u4FvIFHq4kjuTnl9BP';

  try {
    console.log(`📋 Testing session: ${sessionId}`);

    // Step 1: Retrieve the session from Stripe
    console.log('\n📋 Step 1: Retrieving session from Stripe...');
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log('✅ Session found');
    console.log(`   - Payment Status: ${session.payment_status}`);
    console.log(`   - Customer Email: ${session.customer_details?.email}`);

    // Step 2: Extract address information (CORRECTED PATH)
    console.log('\n📋 Step 2: Extracting address information...');
    const billingAddress = session.customer_details?.address;
    const shippingAddress = session.collected_information?.shipping_details?.address;

    console.log('🏠 Billing Address from Stripe:');
    if (billingAddress) {
      console.log(`   ✅ Line 1: ${billingAddress.line1}`);
      console.log(`   ✅ City: ${billingAddress.city}`);
      console.log(`   ✅ Country: ${billingAddress.country}`);
    } else {
      console.log('   ❌ No billing address found');
    }

    console.log('\n🚚 Shipping Address from Stripe:');
    if (shippingAddress) {
      console.log(`   ✅ Line 1: ${shippingAddress.line1}`);
      console.log(`   ✅ City: ${shippingAddress.city}`);
      console.log(`   ✅ Country: ${shippingAddress.country}`);
    } else {
      console.log('   ❌ No shipping address found');
    }

    // Step 3: Check if order already exists
    console.log('\n📋 Step 3: Checking existing order...');
    const existingOrder = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: {
        billingAddress: true,
        shippingAddress: true
      }
    });

    if (existingOrder) {
      console.log(`✅ Order exists: ${existingOrder.id}`);

      // Step 4: Test address saving if needed
      if ((billingAddress || shippingAddress) && (!existingOrder.billingAddressId || !existingOrder.shippingAddressId)) {
        console.log('\n📋 Step 4: Testing address saving...');

        // Save addresses if they exist and not already saved
        if (billingAddress && !existingOrder.billingAddressId) {
          const billingAddr = await prisma.customerAddress.create({
            data: {
              type: 'billing',
              line1: billingAddress.line1 || '',
              line2: billingAddress.line2 || null,
              city: billingAddress.city || '',
              state: billingAddress.state || null,
              postalCode: billingAddress.postal_code || '',
              country: billingAddress.country || '',
            }
          });

          await prisma.order.update({
            where: { id: existingOrder.id },
            data: { billingAddressId: billingAddr.id }
          });

          console.log('✅ Billing address saved and linked');
        }

        if (shippingAddress && !existingOrder.shippingAddressId) {
          const shippingAddr = await prisma.customerAddress.create({
            data: {
              type: 'shipping',
              line1: shippingAddress.line1 || '',
              line2: shippingAddress.line2 || null,
              city: shippingAddress.city || '',
              state: shippingAddress.state || null,
              postalCode: shippingAddress.postal_code || '',
              country: shippingAddress.country || '',
            }
          });

          await prisma.order.update({
            where: { id: existingOrder.id },
            data: { shippingAddressId: shippingAddr.id }
          });

          console.log('✅ Shipping address saved and linked');
        }
      }

      // Step 5: Final verification
      console.log('\n📋 Step 5: Final verification...');
      const finalOrder = await prisma.order.findUnique({
        where: { stripeSessionId: sessionId },
        include: {
          billingAddress: true,
          shippingAddress: true
        }
      });

      if (finalOrder) {
        console.log(`✅ Final order status:`);
        console.log(`   - Order ID: ${finalOrder.id}`);
        console.log(`   - Billing Address: ${finalOrder.billingAddressId ? '✅ Linked' : '❌ Not linked'}`);
        console.log(`   - Shipping Address: ${finalOrder.shippingAddressId ? '✅ Linked' : '❌ Not linked'}`);

        if (finalOrder.billingAddress) {
          console.log(`   - Billing: ${finalOrder.billingAddress.line1}, ${finalOrder.billingAddress.city}`);
        }
        if (finalOrder.shippingAddress) {
          console.log(`   - Shipping: ${finalOrder.shippingAddress.line1}, ${finalOrder.shippingAddress.city}`);
        }
      }
    } else {
      console.log('❌ No order found for this session');
    }

    console.log('\n🎉 Address saving test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.message.includes('No such checkout session')) {
      console.log('💡 This might be because:');
      console.log('   - The session ID is not valid');
      console.log('   - The session might be from test mode but using live keys');
      console.log('   - The session might have expired');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAddressSaving();
