'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';

/* ================= CONFIG ================= */
const VISIBLE_ROWS = 3; // 3 lignes visibles
const BUFFER_ROWS = 2;  // 2 lignes avant + 2 après = max 20-24 items
const ROW_HEIGHT = 420; // hauteur approximative d’une ligne
/* ========================================== */

export default function ProductsPage() {
  const { t } = useI18n();
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

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

  /* ---------------- COLUMNS ---------------- */
  const getColumns = () => {
    if (typeof window === 'undefined') return 1;
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

  /* ---------------- WINDOW PRODUCTS ---------------- */
  const { windowProducts, paddingTop, paddingBottom } = useMemo(() => {
    const totalRows = Math.ceil(filteredProducts.length / columns);
    const currentRow = Math.floor(scrollTop / ROW_HEIGHT);

    const fromRow = Math.max(0, currentRow - BUFFER_ROWS);
    const toRow = Math.min(totalRows, currentRow + VISIBLE_ROWS + BUFFER_ROWS);

    const from = fromRow * columns;
    const to = Math.min(filteredProducts.length, toRow * columns);

    const paddingTop = fromRow * ROW_HEIGHT;
    const paddingBottom = (totalRows - toRow) * ROW_HEIGHT;

    return {
      windowProducts: filteredProducts.slice(from, to),
      paddingTop,
      paddingBottom,
    };
  }, [filteredProducts, scrollTop, columns]);

  /* ---------------- PRELOAD IMAGES ---------------- */
  useEffect(() => {
    windowProducts.forEach(p => {
      const img = new Image();
      img.src = p.image;
    });
  }, [windowProducts]);

  /* ---------------- SCROLL HANDLER ---------------- */
  const handleScroll = () => {
    if (!scrollRef.current) return;
    setScrollTop(scrollRef.current.scrollTop);
  };

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
    <div className="stoneBg text-[var(--foreground)] h-screen flex flex-col">
      {/* HEADER + FILTERS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-shrink-0">
        <h1 className="text-4xl font-bold mb-4 text-left">{t('headings.allArtworks')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div style={{ paddingTop, paddingBottom }}>
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`}>
            {windowProducts.map(p => (
              <ProductCard key={p.id} product={p} priority />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}