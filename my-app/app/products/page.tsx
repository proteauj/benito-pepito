"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import ArtworkSquare from "../../src/components/ArtworkSquare";
import { useI18n } from "../../src/i18n/I18nProvider";

interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: "Sculpture" | "Painting" | "Home & Garden";
  inStock: boolean;
  artist: string;
  medium: string;
  year: number;
  lastUpdated: string;
}

type ProductsByCategory = Record<string, Product[]>;

export default function ProductsIndexPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<ProductsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<"All" | Product["category"]>("All");
  const [sortBy, setSortBy] = useState<"lastUpdated" | "price-asc" | "price-desc">("lastUpdated");
  const [displayCount, setDisplayCount] = useState(9);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pageSize = 9;

  // Initialize category from URL params
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && ["Sculpture", "Painting", "Home & Garden"].includes(categoryParam)) {
      setCategory(categoryParam as Product["category"]);
    }
  }, [searchParams]);

  // Update URL when category changes
  const handleCategoryChange = (newCategory: "All" | Product["category"]) => {
    setCategory(newCategory);
    const params = new URLSearchParams(searchParams.toString());
    if (newCategory === "All") {
      params.delete("category");
    } else {
      params.set("category", newCategory);
    }
    router.replace(`/products?${params.toString()}`);
  };

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e.message || "Error loading products");
      } finally {
        setLoading(false);
      }
    }
    load();
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
    let arr = [...flat];
    // category
    if (category !== "All") arr = arr.filter((p) => p.category === category);
    // search
    const term = q.trim().toLowerCase();
    if (term) {
      arr = arr.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.medium.toLowerCase().includes(term)
      );
    }
    // sort
    switch (sortBy) {
      case "lastUpdated":
        arr.sort(
          (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
        break;
      case "price-asc":
        arr.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        arr.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
    return arr;
  }, [flat, category, q, sortBy]);

  const displayedItems = filteredSorted.slice(0, displayCount);
  const hasMoreInCategory = displayCount < filteredSorted.length;

  // Get next category in cycle
  const getNextCategory = (currentCategory: Product["category"]) => {
    const categoryOrder: Product["category"][] = ["Sculpture", "Painting", "Home & Garden"];
    const currentIndex = categoryOrder.indexOf(currentCategory);

    if (currentIndex >= categoryOrder.length - 1) {
      return categoryOrder[0]; // Go back to first category
    } else {
      return categoryOrder[currentIndex + 1];
    }
  };

  const hasMoreOverall = hasMoreInCategory || (category !== "All");

  // Infinite scroll - load more when user scrolls near bottom
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.offsetHeight;
      const threshold = 1000; // Load more when 1000px from bottom

      if (scrollPosition >= documentHeight - threshold && !isLoadingMore && hasMoreOverall) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, hasMoreOverall]);

  // Load more items
  const loadMore = () => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);

    // Simulate loading delay
    setTimeout(() => {
      if (hasMoreInCategory) {
        setDisplayCount(prev => Math.min(prev + pageSize, filteredSorted.length));
      } else if (category !== "All") {
        // Switch to next category
        const nextCat = getNextCategory(category);
        if (nextCat) {
          handleCategoryChange(nextCat);
          setDisplayCount(pageSize); // Reset count for new category
        }
      }
      setIsLoadingMore(false);
    }, 500);
  };

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
              onChange={(e) => setSortBy(e.target.value as "lastUpdated" | "price-asc" | "price-desc")}
              className="w-full p-3 bg-white text-black border border-[color-mix(in_oklab,var(--leaf)_35%,transparent)] rounded-none appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
            >
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
          {displayedItems.map((p: Product) => (
            <Link key={p.id} href={`/product/${p.slug}`} className="group bg-white overflow-hidden border border-[#cfc9c0] block">
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
                  <span className="px-3 py-2 bg-[var(--gold)] text-black text-sm font-semibold">{t('actions.view')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Infinite scroll will load automatically when scrolling */}
      </div>
    </div>
  );
}
