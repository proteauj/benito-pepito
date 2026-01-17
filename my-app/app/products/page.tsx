// app/products/page.tsx
'use client';

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
  slug: string; // Ajoute slug dans le type Product
}

interface ProductsPageProps {
  products: Product[];
}

export default function ProductsPage({ products }: ProductsPageProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Section Swiper */}
      <Swiper
        direction="vertical"  // Scroll vertical
        slidesPerView={4}  // Nombre de produits visibles par "vue"
        spaceBetween={20}  // Espace entre les items
        grid={{ rows: 1, fill: 'row' }}  // Grille horizontale avec 1 ligne
        virtual  // Utilisation de la virtualisation pour charger à la demande
        modules={[Virtual, Grid]}  // Import des modules Virtual et Grid
        style={{ height: 'calc(100vh - 80px)' }}  // Hauteur de Swiper ajustée
      >
        {Array.isArray(products) && products.length ? (
          products.map((product, index) => (
          <SwiperSlide key={product.id} virtualIndex={index}>
            <div
              className="cursor-pointer"
              onClick={() => router.push(`/product/${product.id}`)}  // Redirection vers la page produit avec le slug
            >
              <div className="relative w-full h-[300px]">
                <img
                  src={product.imageThumbnail}
                  alt={product.title}
                  className="object-contain w-full h-full"
                  loading="lazy"  // Chargement différé des images
                />
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg">{product.title}</h2>
                <p className="font-bold">${product.price}</p>
              </div>
            </div>
          </SwiperSlide>
        ))
      ):(<div>Aucun produit disponible.</div>)}
      </Swiper>
    </div>
  );
}
