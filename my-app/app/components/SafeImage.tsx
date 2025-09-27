// app/components/SafeImage.tsx
import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src: string | undefined | null;
  fallbackSrc?: string;
}

export default function SafeImage({ 
  src, 
  alt, 
  fallbackSrc = "/images/placeholder.jpg", // Mettez un chemin d'image de secours dans public/images
  ...rest 
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
      unoptimized // Important pour éviter les problèmes avec les images locales
    />
  );
}