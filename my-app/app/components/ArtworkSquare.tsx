"use client";

interface ArtworkSquareProps {
  src: string;
  alt: string;
  href?: string;
  priority?: boolean;
  className?: string;
  matPaddingClass?: string;
}

export default function ArtworkSquare({ 
  src, 
  alt, 
  priority = false, 
  className = "", 
  matPaddingClass = "p-2" 
}: ArtworkSquareProps) {
  // Assurez-vous que le chemin commence par /images
  const imagePath = src.startsWith('/') ? src : `/images/${src}`;
  
  return (
    <div className={`relative w-full aspect-square bg-[color:var(--wood,theme(colors.amber.800))] art-wood overflow-hidden ${className}`}>
      <div className={`absolute inset-0 box-border ${matPaddingClass}`}>
        <div className="relative w-full h-full bg-white shadow-sm">
          <img
            src={imagePath}
            alt={alt}
            className="object-contain w-full h-full"
            loading={priority ? 'eager' : 'lazy'}
            onError={(e) => {
              // Fallback en cas d'erreur
              if (e.currentTarget.src !== '/images/placeholder.jpg') {
                e.currentTarget.src = '/images/placeholder.jpg';
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}