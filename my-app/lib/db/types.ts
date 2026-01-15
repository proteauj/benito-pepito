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

export interface Product {
  id: string;
  slug: string;
  title: string;
  titleFr?: string;
  size?: string;
  dimensions?: string;
  price: number;
  image: string;
  category: 'Sculpture' | 'Painting' | 'Home & Garden';
  material?: string;
  materialFr?: string;
  inStock: boolean;
  year: number;
}