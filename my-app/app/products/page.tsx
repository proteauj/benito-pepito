'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';

export default function ProductsPage() {
  const { t } = useI18n();

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sizeFilter, setSizeFilter] =
    useState<Product['size'] | 'All'>('All');

  const [sortBy, setSortBy] =
    useState<'default' | 'price-asc' | 'price-desc'>('default');

  const parentRef = useRef<HTMLDivElement>(null);

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');

        const result = (await res.json()) as
          | Record<string, Product[]>
          | Product[];

        const products = Array.isArray(result)
          ? result
          : Object.values(result).flat();

        setData(products);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------------- SORT ---------------- */
  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [data, sortBy]);

  /* ---------------- FILTER ---------------- */
  const filtered = useMemo(() => {
    return sorted.filter(
      p => sizeFilter === 'All' || p.size === sizeFilter
    );
  }, [sorted, sizeFilter]);

  /* ---------------- COLUMNS ---------------- */
  const columns =
    typeof window === 'undefined'
      ? 4
      : window.innerWidth >= 1024
      ? 4
      : window.innerWidth >= 768
      ? 3
      : window.innerWidth >= 640
      ? 2
      : 1;

  const rowCount = Math.ceil(filtered.length / columns);

  /* ---------------- VIRTUALIZER ---------------- */
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 420,
    overscan: 3, // ← buffer réel (≈ 36 cards max)
  });

  /* ---------------- STATES ---------------- */
  if (loading) return <ProductsLoading />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">{error}</p>
          <Link href="/" className="mt-4 inline-block bg-[var(--gold)] px-6 py-3">
            {t('actions.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- RENDER ---------------- */
  return (
    <div className="min-h-screen stoneBg text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* HEADER */}
        <h1 className="text-4xl font-bold mb-6">
          {t('headings.allArtworks')}
        </h1>

        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <select
            value={sizeFilter}
            onChange={e => setSizeFilter(e.target.value as any)}
            className="p-3 bg-white text-black border"
          >
            <option value="All">{t('products.allSizes')}</option>
            <option value="S">{t('products.sizeS')}</option>
            <option value="M">{t('products.sizeM')}</option>
            <option value="L">{t('products.sizeL')}</option>
            <option value="XL">{t('products.sizeXL')}</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="p-3 bg-white text-black border"
          >
            <option value="default">{t('sort.default')}</option>
            <option value="price-asc">{t('sort.priceAsc')}</option>
            <option value="price-desc">{t('sort.priceDesc')}</option>
          </select>
        </div>

        {/* SCROLL ZONE (UNIQUE) */}
        <div
          ref={parentRef}
          className="h-[80vh] overflow-y-auto"
        >
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map(row => {
              const start = row.index * columns;
              const items = filtered.slice(
                start,
                start + columns
              );

              return (
                <div
                  key={row.key}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${row.start}px)`,
                  }}
                >
                  {items.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}