'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';
import ProductsLoading from '@/components/ProductsLoading';

/* ================= CONFIG ================= */
const VISIBLE = 12; // nombre de produits visibles
const BUFFER = 6;   // éléments avant/après = 12+6+6 = 24 max dans le DOM
/* ========================================== */

export default function ProductsPage() {
  const { t } = useI18n();

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const [start, setStart] = useState(0); // index du premier produit visible
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);

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

  /* ---------------- WINDOW PRODUCTS ---------------- */
  const windowProducts = useMemo(() => {
    const from = Math.max(0, start - BUFFER);
    const to = Math.min(filteredProducts.length, start + VISIBLE + BUFFER);
    return filteredProducts.slice(from, to);
  }, [filteredProducts, start]);

  /* ---------------- PRELOAD IMAGES ---------------- */
  useEffect(() => {
    windowProducts.forEach(p => {
      const img = new window.Image();
      img.src = p.image;
    });
  }, [windowProducts]);

  /* ---------------- OBSERVER ---------------- */
  useEffect(() => {
    if (!lastItemRef.current || !scrollRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStart(prev =>
            Math.min(prev + VISIBLE, Math.max(0, filteredProducts.length - VISIBLE))
          );
        }
      },
      { root: scrollRef.current, rootMargin: '200px' }
    );

    observer.observe(lastItemRef.current);
    return () => observer.disconnect();
  }, [filteredProducts.length, windowProducts]);

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
    <div className="stoneBg text-[var(--foreground)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col h-screen">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-4xl font-bold mb-4 sm:mb-0">{t('headings.allArtworks')}</h1>

          {/* FILTERS */}
          <div className="flex flex-wrap gap-4">
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

        {/* GRID */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {windowProducts.map((product, idx) => {
              const isLastVisible = idx === windowProducts.length - 1;
              return (
                <div
                  key={product.id}
                  ref={isLastVisible ? lastItemRef : null}
                >
                  <Link href={`/product/${product.slug}`} className="group block bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="relative w-full bg-gray-50 overflow-hidden">
                      <div className="relative w-full aspect-[4/5] sm:aspect-square">
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-contain sm:object-cover transition-transform duration-300 group-hover:scale-105"
                          priority={idx < VISIBLE}
                          quality={40}
                        />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium line-clamp-2">{product.title}</h3>
                      <p className="font-semibold mt-1">${product.price}</p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}