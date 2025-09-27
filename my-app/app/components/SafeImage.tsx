// app/components/SafeImage.tsx
"use client";

import { forwardRef, useState, useEffect } from "react";

interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | undefined | null;
  fallbackSrc?: string;
  className?: string;
}

const SafeImage = forwardRef<HTMLImageElement, SafeImageProps>(({
  src: originalSrc,
  alt = "",
  fallbackSrc = "/images/placeholder.jpg",
  className = "",
  ...props
}, ref) => {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    const processed = processImagePath(originalSrc || '');
    console.log('Initial image path:', { originalSrc, processed });
    return processed || fallbackSrc;
  });

  function processImagePath(path: string | undefined | null): string {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) {
      return path;
    }
    // Si le chemin ne commence pas par /, on ajoute /images/
    return path.startsWith('/') ? path : `/images/${path}`;
  }

  useEffect(() => {
    if (!originalSrc) {
      console.log('No source, using fallback');
      setImgSrc(fallbackSrc);
      return;
    }
    
    const newPath = processImagePath(originalSrc);
    console.log('Source changed:', { originalSrc, newPath });
    setImgSrc(newPath);
  }, [originalSrc, fallbackSrc]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Image error:', {
      src: imgSrc,
      originalSrc,
      fallbackSrc,
      error: e
    });
    
    if (imgSrc !== fallbackSrc) {
      console.log('Falling back to default image');
      setImgSrc(fallbackSrc);
    }
  };

  console.log('Rendering SafeImage with src:', imgSrc);

  if (!imgSrc) {
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
      ref={ref}
      {...props}
      src={imgSrc}
      alt={alt}
      className={`block max-w-full h-auto ${className}`}
      onError={handleError}
      loading={props.loading || "lazy"}
    />
  );
});

SafeImage.displayName = 'SafeImage';

export default SafeImage;