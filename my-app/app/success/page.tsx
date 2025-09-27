'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const cartParam = searchParams.get('cart');

    if (sessionId) {
      // Verify the payment status
      verifyPayment(sessionId, cartParam);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string, cartParam: string | null) => {
    try {
      const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update stock using cart data from URL parameter
          if (cartParam) {
            try {
              const cartItems = JSON.parse(decodeURIComponent(cartParam));
              if (Array.isArray(cartItems) && cartItems.length > 0) {
                const productIds = cartItems.map((item: any) => item.id);
                await updateStock(productIds);
                await updateOrderWithCart(sessionId, cartItems);
                console.log('✅ Stock updated for products:', productIds);
              }
            } catch (error) {
              console.error('Error parsing cart data from URL:', error);
            }
          }

          setPaymentStatus('success');
        } else {
          setPaymentStatus('error');
        }
      } else {
        setPaymentStatus('error');
      }
    } catch (error) {
      setPaymentStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderWithCart = async (sessionId: string, cartItems: any[]) => {
    try {
      const response = await fetch('/api/update-order-with-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, cartItems }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Order updated successfully:', data);
        return data;
      } else {
        console.error('❌ Failed to update order:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Error updating order:', error);
    }
  };

  const updateStock = async (productIds: string[]) => {
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds, inStock: false }),
      });

      if (response.ok) {
        console.log('✅ Stock updated successfully');
      } else {
        console.error('❌ Failed to update stock');
      }
    } catch (error) {
      console.error('❌ Error updating stock:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center stoneBg">
        <div className="bg-white/95 border border-[#cfc9c0] shadow px-16 py-12 text-center w-full max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-[var(--leaf)] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-xl font-semibold text-[var(--leaf)]">Vérification du paiement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center stoneBg text-[var(--foreground)]">
      <div className="bg-white/95 border border-[#cfc9c0] shadow px-16 py-12 text-center w-full max-w-lg">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-black mb-2">{t('success.title')}</h1>
          <p className="text-black/70 text-lg">{t('success.message')}</p>

          {/* Payment Status */}
          {paymentStatus === 'success' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">{t('success.paymentVerified')}</p>
            </div>
          )}

          {paymentStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">{t('success.verificationIssue')}</p>
              <p className="text-red-600 text-sm mt-1">{t('success.stockNotUpdated')}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Link
            href="/categories"
            className="block w-full bg-[var(--gold)] text-black py-3 px-6 font-semibold hover:bg-[var(--gold-dark)] transition-colors"
          >
            Explorer d'autres œuvres
          </Link>
          <Link
            href="/"
            className="block w-full btn-ghost"
          >
            Retour à l'accueil
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-[#cfc9c0]">
          <p className="text-sm text-black/50">
            Vous recevrez un email de confirmation avec les détails de votre commande.
          </p>
        </div>
      </div>
    </div>
  );
}
