'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';
import { useVirtualizer } from '@tanstack/react-virtual';

const PAGE_PRIORITY = 12; // Top 12 images à précharger en priorité

export default function ProductsPage() {
  const { t } = useI18n();
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'lastUpdated'>('default');

  const parentRef = useRef<HTMLDivElement>(null);

  // 🔹 Charger les produits
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

  // 🔹 Trier les produits
  const sortedProducts = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    return [...arr].sort((a, b) => {
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

  // 🔹 Filtrer par taille
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter(p => sizeFilter === 'All' || p.size === sizeFilter);
  }, [sortedProducts, sizeFilter]);

  // 🔹 Déterminer le nombre de colonnes dynamiquement
  const getColumns = () => {
    if (typeof window === 'undefined') return 1;
    if (window.innerWidth >= 1024) return 4;
    if (window.innerWidth >= 768) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  };
  const [columns, setColumns] = useState(getColumns());

  useEffect(() => {
    const handleResize = () => setColumns(getColumns());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const rowCount = Math.ceil(filteredProducts.length / columns);

  // 🔹 Virtualisation par ligne
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 420, // hauteur approximative d’une ligne complète
    overscan: 4,
  });

  // 🔹 Préload des images visibles seulement
  useEffect(() => {
    const items = virtualizer.getVirtualItems();
    if (!items.length) return;

    const firstVisible = items[0].index;
    const lastVisible = items[items.length - 1].index;

    const start = firstVisible * columns;
    const end = (lastVisible + 1) * columns;

    filteredProducts.slice(start, end).forEach((p, i) => {
      const img = new Image();
      img.src = p.image;
      // Priorité uniquement pour top PAGE_PRIORITY produits
      if (start + i < PAGE_PRIORITY) img.decode?.();
    });
  }, [virtualizer.getVirtualItems(), filteredProducts, columns]);

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

  return (
    <div className="min-h-screen stoneBg text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-8">{t('headings.allArtworks')}</h1>

        {/* 🔹 Filtres */}
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

        {/* 🔹 Grille virtualisée */}
        <div ref={parentRef} className="h-[80vh] overflow-auto">
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map(virtualRow => {
              const start = virtualRow.index * columns;
              const end = start + columns;
              const rowProducts = filteredProducts.slice(start, end);

              return (
                <div
                  key={virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2 mb-6`}
                >
                  {rowProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} priority={start + i < PAGE_PRIORITY} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}