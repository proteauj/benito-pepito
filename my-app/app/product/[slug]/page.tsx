// app/products/page.tsx
export const dynamic = 'force-dynamic'; // Désactive le prerendering pour cette page

import ProductsClient from './ProductsClient';

export default function ProductsPage() {
  return <ProductsClient />;
}