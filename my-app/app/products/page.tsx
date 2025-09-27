// app/products/page.tsx
'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from '@/i18n/I18nProvider';
import { useProductTranslations } from '@/hooks/useProductTranslations';
import ProductsLoading from '@/components/ProductsLoading';
import { Product } from '@/types';

// Déplacer le contenu principal dans un composant séparé
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
  const pageSize = 12;

  // Votre logique existante ici...
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

  // Le reste de votre logique existante...

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
        <div className="flex items-end justify-between mb-8 leafy-divider pb-3">
          <h1 className="text-4xl font-bold">{t('headings.allArtworks')}</h1>
        </div>

        {/* Votre interface utilisateur existante */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('search.placeholder')}
            className="p-3 bg-white text-black border border-[color-mix(in_oklab,var(--leaf)_35%,transparent)] rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
          />
          {/* Ajoutez vos autres contrôles ici... */}
        </div>

        {/* Contenu des produits */}
        <div className="space-y-12">
          {Object.entries(data)
            .filter(([cat]) => category === "All" || cat === category)
            .map(([category, products]) => (
              <div key={category} id={`category-${category}`} className="space-y-6">
                <h2 className="text-2xl font-bold">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg p-4">
                      <img 
                        src={product.image} 
                        alt={product.title}
                        className="w-full h-48 object-cover rounded"
                      />
                      <h3 className="mt-2 font-medium">{product.title}</h3>
                      <p className="text-gray-600">${product.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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