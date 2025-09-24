"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ArtworkSquare from "@/components/ArtworkSquare";
import { useI18n } from "@/i18n/I18nProvider";

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
  const [data, setData] = useState<ProductsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<"All" | Product["category"]>("All");
  // Removed artist filter
  const [sortBy, setSortBy] = useState("lastUpdated-desc");
  const [page, setPage] = useState(1);
  const pageSize = 9;

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
    // artist filtering removed
    // search
    const term = q.trim().toLowerCase();
    if (term) {
      arr = arr.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          // removed artist from search
          p.medium.toLowerCase().includes(term)
      );
    }
    // sort
    switch (sortBy) {
      case "lastUpdated-desc":
        arr.sort(
          (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
        break;
      case "lastUpdated-asc":
        arr.sort(
          (a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
        );
        break;
      case "price-asc":
        arr.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        arr.sort((a, b) => b.price - a.price);
        break;
      case "year-desc":
        arr.sort((a, b) => b.year - a.year);
        break;
      case "year-asc":
        arr.sort((a, b) => a.year - b.year);
        break;
      // removed artist sort option
      default:
        break;
    }
    return arr;
  }, [flat, category, q, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const pageItems = filteredSorted.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    // reset to first page when filters change
    setPage(1);
  }, [q, category, sortBy]);

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
          <Link href="/categories" className="link-chip">{t('nav.categories')}</Link>
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
              onChange={(e) => setCategory(e.target.value as any)}
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
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-3 bg-white text-black border border-[color-mix(in_oklab,var(--leaf)_35%,transparent)] rounded-none appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
            >
              <option value="lastUpdated-desc">{t('sort.lastUpdatedDesc')}</option>
              <option value="lastUpdated-asc">{t('sort.lastUpdatedAsc')}</option>
              <option value="price-asc">{t('sort.priceAsc')}</option>
              <option value="price-desc">{t('sort.priceDesc')}</option>
              <option value="year-desc">{t('sort.yearDesc')}</option>
              <option value="year-asc">{t('sort.yearAsc')}</option>
              {/* removed artist sort option */}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--leaf)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.112l3.71-2.88a.75.75 0 11.92 1.18l-4.2 3.26a.75.75 0 01-.92 0l-4.2-3.26a.75.75 0 01-.12-1.11z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {pageItems.map((p) => (
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

        {/* Pagination */}
        <div className="flex items-center justify-center mt-8 space-x-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 bg-[var(--gold)] text-black font-semibold disabled:bg-black/30"
          >
            {t('actions.prev')}
          </button>
          <span className="text-black">{t('pagination.page')} {page} {t('pagination.of')} {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 bg-[var(--gold)] text-black font-semibold disabled:bg-black/30"
          >
            {t('actions.next')}
          </button>
        </div>
      </div>
    </div>
  );
}
