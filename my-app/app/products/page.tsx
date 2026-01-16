'use client';

import { VirtuosoGrid } from 'react-virtuoso';
import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';

export default function ProductsPage() {
  const { t } = useI18n();
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  /* FETCH */
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(result => {
        const products = Array.isArray(result)
          ? result
          : Object.values(result).flat();
        setData(products);
      })
      .finally(() => setLoading(false));
  }, []);

  /* SORT */
  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [data, sortBy]);

  /* FILTER */
  const filtered = useMemo(() => {
    return sorted.filter(p => sizeFilter === 'All' || p.size === sizeFilter);
  }, [sorted, sizeFilter]);

  /* RESTORE SCROLL POSITION */
  const initialIndex = useMemo(() => {
    const savedId = sessionStorage.getItem('products-scroll-id');
    if (!savedId) return 0;
    const index = filtered.findIndex(p => p.id === savedId);
    return index >= 0 ? index : 0;
  }, [filtered]);

  if (loading) return <ProductsLoading />;

  return (
    <div className="min-h-screen stoneBg text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 py-6">

        <h1 className="text-4xl font-bold mb-6 text-left">
          {t('headings.allArtworks')}
        </h1>

        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <select
            value={sizeFilter}
            onChange={e => setSizeFilter(e.target.value as any)}
            className="p-3 border bg-white text-black"
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
            className="p-3 border bg-white text-black"
          >
            <option value="default">{t('sort.default')}</option>
            <option value="price-asc">{t('sort.priceAsc')}</option>
            <option value="price-desc">{t('sort.priceDesc')}</option>
          </select>
        </div>

        {/* GRID */}
        <VirtuosoGrid
          data={filtered}
          initialTopMostItemIndex={initialIndex}
          overscan={300}
          listClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          itemContent={(_, product) => (
            <ProductCard
              product={product}
              onClick={() =>
                sessionStorage.setItem('products-scroll-id', product.id)
              }
            />
          )}
        />
      </div>
    </div>
  );
}
