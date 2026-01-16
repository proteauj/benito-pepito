import { Product } from '../../lib/db/types';

export default function ProductCard({ product }: { product: Product }) {
  console.log(product.image, product.imageThumbnail);
  return (
    <div className="bg-white shadow rounded flex flex-col">
      <img
        src={product.imageThumbnail || product.image}
        alt={product.title}
        className="w-full h-auto object-contain block"
      />

      <div className="p-2">
        <h2 className="text-sm font-semibold">{product.title}</h2>
        <p className="text-sm mt-1">{product.price} €</p>
      </div>
    </div>
  );
}
