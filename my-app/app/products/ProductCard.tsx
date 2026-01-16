'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../../lib/db/types';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  return (
    <Link href={`/products/${product.id}`} className="block">
      <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <div className="relative w-full" style={{ aspectRatio: '1/1' }}>
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

        <div className="p-4">
          <h2 className="font-semibold text-lg">{product.title}</h2>
          <p className="text-gray-600">{product.size}</p>
          <p className="mt-2 font-bold">${product.price}</p>
        </div>
      </div>
    </Link>
  );
}
