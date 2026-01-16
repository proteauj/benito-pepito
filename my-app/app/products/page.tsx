'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '../../lib/db/types';
import { useRouter } from 'next/navigation';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Lazy, Grid, Virtual } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/lazy';
import 'swiper/css/virtual';

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

export default function ProductsPage() {
  const { t } = useI18n();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        // flatten si nécessaire
        const flat: Product[] = Array.isArray(data)
          ? data
          : Object.values(data).flat();
        setProducts(flat);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="text-center mt-20">{t('loading')}...</p>;
  if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 stoneBg text-[var(--foreground)]">
      <h1 className="text-4xl font-bold mb-6">{t('headings.allArtworks')}</h1>

      <Swiper {...swiperParams}>
        {products.map((product, index) => (
          <SwiperSlide key={product.id} virtualIndex={index}>
            <div
              className="cursor-pointer"
              onClick={() => router.push(`/products/${product.id}`)}
            >
              <div className="relative w-full h-[420px]">
                <img
                  data-src={product.imageThumbnail}
                  alt={product.title}
                  className="swiper-lazy object-contain w-full h-full"
                />
                <div className="swiper-lazy-preloader"></div>
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg">{product.title}</h2>
                <p className="text-gray-600">{product.size}</p>
                <p className="mt-2 font-bold">${product.price}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}