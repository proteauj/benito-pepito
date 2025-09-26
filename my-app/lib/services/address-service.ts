/**
 * Centralized address service
 * Single source of truth for address saving logic
 */

import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

export class AddressService {
  /**
   * Save addresses for a given session - handles deduplication automatically
   */
  static async saveAddressesForSession(
    sessionId: string,
    billingAddress?: Stripe.Address,
    shippingAddress?: Stripe.Address,
    customerEmail?: string
  ): Promise<void> {
    try {
      console.log(`🏠 Saving addresses for session: ${sessionId}`);

      // Find existing order for this session
      const existingOrder = await prisma.order.findUnique({
        where: { stripeSessionId: sessionId },
        include: {
          billingAddress: true,
          shippingAddress: true
        }
      });

      if (!existingOrder) {
        console.log('⚠️ No order found for session:', sessionId);
        return;
      }

      // Check if addresses already exist for this session
      if (existingOrder.billingAddressId || existingOrder.shippingAddressId) {
        console.log('📍 Addresses already exist for this session, skipping save');
        return;
      }

      // Save billing address if available
      if (billingAddress) {
        await this.saveOrLinkAddress(existingOrder.id, billingAddress, 'billing', customerEmail);
      }

      // Save shipping address if available
      if (shippingAddress) {
        await this.saveOrLinkAddress(existingOrder.id, shippingAddress, 'shipping', customerEmail);
      }

      console.log('✅ Addresses saved successfully');

    } catch (error) {
      console.error('❌ Error in AddressService:', error);
      throw error;
    }
  }

  /**
   * Save or link address - handles deduplication
   */
  private static async saveOrLinkAddress(
    orderId: string,
    address: Stripe.Address,
    type: 'billing' | 'shipping',
    customerEmail?: string
  ): Promise<void> {
    // Check if identical address already exists
    const existingAddress = await this.findExistingAddress(address, type, customerEmail);

    if (existingAddress) {
      // Link existing address to order
      await this.linkAddressToOrder(orderId, existingAddress.id, type);
      console.log(`✅ Linked existing ${type} address`);
    } else {
      // Create new address
      const newAddress = await this.createAddress(address, type);
      await this.linkAddressToOrder(orderId, newAddress.id, type);
      console.log(`✅ Created new ${type} address`);
    }
  }

  /**
   * Find existing address to avoid duplicates
   */
  private static async findExistingAddress(
    address: Stripe.Address,
    type: string,
    customerEmail?: string
  ): Promise<any | null> {
    return await prisma.customerAddress.findFirst({
      where: {
        type: type,
        line1: address.line1 || '',
        line2: address.line2 || null,
        city: address.city || '',
        state: address.state || null,
        postalCode: address.postal_code || '',
        country: address.country || '',
      }
    });
  }

  /**
   * Create new address in database
   */
  private static async createAddress(address: Stripe.Address, type: string) {
    return await prisma.customerAddress.create({
      data: {
        type: type,
        line1: address.line1 || '',
        line2: address.line2 || null,
        city: address.city || '',
        state: address.state || null,
        postalCode: address.postal_code || '',
        country: address.country || '',
      }
    });
  }

  /**
   * Link address to order
   */
  private static async linkAddressToOrder(orderId: string, addressId: string, type: string) {
    await prisma.order.update({
      where: { id: orderId },
      data: type === 'billing'
        ? { billingAddressId: addressId }
        : { shippingAddressId: addressId }
    });
  }
}
