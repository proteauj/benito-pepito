// app/products/page.tsx
'use client';

import { Suspense, useEffect, useMemo, useState, useRef } from 'react';
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from '@/i18n/I18nProvider';
import { useProductTranslations } from '@/hooks/useProductTranslations';
import ProductsLoading from '@/components/ProductsLoading';
import { Product } from '@/types';
import ProductCard from './ProductCard';

function useInfiniteScroll(callback: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) callback();
      },
      {
        rootMargin: '300px', // déclenche avant d'arriver en bas
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [callback]);

  return ref;
}

function ProductsContent() {
  const { t } = useI18n();
  const { getTranslatedText } = useProductTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [data, setData] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"default" | "lastUpdated" | "price-asc" | "price-desc">("default");
  const PAGE_SIZE = 12;
  const MAX_RENDERED = 36; // 3 pages
  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // 🔹 Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error("Failed to fetch products");
        const result = await res.json();
        setData(result);
      } catch (e: any) {
        setError(e.message || "Error loading products");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔹 Trier les produits
  const sortProducts = (products: Product[]) => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case "lastUpdated":
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        default:
          return 0;
      }
    });
  };

  // 1️⃣ Produits filtrés et triés sur **tous** les produits
  const allFilteredProducts = useMemo(() => {
    return Object.values(data)
      .flatMap(products => sortProducts(products))
      .filter(product => 
        sizeFilter === 'All' || product.size === sizeFilter
      );
  }, [data, sizeFilter, sortBy]);

  // 2️⃣ Produits visibles (slice pour infinite scroll)
  const visibleProducts = useMemo(() => {
    return allFilteredProducts.slice(0, visibleCount);
  }, [allFilteredProducts, visibleCount]);

  useEffect(() => {
    const nextBatch = allFilteredProducts.slice(visibleCount, visibleCount + PAGE_SIZE);
    nextBatch.forEach(p => {
      const img = new Image();
      img.src = p.image;
    });
  }, [visibleCount, allFilteredProducts]);

  // 🔹 Pré-charger la prochaine batch
  useEffect(() => {
    const nextBatch = allFilteredProducts.slice(visibleCount, visibleCount + PAGE_SIZE);
    nextBatch.forEach(p => {
      const img = new Image();
      img.src = p.image;
    });
  }, [visibleCount, allFilteredProducts]);

  // 🔹 Infinite scroll avec IntersectionObserver
  const sentinelRef = useInfiniteScroll(() => {
    if (visibleCount < allFilteredProducts.length) {
      setVisibleCount(v => Math.min(v + PAGE_SIZE, allFilteredProducts.length));
    }
  });

  // 🔹 Regrouper par catégorie pour afficher les titres
  const productsByCategory = useMemo(() => {
    return visibleProducts.reduce<Record<string, Product[]>>((acc, product) => {
      if (!acc[product.category]) acc[product.category] = [];
      acc[product.category].push(product);
      return acc;
    }, {});
  }, [visibleProducts]);

  // 🔹 Catégories uniques
  const categories = useMemo(() => ["All", ...Object.keys(data)], [data]);

  if (loading) return <ProductsLoading />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">{error}</p>
          <Link href="/" className="mt-4 inline-block bg-[var(--gold)] text-black px-6 py-3 font-semibold hover:bg-[var(--gold-dark)]">
            {t('actions.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen stoneBg text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* En-tête */}
        <div className="flex items-end justify-between mb-8 leafy-divider pb-3">
          <h1 className="text-4xl font-bold">{t('headings.allArtworks')}</h1>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value as any)}
              className="w-full p-3 bg-white text-black border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
            >
              <option value="All">{t('products.all')}</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>

          {/* Filtre de tri */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-3 bg-white text-black border border-[color-mix(in_oklab,var(--leaf)_35%,transparent)] rounded-none appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
            >
              <option value="default">{t('sort.default')}</option>
              <option value="lastUpdated">{t('sort.lastUpdatedDesc')}</option>
              <option value="price-asc">{t('sort.priceAsc')}</option>
              <option value="price-desc">{t('sort.priceDesc')}</option>
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--leaf)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.112l3.71-2.88a.75.75 0 11.92 1.18l-4.2 3.26a.75.75 0 01-.92 0l-4.2-3.26a.75.75 0 01-.12-1.11z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Contenu des produits */}
        <div className="space-y-12">
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={i < PAGE_SIZE} // seulement les premières images de la batch
              />
            ))}
          </div>

          {/* Sentinel pour infinite scroll */}
          {visibleCount < allFilteredProducts.length && (
            <div ref={sentinelRef} className="h-20" />
          )}
        </div>
      </div>
    </div>
  );
}

// Composant de page avec Suspense
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}