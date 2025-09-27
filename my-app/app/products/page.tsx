// app/products/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/types';
import ProductsLoading from '@/components/ProductsLoading';

// Déplacer le contenu principal dans un composant séparé
function ProductsContent() {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<"All" | Product["category"]>("All");
  const [userSelectedCategory, setUserSelectedCategory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Record<string, Product[]>>({});

  // Votre logique existante ici
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Votre logique de scroll et de gestion des catégories
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setCategory(categoryFromUrl as Product["category"]);
    }
    
    const scrollToCategory = () => {
      if (category !== "All") {
        const element = document.getElementById(`category-${category}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    if (!loading && Object.keys(data).length > 0) {
      setTimeout(scrollToCategory, 100);
    }
  }, [searchParams, loading, data, category]);

  const handleCategoryChange = (newCategory: "All" | Product["category"]) => {
    setCategory(newCategory);
    setUserSelectedCategory(newCategory !== "All");

    const params = new URLSearchParams(searchParams.toString());
    if (newCategory === "All") {
      params.delete('category');
    } else {
      params.set('category', newCategory);
    }
    window.history.pushState({}, '', `?${params.toString()}`);
  };

  // Votre rendu existant
  return (
    <div className="min-h-screen stoneBg text-[var(--foreground)]">
      {/* Votre contenu existant */}
      <div className="container mx-auto px-4 py-8">
        {/* Vos contrôles de catégorie */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => handleCategoryChange("All")}
            className={`px-4 py-2 rounded-full ${
              category === "All" 
                ? 'bg-[var(--gold)] text-black' 
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            Toutes les œuvres
          </button>
          {Object.keys(data).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat as Product["category"])}
              className={`px-4 py-2 rounded-full ${
                category === cat 
                  ? 'bg-[var(--gold)] text-black' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Contenu des produits */}
        {loading ? (
          <ProductsLoading />
        ) : (
          <div className="space-y-12">
            {Object.entries(data)
              .filter(([cat]) => category === "All" || cat === category)
              .map(([category, products]) => (
                <div key={category} id={`category-${category}`} className="space-y-6">
                  <h2 className="text-2xl font-bold">{category}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <div key={product.id} className="bg-white rounded-lg p-4">
                        {/* Votre carte de produit */}
                        <img 
                          src={product.image} 
                          alt={product.title}
                          className="w-full h-48 object-cover rounded"
                        />
                        <h3 className="mt-2 font-medium">{product.title}</h3>
                        <p className="text-gray-600">${product.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Le composant page qui enveloppe le contenu dans un Suspense
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}