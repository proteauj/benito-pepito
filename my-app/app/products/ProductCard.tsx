'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({
  product,
  className = '',
}: ProductCardProps) {
  const { t } = useI18n();

  return (
    <div
      className={`group relative bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative w-full aspect-[4/5] sm:aspect-square bg-gray-50">
          <Image
            src={product.image}
            alt={product.title}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="p-3">
          <h3 className="text-sm font-medium line-clamp-2">
            {product.title}
          </h3>
          <p className="font-semibold mt-1">
            ${product.price}
          </p>
        </div>
      </Link>
    </div>
  );
}