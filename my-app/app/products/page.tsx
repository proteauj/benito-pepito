'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';

const PAGE_SIZE = 12; // batch d'images à précharger

export default function ProductsPage() {
  const { t } = useI18n();

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'lastUpdated'>('default');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // 🔹 Charger les produits
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');

        // ⚡ Type assertion ici
        const result = (await res.json()) as Record<string, Product[]> | Product[];

        // 🔹 Flatten pour toujours avoir Product[]
        const allProducts: Product[] = Array.isArray(result)
          ? result
          : Object.values(result).flat();

        setData(allProducts);
      } catch (e: any) {
        setError(e.message || 'Error loading products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Tri
  const sortedProducts = useMemo(() => {
    return [...data].sort((a, b) => {
      switch (sortBy) {
        case 'lastUpdated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });
  }, [data, sortBy]);

  // 🔹 Filtre par taille
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter(p => sizeFilter === 'All' || p.size === sizeFilter);
  }, [sortedProducts, sizeFilter]);

  // 🔹 Préload des images
  useEffect(() => {
    filteredProducts.slice(0, visibleCount).forEach(p => {
      const img = new Image();
      img.src = p.image;
    });
  }, [filteredProducts, visibleCount]);

  // 🔹 Charger plus de produits au scroll
  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, filteredProducts.length));
  };

  if (loading) return <ProductsLoading />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">{error}</p>
          <Link href="/" className="mt-4 inline-block bg-[var(--gold)] text-black px-6 py-3 font-semibold hover:bg-[var(--gold-dark)]">
            {t('actions.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen stoneBg text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-8">{t('headings.allArtworks')}</h1>

        {/* 🔹 Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <select
            value={sizeFilter}
            onChange={e => {
              setSizeFilter(e.target.value as any);
              setVisibleCount(PAGE_SIZE); // reset scroll batch
            }}
            className="w-full p-3 bg-white text-black border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
          >
            <option value="All">{t('products.all')}</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>

          <select
            value={sortBy}
            onChange={e => {
              setSortBy(e.target.value as any);
              setVisibleCount(PAGE_SIZE); // reset scroll batch
            }}
            className="w-full p-3 bg-white text-black border border-gray-300 rounded-none"
          >
            <option value="default">{t('sort.default')}</option>
            <option value="lastUpdated">{t('sort.lastUpdatedDesc')}</option>
            <option value="price-asc">{t('sort.priceAsc')}</option>
            <option value="price-desc">{t('sort.priceDesc')}</option>
          </select>
        </div>

        {/* 🔹 Grille responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.slice(0, visibleCount).map(product => (
            <ProductCard key={product.id} product={product} priority={false} />
          ))}
        </div>

        {/* 🔹 Bouton Charger plus */}
        {visibleCount < filteredProducts.length && (
          <div className="mt-6 text-center">
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-[var(--gold)] text-black font-semibold hover:bg-[var(--gold-dark)] rounded"
            >
              {t('actions.loadMore')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}