import { Product } from '../../lib/db/types';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white shadow rounded overflow-hidden">
      <img
        src={product.imageThumbnail || product.image}
        alt={product.title}
        className="w-full block"
        style={{ height: 'auto' }}
      />

      <div className="p-2">
        <h2 className="text-sm font-semibold leading-tight">
          {product.title}
        </h2>
        <p className="text-sm mt-1">{product.price} $</p>
        <p className="text-sm mt-1">{product.size}</p>
      </div>
    </div>
  );
}
