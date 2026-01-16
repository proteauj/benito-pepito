'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '../../lib/db/types';

interface Props {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority }: Props) {
  return (
    <Link href={`/products/${product.id}`} className="block">
      <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        {/* Image */}
        <div className="relative w-full">
          <Image
            src={product.imageThumbnail}
            alt={product.title}
            width={300}      // largeur adaptée
            height={300}     // hauteur minimum
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
            placeholder="blur"
            blurDataURL={product.imageThumbnail}
            priority={priority}
          />
        </div>

        {/* Description */}
        <div className="p-4">
          <h2 className="font-semibold text-lg">{product.title}</h2>
          <p className="text-gray-600">{product.size}</p>
          <p className="mt-2 font-bold">${product.price}</p>
        </div>
      </div>
    </Link>
  );
}