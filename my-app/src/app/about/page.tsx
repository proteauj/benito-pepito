'use client';

import SafeImage from '@/components/SafeImage';
import { useI18n } from '@/i18n/I18nProvider';

export default function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen stoneBg text-[var(--foreground)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between leafy-divider pb-3 mb-6 gap-4">
          <h1 className="text-4xl font-bold">{t('about.title')}</h1>
          <div className="flex items-center gap-2">
            <a href="#" className="link-chip">{t('social.instagram')}</a>
            <a href="#" className="link-chip">{t('social.press')}</a>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative aspect-[16/7] border border-[#cfc9c0] bg-white mb-8">
          <SafeImage src="/artworks/about/hero.svg" alt={t('about.heroAlt')} fill className="object-cover" />
        </div>

        {/* Short description */}
        <p className="text-lg text-black/85 leading-relaxed max-w-3xl">
          {t('about.description')}
        </p>

        {/* CTA row */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="/categories" className="bg-[var(--gold)] text-black px-5 py-2 font-semibold hover:bg-[var(--gold-dark)]">{t('actions.exploreCategories')}</a>
          <a href="/contact" className="btn-ghost">{t('actions.contact')}</a>
        </div>
      </div>
    </div>
  );
}
