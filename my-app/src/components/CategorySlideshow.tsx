'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ArtworkSquare from '@/components/ArtworkSquare';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  artist: string;
  medium: string;
  year: number;
}

interface CategorySlideshowProps {
  category: string;
  products: Product[];
}

export default function CategorySlideshow({ category, products }: CategorySlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addToCart } = useCart();

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
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-black">{category}</h2>
        <Link 
          href={`/category/${category.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-')}`}
          className="link-chip"
        >
          View All →
        </Link>
      </div>
      
      <div className="relative bg-white border border-[#cfc9c0] overflow-hidden">
        <div className="relative">
          <Link href={`/category/${category.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-')}`}>
            <ArtworkSquare src={currentProduct.image} alt={currentProduct.title} priority />
          </Link>
          {!currentProduct.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-[#D4AF37] text-black px-4 py-2 rounded-full font-semibold">Sold</span>
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
