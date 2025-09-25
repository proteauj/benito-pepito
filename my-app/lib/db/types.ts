export interface Order {
  id: string;
  stripeSessionId: string;
  customerEmail?: string;
  productIds: string[];
  totalAmount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductStock {
  productId: string;
  inStock: boolean;
  updatedAt: Date;
}
