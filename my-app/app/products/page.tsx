'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '../../lib/db/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';

const VISIBLE_LINES = 3; // nombre de lignes visibles
const BUFFER_LINES = 1;  // lignes tampon
const COLS_DESKTOP = 4;  // colonnes max desktop

export default function ProductsPage() {
  const { t } = useI18n();

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [startLine, setStartLine] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastLineRef = useRef<HTMLDivElement>(null);

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

  /* ---------------- WINDOW PRODUCTS PAR LIGNE ---------------- */
  const cols = COLS_DESKTOP; // on pourrait le calculer dynamiquement
  const productsPerLine = cols;

  const windowProducts = useMemo(() => {
    const fromLine = Math.max(0, startLine - BUFFER_LINES);
    const toLine = Math.min(
      Math.ceil(filteredProducts.length / productsPerLine),
      startLine + VISIBLE_LINES + BUFFER_LINES
    );

    return filteredProducts.slice(fromLine * productsPerLine, toLine * productsPerLine);
  }, [filteredProducts, startLine, productsPerLine]);

  /* ---------------- PRELOAD THUMBNAILS LIGNE PAR LIGNE ---------------- */
  useEffect(() => {
    if (!windowProducts.length) return;
    setFilterLoading(true);

    let loadedCount = 0;
    windowProducts.forEach(p => {
      const img = new Image();
      img.src = p.imageThumbnail;
      img.onload = img.onerror = () => {
        loadedCount++;
        if (loadedCount === windowProducts.length) setFilterLoading(false);
      };
    });
  }, [windowProducts]);

  /* ---------------- RESET START LINE SUR FILTRE/TRI ---------------- */
  const resetStart = () => setStartLine(0);

  /* ---------------- SCROLL OBSERVER ---------------- */
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        const lastVisible = entries[0];
        if (!lastVisible.isIntersecting) return;

        setStartLine(prev => {
          const totalLines = Math.ceil(filteredProducts.length / productsPerLine);
          return Math.min(prev + 1, Math.max(0, totalLines - VISIBLE_LINES));
        });
      },
      { root: containerRef.current, rootMargin: '200px' }
    );

    if (lastLineRef.current) observer.observe(lastLineRef.current);
    return () => observer.disconnect();
  }, [windowProducts, filteredProducts.length, productsPerLine]);

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
  const topSpacerHeight = startLine * 420; // hauteur approximative par ligne
  const bottomSpacerHeight = Math.max(
    0,
    (Math.ceil(filteredProducts.length / productsPerLine) - (startLine + VISIBLE_LINES)) * 420
  );

  return (
    <div className="stoneBg text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-6">{t('headings.allArtworks')}</h1>

        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <select value={sizeFilter} onChange={e => { setSizeFilter(e.target.value as any); resetStart(); }} className="p-3 border bg-white text-black">
            <option value="All">{t('products.allSizes')}</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>

          <select value={sortBy} onChange={e => { setSortBy(e.target.value as any); resetStart(); }} className="p-3 border bg-white text-black">
            <option value="default">{t('sort.default')}</option>
            <option value="price-asc">{t('sort.priceAsc')}</option>
            <option value="price-desc">{t('sort.priceDesc')}</option>
          </select>
        </div>

        {/* GRID VIRTUELLE */}
        <div ref={containerRef} style={{ maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
          {filterLoading && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/50 z-50 pointer-events-none">
              <span className="text-xl font-semibold animate-pulse">{t('loading')}</span>
            </div>
          )}

          <div style={{ height: topSpacerHeight }} />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {windowProducts.map((product, idx) => {
              const isLast = idx === windowProducts.length - 1;
              return (
                <div key={product.id} ref={isLast ? lastLineRef : null}>
                  <ProductCard product={product} priority={startLine === 0} />
                </div>
              );
            })}
          </div>

          <div style={{ height: bottomSpacerHeight }} />
        </div>
      </div>
    </div>
  );
}