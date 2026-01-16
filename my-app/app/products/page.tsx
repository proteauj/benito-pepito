'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '../../lib/db/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';

const ROW_BUFFER = 2; // nombre de lignes en cache avant/après
const ROW_VISIBLE = 3; // lignes visibles par défaut
const COLUMNS = { base: 1, sm: 2, md: 3, lg: 4 }; // responsive

export default function ProductsPage() {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [startRow, setStartRow] = useState(0); // ligne de départ

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');

        const result = (await res.json()) as Product[] | Record<string, Product[]>;
        if (Array.isArray(result)) setData(result);
        else if (result && Object.values(result).length > 0) setData(Object.values(result).flat());
        else setError('No products found');
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------------- SORT & FILTER ---------------- */
  const filteredProducts = useMemo(() => {
    let items = [...data];
    if (sortBy === 'price-asc') items.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') items.sort((a, b) => b.price - a.price);
    if (sizeFilter !== 'All') items = items.filter(p => p.size === sizeFilter);
    return items;
  }, [data, sortBy, sizeFilter]);

  /* ---------------- GRID UTILS ---------------- */
  const getColumns = () => {
    if (typeof window === 'undefined') return COLUMNS.lg;
    const w = window.innerWidth;
    if (w < 640) return COLUMNS.base;
    if (w < 768) return COLUMNS.sm;
    if (w < 1024) return COLUMNS.md;
    return COLUMNS.lg;
  };

  const columns = getColumns();
  const rows = useMemo(() => {
    const res = [];
    for (let i = 0; i < filteredProducts.length; i += columns) {
      res.push(filteredProducts.slice(i, i + columns));
    }
    return res;
  }, [filteredProducts, columns]);

  /* ---------------- VISIBLE ROWS ---------------- */
  const visibleRows = useMemo(() => {
    const from = Math.max(0, startRow - ROW_BUFFER);
    const to = Math.min(rows.length, startRow + ROW_VISIBLE + ROW_BUFFER);
    return rows.slice(from, to);
  }, [rows, startRow]);

  /* ---------------- SCROLL HANDLER ---------------- */
  const onScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const rowHeight = 450; // approx hauteur d’une ligne (images + titre)
    const newStartRow = Math.floor(scrollTop / rowHeight);
    setStartRow(newStartRow);
  };

  /* ---------------- STATES ---------------- */
  if (loading) return <ProductsLoading />;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">{error}</p>
          <Link href="/" className="mt-4 inline-block bg-[var(--gold)] text-black px-6 py-3 font-semibold">
            {t('actions.backToHome')}
          </Link>
        </div>
      </div>
    );

  return (
    <div className="stoneBg text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-6">{t('headings.allArtworks')}</h1>

        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value as any)}
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
            onChange={(e) => setSortBy(e.target.value as any)}
            className="p-3 border bg-white text-black"
          >
            <option value="default">{t('sort.default')}</option>
            <option value="price-asc">{t('sort.priceAsc')}</option>
            <option value="price-desc">{t('sort.priceDesc')}</option>
          </select>
        </div>

        {/* GRID VIRTUELLE */}
        <div
          ref={containerRef}
          style={{ maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}
          onScroll={onScroll}
        >
          <div style={{ height: startRow * 450 }} /> {/* top spacer */}
          {visibleRows.map((row, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
              {row.map((product) => (
                <ProductCard key={product.id} product={product} priority={startRow === 0} />
              ))}
            </div>
          ))}
          <div style={{ height: (rows.length - (startRow + visibleRows.length)) * 450 }} /> {/* bottom spacer */}
        </div>
      </div>
    </div>
  );
}