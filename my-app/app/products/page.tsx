'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '../../lib/db/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';

const VISIBLE_ROWS = 3; // nombre de lignes visibles
const COLS = 4;          // nombre de colonnes
const BUFFER_ROWS = 2;   // lignes tampon
const GAP = 24;          // gap en px

export default function ProductsPage() {
  const { t } = useI18n();

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [startRow, setStartRow] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');

        const result = (await res.json()) as Product[] | Record<string, Product[]>;

        if (Array.isArray(result)) setData(result);
        else if (result && Object.values(result).length > 0)
          setData(Object.values(result).flat());
        else setError('No products found');
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

  /* ---------------- VIRTUALIZATION ---------------- */
  const rowHeight = 420 + GAP; // hauteur approximative d'une ligne (image + gap)
  const totalRows = Math.ceil(filteredProducts.length / COLS);

  const visibleRows = useMemo(() => {
    const from = Math.max(0, startRow - BUFFER_ROWS);
    const to = Math.min(totalRows, startRow + VISIBLE_ROWS + BUFFER_ROWS);
    const startIdx = from * COLS;
    const endIdx = Math.min(filteredProducts.length, to * COLS);
    return filteredProducts.slice(startIdx, endIdx);
  }, [filteredProducts, startRow, totalRows]);

  /* ---------------- SCROLL HANDLER ---------------- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      const newStartRow = Math.floor(container.scrollTop / rowHeight);
      setStartRow(newStartRow);
    };

    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, [rowHeight]);

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

  const topSpacerHeight = startRow * rowHeight;
  const bottomSpacerHeight = Math.max(0, (totalRows - (startRow + VISIBLE_ROWS + BUFFER_ROWS)) * rowHeight);

  return (
    <div className="stoneBg text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

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

        <div
          ref={containerRef}
          style={{ maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}
        >
          {filterLoading && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/50 z-50 pointer-events-none">
              <span className="text-xl font-semibold animate-pulse">{t('loading')}</span>
            </div>
          )}

          <div style={{ height: topSpacerHeight }} />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleRows.map(product => (
              <ProductCard key={product.id} product={product} priority={false} />
            ))}
          </div>

          <div style={{ height: bottomSpacerHeight }} />
        </div>

      </div>
    </div>
  );
}