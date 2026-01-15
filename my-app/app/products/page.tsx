'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';
import { VirtuosoGrid } from 'react-virtuoso';

/* ================= CONFIG ================= */
const VISIBLE = 12; // produits visibles
const BUFFER = 24;  // buffer avant/après
/* ========================================== */

export default function ProductsPage() {
  const { t } = useI18n();

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');

        const result = (await res.json()) as Record<string, Product[]> | Product[];
        const products = Array.isArray(result) ? result : Object.values(result).flat();
        setData(products);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------------- SORT ---------------- */
  const sortedProducts = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [data, sortBy]);

  /* ---------------- FILTER ---------------- */
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter(p => sizeFilter === 'All' || p.size === sizeFilter);
  }, [sortedProducts, sizeFilter]);

  /* ---------------- PRELOAD IMAGES ---------------- */
  useEffect(() => {
    filteredProducts.slice(0, VISIBLE + BUFFER).forEach(p => {
      const img = new Image();
      img.src = p.image;
    });
  }, [filteredProducts]);

  /* ---------------- STATES ---------------- */
  if (loading) return <ProductsLoading />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">{error}</p>
          <Link
            href="/"
            className="mt-4 inline-block bg-[var(--gold)] text-black px-6 py-3 font-semibold"
          >
            {t('actions.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- RENDER ---------------- */
  return (
    <div className="stoneBg text-[var(--foreground)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col h-full">

        {/* HEADER */}
        <div className="py-8 shrink-0">
          <h1 className="text-4xl font-bold mb-6">{t('headings.allArtworks')}</h1>

          {/* FILTERS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <select
              value={sizeFilter}
              onChange={e => setSizeFilter(e.target.value as any)}
              className="p-3 border bg-white text-black"
            >
              <option value="All">{t('products.allSizes')}</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="p-3 border bg-white text-black"
            >
              <option value="default">{t('sort.default')}</option>
              <option value="price-asc">{t('sort.priceAsc')}</option>
              <option value="price-desc">{t('sort.priceDesc')}</option>
            </select>
          </div>
        </div>

        {/* GRID VIRTUALISÉE */}
        <div className="flex-1">
          <VirtuosoGrid
            style={{ height: '100%' }}
            totalCount={filteredProducts.length}
            overscan={BUFFER}
            components={{
              List: (props) => <div {...props} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" />
            }}
            itemContent={(index) => {
              const product = filteredProducts[index];
              return <ProductCard key={product.id} product={product} priority />;
            }}
          />
        </div>
      </div>
    </div>
  );
}