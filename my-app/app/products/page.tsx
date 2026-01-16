'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '../../lib/db/types';
import ProductsLoading from '@/components/ProductsLoading';

export default function ProductsPage() {
  const { t } = useI18n();
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  // Fetch products
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');

        const result = await res.json();
        let products: Product[] = [];
        if (Array.isArray(result)) products = result as Product[];
        else if (result && typeof result === 'object') products = Object.values(result).flat() as Product[];

        setData(products);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter + Sort
  const filteredProducts = useMemo(() => {
    return data
      .filter(p => sizeFilter === 'All' || p.size === sizeFilter)
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [data, sizeFilter, sortBy]);

  if (loading) return <ProductsLoading />;

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-red-600">{error}</p>
          <Link href="/" className="mt-4 inline-block bg-[var(--gold)] text-black px-6 py-3 font-semibold">
            {t('actions.backToHome')}
          </Link>
        </div>
      </div>
    );

  return (
    <div className="stoneBg text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <h1 className="text-4xl font-bold mb-6">{t('headings.allArtworks')}</h1>

        {/* Filters */}
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded shadow flex flex-col overflow-hidden">
              <div className="w-full flex justify-center">
                <Image
                  src={product.imageThumbnail || product.image}
                  alt={product.title}
                  width={300}
                  height={300}
                  style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={product.imageThumbnail || product.image}
                />
              </div>
              <div className="p-2 flex flex-col">
                <h2 className="text-lg font-semibold">{product.title}</h2>
                <p className="text-sm mt-1">{product.price} €</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}