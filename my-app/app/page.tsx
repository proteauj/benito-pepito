'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { useCart } from './contexts/CartContext';
import CategorySlideshow from './components/CategorySlideshow';
import { useI18n } from './i18n/I18nProvider';
import { Product } from '../lib/db/types';

type ProductsByCategory = Record<string, Product[]>;

export default function HomePage() {
  const { t } = useI18n();
  const [productsByCategory, setProductsByCategory] = useState<ProductsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { itemCount, toggleCart } = useCart();

  // Track homepage visit
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch('/api/analytics/track?page=homepage', {
          method: 'POST',
        });
      } catch (error) {
        // Silently fail if tracking fails - don't break the user experience
        console.debug('Analytics tracking failed:', error);
      }
    };

    trackVisit();
  }, []); // Empty dependency array - only run once on mount

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
        <div className="bg-white/95 border border-[#cfc9c0] shadow px-16 py-12 text-center w-full max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-[var(--leaf)] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-xl font-semibold text-[var(--leaf)]">{t('loading')}</p>
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
    <div className="min-h-screen stoneBg text-[var(--foreground)]">

      {/* Category Slideshows: two side-by-side on md+ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <div className="leafy-divider">
            <h1 className="text-4xl font-bold">{t('nav.home')}</h1>
          </div>
          <Link href="/products" className="bg-[var(--gold)] text-black px-6 py-2 font-semibold hover:bg-[var(--gold-dark)] transition-colors text-center">
            {t('nav.allWorks')}
          </Link>
        </div>
        <p className="text-lg font-semibold text-[var(--leaf)] mb-6 text-shadow-white">{t('home.tagline')}</p>
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
    </div>
  );
}