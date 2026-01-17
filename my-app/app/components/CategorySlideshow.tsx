'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../contexts/CartContext';
import { useI18n } from '../i18n/I18nProvider';
import { useProductTranslations } from '../hooks/useProductTranslations';
import ArtworkSquare from './ArtworkSquare';
import SafeImage from './SafeImage';
import { Product } from '../../lib/db/types';

interface CategorySlideshowProps {
  category: string;
  products: Product[];
}

export default function CategorySlideshow({ category, products }: CategorySlideshowProps) {
  const { t } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
    }, 2000); // Change product every 2 seconds

    return () => clearInterval(interval);
  }, [products.length]);

  if (products.length === 0) {
    return null;
  }

  const currentProduct = products[currentIndex];

  return (
    <div className="mb-12 w-full max-w-full overflow-hidden">
      <h2 className="text-3xl font-bold text-black mb-6 px-4 sm:px-0">{t(`category.${category}`)}</h2>
      
      <div className="relative bg-white border border-[#cfc9c0] overflow-hidden mx-auto w-full max-w-full rounded-sm">
        <div className="relative w-full aspect-square p-2">
          <Link 
            href={`/products/${currentProduct.id}`}
            className="block w-full h-full relative group"
          >
            <div className="absolute inset-0 bg-white/70 rounded-md shadow-sm transform group-hover:scale-[0.98] transition-transform duration-300" />
            <div className="relative w-full h-full overflow-hidden rounded-md border-2 border-white/70">
              <img
                src={currentProduct.image}
                alt={currentProduct.title}
                className="object-cover w-full h-full"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </Link>
          {!currentProduct.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-[#D4AF37] text-black px-4 py-2 rounded-full font-semibold">{t('status.sold')}</span>
            </div>
          )}
          {/* Progress Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-[var(--gold)]' : 'bg-black/40'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
