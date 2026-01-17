'use client'; // directive nécessaire pour le rendu côté client uniquement

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Virtual, Grid } from 'swiper/modules';
import { useRouter } from 'next/navigation';
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/virtual';

interface Product {
  id: string;
  title: string;
  imageThumbnail: string;
  price: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data); // Assure-toi que `data` est un tableau valide
        } else {
          console.error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }

    fetchProducts();
  }, []);

  // Si les produits ne sont pas encore chargés, affiche un message de chargement
  if (products === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement des produits...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Aucun produit trouvé.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Swiper
        direction="vertical"
        slidesPerView={4}
        spaceBetween={20}
        grid={{ rows: 1, fill: 'row' }}
        virtual
        modules={[Grid, Virtual]}
        style={{ height: 'calc(100vh - 80px)' }}
      >
        {products.map((product, index) => (
          <SwiperSlide key={product.id} virtualIndex={index}>
            <div
              className="cursor-pointer"
              onClick={() => router.push(`/products/${product.id}`)}
            >
              <div className="relative w-full h-[300px]">
                <img
                  src={product.imageThumbnail}
                  alt={product.title}
                  className="object-contain w-full h-full"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg">{product.title}</h2>
                <p className="font-bold">${product.price}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}