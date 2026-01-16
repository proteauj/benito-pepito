// ProductCard.tsx
'use client';

import Image from 'next/image';
import { Product } from '@/types';

interface Props {
  product: Product;
  priority?: boolean; // pour prefetch les images au-dessus du fold
}

export default function ProductCard({ product, priority }: Props) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-200">
      <div className="relative w-full h-[420px]">
        <Image
          src={product.image}
          alt={product.title}
          fill
          style={{ objectFit: 'cover' }}
          placeholder="blur"
          blurDataURL="/placeholder.png" // image très légère pour le blur
          priority={priority}
        />
      </div>
      <div className="p-4">
        <h2 className="font-semibold text-lg">{product.title}</h2>
        <p className="text-gray-600">{product.size}</p>
        <p className="mt-2 font-bold">${product.price}</p>
      </div>
    </div>
  );
}