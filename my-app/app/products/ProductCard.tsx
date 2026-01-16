import { Product } from '../../lib/db/types';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded shadow overflow-hidden flex flex-col">
      {/* IMAGE */}
      <img
        src={product.imageThumbnail || product.image}
        alt={product.title}
        className="w-full h-auto object-contain"
        loading="lazy"
      />

      {/* TEXTE */}
      <div className="p-2">
        <h2 className="text-base font-semibold leading-snug">
          {product.title}
        </h2>
        <p className="text-sm mt-1">{product.price} €</p>
      </div>
    </div>
  );
}