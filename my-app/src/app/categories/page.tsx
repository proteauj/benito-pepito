'use client';

import Link from 'next/link';
import Image from 'next/image';

const categories = [
  {
    name: 'Sculpture',
    slug: 'sculpture',
    image: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=1200&h=800&fit=crop',
    description: 'One-of-a-kind pieces molded and carved to perfection.'
  },
  {
    name: 'Painting',
    slug: 'painting',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200&h=800&fit=crop',
    description: 'Original works on canvas and paper across movements and styles.'
  },
  {
    name: 'Home & Garden',
    slug: 'home-and-garden',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=800&fit=crop',
    description: 'Leafy greens and living installations to transform spaces.'
  },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-8">Categories</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="group rounded-xl overflow-hidden border border-[#cfc9c0] bg-white">
              <div className="relative aspect-[4/3]">
                <Image src={c.image} alt={c.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <h2 className="text-xl font-semibold text-black">{c.name}</h2>
                <p className="text-sm text-black/70">{c.description}</p>
                <span className="inline-block mt-3 text-[var(--gold)] font-semibold">Explore →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
