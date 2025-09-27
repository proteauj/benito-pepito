"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useI18n } from '../i18n/I18nProvider';
import LanguageSelector from './LanguageSelector';

export default function SiteHeader() {
  const [isMounted, setIsMounted] = useState(false);
  const { items, isOpen, toggleCart } = useCart();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = isMounted 
    ? items.reduce((total, item) => total + item.quantity, 0)
    : 0;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <header className="headerGradient border-b border-[#cfc9c0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Espace vide pour éviter les sauts de mise en page */}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="headerGradient border-b border-[#cfc9c0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
          <Link 
              href="/" 
              className="h-16 flex items-center px-4 text-4xl lg:text-5xl font-extrabold text-black hover:bg-white hover:text-[var(--leaf)] transition-colors whitespace-nowrap mouly-font"
            >
              Benito Pepito
            </Link>
          </div>
          {/* Desktop navigation (no Home link) */}
          <nav className="hidden md:flex space-x-2 h-16">
          <Link 
              href="/products" 
              className="h-full px-3 text-black hover:bg-white hover:text-[var(--leaf)] flex items-center transition-colors text-lg md:text-xl font-semibold"
            >
              {t('nav.allWorks')}
            </Link>
            <Link 
              href="/about" 
              className="h-full px-3 text-black hover:bg-white hover:text-[var(--leaf)] flex items-center transition-colors text-lg md:text-xl font-semibold"
            >
              {t('nav.about')}
            </Link>
            <Link 
              href="/contact" 
              className="h-full px-3 text-black hover:bg-white hover:text-[var(--leaf)] flex items-center transition-colors text-lg md:text-xl font-semibold"
            >
              {t('nav.contact')}
            </Link>
          </nav>
          <div className="flex items-center space-x-2 h-16">
            <LanguageSelector />
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
            {/* <Link href="/products" className="h-16 w-16 text-black hover:bg-white hover:text-[var(--leaf)] flex items-center justify-center transition-colors rounded-none overflow-hidden" aria-label="Search">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link> */}
            <button 
              onClick={toggleCart} 
              className="h-16 w-16 text-black hover:bg-white hover:text-[var(--leaf)] relative flex items-center justify-center transition-colors rounded-none overflow-hidden cursor-pointer"
              aria-label="Cart"
            >
              {/* Simple bag icon */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8h12l-1 12a2 2 0 01-2 2H9a2 2 0 01-2-2L6 8z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8V6a3 3 0 116 0v2" />
              </svg>
              {itemCount > 0 && (
                <span className="pointer-events-none absolute top-1 right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg">
            <div className="p-4 border-b flex justify-between items-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileOpen(false);
                }}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <nav className="p-4 space-y-4">
              <Link 
                href="/products" 
                className="block py-2 hover:text-[var(--leaf)]"
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.allWorks')}
              </Link>
              <Link 
                href="/about" 
                className="block py-2 hover:text-[var(--leaf)]"
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.about')}
              </Link>
              <Link 
                href="/contact" 
                className="block py-2 hover:text-[var(--leaf)]"
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.contact')}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
