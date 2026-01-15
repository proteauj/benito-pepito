'use client';

import { Suspense, useEffect, useMemo, useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useI18n } from '@/i18n/I18nProvider';
import ProductsLoading from '@/components/ProductsLoading';
import { Product } from '@/types';
import ProductCard from './ProductCard';

export default function ProductsContent() {
  const { t } = useI18n();
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'lastUpdated' | 'price-asc' | 'price-desc'>('default');

  // 🔹 Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const result = await res.json();
        setData(result);
      } catch (e: any) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔹 Trier et filtrer tous les produits
  const filteredProducts = useMemo(() => {
    let prods = [...data];
    if (sizeFilter !== 'All') {
      prods = prods.filter(p => p.size === sizeFilter);
    }
    switch (sortBy) {
      case 'lastUpdated':
        prods.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case 'price-asc':
        prods.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        prods.sort((a, b) => b.price - a.price);
        break;
    }
    return prods;
  }, [data, sizeFilter, sortBy]);

  // 🔹 Virtualisation
  const parentRef = useRef<HTMLDivElement>(null);
  const COLUMN_COUNT = 4; // max 4 colonnes sur desktop
  const rowCount = Math.ceil(filteredProducts.length / COLUMN_COUNT);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 350, // hauteur approximative d'une ligne
    overscan: 5, // lignes préchargées avant/après
  });

  // 🔹 Précharger les images des lignes virtuelles
  useEffect(() => {
    rowVirtualizer.getVirtualItems().forEach(row => {
      const startIndex = row.index * COLUMN_COUNT;
      const endIndex = Math.min(startIndex + COLUMN_COUNT, filteredProducts.length);
      const items = filteredProducts.slice(startIndex, endIndex);
      items.forEach(product => {
        const img = new Image();
        img.src = product.image;
      });
    });
  }, [filteredProducts, rowVirtualizer.getVirtualItems()]);

  if (loading) return <ProductsLoading />;

  return (
    <div className="min-h-screen stoneBg text-[var(--foreground)] px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-bold mb-8">{t('headings.allArtworks')}</h1>

      {/* Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <select
          value={sizeFilter}
          onChange={e => setSizeFilter(e.target.value as any)}
          className="w-full p-3 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
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
          className="w-full p-3 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
        >
          <option value="default">{t('sort.default')}</option>
          <option value="lastUpdated">{t('sort.lastUpdatedDesc')}</option>
          <option value="price-asc">{t('sort.priceAsc')}</option>
          <option value="price-desc">{t('sort.priceDesc')}</option>
        </select>
      </div>

      {/* Grille virtualisée */}
      <div ref={parentRef} className="relative h-[calc(100vh-200px)] overflow-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map(row => {
            const startIndex = row.index * COLUMN_COUNT;
            const endIndex = Math.min(startIndex + COLUMN_COUNT, filteredProducts.length);
            const items = filteredProducts.slice(startIndex, endIndex);

            return (
              <div
                key={row.index}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 absolute w-full"
                style={{ top: 0, transform: `translateY(${row.start}px)` }}
              >
                {items.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}