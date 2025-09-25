import { prisma } from './client';
import { Order, ProductStock } from './types';

export class DatabaseService {
  // Orders
  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const order = await prisma.order.create({
      data: {
        stripeSessionId: orderData.stripeSessionId,
        customerEmail: orderData.customerEmail,
        productIds: orderData.productIds,
        totalAmount: orderData.totalAmount,
        currency: orderData.currency,
        status: orderData.status,
      }
    });

    return this.mapOrderToOrder(order);
  }

  static async updateOrderStatus(stripeSessionId: string, status: Order['status']): Promise<Order | null> {
    try {
      const order = await prisma.order.update({
        where: { stripeSessionId },
        data: { status, updatedAt: new Date() }
      });
      return this.mapOrderToOrder(order);
    } catch (error) {
      return null;
    }
  }

  static async getOrderBySessionId(stripeSessionId: string): Promise<Order | null> {
    try {
      const order = await prisma.order.findUnique({
        where: { stripeSessionId }
      });
      return order ? this.mapOrderToOrder(order) : null;
    } catch (error) {
      return null;
    }
  }

  // Product Stock
  static async getProductStock(productId: string): Promise<boolean> {
    try {
      const stock = await prisma.productStock.findUnique({
        where: { productId }
      });
      return stock?.inStock ?? true;
    } catch (error) {
      return true;
    }
  }

  static async updateProductStock(productId: string, inStock: boolean): Promise<void> {
    try {
      await prisma.productStock.upsert({
        where: { productId },
        update: { inStock, updatedAt: new Date() },
        create: { productId, inStock, updatedAt: new Date() }
      });
    } catch (error) {
      console.error('Error updating product stock:', error);
    }
  }

  static async updateMultipleProductStock(productIds: string[], inStock: boolean): Promise<void> {
    try {
      await Promise.all(
        productIds.map(productId =>
          prisma.productStock.upsert({
            where: { productId },
            update: { inStock, updatedAt: new Date() },
            create: { productId, inStock, updatedAt: new Date() }
          })
        )
      );
    } catch (error) {
      console.error('Error updating multiple product stock:', error);
    }
  }

  // Mapping helpers
  private static mapOrderToOrder(prismaOrder: any): Order {
    return {
      id: prismaOrder.id,
      stripeSessionId: prismaOrder.stripeSessionId,
      customerEmail: prismaOrder.customerEmail,
      productIds: prismaOrder.productIds,
      totalAmount: prismaOrder.totalAmount,
      currency: prismaOrder.currency,
      status: prismaOrder.status,
      createdAt: prismaOrder.createdAt,
      updatedAt: prismaOrder.updatedAt
    };
  }

  private static mapOrderRow(row: any): Order {
    return {
      id: row.id,
      stripeSessionId: row.stripe_session_id,
      customerEmail: row.customer_email,
      productIds: row.product_ids,
      totalAmount: row.total_amount,
      currency: row.currency,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
