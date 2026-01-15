// app/products/page.tsx
'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from '@/i18n/I18nProvider';
import { useProductTranslations } from '@/hooks/useProductTranslations';
import ProductsLoading from '@/components/ProductsLoading';
import { Product } from '@/types';
import ProductCard from './ProductCard';

function ProductsContent() {
  const { t } = useI18n();
  const { getTranslatedText } = useProductTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<"All" | Product["category"]>("All");
  const [sortBy, setSortBy] = useState<"default" | "lastUpdated" | "price-asc" | "price-desc">("default");
  const [displayCount, setDisplayCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [userSelectedCategory, setUserSelectedCategory] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error("Failed to fetch products");
        const result = await response.json();
        setData(result);
      } catch (e: any) {
        console.error("Error loading products:", e);
        setError(e.message || "Error loading products");
      } finally {
        setLoading(false);
        setHasMounted(true);
      }
    };

    fetchData();
  }, []);

  // Gestion des paramètres d'URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && data[categoryFromUrl as keyof typeof data]) {
      setCategory(categoryFromUrl as Product["category"]);
      setUserSelectedCategory(true);
    }
  }, [searchParams, data]);

  // Fonction pour gérer le changement de catégorie
  const handleCategoryChange = (newCategory: "All" | Product["category"]) => {
    setCategory(newCategory);
    setUserSelectedCategory(newCategory !== "All");

    const params = new URLSearchParams(searchParams.toString());
    if (newCategory === "All") {
      params.delete('category');
    } else {
      params.set('category', newCategory);
    }
    router.push(`/products?${params.toString()}`);
  };

  // Fonction pour trier les produits
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
          return 0; // Ordre par défaut
      }
    });
  };

  // Obtenir les catégories uniques
  const categories = useMemo(() => {
    return ["All", ...Object.keys(data)];
  }, [data]);

  // Charger plus de produits
  const loadMore = () => {
    setDisplayCount(prev => prev + pageSize);
  };

  if (loading) {
    return <ProductsLoading />;
  }

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
          {/* Barre de recherche */}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('search.placeholder')}
            className="p-3 bg-white text-black border border-[color-mix(in_oklab,var(--leaf)_35%,transparent)] rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
          />

          {/* Filtre par catégorie */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as any)}
              className="w-full p-3 bg-white text-black border border-[color-mix(in_oklab,var(--leaf)_35%,transparent)] rounded-none appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{t(`category.${cat}`)}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--leaf)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.112l3.71-2.88a.75.75 0 11.92 1.18l-4.2 3.26a.75.75 0 01-.92 0l-4.2-3.26a.75.75 0 01-.12-1.11z" clipRule="evenodd" />
            </svg>
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
          {Object.entries(data)
            .filter(([cat]) => category === "All" || cat === category)
            .map(([category, products]) => {
              // filtrer les produits de cette catégorie par texte
              // Filtrer et trier les produits
              const filteredProducts = sortProducts(products)
                .filter(product => product.title.toLowerCase().includes(q.toLowerCase()))
                .slice(0, 12); // Toujours 12 max

              // si aucun produit ne correspond, ne pas afficher la catégorie
              if (filteredProducts.length === 0) return null;

              const startIndex = (page - 1) * pageSize;
              const endIndex = startIndex + pageSize;

              const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

              return (
                <div key={category} id={`category-${category}`} className="space-y-6">
                  <h2 className="text-2xl font-bold">{category}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {paginatedProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      onClick={() => setPage(p => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                      {t('actions.back')}
                    </button>

                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={endIndex >= filteredProducts.length}
                      className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                      {t('actions.next')}
                    </button>
                  </div>
                </div>
              )
            }
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