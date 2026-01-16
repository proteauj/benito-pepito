'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';

const VISIBLE = 12;  // 12 visibles
const BUFFER = 12;   // 12 avant + 12 après = max 36

export default function ProductsPage() {
  const { t } = useI18n();

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [start, setStart] = useState(0);

  const lastItemRef = useRef<HTMLDivElement>(null);

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');

        const result = (await res.json()) as Record<string, Product[]> | Product[];
        setData(Array.isArray(result) ? result : Object.values(result).flat());
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------------- WINDOW PRODUCTS ---------------- */
  const windowProducts = useMemo(() => {
    const from = Math.max(0, start - BUFFER);
    const to = Math.min(data.length, start + VISIBLE + BUFFER);
    return data.slice(from, to);
  }, [data, start]);

  /* ---------------- PRELOAD ---------------- */
  useEffect(() => {
    windowProducts.forEach((p, i) => {
      if (i < VISIBLE + BUFFER) {
        const img = new window.Image();
        img.src = p.image;
      }
    });
  }, [windowProducts]);

  /* ---------------- OBSERVER ---------------- */
  useEffect(() => {
    if (!lastItemRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStart(s => Math.min(s + VISIBLE, Math.max(0, data.length - VISIBLE)));
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(lastItemRef.current);
    return () => observer.disconnect();
  }, [data.length]);

  if (loading) return <ProductsLoading />;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );

  return (
    <div className="stoneBg text-[var(--foreground)] h-screen flex flex-col">
      {/* HEADER + FILTERS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 shrink-0">
        <h1 className="text-4xl font-bold mb-6">{t('headings.allArtworks')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <select
            value={'All'}
            onChange={() => {}}
            className="p-3 border bg-white text-black"
          >
            <option value="All">{t('products.allSizes')}</option>
          </select>
          <select value={'default'} onChange={() => {}} className="p-3 border bg-white text-black">
            <option value="default">{t('sort.default')}</option>
          </select>
        </div>
      </div>

      {/* SCROLL CONTAINER */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {windowProducts.map((product, idx) => {
            const isLastVisible = idx === Math.min(windowProducts.length, VISIBLE + BUFFER) - 1;
            return (
              <div key={product.id} ref={isLastVisible ? lastItemRef : null}>
                <ProductCard product={product} priority={idx < VISIBLE} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}