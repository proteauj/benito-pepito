'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useI18n } from '@/i18n/I18nProvider';
import { useProductTranslations } from '@/hooks/useProductTranslations';
import ArtworkSquare from '@/components/ArtworkSquare';

interface ProductsByCategory {
  [key: string]: Product[];
}

interface ProductsContentProps {
  products: Product[];
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

export default function ProductByCategory({ 
  products, 
  isLoadingMore, 
  hasMore, 
  loadMore 
}: ProductsContentProps) {
  const { t } = useI18n();
  const { getTranslatedText } = useProductTranslations();
  const searchParams = useSearchParams();
  const category = searchParams.get('category');

  return (
    <div className="space-y-8">
      {/* Grille de produits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product, index) => {
          const isFirstOfCategory = index === 0 || products[index - 1]?.category !== product.category;
          const translatedTitle = getTranslatedText(product, 'title');
          
          return (
            <div key={product.id} className="group">
              {isFirstOfCategory && (
                <div 
                  id={product.category.toLowerCase().replace(' ', '-')}
                  data-category={product.category}
                  className="sr-only"
                  style={{ marginTop: '-100px', paddingTop: '100px' }}
                ></div>
              )}
              
              <Link 
                href={`/product/${product.slug}`} 
                className="block bg-white overflow-hidden border border-[#cfc9c0] hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative aspect-square">
                  <ArtworkSquare 
                    src={product.image} 
                    alt={translatedTitle} 
                    className="w-full h-full object-cover"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-[var(--gold)] text-black px-4 py-2 rounded-full font-semibold">
                        {t('status.sold')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {translatedTitle} · {product.year}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {getTranslatedText(product, 'medium')}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    <span className="px-3 py-1.5 bg-[var(--gold)] text-black text-sm font-semibold rounded-sm">
                      {t('actions.view')}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Bouton Voir plus */}
      {hasMore && (
        <div className="text-center mt-8">
            {isLoadingMore ? t('loading') : null}
        </div>
      )}
    </div>
  );
}