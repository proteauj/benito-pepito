'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';

/* ================= CONFIG ================= */
const VISIBLE = 12;
/* ========================================== */

export default function ProductsPage() {
  const { t } = useI18n();

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sizeFilter, setSizeFilter] =
    useState<Product['size'] | 'All'>('All');

  const [sortBy, setSortBy] =
    useState<'default' | 'price-asc' | 'price-desc'>('default');

  const [start, setStart] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  /* ---------------- VISIBLE PRODUCTS (ONLY 12) ---------------- */
  const visibleProducts = useMemo(() => {
    return filtered.slice(start, start + VISIBLE);
  }, [filtered, start]);

  /* ---------------- SCROLL HANDLER ---------------- */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;

      // vers le bas
      if (
        scrollTop + clientHeight >= scrollHeight - 50 &&
        start + VISIBLE < filtered.length
      ) {
        setStart(s => s + VISIBLE);
        el.scrollTop = 0; // reset visuel propre
      }
    };

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [start, filtered.length]);

  /* ---------------- STATES ---------------- */
  if (loading) return <ProductsLoading />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  /* ---------------- RENDER ---------------- */
  return (
    <div className="h-screen stoneBg text-[var(--foreground)] overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col px-4 sm:px-6 lg:px-8">

        {/* HEADER FIXE */}
        <div className="shrink-0 py-8">
          <h1 className="text-4xl font-bold mb-6">
            {t('headings.allArtworks')}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={sizeFilter}
              onChange={e => {
                setStart(0);
                setSizeFilter(e.target.value as any);
              }}
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
              onChange={e => {
                setStart(0);
                setSortBy(e.target.value as any);
              }}
              className="p-3 border bg-white text-black"
            >
              <option value="default">{t('sort.default')}</option>
              <option value="price-asc">{t('sort.priceAsc')}</option>
              <option value="price-desc">{t('sort.priceDesc')}</option>
            </select>
          </div>
        </div>

        {/* ZONE SCROLL UNIQUE */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto pb-10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}