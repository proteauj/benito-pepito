'use client';

import { Suspense, useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';
import { useVirtualizer } from '@tanstack/react-virtual';

const PAGE_SIZE = 12; // pour preload images en batch

export default function ProductsPage() {
  const { t } = useI18n();

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'lastUpdated'>('default');

  // Charger les produits
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const result: Product[] = await res.json();
        setData(result);
      } catch (e: any) {
        setError(e.message || 'Error loading products');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Tri
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

  // Filtre par taille
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter(p => sizeFilter === 'All' || p.size === sizeFilter);
  }, [sortedProducts, sizeFilter]);

  // Préload des images par batch
  useEffect(() => {
    const preloadImages = () => {
      filteredProducts.slice(0, PAGE_SIZE).forEach(p => {
        const img = new Image();
        img.src = p.image;
      });
    };
    preloadImages();
  }, [filteredProducts]);

  // Virtualisation
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: filteredProducts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400, // hauteur approx d'une carte produit
    overscan: 4,
  });

  if (loading) return <ProductsLoading />;

  if (error) {
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
  }

  return (
    <div className="min-h-screen stoneBg text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-8">{t('headings.allArtworks')}</h1>

        {/* Filtre taille */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
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
          </div>

          {/* Tri */}
          <div className="relative">
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
        </div>

        {/* Grille virtualisée */}
        <div ref={parentRef} className="h-[80vh] overflow-auto">
          <div
            style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}
          >
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
              const product = filteredProducts[virtualRow.index];
              return (
                <div
                  key={product.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2 mb-6"
                >
                  <ProductCard product={product} priority={virtualRow.index < PAGE_SIZE} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}