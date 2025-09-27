'use client';

import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Loading from '@/components/Loading';

// Chargement dynamique avec désactivation du SSR
const ProductByCategory = dynamic(
  () => import('./ProductByCategory'),
  { 
    ssr: false,
    loading: () => <Loading />
  }
);

export default function ProductsContent() {
  const searchParams = useSearchParams();
  return <ProductByCategory searchParams={searchParams} />;
}