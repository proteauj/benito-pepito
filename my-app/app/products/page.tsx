'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';

/* ===== CONFIG ===== */
const ROW_HEIGHT = 420;
const OVERSCAN_ROWS = 3;
/* ================== */

export default function ProductsPage() {
  const { t } = useI18n();

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] =
    useState<'default' | 'price-asc' | 'price-desc'>('default');

  const scrollRef = useRef<HTMLDivElement>(null);

  /* ---------- FETCH ---------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const result = await res.json();
        setData(Array.isArray(result) ? result : Object.values(result).flat());
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- SORT ---------- */
  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [data, sortBy]);

  /* ---------- FILTER ---------- */
  const products = useMemo(() => {
    return sorted.filter(p => sizeFilter === 'All' || p.size === sizeFilter);
  }, [sorted, sizeFilter]);

  /* ---------- COLUMNS ---------- */
  const getColumns = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth >= 1024) return 4;
    if (window.innerWidth >= 768) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  };

  const [columns, setColumns] = useState(getColumns());
  useEffect(() => {
    const onResize = () => setColumns(getColumns());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ---------- VIRTUALIZER ---------- */
  const rowCount = Math.ceil(products.length / columns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN_ROWS,
  });

  /* ---------- PRELOAD (VISIBLE ONLY) ---------- */
  useEffect(() => {
    virtualizer.getVirtualItems().forEach(row => {
      const start = row.index * columns;
      const end = Math.min(start + columns, products.length);
      products.slice(start, end).forEach(p => {
        const img = new Image();
        img.src = p.image;
      });
    });
  }, [virtualizer.getVirtualItems(), products, columns]);

  if (loading) return <ProductsLoading />;

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-screen stoneBg text-[var(--foreground)] flex flex-col">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto w-full px-4 py-6 shrink-0">
        <h1 className="text-4xl font-bold mb-6">
          {t('headings.allArtworks')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* SCROLL UNIQUE */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div
          style={{
            height: virtualizer.getTotalSize(),
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map(row => {
            const start = row.index * columns;
            const end = Math.min(start + columns, products.length);

            return (
              <div
                key={row.key}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${row.start}px)`,
                }}
              >
                {products.slice(start, end).map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}