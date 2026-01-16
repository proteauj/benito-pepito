'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Product } from '../../lib/db/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';

const VISIBLE = 12;
const BUFFER = 12;
const ITEM_HEIGHT = 440; // inclut image + info

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [start, setStart] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);

  // ---------------- FETCH PRODUCTS ----------------
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

  // ---------------- SORT ----------------
  const sortedProducts = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [data, sortBy]);

  // ---------------- FILTER ----------------
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter(p => sizeFilter === 'All' || p.size === sizeFilter);
  }, [sortedProducts, sizeFilter]);

  // ---------------- WINDOW PRODUCTS ----------------
  const windowProducts = useMemo(() => {
    const from = Math.max(0, start - BUFFER);
    const to = Math.min(filteredProducts.length, start + VISIBLE + BUFFER);
    return filteredProducts.slice(from, to);
  }, [filteredProducts, start]);

  // ---------------- PRELOAD THUMBNAILS PAR LIGNE ----------------
  useEffect(() => {
    if (!windowProducts.length) return;
    setFilterLoading(true);

    const promises = windowProducts.map(p => {
      return new Promise<void>(resolve => {
        const img = new Image();
        img.src = p.imageThumbnail;
        img.onload = img.onerror = () => resolve();
      });
    });

    Promise.all(promises).then(() => setFilterLoading(false));
  }, [windowProducts]);

  // ---------------- RESET START ----------------
  const resetStart = () => {
    if (!containerRef.current) return setStart(0);
    const scrollTop = containerRef.current.scrollTop;
    setStart(Math.floor(scrollTop / ITEM_HEIGHT));
  };

  // ---------------- INFINITE SCROLL BIDIRECTIONNEL ----------------
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        if (!containerRef.current) return;
        const scrollTop = containerRef.current.scrollTop;

        // détecte scroll bas
        if (entries[0].isIntersecting && scrollTop + containerRef.current.clientHeight >= containerRef.current.scrollHeight - 100) {
          setStart(prev => Math.min(prev + VISIBLE, Math.max(0, filteredProducts.length - VISIBLE)));
        }
      },
      { root: containerRef.current, rootMargin: '200px' }
    );

    if (lastItemRef.current) observer.observe(lastItemRef.current);

    return () => observer.disconnect();
  }, [windowProducts, filteredProducts.length]);

  // ---------------- STATES ----------------
  if (loading) return <ProductsLoading />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">{error}</p>
          <Link href="/" className="mt-4 inline-block bg-[var(--gold)] text-black px-6 py-3 font-semibold">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const topSpacerHeight = start * ITEM_HEIGHT;
  const bottomSpacerHeight = Math.max(0, (filteredProducts.length - (start + windowProducts.length)) * ITEM_HEIGHT);

  return (
    <div className="stoneBg text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-6">All Artworks</h1>

        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <select value={sizeFilter} onChange={e => { setSizeFilter(e.target.value as any); resetStart(); }} className="p-3 border bg-white text-black">
            <option value="All">All Sizes</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>

          <select value={sortBy} onChange={e => { setSortBy(e.target.value as any); resetStart(); }} className="p-3 border bg-white text-black">
            <option value="default">Default</option>
            <option value="price-asc">Price Asc</option>
            <option value="price-desc">Price Desc</option>
          </select>
        </div>

        {/* GRID VIRTUELLE */}
        <div ref={containerRef} style={{ maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
          {filterLoading && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/50 z-50 pointer-events-none">
              <span className="text-xl font-semibold animate-pulse">Loading...</span>
            </div>
          )}

          <div style={{ height: topSpacerHeight }} />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {windowProducts.map((product, idx) => {
              const isLastVisible = idx === windowProducts.length - 1;
              return (
                <div key={product.id} ref={isLastVisible ? lastItemRef : null}>
                  <ProductCard product={product} priority={start === 0} />
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