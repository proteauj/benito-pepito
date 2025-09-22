"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";

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
  rating: number;
  reviews: number;
  artist: string;
  medium: string;
  year: number;
  lastUpdated: string;
}

type ProductsByCategory = Record<string, Product[]>;

export default function ProductsIndexPage() {
  const [data, setData] = useState<ProductsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<"All" | Product["category"]>("All");
  const [artist, setArtist] = useState("all");
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

  const artists = useMemo(() => {
    return Array.from(new Set(flat.map((p) => p.artist))).sort();
  }, [flat]);

  const filteredSorted = useMemo(() => {
    let arr = [...flat];
    // category
    if (category !== "All") arr = arr.filter((p) => p.category === category);
    // artist
    if (artist !== "all") arr = arr.filter((p) => p.artist === artist);
    // search
    const term = q.trim().toLowerCase();
    if (term) {
      arr = arr.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.artist.toLowerCase().includes(term) ||
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
      case "artist":
        arr.sort((a, b) => a.artist.localeCompare(b.artist));
        break;
      default:
        break;
    }
    return arr;
  }, [flat, category, artist, q, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const pageItems = filteredSorted.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    // reset to first page when filters change
    setPage(1);
  }, [q, category, artist, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-xl text-black/80">Loading artworks...</p>
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
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-8 leafy-divider pb-3">
          <h1 className="text-4xl font-bold">All Artworks</h1>
          <Link href="/categories" className="text-[var(--gold)] hover:text-[var(--gold-dark)]">Categories →</Link>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, artist, medium"
            className="p-3 bg-white text-black border border-[color-mix(in_oklab,var(--leaf)_35%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="p-3 bg-white text-black border border-[color-mix(in_oklab,var(--leaf)_35%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="p-3 bg-white text-black border border-[color-mix(in_oklab,var(--leaf)_35%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
          >
            <option value="all">All artists</option>
            {artists.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-3 bg-white text-black border border-[color-mix(in_oklab,var(--leaf)_35%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
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

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {pageItems.map((p) => (
            <div key={p.id} className="group bg-white overflow-hidden border border-[#cfc9c0]">
              <div className="relative aspect-[4/3]">
                <Link href={`/product/${p.slug}`}>
                  <SafeImage src={p.image} alt={p.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </Link>
                {!p.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-[var(--gold)] text-black px-4 py-2 rounded-full font-semibold">Sold</span>
                  </div>
                )}
              </div>
              <div className="p-5 text-black">
                <h3 className="text-xl font-semibold">{p.artist}</h3>
                <p className="text-sm text-black/70">{p.title} · {p.year}</p>
                <p className="text-sm text-black/60 mb-3">{p.medium}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold">${p.price}</span>
                    {p.originalPrice && (
                      <span className="text-sm line-through text-black/40">${p.originalPrice}</span>
                    )}
                  </div>
                  <Link href={`/product/${p.slug}`} className="px-3 py-2 bg-[var(--gold)] text-black text-sm font-semibold hover:bg-[var(--gold-dark)]">View</Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center mt-8 space-x-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 bg-[var(--gold)] text-black font-semibold disabled:bg-black/30"
          >
            Prev
          </button>
          <span className="text-black">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 bg-[var(--gold)] text-black font-semibold disabled:bg-black/30"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
