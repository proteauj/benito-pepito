'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '../../lib/db/types';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-200">
      
      {/* Image clickable vers page détail */}
      <Link href={`/products/${product.id}`} className="block relative w-full">
        <div className="relative w-full h-[420px]">
          <Image
            src={product.imageThumbnail}
            alt={product.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 25vw"
            placeholder="blur"
            blurDataURL={product.imageThumbnail}
          />
        </div>
      </Link>

      {/* Section description sous l'image, seulement la place nécessaire */}
      <div className="p-4">
        <h2 className="font-semibold text-lg">{product.title}</h2>
        <p className="text-gray-600">{product.size}</p>
        <p className="mt-2 font-bold">${product.price}</p>
      </div>
    </div>
  );
}