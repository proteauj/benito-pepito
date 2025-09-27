'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useI18n } from '@/i18n/I18nProvider';
import { useProductTranslations } from '@/hooks/useProductTranslations';
import ArtworkSquare from '@/components/ArtworkSquare';
import Loading from '@/components/Loading';

interface ProductByCategoryProps {
  searchParams: URLSearchParams;
}

export default function ProductByCategory({ searchParams }: ProductByCategoryProps) {
  const { t } = useI18n();
  const { getTranslatedText } = useProductTranslations();
  const router = useRouter();
  
  const category = searchParams.get('category');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/products');
      
      if (!res.ok) {
        throw new Error('Erreur lors du chargement des produits');
      }
      
      const data = await res.json();
      let productsList: Product[] = [];
      
      if (category && data[category]) {
        productsList = data[category];
      } else {
        productsList = (Object.values(data) as Product[][]).flat();
      }
      
      setProducts(prev => page === 1 ? productsList : [...prev, ...productsList]);
      setHasMore(productsList.length > 0);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };


  // useEffect(() => {
  //   setProducts([]);
  //   setPage(1);
  // }, [category]);
  
  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadMore = () => {
    if (isLoading) return;
    
    if (hasMore) {
      // Charge la page suivante normalement
      setPage(prev => prev + 1);
    } else {
      // Retourne au début de la liste
      setPage(1);
      // Fait défiler vers le haut de manière fluide
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Réinitialise hasMore pour éviter des déclenchements multiples
      setHasMore(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/products?page=${page}&category=${category || ''}`);
        
        if (!res.ok) throw new Error('Erreur de chargement');
        
        const data = await res.json();
        let productsList: Product[] = [];
        
        if (category && data[category]) {
          productsList = data[category];
        } else {
          productsList = (Object.values(data) as Product[][]).flat();
        }
        
        // Si on est à la première page, on remplace les produits
        // Sinon on les ajoute à la suite
        setProducts(prev => page === 1 ? productsList : [...prev, ...productsList]);
        
        // On considère qu'il y a plus de produits tant qu'on n'a pas atteint la fin
        setHasMore(productsList.length > 0);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [page, category]);

  {isLoading && page === 1 && (
    <div className="flex items-center justify-center h-64">
      <Loading />
    </div>
  )}

  return (
    <div className="space-y-8">
      {/* Grille de produits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product, index) => {
          const isFirstOfCategory = index === 0 || products[index - 1]?.category !== product.category;
          const translatedTitle = getTranslatedText(product, 'title');
          
          return (
            <div key={product.id} className="group">
              {isFirstOfCategory && (
                <div 
                  id={product.category.toLowerCase().replace(' ', '-')}
                  data-category={product.category}
                  className="sr-only"
                  style={{ marginTop: '-100px', paddingTop: '100px' }}
                ></div>
              )}
              
              <Link 
                href={`/product/${product.slug}`} 
                className="block bg-white overflow-hidden border border-[#cfc9c0] hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative aspect-square">
                  <ArtworkSquare 
                    src={product.image} 
                    alt={translatedTitle} 
                    className="w-full h-full object-cover"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-[var(--gold)] text-black px-4 py-2 rounded-full font-semibold">
                        {t('status.sold')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {translatedTitle} · {product.year}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {getTranslatedText(product, 'medium')}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    <span className="px-3 py-1.5 bg-[var(--gold)] text-black text-sm font-semibold rounded-sm">
                      {t('actions.view')}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {isLoading && page > 1 && (
        <div className="flex justify-center my-8">
          <Loading />
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="text-center py-4 text-sm text-gray-400">
          {t('products.endOfList')}
        </div>
      )}
    </div>
  );
}