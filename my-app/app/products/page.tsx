"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from '../i18n/I18nProvider';
import { useProductTranslations } from '../hooks/useProductTranslations';
import ArtworkSquare from '../components/ArtworkSquare';

interface Product {
  id: string;
  slug: string;
  title: string;
  titleFr?: string;
  description: string;
  descriptionFr?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: "Sculpture" | "Painting" | "Home & Garden";
  inStock: boolean;
  artist: string;
  medium: string;
  mediumFr?: string;
  year: number;
  lastUpdated: string;
}

type ProductsByCategory = Record<string, Product[]>;

export default function ProductsIndexPage() {
  const { t } = useI18n();
  const { getTranslatedText } = useProductTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<ProductsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<"All" | Product["category"]>("All");
  const [sortBy, setSortBy] = useState<"default" | "lastUpdated" | "price-asc" | "price-desc">("default");
  const [displayCount, setDisplayCount] = useState(12); // Augmenté pour un meilleur premier chargement
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [userSelectedCategory, setUserSelectedCategory] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const pageSize = 12; // Augmenté pour charger plus d'éléments à la fois

  // Initialize scroll target from URL params
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && ["Sculpture", "Painting", "Home & Garden"].includes(categoryParam)) {
      // Scroll to category section after products are loaded
      const scrollToCategory = () => {
        const element = document.querySelector(`[data-category="${categoryParam}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };

      // Wait for products to load then scroll
      if (!loading && Object.keys(data).length > 0) {
        setTimeout(scrollToCategory, 100);
      }
    }
  }, [searchParams, loading, data]);

  // Update URL when category changes (only when user explicitly selects)
  const handleCategoryChange = (newCategory: "All" | Product["category"]) => {
    setCategory(newCategory);
    setUserSelectedCategory(newCategory !== "All");

    const params = new URLSearchParams(searchParams.toString());
    if (newCategory === "All") {
      params.delete("category");
    } else {
      params.set("category", newCategory);
    }
    router.replace(`/products?${params.toString()}`);
  };

  // Chargement initial des données
  useEffect(() => {
    const loadProducts = async () => {
      // Vérifier d'abord le cache local
      const cachedData = localStorage.getItem('cachedProducts');
      const cacheTime = localStorage.getItem('productsCacheTime');
      const oneHourAgo = Date.now() - 60 * 60 * 1000; // 1 heure de cache

      if (cachedData && cacheTime && parseInt(cacheTime) > oneHourAgo) {
        setData(JSON.parse(cachedData));
        setLoading(false);
      }

      try {
        const res = await fetch("/api/products", {
          next: { revalidate: 3600 } // Revalidation après 1 heure
        });
        if (!res.ok) throw new Error("Failed to fetch products");
        const json = await res.json();
        
        // Mettre à jour le cache local
        localStorage.setItem('cachedProducts', JSON.stringify(json));
        localStorage.setItem('productsCacheTime', Date.now().toString());
        
        setData(json);
      } catch (e: any) {
        console.error("Error loading products:", e);
        setError(e.message || "Error loading products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
    setHasMounted(true);
  }, []);

  const flat = useMemo(() => {
    const arr: Product[] = [];
    Object.values(data).forEach((list) => arr.push(...list));
    return arr;
  }, [data]);

  const categories = useMemo(() => [
    "All",
    ...Array.from(new Set(flat.map((p) => p.category))) as Product["category"][],
  ], [flat]);

  // Removed artists list (no artist filter)

  const filteredSorted = useMemo(() => {
    // Créer une copie du tableau plat pour éviter les mutations
    let arr = [...flat];

    // Filtrer par catégorie si sélectionnée
    if (userSelectedCategory && category !== "All") {
      arr = arr.filter((p) => p.category === category);
    }

    // Filtrer par terme de recherche
    const term = q.trim().toLowerCase();
    if (term) {
      const searchTerms = term.split(' ').filter(t => t.length > 0);
      
      arr = arr.filter((p) => {
        const searchText = `${p.title} ${p.medium} ${p.description}`.toLowerCase();
        return searchTerms.every(t => searchText.includes(t));
      });
    }

    // Obtenir l'ordre original des produits depuis le fichier products.ts
    const allProducts = Object.values(data).flat();
    
    // Trier les résultats
    return [...arr].sort((a, b) => {
      // Si un tri spécifique est sélectionné, l'appliquer
      switch (sortBy) {
        case "lastUpdated":
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        default:
          // Par défaut, utiliser l'ordre du fichier products.ts
          const indexA = allProducts.findIndex(p => p.id === a.id);
          const indexB = allProducts.findIndex(p => p.id === b.id);
          return indexA - indexB;
      }
    });
  }, [flat, userSelectedCategory, category, q, sortBy]);

  // Utiliser useMemo pour éviter les recalculs inutiles
  const { displayedItems, hasMore } = useMemo(() => {
    return {
      displayedItems: filteredSorted.slice(0, displayCount),
      hasMore: displayCount < filteredSorted.length
    };
  }, [filteredSorted, displayCount]);

  // Obtenir la catégorie suivante dans l'ordre défini
  const getNextCategory = (currentCategory: Product["category"]): Product["category"] => {
    const categoryOrder: Product["category"][] = ["Sculpture", "Painting", "Home & Garden"];
    const currentIndex = categoryOrder.indexOf(currentCategory);
    
    // Si la catégorie actuelle n'est pas dans l'ordre ou est la dernière, retourner la première
    if (currentIndex === -1 || currentIndex === categoryOrder.length - 1) {
      return categoryOrder[0];
    }
    
    // Sinon retourner la catégorie suivante
    return categoryOrder[currentIndex + 1];
  };

  const hasMoreOverall = hasMore;

  // Infinite scroll avec navigation entre catégories
  useEffect(() => {
    if (!hasMounted) return;
    
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const documentHeight = document.documentElement.offsetHeight;
      const threshold = 300; // Seuil de déclenchement réduit pour une meilleure réactivité

      // Vérifier si on est proche du bas de la page
      if (scrollPosition >= documentHeight - threshold) {
        // Si on peut charger plus d'éléments dans la catégorie actuelle
        if (hasMore && !isLoadingMore) {
          loadMore();
        } 
        // Si on a tout chargé dans la catégorie actuelle et qu'on n'est pas sur "Toutes les catégories"
        else if (!hasMore && category !== "All" && !isLoadingMore) {
          const nextCategory = getNextCategory(category);
          
          // Trouver le premier élément de la catégorie suivante
          const nextCategoryElement = document.querySelector(`[data-category="${nextCategory}"]`);
          
          if (nextCategoryElement) {
            // Faire défiler jusqu'à la catégorie suivante
            nextCategoryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Mettre à jour l'URL et l'état de la catégorie
            const params = new URLSearchParams(window.location.search);
            params.set('category', nextCategory);
            window.history.replaceState({}, '', `?${params.toString()}`);
            
            // Mettre à jour l'état de la catégorie
            setCategory(nextCategory);
            setUserSelectedCategory(true);
          }
        }
      }
    };

    const debouncedScroll = debounce(handleScroll, 150);
    
    window.addEventListener('scroll', debouncedScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', debouncedScroll);
    };
  }, [isLoadingMore, hasMore, hasMoreOverall, hasMounted, category]);
  
  // Fonction de debounce pour optimiser les événements de scroll
  function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    return function(...args: Parameters<T>) {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Charger plus d'éléments
  const loadMore = useMemo(() => {
    return () => {
      if (isLoadingMore || !hasMore) return;
      
      setIsLoadingMore(true);
      
      // Utiliser requestAnimationFrame pour un rendu plus fluide
      requestAnimationFrame(() => {
        setDisplayCount(prev => {
          const newCount = Math.min(prev + pageSize, filteredSorted.length);
          return newCount;
        });
        
        // Délai minimum pour éviter les chargements trop rapides
        setTimeout(() => {
          setIsLoadingMore(false);
        }, 300);
      });
    };
  }, [isLoadingMore, hasMore, pageSize, filteredSorted.length]);

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

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('search.placeholder')}
            className="p-3 bg-white text-black border border-[color-mix(in_oklab,var(--leaf)_35%,transparent)] rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
          />
          <div className="relative">
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as any)}
              className="w-full p-3 bg-white text-black border border-[color-mix(in_oklab,var(--leaf)_35%,transparent)] rounded-none appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{t(`category.${c}`)}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--leaf)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.112l3.71-2.88a.75.75 0 11.92 1.18l-4.2 3.26a.75.75 0 01-.92 0l-4.2-3.26a.75.75 0 01-.12-1.11z" clipRule="evenodd" />
            </svg>
          </div>
          {/* removed artist filter select */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "default" | "lastUpdated" | "price-asc" | "price-desc")}
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

        {/* Loading indicator for infinite scroll */}
        {isLoadingMore && (
          <div className="flex justify-center mb-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--leaf)] border-t-transparent"></div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedItems.map((p: Product, index: number) => {
            const isFirstOfCategory = index === 0 || displayedItems[index - 1]?.category !== p.category;
            return (
              <div key={p.id}>
                {isFirstOfCategory && (
                  <div data-category={p.category} className="sr-only" style={{ marginTop: '-100px', paddingTop: '100px' }}></div>
                )}
                <Link href={`/product/${p.slug}`} className="group bg-white overflow-hidden border border-[#cfc9c0] block">
                  <div className="relative">
                    <ArtworkSquare src={p.image} alt={p.title} />
                    {!p.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-[var(--gold)] text-black px-4 py-2 rounded-full font-semibold">{t('status.sold')}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 text-black">
                    <h3 className="text-xl font-semibold">{getTranslatedText(p, 'title')} · {p.year}</h3>
                    <p className="text-sm text-black/60 mb-3">{getTranslatedText(p, 'medium')}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold">${p.price}</span>
                        {p.originalPrice && (
                          <span className="text-sm line-through text-black/40">${p.originalPrice}</span>
                        )}
                      </div>
                      <span className="px-3 py-2 bg-[var(--gold)] text-black text-sm font-semibold">{t('actions.view')}</span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Infinite scroll will load automatically when scrolling */}
      </div>
    </div>
  );
}
