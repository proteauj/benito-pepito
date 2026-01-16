'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Product } from '../../lib/db/types';

interface Props {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority }: Props) {
  const [showFull, setShowFull] = useState(false);

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => setShowFull(true)}
    >
      {/* Image */}
      <div className="relative w-full h-[420px]">
        <Image
          src={product.imageThumbnail}
          alt={product.title}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 25vw"
          placeholder="blur"
          blurDataURL={product.imageThumbnail}
        />

        {/* Full-size au clic */}
        {showFull && (
          <Image
            src={product.image}
            alt={product.title}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        )}
      </div>

      {/* Description adaptative */}
      <div className="p-4">
        <h2 className="font-semibold text-lg">{product.title}</h2>
        <p className="text-gray-600">{product.size}</p>
        <p className="mt-2 font-bold">${product.price}</p>
      </div>
    </div>
  );
}