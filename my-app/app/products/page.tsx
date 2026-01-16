'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '../../lib/db/types';
import SwiperCore from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/virtual';
import 'swiper/css/lazy';
import { Grid, Virtual, Lazy } from 'swiper/modules';

import type { SwiperOptions } from 'swiper/types';

const swiperParams: SwiperOptions = {
  direction: 'vertical',
  slidesPerView: 4,
  spaceBetween: 20,
  grid: { rows: 1, fill: 'row' },
  virtual: true,
  modules: [Grid, Virtual, Lazy],
  // @ts-ignore Lazy n'est pas dans SwiperOptions, on l'ignore pour TypeScript
  lazy: { loadPrevNext: true },
};

// on active les modules
SwiperCore.use([Virtual, Lazy, Grid]);

export default function ProductsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = (await res.json()) as Product[] | Record<string, Product[]>;
        setProducts(Array.isArray(data) ? data : Object.values(data).flat());
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) return <p className="text-center mt-20">{t('loading')}...</p>;
  if (error) return <p className="text-red-600 text-center mt-20">{error}</p>;

  const handleClick = (product: Product) => {
    router.push(`/products/${product.slug || product.id}`);
  };

  return (
    <div className="stoneBg min-h-screen text-[var(--foreground)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-6">{t('headings.allArtworks')}</h1>

        <Swiper  {...swiperParams}>
          {products.map((product, index) => (
            <SwiperSlide key={product.id} virtualIndex={index}>
              <img
                data-src={product.imageThumbnail}
                alt={product.title}
                className="swiper-lazy object-contain w-full h-full"
              />
              <div className="swiper-lazy-preloader"></div>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </div>
  );
}