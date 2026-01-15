'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useI18n } from '@/i18n/I18nProvider';
import SafeImage from './SafeImage';
import { useEffect, useState } from 'react';

export default function MiniCartDrawer() {
  const [isMounted, setIsMounted] = useState(false);
  const { isOpen, items, total, itemCount, updateQuantity, removeFromCart, closeCart } = useCart();
  const { t } = useI18n();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <aside
        className={`absolute right-0 top-0 h-full w-full sm:w-[420px] drawerBg text-[var(--foreground)] shadow-xl transform transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Mini Cart"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2f2d]">
          <h2 className="text-lg font-semibold">{t('minicart.title')} ({itemCount})</h2>
          <button onClick={closeCart} className="text-[var(--foreground)]/70 hover:text-[var(--gold)]" aria-label="Close cart">
            ✕
          </button>
        </div>

        <div className="h-[calc(100%-160px)] overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-[var(--foreground)]/70">{t('minicart.empty')}</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex bg-white border border-[#cfc9c0] p-3">
                <div className="relative w-20 h-20 mr-3">
                  <SafeImage src={item.image} alt={item.title} className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold leading-tight">{item.title}</h3>
                      <p className="text-xs text-[var(--foreground)]/60">{item.material}, {item.year}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-[var(--gold)] hover:underline text-sm">{t('actions.remove')}</button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-semibold">${item.price}</span>
                    <div className="flex items-center border rounded border-[#2a2f2d]">
                      <button className="px-2 py-1" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>-</button>
                      <span className="px-3 py-1 border-l border-r border-[#2a2f2d]">{item.quantity}</span>
                      <button className="px-2 py-1" onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-[#2a2f2d] p-5 bg-[#e4dfd7] text-black">
          <div className="flex justify-between mb-3">
            <span>{t('cart.total')}</span>
            <span className="text-xl font-bold">${total.toFixed(2)}</span>
          </div>
          <Link
            href="/cart"
            onClick={closeCart}
            className="block w-full text-center bg-[var(--gold)] text-black py-3 font-semibold hover:bg-white hover:text-[var(--leaf)]"
          >
            {t('minicart.review')}
          </Link>
        </div>
      </aside>
    </div>
  );
}
