// app/product/[slug]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';  // on utilise 'next/navigation' pour la redirection

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageThumbnail: string;
}

interface ProductPageProps {
  params: { slug: string }; // on récupère 'slug' dans params
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;  // récupération du slug à partir de params
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products?slug=${slug}`);
        if (!res.ok) {
          throw new Error('Produit introuvable');
        }
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError('Produit introuvable');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (loading) return <div>Chargement...</div>;
  if (error || !product) return <div>{error || 'Produit introuvable'}</div>;

  return (
    <div>
      <h1>{product.title}</h1>
      <img src={product.imageThumbnail} alt={product.title} />
      <p>{product.description}</p>
      <p>Prix: ${product.price}</p>
    </div>
  );
}