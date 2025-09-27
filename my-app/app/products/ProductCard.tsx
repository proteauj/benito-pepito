// app/components/ProductCard.tsx
"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { Product } from "@/types";
import SafeImage from "@/components/SafeImage";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  const { t } = useI18n();
  
  return (
    <div className={`group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      <Link 
        href={`/product/${product.slug}`}
        className="block"
        aria-label={product.title}
      >
        <div className="aspect-square relative overflow-hidden bg-gray-50">
          <SafeImage
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            width={400}
            height={400}
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-white text-black px-3 py-1 text-sm font-medium rounded-full">
                {t('status.sold')}
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
            {product.title}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-900">
              ${product.price.toFixed(2)}
              {product.originalPrice && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}