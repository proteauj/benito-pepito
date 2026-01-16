'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const AutoSizer = dynamic(
  () => import('react-virtualized-auto-sizer').then(mod => mod.AutoSizer),
  { ssr: false }
);

const Grid = dynamic(
  () => import('react-virtualized').then(mod => mod.Grid),
  { ssr: false }
);

interface Product {
  id: string;
  title: string;
  imageThumbnail: string;
  price: number;
}

interface ProductsGridProps {
  products: Product[];
}

export default function ProductsGrid({ products }: ProductsGridProps) {
  const router = useRouter();

  const columnCount = 4;
  const rowCount = Math.ceil(products.length / columnCount);

  return (
    <AutoSizer>
      {({ width, height }) => (
        <Grid
          columnCount={columnCount}
          rowCount={rowCount}
          columnWidth={width / columnCount}
          rowHeight={420}
          width={width}
          height={height}
          cellRenderer={({ columnIndex, rowIndex, style }) => {
            const product = products[rowIndex * columnCount + columnIndex];
            if (!product) return null;

            return (
              <div
                key={product.id}
                style={style}
                className="p-2 cursor-pointer"
                onClick={() => router.push(`/products/${product.id}`)}
              >
                <img
                  src={product.imageThumbnail}
                  alt={product.title}
                  className="object-contain w-full h-[300px]"
                />
                <h2 className="font-semibold text-lg mt-2">{product.title}</h2>
                <p className="font-bold">${product.price}</p>
              </div>
            );
          }}
        />
      )}
    </AutoSizer>
  );
}