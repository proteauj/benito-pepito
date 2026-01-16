'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '../../lib/db/types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Grid, Virtual } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/virtual';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : Object.values(data).flat());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const swiperParams = {
    direction: 'vertical' as const,
    slidesPerView: 4,
    spaceBetween: 20,
    grid: { rows: 1 },
    virtual: true,
    modules: [Grid, Virtual],
    style: { height: '80vh' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-bold mb-6">Toutes les œuvres</h1>

      <Swiper {...swiperParams}>
        {products.map((product, index) => (
          <SwiperSlide key={product.id} virtualIndex={index}>
            <div
              className="cursor-pointer bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-200"
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