'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '../../lib/db/types';
import ProductCard from './ProductCard';
import ProductsLoading from '@/components/ProductsLoading';

const VISIBLE_ROWS = 3; // nombre de lignes visibles
const BUFFER_ROWS = 2;  // lignes tampon pour préchargement

export default function ProductsPage() {
  const { t } = useI18n();

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sizeFilter, setSizeFilter] = useState<Product['size'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const [cols, setCols] = useState(1);          // colonnes dynamiques
  const [startRow, setStartRow] = useState(0);  // première ligne affichée
  const containerRef = useRef<HTMLDivElement>(null);
  const lastRowRef = useRef<HTMLDivElement>(null);

  const ITEM_HEIGHT = 420; // hauteur de la carte

  /* ---------------- COLONNES RESPONSIVES ---------------- */
  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w < 640) setCols(1);
      else if (w < 768) setCols(2);
      else if (w < 1024) setCols(3);
      else setCols(4);
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  /* ---------------- FETCH PRODUITS ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');

        const result = (await res.json()) as Product[] | Record<string, Product[]>;
        if (Array.isArray(result)) setData(result);
        else if (result && Object.values(result).length > 0)
          setData(Object.values(result).flat() as Product[]);
        else setError('No products found');
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------------- TRI ---------------- */
  const sortedProducts = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [data, sortBy]);

  /* ---------------- FILTRE ---------------- */
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter(p => sizeFilter === 'All' || p.size === sizeFilter);
  }, [sortedProducts, sizeFilter]);

  /* ---------------- CONSTRUCTION PAR LIGNES ---------------- */
  const lines: Product[][] = useMemo(() => {
    const res: Product[][] = [];
    for (let i = 0; i < filteredProducts.length; i += cols) {
      res.push(filteredProducts.slice(i, i + cols));
    }
    return res;
  }, [filteredProducts, cols]);

  const totalRows = lines.length;

  /* ---------------- WINDOW LIGNES ---------------- */
  const windowLines = useMemo(() => {
    const from = Math.max(0, startRow - BUFFER_ROWS);
    const to = Math.min(totalRows, startRow + VISIBLE_ROWS + BUFFER_ROWS);
    return lines.slice(from, to);
  }, [lines, startRow, totalRows]);

  /* ---------------- PRELOAD MINIATURES PAR LIGNE ---------------- */
  useEffect(() => {
    if (!windowLines.length) return;
    setFilterLoading(true);
    let loadedCount = 0;
    windowLines.flat().forEach(p => {
      const img = new Image();
      img.src = p.imageThumbnail;
      img.onload = img.onerror = () => {
        loadedCount++;
        if (loadedCount === windowLines.flat().length) setFilterLoading(false);
      };
    });
  }, [windowLines]);

  /* ---------------- RESET START SUR FILTRE/TRI ---------------- */
  const resetStart = () => {
    if (!containerRef.current) {
      setStartRow(0);
      return;
    }
    const scrollTop = containerRef.current.scrollTop;
    const newStart = Math.floor(scrollTop / ITEM_HEIGHT);
    setStartRow(newStart);
  };

  /* ---------------- OBSERVER POUR INFINITE SCROLL ---------------- */
  useEffect(() => {
    if (!lastRowRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setStartRow(prev => {
            const next = prev + VISIBLE_ROWS;
            return Math.min(next, totalRows - VISIBLE_ROWS);
          });
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );

    observer.observe(lastRowRef.current);
    return () => observer.disconnect();
  }, [windowLines, totalRows]);

  /* ---------------- STATES ---------------- */
  if (loading) return <ProductsLoading />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">{error}</p>
          <Link
            href="/"
            className="mt-4 inline-block bg-[var(--gold)] text-black px-6 py-3 font-semibold"
          >
            {t('actions.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- SPACERS ---------------- */
  const topSpacerHeight = startRow * ITEM_HEIGHT;
  const bottomSpacerHeight = Math.max(0, (totalRows - (startRow + windowLines.length)) * ITEM_HEIGHT);

  /* ---------------- RENDER ---------------- */
  return (
    <div className="stoneBg text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <h1 className="text-4xl font-bold mb-6">{t('headings.allArtworks')}</h1>

        {/* FILTRE & TRI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <select
            value={sizeFilter}
            onChange={e => {
              setSizeFilter(e.target.value as any);
              resetStart();
            }}
            className="p-3 border bg-white text-black"
          >
            <option value="All">{t('products.allSizes')}</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>

          <select
            value={sortBy}
            onChange={e => {
              setSortBy(e.target.value as any);
              resetStart();
            }}
            className="p-3 border bg-white text-black"
          >
            <option value="default">{t('sort.default')}</option>
            <option value="price-asc">{t('sort.priceAsc')}</option>
            <option value="price-desc">{t('sort.priceDesc')}</option>
          </select>
        </div>

        {/* GRID VIRTUELLE */}
        <div
          ref={containerRef}
          style={{ maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}
        >
          {filterLoading && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/50 z-50 pointer-events-none">
              <span className="text-xl font-semibold animate-pulse">{t('loading')}</span>
            </div>
          )}

          <div style={{ height: topSpacerHeight }} />

          {windowLines.map((line, rowIdx) => {
            const isLastLine = rowIdx === windowLines.length - 1;
            return (
              <div
                key={startRow + rowIdx}
                ref={isLastLine ? lastRowRef : null}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6"
              >
                {line.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={startRow === 0 && rowIdx === 0}
                  />
                ))}
              </div>
            );
          })}

          <div style={{ height: bottomSpacerHeight }} />
        </div>
      </div>
    </div>
  );
}