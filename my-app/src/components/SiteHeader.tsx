'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export default function SiteHeader() {
  const { itemCount, toggleCart } = useCart();
  return (
    <header className="bg-white/80 backdrop-blur shadow-sm border-b border-[#cfc9c0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-[var(--foreground)]">Benito Pepito</Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-[var(--foreground)]/80 hover:text-[var(--gold)]">Home</Link>
            <Link href="/categories" className="text-[var(--foreground)]/80 hover:text-[var(--gold)]">Categories</Link>
            <Link href="/about" className="text-[var(--foreground)]/80 hover:text-[var(--gold)]">About</Link>
            <Link href="/contact" className="text-[var(--foreground)]/80 hover:text-[var(--gold)]">Contact</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="text-[var(--foreground)]/80 hover:text-[var(--gold)]" aria-label="Search">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button onClick={toggleCart} className="text-[var(--foreground)]/80 hover:text-[var(--gold)] relative" aria-label="Cart">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-[var(--leaf)] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{itemCount}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
