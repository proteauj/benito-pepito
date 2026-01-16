'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';

/* ================= CONFIG ================= */
const VISIBLE_ROWS = 3; // lignes visibles
const BUFFER_ROWS = 3;  // lignes avant/après
const ROW_HEIGHT = 420; // hauteur moyenne d'une ligne
/* ========================================== */

export default function ProductsPage() {
  const { t } = useI18n();

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [columns, setColumns] = useState(4);

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

  /* ---------------- SORT & FILTER ---------------- */
  const filteredProducts = data
    .slice()
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    })
    .filter(p => sizeFilter === 'All' || p.size === sizeFilter);

  /* ---------------- COLUMNS RESPONSIVE ---------------- */
  const getColumns = () => {
    if (typeof window === 'undefined') return 1;
    if (window.innerWidth >= 1024) return 4;
    if (window.innerWidth >= 768) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  };

  useEffect(() => {
    const onResize = () => setColumns(getColumns());
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ---------------- SCROLL ---------------- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  /* ---------------- WINDOW PRODUCTS ---------------- */
  const totalRows = Math.ceil(filteredProducts.length / columns);
  const startRow = Math.floor(scrollTop / ROW_HEIGHT);
  const fromRow = Math.max(0, startRow - BUFFER_ROWS);
  const toRow = Math.min(totalRows, startRow + VISIBLE_ROWS + BUFFER_ROWS);

  const fromIndex = fromRow * columns;
  const toIndex = Math.min(toRow * columns, filteredProducts.length);

  const windowProducts = filteredProducts.slice(fromIndex, toIndex);

  const paddingTop = fromRow * ROW_HEIGHT;
  const paddingBottom = (totalRows - toRow) * ROW_HEIGHT;

  /* ---------------- PRELOAD IMAGES ---------------- */
  useEffect(() => {
    windowProducts.forEach(p => new Image().src = p.image);
  }, [windowProducts]);

  /* ---------------- STATES ---------------- */
  if (loading) return <ProductsLoading />;
  if (error)
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

  /* ---------------- RENDER ---------------- */
  return (
    <div className="h-screen stoneBg text-[var(--foreground)] flex flex-col">
      {/* HEADER & FILTERS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-start gap-4">
        <h1 className="text-4xl font-bold">{t('headings.allArtworks')}</h1>

        <div className="flex flex-col sm:flex-row gap-4">
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

      {/* GRID SCROLLABLE */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto w-full"
        style={{ position: 'relative' }}
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