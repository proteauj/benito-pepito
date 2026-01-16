// app/products/ProductsList.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '../../lib/db/types';
import ProductCard from './ProductCard';

interface ApiResponse {
  [key: string]: Product[];
}

export default function ProductsList() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const category = searchParams.get('category') || 'All';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching products...');
        
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        console.log('API Response:', data);
        
        // Convertir l'objet en tableau plat de tous les produits
        let allProducts: Product[] = [];
        
        // Parcourir chaque catégorie et ajouter les produits
        Object.values(data).forEach(categoryProducts => {
          if (Array.isArray(categoryProducts)) {
            allProducts = [...allProducts, ...categoryProducts];
          }
        });

        console.log('All products:', allProducts);
        
        // Filtrer par catégorie si nécessaire
        const filteredProducts = category !== 'All' 
          ? allProducts.filter(p => p.category === category)
          : allProducts;
          
        console.log(`Filtered to ${filteredProducts.length} products`);
        setProducts(filteredProducts);
        
      } catch (err) {
        console.error('Error in fetchProducts:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[var(--gold)] text-black px-4 py-2 rounded hover:bg-[var(--gold-dark)]"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center">Chargement des œuvres...</div>;
  }

  // S'assurer que products est bien un tableau avant de mapper
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p>Aucune œuvre trouvée dans cette catégorie.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
          />
        ))}
      </div>
    </div>
  );
}