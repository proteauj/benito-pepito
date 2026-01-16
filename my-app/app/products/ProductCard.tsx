'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '../../lib/db/types';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  return (
    <Link href={`/products/${product.slug}`} className="block">
      <div className="bg-white rounded-lg shadow hover:shadow-lg cursor-pointer">
        <div className="relative w-full h-[420px]">
          <Image
            src={product.imageThumbnail}
            alt={product.title}
            fill
            className="object-contain"
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