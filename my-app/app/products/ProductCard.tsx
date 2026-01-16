'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { Product } from '../../lib/db/types';

interface Props {
  product: Product;
  priority?: boolean; // précharge seulement pour le viewport initial
}

export default function ProductCard({ product, priority }: Props) {
  const [showFull, setShowFull] = useState(false);
  const [imgHeight, setImgHeight] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setImgHeight(imgRef.current.naturalHeight / imgRef.current.naturalWidth * imgRef.current.width);
    }
  }, []);

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => setShowFull(true)}
    >
      {/* Image adaptative */}
      <div className="relative w-full" style={{ height: imgHeight || 300 }}>
        <Image
          ref={imgRef}
          src={product.imageThumbnail}
          alt={product.title}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 25vw"
          placeholder="blur"
          blurDataURL={product.imageThumbnail}
          onLoadingComplete={(img) => {
            const h = img.naturalHeight / img.naturalWidth * img.width;
            setImgHeight(h);
          }}
        />

        {showFull && (
          <Image
            src={product.image}
            alt={product.title}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        )}
      </div>

      <div className="p-4">
        <h2 className="font-semibold text-lg">{product.title}</h2>
        <p className="text-gray-600">{product.size}</p>
        <p className="mt-2 font-bold">${product.price}</p>
      </div>
    </div>
  );
}