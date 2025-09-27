'use client';

import SafeImage from "../components/SafeImage";
import { useI18n } from "../i18n/I18nProvider";


export default function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen stoneBg text-[var(--foreground)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between leafy-divider pb-3 mb-6 gap-4">
          <h1 className="text-4xl font-bold">{t('about.title')}</h1>
          <div className="flex items-center gap-2">
            <a href="https://www.instagram.com/benitopepito_artist?igsh=MTJxMTZjbmlyNGMw&utm_source=qr" className="link-chip">{t('social.instagram')}</a>
            <a href="http://www.tiktok.com/@benitopepito_artist" className="link-chip">{t('social.tiktok')}</a>
          </div>
        </div>

        {/* Two-column layout: Image left, Description right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 items-start">
          {/* Left column: Hero image */}
          <div className="relative aspect-[4/3] border border-[#cfc9c0] bg-white">
            <SafeImage src="/images/staff/benitoPepito.jpg" alt={t('about.heroAlt')} className="object-cover" />
          </div>

          {/* Right column: Description */}
          <div className="flex flex-col justify-start">
            <p className="text-lg font-semibold text-black/85 leading-relaxed mb-6 text-shadow-white">
              {t('about.description')}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <a href="/products" className="bg-[var(--gold)] text-black px-5 py-2 font-semibold hover:bg-[var(--gold-dark)]">{t('products')}</a>
              <a href="/contact" className="btn-ghost">{t('actions.contact')}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
