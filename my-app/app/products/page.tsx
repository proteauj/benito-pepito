'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';

/* ================= CONFIG ================= */
const VISIBLE_ROWS = 3; // 3 lignes visibles = 12 cards si 4 cols
const BUFFER_ROWS = 3;  // 3 lignes avant + 3 lignes après = 36 max
const ROW_HEIGHT = 420; // hauteur approximative d’une ligne
/* ========================================== */

export default function ProductsPage() {
  const { t } = useI18n();

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const [start, setStart] = useState(0); // index du premier item visible
  const bottomRef = useRef<HTMLDivElement>(null);

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
  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [data, sortBy]);

  /* ---------------- FILTER ---------------- */
  const filtered = useMemo(() => {
    return sorted.filter(p => sizeFilter === 'All' || p.size === sizeFilter);
  }, [sorted, sizeFilter]);

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
  const totalRows = Math.ceil(filtered.length / columns);
  const startRow = Math.floor(start / columns);

  const windowProducts = useMemo(() => {
    const fromRow = Math.max(0, startRow - BUFFER_ROWS);
    const toRow = Math.min(totalRows, startRow + VISIBLE_ROWS + BUFFER_ROWS);

    const from = fromRow * columns;
    const to = toRow * columns;
    return filtered.slice(from, to);
  }, [filtered, startRow, columns, totalRows]);

  const paddingTop = startRow * ROW_HEIGHT;
  const visibleRowsCount = Math.ceil(windowProducts.length / columns);
  const paddingBottom = (totalRows - (startRow + visibleRowsCount)) * ROW_HEIGHT;

  /* ---------------- PRELOAD IMAGES ---------------- */
  useEffect(() => {
    windowProducts.forEach(p => {
      const img = new Image();
      img.src = p.image;
    });
  }, [windowProducts]);

  /* ---------------- OBSERVER ---------------- */
  useEffect(() => {
    if (!bottomRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStart(s =>
            Math.min(
              s + columns * VISIBLE_ROWS,
              Math.max(0, filtered.length - columns * VISIBLE_ROWS)
            )
          );
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [filtered.length, columns]);

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
    <div className="h-screen stoneBg text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto h-full flex flex-col px-4 sm:px-6 lg:px-8">

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
        <div
          className="flex-1 overflow-y-auto pb-10"
          style={{ paddingTop, paddingBottom }}
        >
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`}>
            {windowProducts.map(p => (
              <ProductCard key={p.id} product={p} priority />
            ))}
          </div>

          {/* SENTINEL */}
          <div ref={bottomRef} className="h-10" />
        </div>
      </div>
    </div>
  );
}