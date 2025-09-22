'use client';

import SafeImage from '@/components/SafeImage';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="leafy-divider pb-3 mb-6">
          <h1 className="text-4xl font-bold">About</h1>
        </div>

        {/* Hero image */}
        <div className="relative aspect-[16/7] border border-[#cfc9c0] bg-white mb-8">
          <SafeImage src="/artworks/about/hero.svg" alt="About Hero" fill className="object-cover" />
        </div>

        {/* Short description */}
        <p className="text-lg text-black/85 leading-relaxed max-w-3xl">
          Benito Pepito is an artist-first gallery. We curate singular works across sculpture,
          painting, and home & garden. We favor materials, process, and quiet presentation—
          letting each piece breathe.
        </p>

        {/* Media links row */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="/categories" className="bg-[var(--gold)] text-black px-5 py-2 font-semibold hover:bg-[var(--gold-dark)]">Explore Categories</a>
          <a href="/contact" className="border border-[#cfc9c0] text-black px-5 py-2 font-semibold hover:bg-white">Contact</a>
          <a href="#" className="link-chip">Instagram</a>
          <a href="#" className="link-chip">Press</a>
        </div>
      </div>
    </div>
  );
}
