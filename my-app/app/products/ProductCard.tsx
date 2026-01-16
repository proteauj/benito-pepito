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
      className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer flex flex-col"
      onClick={() => setShowFull(true)}
    >
      {/* Image Container */}
      <div className="relative w-full" style={{ height: 'auto', minHeight: '0' }}>
        <Image
          src={product.imageThumbnail}
          alt={product.title}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 25vw"
          placeholder="blur"
          blurDataURL={product.imageThumbnail}
        />

        {/* Full-size seulement au clic */}
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

      {/* Section info prend juste la place nécessaire */}
      <div className="p-3 flex flex-col gap-1">
        <h2 className="font-semibold text-lg">{product.title}</h2>
        <p className="text-gray-600 text-sm">{product.size}</p>
        <p className="mt-1 font-bold">${product.price}</p>
      </div>
    </div>
  );
}