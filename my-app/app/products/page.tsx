'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';

const VISIBLE_COUNT = 12;
const BUFFER = 12; // avant + après → 36 en mémoire

export default function ProductsPage() {
  const { t } = useI18n();

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<
    'default' | 'price-asc' | 'price-desc'
  >('default');

  const [visibleStart, setVisibleStart] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isTicking = useRef(false);

  /* ------------------ FETCH ------------------ */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');

        const result = (await res.json()) as Record<string, Product[]> | Product[];
        const allProducts = Array.isArray(result)
          ? result
          : Object.values(result).flat();

        setData(allProducts);
      } catch (e: any) {
        setError(e.message || 'Error loading products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ------------------ SORT ------------------ */
  const sortedProducts = useMemo(() => {
    return [...data].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });
  }, [data, sortBy]);

  /* ------------------ FILTER ------------------ */
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter(
      p => sizeFilter === 'All' || p.size === sizeFilter
    );
  }, [sortedProducts, sizeFilter]);

  /* ------------------ WINDOW (36) ------------------ */
  const windowProducts = useMemo(() => {
    const start = Math.max(0, visibleStart - BUFFER);
    const end = Math.min(
      filteredProducts.length,
      visibleStart + VISIBLE_COUNT + BUFFER
    );
    return filteredProducts.slice(start, end);
  }, [filteredProducts, visibleStart]);

  /* ------------------ VISIBLE (12) ------------------ */
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(
      visibleStart,
      visibleStart + VISIBLE_COUNT
    );
  }, [filteredProducts, visibleStart]);

  /* ------------------ PRELOAD IMAGES (36) ------------------ */
  useEffect(() => {
    windowProducts.forEach(p => {
      const img = new Image();
      img.src = p.image;
    });
  }, [windowProducts]);

  /* ------------------ SCROLL HANDLER ------------------ */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (isTicking.current) return;

      window.requestAnimationFrame(() => {
        const { scrollTop, scrollHeight, clientHeight } = el;

        // 🔽 vers le bas
        if (
          scrollTop + clientHeight > scrollHeight - 200 &&
          visibleStart + VISIBLE_COUNT < filteredProducts.length
        ) {
          setVisibleStart(v => v + VISIBLE_COUNT);
          el.scrollTop = 100; // évite saut visuel
        }

        // 🔼 vers le haut
        if (scrollTop < 100 && visibleStart > 0) {
          setVisibleStart(v => Math.max(0, v - VISIBLE_COUNT));
          el.scrollTop = 300;
        }

        isTicking.current = false;
      });

      isTicking.current = true;
    };

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [visibleStart, filteredProducts.length]);

  /* ------------------ STATES ------------------ */
  if (loading) return <ProductsLoading />;

  if (error) {
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
  }

  /* ------------------ RENDER ------------------ */
  return (
    <div className="h-screen overflow-hidden stoneBg text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto h-full flex flex-col px-4 sm:px-6 lg:px-8">

        {/* 🔹 HEADER */}
        <div className="py-8 shrink-0">
          <h1 className="text-4xl font-bold mb-6">
            {t('headings.allArtworks')}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={sizeFilter}
              onChange={e => setSizeFilter(e.target.value as any)}
              className="p-3 bg-white text-black border"
            >
              <option value="All">{t('products.allSizes')}</option>
              <option value="S">{t('products.sizeS')}</option>
              <option value="M">{t('products.sizeM')}</option>
              <option value="L">{t('products.sizeL')}</option>
              <option value="XL">{t('products.sizeXL')}</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="p-3 bg-white text-black border"
            >
              <option value="default">{t('sort.default')}</option>
              <option value="price-asc">{t('sort.priceAsc')}</option>
              <option value="price-desc">{t('sort.priceDesc')}</option>
            </select>
          </div>
        </div>

        {/* 🔹 SCROLL ZONE */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto pb-10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                priority
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}