// app/success/page.tsx
'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { useSearchParams } from 'next/navigation';

// Composant interne qui utilise useSearchParams
function SuccessContent() {
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-sm shadow-lg max-w-md w-full text-center">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-2">{t('success.title')}</h1>
        <p className="mb-6 text-gray-600">
          {t('success.message')} #{sessionId}
        </p>
        <Link
          href="/"
          className="inline-block bg-[var(--gold)] text-black px-6 py-3 rounded font-semibold hover:bg-[var(--gold-dark)] transition-colors"
        >
          {t('actions.backToHome')}
        </Link>
      </div>
    </div>
  );
}

// Page exportée avec Suspense
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Chargement...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}