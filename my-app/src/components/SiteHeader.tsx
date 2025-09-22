"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useI18n } from '@/i18n/I18nProvider';

export default function SiteHeader() {
  const { itemCount, toggleCart } = useCart();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="headerGradient border-b border-[#cfc9c0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="h-16 flex items-center px-4 text-2xl md:text-3xl font-extrabold text-black hover:bg-white hover:text-[var(--leaf)] transition-colors whitespace-nowrap mouly-font">Benito Pepito</Link>
          </div>
          {/* Desktop navigation (no Home link) */}
          <nav className="hidden md:flex space-x-2 h-16">
            <Link href="/categories" className="h-full px-3 text-black hover:bg-white hover:text-[var(--leaf)] flex items-center transition-colors text-lg md:text-xl font-semibold">{t('nav.categories')}</Link>
            <Link href="/products" className="h-full px-3 text-black hover:bg-white hover:text-[var(--leaf)] flex items-center transition-colors text-lg md:text-xl font-semibold">{t('nav.allWorks')}</Link>
            <Link href="/about" className="h-full px-3 text-black hover:bg-white hover:text-[var(--leaf)] flex items-center transition-colors text-lg md:text-xl font-semibold">{t('nav.about')}</Link>
            <Link href="/contact" className="h-full px-3 text-black hover:bg-white hover:text-[var(--leaf)] flex items-center transition-colors text-lg md:text-xl font-semibold">{t('nav.contact')}</Link>
          </nav>
          <div className="flex items-center space-x-2 h-16">
            {/* Mobile hamburger */}
            <button
              className="md:hidden h-16 w-16 text-black hover:bg-white hover:text-[var(--leaf)] flex items-center justify-center transition-colors"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/products" className="h-16 w-16 text-black hover:bg-white hover:text-[var(--leaf)] flex items-center justify-center transition-colors rounded-none overflow-hidden" aria-label="Search">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <button onClick={toggleCart} className="h-16 w-16 text-black hover:bg-white hover:text-[var(--leaf)] relative flex items-center justify-center transition-colors rounded-none overflow-hidden" aria-label="Cart">
              {/* Simple bag icon */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8h12l-1 12a2 2 0 01-2 2H9a2 2 0 01-2-2L6 8z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8V6a3 3 0 116 0v2" />
              </svg>
              <span className="pointer-events-none absolute top-1 right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{itemCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-40 ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!mobileOpen}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />
        {/* Panel */}
        <aside
          className={`absolute left-0 top-0 h-full w-4/5 max-w-xs drawerBg text-[var(--foreground)] shadow-xl transform transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
          role="dialog"
          aria-label="Main menu"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2f2d]">
            <span className="font-semibold">Menu</span>
            <button onClick={() => setMobileOpen(false)} className="text-[var(--foreground)]/70 hover:text-[var(--gold)]" aria-label="Close menu">✕</button>
          </div>
          <nav className="p-5 space-y-3">
            <Link href="/categories" onClick={() => setMobileOpen(false)} className="block px-3 py-2 bg-white border border-[#cfc9c0]">{t('nav.categories')}</Link>
            <Link href="/products" onClick={() => setMobileOpen(false)} className="block px-3 py-2 bg-white border border-[#cfc9c0]">{t('nav.allWorks')}</Link>
            <Link href="/about" onClick={() => setMobileOpen(false)} className="block px-3 py-2 bg-white border border-[#cfc9c0]">{t('nav.about')}</Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="block px-3 py-2 bg-white border border-[#cfc9c0]">{t('nav.contact')}</Link>
          </nav>
        </aside>
      </div>
    </header>
  );
}
