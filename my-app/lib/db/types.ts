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
  price: number;
  image: string;           // toujours la version full
  imageThumbnail: string;  // toujours générée par le script
  category: string;
  material?: string;
  materialFr?: string;
  inStock: boolean;
  year: number;
}
