'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';

const ITEM_HEIGHT = 420;
const COLUMNS = 4;
const VISIBLE_ROWS = 3; // 12 items
const BUFFER_ROWS = 3;  // +12 avant / +12 après

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [startRow, setStartRow] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  /* ---------- FETCH ---------- */
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(res => {
        const all = Array.isArray(res) ? res : Object.values(res).flat();
        setProducts(all);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalRows = Math.ceil(products.length / COLUMNS);

  /* ---------- WINDOW ---------- */
  const fromRow = Math.max(0, startRow - BUFFER_ROWS);
  const toRow = Math.min(
    totalRows,
    startRow + VISIBLE_ROWS + BUFFER_ROWS
  );

  const windowProducts = products.slice(
    fromRow * COLUMNS,
    toRow * COLUMNS
  );

  const paddingTop = fromRow * ITEM_HEIGHT;
  const paddingBottom = (totalRows - toRow) * ITEM_HEIGHT;

  /* ---------- SCROLL ---------- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const nextRow = Math.floor(el.scrollTop / ITEM_HEIGHT);
      if (nextRow !== startRow) {
        setStartRow(nextRow);
      }
    };

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [startRow]);

  if (loading) return <ProductsLoading />;

  return (
    <div className="h-screen overflow-hidden">
      <div
        ref={containerRef}
        className="h-full overflow-y-auto"
      >
        <div style={{ height: totalRows * ITEM_HEIGHT }} />

        <div
          style={{
            position: 'absolute',
            top: paddingTop,
            left: 0,
            right: 0,
          }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6"
        >
          {windowProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}