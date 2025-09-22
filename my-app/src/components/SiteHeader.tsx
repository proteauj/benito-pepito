'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useI18n } from '@/i18n/I18nProvider';

export default function SiteHeader() {
  const { itemCount, toggleCart } = useCart();
  const { t } = useI18n();
  return (
    <header className="headerGradient border-b border-[#cfc9c0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="h-16 flex items-center px-4 text-2xl md:text-3xl font-extrabold text-[var(--gold)] hover:bg-white hover:text-[var(--leaf)] transition-colors">Benito Pepito</Link>
          </div>
          <nav className="hidden md:flex space-x-2 h-16">
            <Link href="/" className="h-full px-3 text-[var(--gold)] hover:bg-white hover:text-[var(--leaf)] flex items-center transition-colors text-lg md:text-xl font-semibold">{t('nav.home')}</Link>
            <Link href="/categories" className="h-full px-3 text-[var(--gold)] hover:bg-white hover:text-[var(--leaf)] flex items-center transition-colors text-lg md:text-xl font-semibold">{t('nav.categories')}</Link>
            <Link href="/products" className="h-full px-3 text-[var(--gold)] hover:bg-white hover:text-[var(--leaf)] flex items-center transition-colors text-lg md:text-xl font-semibold">{t('nav.allWorks')}</Link>
            <Link href="/about" className="h-full px-3 text-[var(--gold)] hover:bg-white hover:text-[var(--leaf)] flex items-center transition-colors text-lg md:text-xl font-semibold">{t('nav.about')}</Link>
            <Link href="/contact" className="h-full px-3 text-[var(--gold)] hover:bg-white hover:text-[var(--leaf)] flex items-center transition-colors text-lg md:text-xl font-semibold">{t('nav.contact')}</Link>
          </nav>
          <div className="flex items-center space-x-2 h-16">
            <Link href="/products" className="h-16 w-16 text-[var(--gold)] hover:bg-white hover:text-[var(--leaf)] flex items-center justify-center transition-colors rounded-none overflow-hidden" aria-label="Search">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <button onClick={toggleCart} className="h-16 w-16 text-[var(--gold)] hover:bg-white hover:text-[var(--leaf)] relative flex items-center justify-center transition-colors rounded-none overflow-hidden" aria-label="Cart">
              {/* Simple bag icon */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8h12l-1 12a2 2 0 01-2 2H9a2 2 0 01-2-2L6 8z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8V6a3 3 0 116 0v2" />
              </svg>
              <span className="pointer-events-none absolute top-1 right-1 bg-[var(--leaf)] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{itemCount}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
