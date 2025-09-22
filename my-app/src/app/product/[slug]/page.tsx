'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ArtworkSquare from '@/components/ArtworkSquare';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
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

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { t } = useI18n();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function slugify(input: string) {
    return input
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  useEffect(() => {
    async function fetchProduct() {
      if (!params.slug) return;

      try {
        const response = await fetch(`/api/products?slug=${params.slug}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const productData = await response.json();
        setProduct(productData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/95 border border-[#cfc9c0] shadow px-16 py-12 text-center w-full max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-[var(--leaf)] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-xl font-semibold text-[var(--leaf)]">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">{t('errors.productNotFound')}</p>
          <Link href="/" className="mt-4 inline-block bg-[var(--gold)] text-black px-6 py-2 rounded-lg hover:bg-[var(--gold-dark)]">
            {t('actions.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen stoneBg text-[var(--foreground)]">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 leafy-divider pb-3 mb-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link href="/" className="link-chip">{t('breadcrumbs.home')}</Link>
            </li>
            <li aria-hidden className="text-black/40">›</li>
            <li>
              <Link href={`/category/${slugify(product.category)}`} className="link-chip">
                {t(`category.${product.category}`)}
              </Link>
            </li>
            <li aria-hidden className="text-black/40">›</li>
            <li>
              <span className="text-gray-900 font-medium">{product.title}</span>
            </li>
          </ol>
        </nav>
      </div>

      {/* Product Details */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */
          }
          <div>
            <div className="mb-4 relative">
              <ArtworkSquare
                src={product?.images[selectedImageIndex] as string}
                alt={product?.title || 'Artwork'}
              />
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-[var(--gold)] text-black px-4 py-2 rounded-full font-semibold">{t('status.sold')}</span>
                </div>
              )}
            </div>
            {/* Removed thumbnails grid for a cleaner product view */}
          </div>

          {/* Product Info */}
          <div>
            <div className="leafy-divider pb-3 mb-4">
              <h1 className="text-3xl font-bold text-black">{product.title} · {product.year}</h1>
            </div>
            <p className="text-black/70 mb-4">{product.medium}</p>
            
            {/* Rating removed per request */}

            {/* Stock Status */}
            <div className="mb-6">
              {product.inStock ? (
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 text-green-800">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {t('status.available')}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-black/10 text-black">
                  {t('status.sold')}
                </span>
              )}
            </div>

            {/* Add to Cart (single-quantity artworks) */}
            <div className="flex items-center space-x-4 mb-8">
              <button
                onClick={() => product && addToCart(product, 1)}
                disabled={!product.inStock}
                className="flex-1 bg-[var(--gold)] text-black py-3 px-6 font-semibold hover:bg-white hover:text-[var(--leaf)] disabled:bg-black/30 disabled:cursor-not-allowed transition-colors"
              >
                {product.inStock ? t('product.addToCart') : t('status.sold')}
              </button>
            </div>

            {/* Additional Actions */}
            <div className="flex space-x-4">
              <button className="btn-ghost flex-1">
                {t('actions.wishlist')}
              </button>
              <button className="btn-ghost flex-1">
                {t('actions.share')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
