import { Product } from '../../lib/db/types';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="flex flex-col bg-white rounded shadow overflow-hidden">
      <div className="w-full flex justify-center">
        <img
          src={product.imageThumbnail || product.image}
          alt={product.title}
          className="w-full h-auto object-contain"
          loading="lazy"
        />
      </div>
      <div className="p-2 flex flex-col">
        <h2 className="text-lg font-semibold">{product.title}</h2>
        <p className="text-sm mt-1">{product.price}</p>
      </div>
    </div>
  );
}