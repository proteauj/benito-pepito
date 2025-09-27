// app/components/SafeImage.tsx
"use client";

import { useState, useEffect } from "react";

interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | undefined | null;
  fallbackSrc?: string;
  className?: string;
}

export default function SafeImage({
  src: originalSrc,
  alt = "",
  fallbackSrc = "/images/placeholder.jpg",
  className = "",
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    if (!originalSrc) return fallbackSrc;
    return processImagePath(originalSrc);
  });

  function processImagePath(path: string): string {
    // Si c'est une URL complète, la retourner telle quelle
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) {
      return path;
    }
    
    // Si le chemin commence par /, le retourner tel quel
    if (path.startsWith('/')) {
      return path;
    }
    
    // Sinon, ajouter le préfixe /images/
    return `/images/${path}`;
  }

  useEffect(() => {
    if (!originalSrc) {
      setImgSrc(fallbackSrc);
      return;
    }
    
    setImgSrc(processImagePath(originalSrc));
  }, [originalSrc, fallbackSrc]);

  const handleError = () => {
    console.error(`Image failed to load: ${imgSrc}`);
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  if (!originalSrc && !fallbackSrc) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ 
          width: props.width ? `${props.width}px` : '100%',
          height: props.height ? `${props.height}px` : '100%'
        }}
      >
        <span className="text-gray-500">No image</span>
      </div>
    );
  }

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      className={`block max-w-full h-auto ${className}`}
      onError={handleError}
      loading={props.loading || "lazy"}
    />
  );
}