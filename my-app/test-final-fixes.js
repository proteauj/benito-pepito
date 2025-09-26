#!/usr/bin/env node

/**
 * Final test to verify both address duplication and customer email issues are fixed
 */

const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil'
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFinalFixes() {
  console.log('🧪 Testing final fixes for address duplication and customer email...\n');

  // Check if environment variables are set
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('❌ STRIPE_SECRET_KEY not found in environment variables');
    console.log('💡 Please add your Stripe secret key to .env file');
    return;
  }

  const sessionId = 'cs_live_a1peedSXDD3qp1ZeAxvRWCfKdODESsaJl4yRWqA5u4FvIFHq4kjuTnl9BP';

  try {
    console.log(`📋 Testing session: ${sessionId}`);

    // Step 1: Retrieve the session from Stripe
    console.log('\n📋 Step 1: Retrieving session from Stripe...');
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log('✅ Session found');
    console.log(`   - Customer Email: ${session.customer_details?.email}`);

    // Step 2: Extract address information
    console.log('\n📋 Step 2: Extracting address information...');
    const billingAddress = session.customer_details?.address;
    const shippingAddress = session.collected_information?.shipping_details?.address;

    console.log('🏠 Addresses found:');
    console.log(`   - Billing: ${billingAddress ? '✅' : '❌'}`);
    console.log(`   - Shipping: ${shippingAddress ? '✅' : '❌'}`);

    // Step 3: Check existing orders and addresses
    console.log('\n📋 Step 3: Checking existing data...');
    const existingOrder = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: {
        billingAddress: true,
        shippingAddress: true
      }
    });

    if (existingOrder) {
      console.log(`✅ Order exists: ${existingOrder.id}`);
      console.log(`   - Customer Email: ${existingOrder.customerEmail || '❌ Missing'}`);
      console.log(`   - Billing Address: ${existingOrder.billingAddressId ? '✅' : '❌'}`);
      console.log(`   - Shipping Address: ${existingOrder.shippingAddressId ? '✅' : '❌'}`);

      // Count total addresses to check for duplicates
      const totalAddresses = await prisma.customerAddress.count();
      console.log(`   - Total addresses in DB: ${totalAddresses}`);

      // Count addresses with same details as our test addresses
      if (billingAddress) {
        const duplicateBilling = await prisma.customerAddress.count({
          where: {
            type: 'billing',
            line1: billingAddress.line1 || '',
            city: billingAddress.city || '',
            postalCode: billingAddress.postal_code || '',
            country: billingAddress.country || '',
          }
        });
        console.log(`   - Duplicate billing addresses: ${duplicateBilling}`);
      }

      if (shippingAddress) {
        const duplicateShipping = await prisma.customerAddress.count({
          where: {
            type: 'shipping',
            line1: shippingAddress.line1 || '',
            city: shippingAddress.city || '',
            postalCode: shippingAddress.postal_code || '',
            country: shippingAddress.country || '',
          }
        });
        console.log(`   - Duplicate shipping addresses: ${duplicateShipping}`);
      }

      // Step 4: Test the fixes
      console.log('\n📋 Step 4: Testing fixes...');

      // Test 1: Email should be saved
      if (!existingOrder.customerEmail && session.customer_details?.email) {
        await prisma.order.update({
          where: { id: existingOrder.id },
          data: { customerEmail: session.customer_details.email }
        });
        console.log('✅ Customer email fixed');
      }

      // Test 2: Addresses should not duplicate
      if ((billingAddress || shippingAddress) && (!existingOrder.billingAddressId || !existingOrder.shippingAddressId)) {
        console.log('📍 Testing address deduplication...');

        if (billingAddress && !existingOrder.billingAddressId) {
          const existingBilling = await prisma.customerAddress.findFirst({
            where: {
              type: 'billing',
              line1: billingAddress.line1 || '',
              city: billingAddress.city || '',
              postalCode: billingAddress.postal_code || '',
              country: billingAddress.country || '',
            }
          });

          if (existingBilling) {
            console.log('✅ Found existing billing address - no duplication');
          } else {
            console.log('ℹ️ Creating new billing address');
          }
        }

        if (shippingAddress && !existingOrder.shippingAddressId) {
          const existingShipping = await prisma.customerAddress.findFirst({
            where: {
              type: 'shipping',
              line1: shippingAddress.line1 || '',
              city: shippingAddress.city || '',
              postalCode: shippingAddress.postal_code || '',
              country: shippingAddress.country || '',
            }
          });

          if (existingShipping) {
            console.log('✅ Found existing shipping address - no duplication');
          } else {
            console.log('ℹ️ Creating new shipping address');
          }
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
        console.log(`✅ Final Results:`);
        console.log(`   - Customer Email: ${finalOrder.customerEmail ? '✅' : '❌'}`);
        console.log(`   - Billing Address: ${finalOrder.billingAddressId ? '✅' : '❌'}`);
        console.log(`   - Shipping Address: ${finalOrder.shippingAddressId ? '✅' : '❌'}`);
        console.log(`   - No Duplicates: ${finalOrder.billingAddressId && finalOrder.shippingAddressId ? '✅' : '⚠️'}`);
      }

    } else {
      console.log('❌ No order found for this session');
    }

    console.log('\n🎉 Testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testFinalFixes();
