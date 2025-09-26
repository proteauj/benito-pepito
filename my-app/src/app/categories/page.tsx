'use client';

import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { useI18n } from '@/i18n/I18nProvider';

const categories = [
  {
    name: 'Sculpture',
    slug: 'sculpture',
    image: '/images/sculpt2.jpg',
    description: 'One-of-a-kind pieces molded and carved to perfection.'
  },
  {
    name: 'Painting',
    slug: 'painting',
    image: '/images/paint11.jpeg',
    description: 'Original works on canvas and paper across movements and styles.'
  },
  {
    name: 'Home & Garden',
    slug: 'home-and-garden',
    image: '/images/home6.jpg',
    description: 'Leafy greens and living installations to transform spaces.'
  },
];

export default function CategoriesPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen stoneBg text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-8">{t('nav.categories')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="group overflow-hidden border border-[#cfc9c0] bg-white">
              <div className="relative aspect-[4/3]">
                <SafeImage src={c.image} alt={c.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <h2 className="text-xl font-semibold text-black">{t(`category.${c.name}`)}</h2>
                <p className="text-sm text-black/70">{t(`category.${c.name}`)}</p>
                <span className="inline-block mt-3 bg-[var(--gold)] text-black px-3 py-1 font-semibold hover:bg-white hover:text-[var(--leaf)]">{t('category.viewAll')}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
