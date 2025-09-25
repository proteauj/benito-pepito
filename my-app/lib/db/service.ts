import { prisma } from './client';
import { Order, ProductStock } from './types';

export class DatabaseService {
  // Orders
  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const result = await prisma`
      INSERT INTO orders (stripe_session_id, customer_email, product_ids, total_amount, currency, status)
      VALUES (${orderData.stripeSessionId}, ${orderData.customerEmail}, ${JSON.stringify(orderData.productIds)}, ${orderData.totalAmount}, ${orderData.currency}, ${orderData.status})
      RETURNING *
    `;

    return this.mapOrderRow(result.rows[0]);
  }

  static async updateOrderStatus(stripeSessionId: string, status: Order['status']): Promise<Order | null> {
    const result = await prisma`
      UPDATE orders
      SET status = ${status}, updated_at = NOW()
      WHERE stripe_session_id = ${stripeSessionId}
      RETURNING *
    `;

    if (result.rows.length === 0) return null;
    return this.mapOrderRow(result.rows[0]);
  }

  static async getOrderBySessionId(stripeSessionId: string): Promise<Order | null> {
    const result = await prisma`
      SELECT * FROM orders WHERE stripe_session_id = ${stripeSessionId}
    `;

    if (result.rows.length === 0) return null;
    return this.mapOrderRow(result.rows[0]);
  }

  // Product Stock
  static async getProductStock(productId: string): Promise<boolean> {
    const result = await prisma`
      SELECT in_stock FROM product_stock WHERE product_id = ${productId}
    `;

    if (result.rows.length === 0) return true; // Default to in stock if not found
    return result.rows[0].in_stock;
  }

  static async updateProductStock(productId: string, inStock: boolean): Promise<void> {
    await prisma`
      INSERT INTO product_stock (product_id, in_stock, updated_at)
      VALUES (${productId}, ${inStock}, NOW())
      ON CONFLICT (product_id)
      DO UPDATE SET
        in_stock = ${inStock},
        updated_at = NOW()
    `;
  }

  static async updateMultipleProductStock(productIds: string[], inStock: boolean): Promise<void> {
    const values = productIds.map((id, index) =>
      `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
    ).join(', ');

    const params = productIds.flatMap(id => [id, inStock, new Date()]);

    await prisma`
      INSERT INTO product_stock (product_id, in_stock, updated_at)
      VALUES ${values}
      ON CONFLICT (product_id)
      DO UPDATE SET
        in_stock = EXCLUDED.in_stock,
        updated_at = EXCLUDED.updated_at
    `;
  }

  // Helper methods
  private static mapOrderRow(row: any): Order {
    return {
      id: row.id,
      stripeSessionId: row.stripe_session_id,
      customerEmail: row.customer_email,
      productIds: row.product_ids,
      totalAmount: parseInt(row.total_amount),
      currency: row.currency,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
