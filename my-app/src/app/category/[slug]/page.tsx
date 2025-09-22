'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import SafeImage from '@/components/SafeImage';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  const [data, setData] = useState<ProductsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [artistFilter, setArtistFilter] = useState<string>('all');
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

  const { categoryTitle, products, artists } = useMemo(() => {
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
    const artistSet = Array.from(new Set(items.map(i => i.artist))).sort();
    return { categoryTitle: title, products: items, artists: artistSet };
  }, [data, params.slug]);

  const filteredSorted = useMemo(() => {
    let arr = [...products];
    if (onlyAvailable) arr = arr.filter(p => p.inStock);
    if (artistFilter !== 'all') arr = arr.filter(p => p.artist === artistFilter);
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
  }, [products, onlyAvailable, artistFilter, sortBy]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-xl text-[var(--foreground)]/80">Loading artworks...</p>
          </div>
        </div>
      ) : (error || (!categoryTitle && Object.keys(data).length > 0)) ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-red-600">Category not found</p>
            <Link href="/" className="mt-4 inline-block bg-[var(--gold)] text-black px-6 py-3 font-semibold hover:bg-[var(--gold-dark)]">Back to Home</Link>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-end justify-between mb-8 leafy-divider pb-3">
            <h1 className="text-4xl font-bold">{categoryTitle}</h1>
            <Link href="/" className="text-[var(--gold)] hover:text-[var(--gold-dark)]">← Back</Link>
          </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <label className="flex items-center space-x-3 p-3">
            <input type="checkbox" checked={onlyAvailable} onChange={e => setOnlyAvailable(e.target.checked)} />
            <span className="text-[var(--leaf)] font-medium">Only available</span>
          </label>
          <select
            className="p-3 bg-white text-black border border-[color-mix(in_oklab,var(--leaf)_35%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
            value={artistFilter}
            onChange={e => setArtistFilter(e.target.value)}
          >
            <option value="all">All artists</option>
            {artists?.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            className="p-3 bg-white text-black border border-[color-mix(in_oklab,var(--leaf)_35%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="lastUpdated-desc">Last Updated (Newest)</option>
            <option value="lastUpdated-asc">Last Updated (Oldest)</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="year-desc">Newest</option>
            <option value="year-asc">Oldest</option>
            <option value="artist">Artist A→Z</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSorted.map((p) => (
            <div key={p.id} className="group bg-white overflow-hidden border border-[#cfc9c0]">
              <Link href={`/product/${p.slug}`}>
                <div className="relative aspect-[4/3]">
                  <SafeImage src={p.image} alt={p.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  {!p.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-[var(--gold)] text-black px-4 py-2 rounded-full font-semibold">Sold</span>
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-5 text-black">
                <Link href={`/product/${p.slug}`} className="block">
                  <h3 className="text-xl font-semibold">{p.artist}</h3>
                  <p className="text-sm text-black/70">{p.title} · {p.year}</p>
                </Link>
                <p className="text-sm text-black/60 mb-3">{p.medium}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold">${p.price}</span>
                    {p.originalPrice && (
                      <span className="text-sm line-through text-black/40">${p.originalPrice}</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/product/${p.slug}`} className="px-3 py-2 bg-[var(--gold)] text-black text-sm font-semibold hover:bg-[var(--gold-dark)]">View</Link>
                    <button
                      onClick={() => addToCart(p, 1)}
                      disabled={!p.inStock}
                      className="px-3 py-2 bg-[var(--gold)] text-black text-sm font-semibold hover:bg-[var(--gold-dark)] disabled:bg-black/30 disabled:cursor-not-allowed"
                    >
                      {p.inStock ? 'Add' : 'Sold'}
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
