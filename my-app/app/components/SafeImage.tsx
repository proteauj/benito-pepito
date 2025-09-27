// app/components/SafeImage.tsx
"use client";

import { useState, useEffect } from "react";

interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | undefined | null;
  fallbackSrc?: string;
  className?: string;
}

/**
 * Composant Image sécurisé avec gestion des erreurs et fallback
 * Utilise une balise img standard au lieu de next/image
 */
export default function SafeImage({
  src: originalSrc,
  alt = "",
  fallbackSrc = "/images/placeholder.jpg",
  className = "",
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(() => {
    // Si pas de source, utiliser le fallback
    if (!originalSrc) return fallbackSrc;
    // Si c'est une URL absolue, l'utiliser telle quelle
    if (originalSrc.startsWith('http') || originalSrc.startsWith('data:')) {
      return originalSrc;
    }
    // Sinon, ajouter le préfixe /images/ si nécessaire
    return originalSrc.startsWith('/') ? originalSrc : `/images/${originalSrc}`;
  });

  // Mettre à jour l'image quand la source change
  useEffect(() => {
    if (!originalSrc) {
      setImgSrc(fallbackSrc);
      return;
    }
    
    // Nettoyer le chemin de l'image
    const cleanSrc = originalSrc.startsWith('/') || 
                    originalSrc.startsWith('http') || 
                    originalSrc.startsWith('data:')
      ? originalSrc 
      : `/images/${originalSrc}`;
      
    setImgSrc(cleanSrc);
  }, [originalSrc, fallbackSrc]);

  // Gestion des erreurs de chargement
  const handleError = () => {
    console.error(`Image failed to load: ${imgSrc}`);
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  // Si pas de source et pas de fallback, retourner un div vide
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
      src={imgSrc}  // Ici, imgSrc est toujours une string
      alt={alt}
      className={`block max-w-full h-auto ${className}`}
      onError={handleError}
      loading={props.loading || "lazy"}
    />
  );
}