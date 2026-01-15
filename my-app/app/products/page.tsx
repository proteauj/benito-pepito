'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';

const MAX_VISIBLE = 36;

export default function ProductsPage() {
  const { t } = useI18n();
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'lastUpdated'>('default');

  const [visibleStart, setVisibleStart] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Charger les produits
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');

        const result = (await res.json()) as Record<string, Product[]> | Product[];
        const allProducts: Product[] = Array.isArray(result) ? result : Object.values(result).flat();
        setData(allProducts);
      } catch (e: any) {
        setError(e.message || 'Error loading products');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Trier
  const sortedProducts = useMemo(() => {
    return [...data].sort((a, b) => {
      switch (sortBy) {
        case 'lastUpdated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });
  }, [data, sortBy]);

  // Filtrer
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter(p => sizeFilter === 'All' || p.size === sizeFilter);
  }, [sortedProducts, sizeFilter]);

  // Produits visibles (fenêtre glissante)
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(visibleStart, visibleStart + MAX_VISIBLE);
  }, [filteredProducts, visibleStart]);

  // Détecter scroll pour charger les suivants
  const onScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const scrollHeight = containerRef.current.scrollHeight;
    const clientHeight = containerRef.current.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 50) {
      // avancer la fenêtre
      setVisibleStart(prev => Math.min(prev + MAX_VISIBLE, Math.max(0, filteredProducts.length - MAX_VISIBLE)));
    }
    if (scrollTop <= 0) {
      // reculer la fenêtre
      setVisibleStart(prev => Math.max(prev - MAX_VISIBLE, 0));
    }
  };

  if (loading) return <ProductsLoading />;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">{error}</p>
          <Link href="/" className="mt-4 inline-block bg-[var(--gold)] text-black px-6 py-3 font-semibold hover:bg-[var(--gold-dark)]">
            {t('actions.backToHome')}
          </Link>
        </div>
      </div>
    );

  // Nombre de colonnes responsive
  const columns = (() => {
    if (typeof window === 'undefined') return 1;
    if (window.innerWidth >= 1024) return 4;
    if (window.innerWidth >= 768) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  })();

  return (
    <div className="min-h-screen stoneBg text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-8">{t('headings.allArtworks')}</h1>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <select
            value={sizeFilter}
            onChange={e => setSizeFilter(e.target.value as any)}
            className="w-full p-3 bg-white text-black border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
          >
            <option value="All">{t('products.all')}</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="w-full p-3 bg-white text-black border border-gray-300 rounded-none"
          >
            <option value="default">{t('sort.default')}</option>
            <option value="lastUpdated">{t('sort.lastUpdatedDesc')}</option>
            <option value="price-asc">{t('sort.priceAsc')}</option>
            <option value="price-desc">{t('sort.priceDesc')}</option>
          </select>
        </div>

        {/* Grille fenêtre 36 produits */}
        <div
          ref={containerRef}
          onScroll={onScroll}
          className="h-[80vh] overflow-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleProducts.map(product => (
              <ProductCard key={product.id} product={product} priority />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}