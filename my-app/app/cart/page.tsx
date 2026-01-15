'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { useCart } from '@/contexts/CartContext';
import { useI18n } from '@/i18n/I18nProvider';

export default function CartPage() {
  const { items, total, itemCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  const lineItems = useMemo(() =>
    items.map((it) => ({
      id: it.id,
      name: it.title,
      price: it.price,
      quantity: it.quantity,
    })),
  [items]);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: lineItems }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create checkout session');
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen stoneBg text-[var(--foreground)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">{t('cart.emptyTitle')}</h1>
          <p className="text-black/70 mb-8">{t('cart.emptySubtitle')}</p>
          <Link href="/" className="inline-block bg-[var(--gold)] text-black px-6 py-3 rounded-sm font-semibold hover:bg-[var(--gold-dark)]">
            {t('cart.emptyCta')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen stoneBg text-[var(--foreground)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('cart.title')}</h1>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-800">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex bg-white rounded-sm shadow p-4">
                <div className="relative w-24 h-24 mr-4">
                  <SafeImage src={item.image} alt={item.title} className="object-cover rounded" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <p className="text-gray-600">{item.category}</p>
                  <div className="flex items-center mt-3 space-x-3">
                    <span className="font-semibold">${item.price}</span>
                    <div className="flex items-center border rounded">
                      <button
                        className="px-2 py-1"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >-</button>
                      <span className="px-3 py-1 border-l border-r">{item.quantity}</span>
                      <button
                        className="px-2 py-1"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >+</button>
                    </div>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => removeFromCart(item.id)}
                    >{t('actions.remove')}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-sm shadow p-6 h-fit">
            <h3 className="text-xl font-semibold mb-4">{t('cart.orderSummary')}</h3>
            <div className="flex justify-between mb-2">
              <span>{t('cart.items')}</span>
              <span>{itemCount}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span>{t('cart.total')}</span>
              <span className="text-2xl font-bold">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-[var(--gold)] text-black py-3 rounded-sm font-semibold hover:bg-[var(--gold-dark)] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? t('cart.processing') : t('cart.checkout')}
            </button>
            <button
              onClick={clearCart}
              className="w-full mt-3 border border-[#cfc9c0] text-black py-3 rounded-sm font-semibold hover:bg-white"
            >
              {t('cart.clear')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
