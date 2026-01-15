'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';

const VISIBLE = 12;
const PRELOAD = 12;

export default function ProductsPage() {
  const { t } = useI18n();

  const [data, setData] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'lastUpdated'>('default');

  const containerRef = useRef<HTMLDivElement>(null);

  // 🔹 Fetch
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then((result: Record<string, Product[]> | Product[]) => {
        const all = Array.isArray(result) ? result : Object.values(result).flat();
        setData(all);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // 🔹 Sort
  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        default: return 0;
      }
    });
  }, [data, sortBy]);

  // 🔹 Filter
  const filtered = useMemo(() => {
    return sorted.filter(p => sizeFilter === 'All' || p.size === sizeFilter);
  }, [sorted, sizeFilter]);

  // 🔹 Visible window
  const start = page * VISIBLE;
  const visibleProducts = filtered.slice(start, start + VISIBLE);

  // 🔹 Preload window
  useEffect(() => {
    const preloadStart = Math.max(0, start - PRELOAD);
    const preloadEnd = Math.min(filtered.length, start + VISIBLE + PRELOAD);

    filtered.slice(preloadStart, preloadEnd).forEach(p => {
      const img = new Image();
      img.src = p.image;
    });
  }, [filtered, start]);

  // 🔹 Scroll detector
  const onScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      setPage(p => Math.min(p + 1, Math.floor(filtered.length / VISIBLE)));
      el.scrollTop = 0;
    }

    if (el.scrollTop === 0 && page > 0) {
      setPage(p => p - 1);
      el.scrollTop = el.scrollHeight;
    }
  };

  if (loading) return <ProductsLoading />;

  if (error) {
    return <div className="text-red-600 text-center mt-20">{error}</div>;
  }

  return (
    <div className="min-h-screen stoneBg">
      <div className="max-w-7xl mx-auto px-4 py-10">

        <h1 className="text-4xl font-bold mb-8">{t('headings.allArtworks')}</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <select value={sizeFilter} onChange={e => setSizeFilter(e.target.value as any)} className="p-3 border">
            <option value="All">All</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>

          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="p-3 border">
            <option value="default">Default</option>
            <option value="lastUpdated">Latest</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
          </select>
        </div>

        {/* Grid */}
        <div
          ref={containerRef}
          onScroll={onScroll}
          className="h-[80vh] overflow-y-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleProducts.map(p => (
              <ProductCard key={p.id} product={p} priority />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
