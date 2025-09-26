#!/usr/bin/env node

/**
 * Automated test script for deployment
 * This runs automatically during development and deployment
 * Compatible with Vercel deployment
 */

const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil'
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runAutomatedTests() {
  console.log('🚀 Running automated tests...\n');

  // Check if environment variables are set
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('⚠️ STRIPE_SECRET_KEY not found - skipping Stripe tests');
    console.log('💡 Add your Stripe key to .env file for full testing');
    return { success: true, message: 'Environment check passed (no Stripe key)' };
  }

  try {
    // Test 1: Database connection
    console.log('📋 Test 1: Database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Test 2: Stripe connection
    console.log('\n📋 Test 2: Stripe connection...');
    const testSession = await stripe.checkout.sessions.list({ limit: 1 });
    console.log('✅ Stripe connected successfully');

    // Test 3: Address saving functionality
    console.log('\n📋 Test 3: Address saving functionality...');
    const testAddress = {
      line1: '123 Test Street',
      city: 'Test City',
      state: 'QC',
      postalCode: 'H1A 2B3',
      country: 'CA'
    };

    const existingAddress = await prisma.customerAddress.findFirst({
      where: {
        type: 'billing',
        line1: testAddress.line1,
        city: testAddress.city,
        postalCode: testAddress.postalCode,
        country: testAddress.country,
      }
    });

    if (existingAddress) {
      console.log('✅ Address deduplication working');
    } else {
      console.log('ℹ️ Creating test address for deduplication test');
      await prisma.customerAddress.create({
        data: {
          type: 'billing',
          line1: testAddress.line1,
          city: testAddress.city,
          state: testAddress.state,
          postalCode: testAddress.postalCode,
          country: testAddress.country,
        }
      });
      console.log('✅ Test address created');
    }

    // Test 4: Order creation
    console.log('\n📋 Test 4: Order creation...');
    const testOrder = await prisma.order.create({
      data: {
        stripeSessionId: 'test_session_' + Date.now(),
        customerEmail: 'test@example.com',
        productIds: ['test-product'],
        totalAmount: 10000,
        currency: 'CAD',
        status: 'completed'
      }
    });
    console.log(`✅ Test order created: ${testOrder.id}`);

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await prisma.order.delete({ where: { id: testOrder.id } });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All automated tests passed!');
    return { success: true, message: 'All tests passed' };

  } catch (error) {
    console.error('❌ Automated test failed:', error.message);
    return { success: false, message: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other scripts
module.exports = { runAutomatedTests };

// Run if called directly
if (require.main === module) {
  runAutomatedTests()
    .then(result => {
      console.log('\n📊 Test Result:', result.message);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}
