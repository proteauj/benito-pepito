'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArtworkSquare from '@/components/ArtworkSquare';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useI18n } from '@/i18n/I18nProvider';

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
  lastUpdated: string;
}

type ProductsByCategory = Record<string, Product[]>;

function slugify(input: string) {
  // normalize: lowercase, replace & with 'and', remove non-alphanumerics except hyphen, collapse hyphens
  return input
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const [data, setData] = useState<ProductsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<string>('lastUpdated-desc');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e.message || 'Error fetching products');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const { categoryTitle, products } = useMemo(() => {
    let title = '';
    let items: Product[] = [];
    const entries = Object.entries(data);
    // Try direct key match first
    for (const [key, value] of entries) {
      if (key.toLowerCase() === (params.slug as string).toLowerCase()) {
        title = key; items = value; break;
      }
    }
    // Fallback to slugify match
    if (!title) {
      for (const [key, value] of entries) {
        if (slugify(key) === params.slug) { title = key; items = value; break; }
      }
    }
    if (process.env.NODE_ENV !== 'production') {
      // Dev diagnostics
      console.warn('[CategoryPage] params.slug=', params.slug, 'available=', Object.keys(data), 'matchedTitle=', title);
    }
    return { categoryTitle: title, products: items };
  }, [data, params.slug]);

  const filteredSorted = useMemo(() => {
    let arr = [...products];
    if (onlyAvailable) arr = arr.filter(p => p.inStock);
    switch (sortBy) {
      case 'price-asc':
        arr.sort((a, b) => a.price - b.price); break;
      case 'price-desc':
        arr.sort((a, b) => b.price - a.price); break;
      case 'year-desc':
        arr.sort((a, b) => b.year - a.year); break;
      case 'year-asc':
        arr.sort((a, b) => a.year - b.year); break;
      case 'artist':
        arr.sort((a, b) => a.artist.localeCompare(b.artist)); break;
      case 'lastUpdated-desc':
        arr.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()); break;
      case 'lastUpdated-asc':
        arr.sort((a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()); break;
      default:
        break;
    }
    return arr;
  }, [products, onlyAvailable, sortBy]);

  return (
    <div className="min-h-screen stoneBg text-[var(--foreground)]">
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white/95 border border-[#cfc9c0] shadow px-10 py-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--leaf)] border-t-transparent mx-auto"></div>
            <p className="mt-4 text-xl font-semibold text-[var(--leaf)]">{t('loading')}</p>
          </div>
        </div>
      ) : (error || (!categoryTitle && Object.keys(data).length > 0)) ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-red-600">{t('errors.categoryNotFound')}</p>
            <Link href="/" className="mt-4 inline-block bg-[var(--gold)] text-black px-6 py-3 font-semibold hover:bg-[var(--gold-dark)]">{t('actions.backToHome')}</Link>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-end justify-between mb-8 leafy-divider pb-3">
            <h1 className="text-4xl font-bold">{t(`category.${categoryTitle}`)}</h1>
            <Link href="/" className="link-chip">{t('actions.back')}</Link>
          </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <label className="flex items-center space-x-3 p-3">
            <input type="checkbox" checked={onlyAvailable} onChange={e => setOnlyAvailable(e.target.checked)} />
            <span className="text-[var(--leaf)] font-medium">{t('filters.onlyAvailable')}</span>
          </label>
          <select
            className="p-3 bg-white text-black border border-[color-mix(in_oklab,var(--leaf)_35%,transparent)] rounded-none appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="lastUpdated-desc">{t('sort.lastUpdatedDesc')}</option>
            <option value="lastUpdated-asc">{t('sort.lastUpdatedAsc')}</option>
            <option value="price-asc">{t('sort.priceAsc')}</option>
            <option value="price-desc">{t('sort.priceDesc')}</option>
            <option value="year-desc">{t('sort.yearDesc')}</option>
            <option value="year-asc">{t('sort.yearAsc')}</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSorted.map((p) => (
            <div
              key={p.id}
              className="group bg-white overflow-hidden border border-[#cfc9c0] cursor-pointer"
              onClick={() => router.push(`/product/${p.slug}`)}
            >
              <div className="relative">
                <ArtworkSquare src={p.image} alt={p.title} />
                {!p.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-[var(--gold)] text-black px-4 py-2 rounded-full font-semibold">{t('status.sold')}</span>
                  </div>
                )}
              </div>
              <div className="p-5 text-black">
                <h3 className="text-xl font-semibold">{p.title} · {p.year}</h3>
                <p className="text-sm text-black/60 mb-3">{p.medium}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold">${p.price}</span>
                    {p.originalPrice && (
                      <span className="text-sm line-through text-black/40">${p.originalPrice}</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/product/${p.slug}`); }}
                      className="px-3 py-2 bg-[var(--gold)] text-black text-sm font-semibold hover:bg-[var(--gold-dark)]"
                    >
                      {t('actions.view')}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(p, 1); }}
                      disabled={!p.inStock}
                      className="px-3 py-2 bg-[var(--gold)] text-black text-sm font-semibold hover:bg-[var(--gold-dark)] disabled:bg-black/30 disabled:cursor-not-allowed"
                    >
                      {p.inStock ? t('actions.add') : t('status.sold')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      )}
    </div>
  );
}
