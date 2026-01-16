'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Virtual, Grid } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/virtual';
import { Product } from '../../lib/db/types';

interface ProductsPageProps {
  products: Product[];
}

export default function ProductsPage({ products }: ProductsPageProps) {
  const router = useRouter();

  const swiperParams = useMemo(() => ({
    direction: 'vertical' as const,
    slidesPerView: 4,
    spaceBetween: 20,
    grid: { rows: 1 },
    virtual: true,
    modules: [Grid, Virtual],
    style: { height: '80vh' },
  }), []);

  return (
    <div className="stoneBg text-[var(--foreground)] px-4 py-10 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Toutes les œuvres</h1>

      <Swiper {...swiperParams}>
        {products.map((product, index) => (
          <SwiperSlide key={product.id} virtualIndex={index}>
            <div
              className="cursor-pointer"
              onClick={() => router.push(`/products/${product.id}`)}
            >
              <div className="relative w-full h-[420px]">
                <Image
                  src={product.imageThumbnail}
                  alt={product.title}
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 768px) 100vw, 25vw"
                  priority={index < 4} // précharge les premières images
                />
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
