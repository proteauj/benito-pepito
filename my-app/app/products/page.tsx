'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '../../lib/db/types';
import ProductsLoading from '@/components/ProductsLoading';

/* ================= CONFIG ================= */
const VISIBLE = 12;  // Nombre de produits visibles à l'écran
const BUFFER = 12;   // Buffer avant + après
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
        const result = await res.json();

        let products: Product[] = [];
        if (Array.isArray(result)) products = result;
        else if (result && typeof result === 'object') products = Object.values(result).flat() as Product[];

        setData(products);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------------- FILTER + SORT ---------------- */
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .filter(p => sizeFilter === 'All' || p.size === sizeFilter)
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [data, sizeFilter, sortBy]);

  /* ---------------- WINDOW PRODUCTS ---------------- */
  const windowProducts = useMemo(() => {
    const from = Math.max(0, start - BUFFER);
    const to = Math.min(filteredProducts.length, start + VISIBLE + BUFFER);
    return filteredProducts.slice(from, to);
  }, [filteredProducts, start]);

  /* ---------------- SCROLL HANDLER ---------------- */
  useEffect(() => {
    const onScroll = () => {
      if (isTicking.current) return;
      window.requestAnimationFrame(() => {
        const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 200 && start + VISIBLE < filteredProducts.length) {
          setStart(prev => Math.min(prev + VISIBLE, filteredProducts.length));
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
  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
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
              className="bg-white rounded shadow flex flex-col overflow-hidden"
            >
              {/* IMAGE */}
              <div className="w-full flex justify-center">
                <Image
                  src={product.imageThumbnail || product.image}
                  alt={product.title}
                  width={300}
                  height={300}
                  style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  placeholder="blur"
                  blurDataURL={product.imageThumbnail || product.image}
                  loading="lazy"
                />
              </div>

              {/* TITRE + PRIX */}
              <div className="p-2 flex flex-col">
                <h2 className="text-lg font-semibold">{product.title}</h2>
                <p className="text-sm mt-1">{product.price} €</p>
              </div>
            </div>
          ))}
        </div>

        {/* SECTION DESCRIPTION */}
        <div className="mt-6 p-4 bg-white rounded">
          <h2 className="text-2xl font-bold mb-2">Description</h2>
          <p>
            Cette section s’ajuste automatiquement à la hauteur de son contenu et au nombre de produits affichés.
          </p>
        </div>

      </div>
    </div>
  );
}