// app/products/page.tsx

export const dynamic = 'force-dynamic'; // Important pour forcer le côté client, et désactiver le prerender

import ProductsClient from './ProductsClient';

export default function ProductsPage() {
  return <ProductsClient />;
}