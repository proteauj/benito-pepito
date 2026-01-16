'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '@/types';
import React from 'react';

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean; // uniquement pour les premières images
}

function ProductCard({ product, className = '', priority = false }: ProductCardProps) {
  const { t } = useI18n();

  return (
    <div
      className={`group relative bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <Link href={`/product/${product.slug}`} className="group block">
        <div className="relative w-full bg-gray-50 overflow-hidden">
          <div className="relative w-full aspect-[4/5] sm:aspect-square">
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain sm:object-cover transition-transform duration-300 group-hover:scale-105"
              loading={priority ? 'eager' : 'lazy'}
            />
          </div>
        </div>

        <div className="p-3">
          <h3 className="text-sm font-medium line-clamp-2">
            {product.id} - {product.title}
          </h3>
          <p className="font-semibold mt-1">${product.price}</p>
        </div>
      </Link>
    </div>
  );
}

// On memoize pour éviter les rerenders inutiles
export default React.memo(ProductCard);