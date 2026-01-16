'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';

/* ================= CONFIG ================= */
const VISIBLE = 12; // produits visibles
const BUFFER = 12;  // buffer avant + après → max DOM 36
const ROW_HEIGHT = 420; // hauteur approximative d’une ligne
/* ========================================== */

export default function ProductsPage() {
  const { t } = useI18n();

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const [start, setStart] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

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
  const totalRows = Math.ceil(filteredProducts.length / columns);
  const startRow = Math.floor(start / columns);

  const windowProducts = useMemo(() => {
    const bufferRows = Math.ceil(BUFFER / columns);
    const visibleRows = Math.ceil(VISIBLE / columns);

    const fromRow = Math.max(0, startRow - bufferRows);
    const toRow = Math.min(totalRows, startRow + visibleRows + bufferRows);

    const from = fromRow * columns;
    const to = toRow * columns;

    return filteredProducts.slice(from, to);
  }, [filteredProducts, startRow, columns, totalRows]);

  const paddingTop = startRow * ROW_HEIGHT;
  const visibleRowsCount = Math.ceil(windowProducts.length / columns);
  const paddingBottom = (totalRows - (startRow + visibleRowsCount)) * ROW_HEIGHT;

  /* ---------------- PRELOAD IMAGES ---------------- */
  useEffect(() => {
    windowProducts.forEach((p, idx) => {
      const img = new Image();
      img.src = p.image;
    });
  }, [windowProducts]);

  /* ---------------- SCROLL INFINI ---------------- */
  const onScroll = () => {
    if (!containerRef.current) return;

    const scrollBottom = containerRef.current.scrollTop + containerRef.current.clientHeight;
    const scrollHeight = containerRef.current.scrollHeight;

    // si proche du bas → charger suivants
    if (scrollBottom + 100 >= scrollHeight) {
      setStart(prev => Math.min(prev + VISIBLE, Math.max(0, filteredProducts.length - VISIBLE)));
    }
  };

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

  return (
    <div className="stoneBg text-[var(--foreground)] min-h-screen flex flex-col">

      {/* HEADER + FILTERS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-shrink-0">
        <h1 className="text-4xl font-bold mb-6 text-left">{t('headings.allArtworks')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 justify-start">
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
        onScroll={onScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8"
        style={{ paddingTop, paddingBottom }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {windowProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={start === 0 && idx < VISIBLE}
            />
          ))}
        </div>
      </div>
    </div>
  );
}