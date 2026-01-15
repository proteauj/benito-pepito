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
