'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';
import ProductsLoading from '@/components/ProductsLoading';

/* ================= CONFIG ================= */
const VISIBLE = 12;   // Nombre de produits visibles à l'écran
const BUFFER = 12;    // Buffer avant + après
/* ========================================== */

export default function ProductsPage() {
  const { t } = useI18n();

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [start, setStart] = useState(0);

  const isTicking = useRef(false);

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

  /* ---------------- WINDOW PRODUCTS ---------------- */
  const windowProducts = useMemo(() => {
    const from = Math.max(0, start - BUFFER);
    const to = Math.min(filteredProducts.length, start + VISIBLE + BUFFER);
    return filteredProducts.slice(from, to);
  }, [filteredProducts, start]);

  /* ---------------- PRELOAD IMAGES ---------------- */
  useEffect(() => {
    windowProducts.forEach(p => {
      if (p.imageThumbnail) {
        const img = new (window as any).Image();
        img.src = p.imageThumbnail;
      }
    });
  }, [windowProducts]);

  /* ---------------- SCROLL HANDLER ---------------- */
  useEffect(() => {
    const onScroll = () => {
      if (isTicking.current) return;

      window.requestAnimationFrame(() => {
        const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

        // Scroll vers le bas
        if (scrollTop + clientHeight >= scrollHeight - 200 && start + VISIBLE < filteredProducts.length) {
          setStart(prev => Math.min(prev + VISIBLE, filteredProducts.length - VISIBLE));
        }

        // Scroll vers le haut
        if (scrollTop <= 200 && start > 0) {
          setStart(prev => Math.max(prev - VISIBLE, 0));
        }

        isTicking.current = false;
      });

      isTicking.current = true;
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [start, filteredProducts.length]);

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
    <div className="stoneBg text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* HEADER */}
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

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {windowProducts.map(product => (
            <div
              key={product.id}
              className="flex flex-col bg-white rounded shadow overflow-hidden"
            >
              <Image
                src={product.imageThumbnail || product.image}
                alt={product.title}
                width={300}
                height={0}
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                placeholder="blur"
                blurDataURL={product.imageThumbnail || product.image}
              />
              <div className="p-3">
                <h2 className="font-semibold text-lg">{product.title}</h2>
                <p className="text-sm mt-1">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}