export interface Product {
  id: string;
  slug: string;
  title: string;
  titleFr?: string;
  description: string;
  descriptionFr?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: "Sculpture" | "Painting" | "Home & Garden";
  inStock: boolean;
  artist: string;
  medium: string;
  mediumFr?: string;
  year: number;
  lastUpdated: string;
}

export type ProductsByCategory = Record<string, Product[]>;
