'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Product } from '../../lib/db/types';

interface Props {
  product: Product;
  priority?: boolean; // précharge seulement pour le viewport initial
}

export default function ProductCard({ product, priority }: Props) {
  const [showFull, setShowFull] = useState(false);

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => setShowFull(true)}
    >
      <div className="relative w-full h-[420px]">
        {/* Miniature rapide */}
        <Image
          src={product.imageThumbnail} // safe, toujours string
          alt={product.title}
          width={300}
          height={300}
          placeholder="blur"
          blurDataURL={product.imageThumbnail} // petite astuce pour éviter lag
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

      <div className="p-4">
        <h2 className="font-semibold text-lg">{product.title}</h2>
        <p className="text-gray-600">{product.size}</p>
        <p className="mt-2 font-bold">${product.price}</p>
      </div>
    </div>
  );
}