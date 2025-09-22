'use client';

import { useEffect, useState } from 'react';
import CategorySlideshow from '@/components/CategorySlideshow';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  artist: string;
  medium: string;
  year: number;
}

type ProductsByCategory = Record<string, Product[]>;

export default function HomePage() {
  const [productsByCategory, setProductsByCategory] = useState<ProductsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { itemCount, toggleCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProductsByCategory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      {/* Category Slideshows: two side-by-side on md+ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="leafy-divider pb-3 mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Collections</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {Object.entries(productsByCategory).map(([category, products]) => (
            <CategorySlideshow
              key={category}
              category={category}
              products={products}
            />
          ))}
        </div>
      </main>

      {/* Hero Section (moved below to prioritize artworks) */}
      <section className="bg-gradient-to-r from-emerald-700 to-[var(--gold)] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6">Welcome to Benito Pepito</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover singular artworks across curated categories.
          </p>
          <a href="#" className="inline-block bg-[var(--gold)] text-black px-8 py-3 rounded-lg font-semibold hover:bg-[var(--gold-dark)] transition-colors">
            Explore Collections
          </a>
        </div>
      </section>

    </div>
  );
}