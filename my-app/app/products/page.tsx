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
}

interface ProductsPageProps {
  products: Product[];
}

export default function ProductsPage({ products }: ProductsPageProps) {
  const router = useRouter();
  const columnCount = 4; // Nombre de colonnes (ajuste selon tes besoins)

  // Déclare rowCount en dehors du if
  let rowCount = 0;

  // Vérification si `products` est un tableau et a une longueur > 0
  if (Array.isArray(products) && products.length > 0) {
    rowCount = Math.ceil(products.length / columnCount); // Nombre de lignes
  } else {
    // Gérer le cas où products est vide ou non défini
    rowCount = 0; // Si vide, on ne crée aucune ligne
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Section Swiper */}
      <Swiper
        direction="vertical"   // Scroll vertical
        slidesPerView={4}      // Nombre de produits visibles par "vue"
        spaceBetween={20}      // Espace entre les items
        grid={{ rows: 1, fill: 'row' }}  // Grille horizontale avec 1 ligne
        virtual               // Utilisation de la virtualisation pour charger à la demande
        modules={[Virtual, Grid]}  // Import des modules Virtual et Grid
        style={{ height: 'calc(100vh - 80px)' }}  // Hauteur de Swiper ajustée
      >
        {products?.length > 0 ? (
          products.map((product, index) => (
            <SwiperSlide key={product.id} virtualIndex={index}>
              <div
                className="cursor-pointer"
                onClick={() => router.push(`/products/${product.id}`)}  // Redirection vers la page produit
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
        ) : (
          <p>No products available</p>  // Affichage d'un message si aucun produit n'est disponible
        )}
      </Swiper>
    </div>
  );
}