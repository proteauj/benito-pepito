"use client";

import SafeImage from "@/components/SafeImage";

interface ArtworkSquareProps {
  src: string;
  alt: string;
  href?: string;
  priority?: boolean;
  className?: string;
  matPaddingClass?: string; // e.g., "p-3"; default responsive padding
}

// Renders any image into a square with a wood-like background and a small inset
// so tall/wide artworks are zoomed out to fit uniformly.
export default function ArtworkSquare({ src, alt, priority = false, className = "", matPaddingClass = "p-2" }: ArtworkSquareProps) {
  return (
    <div className={`relative w-full aspect-square bg-[color:var(--wood,theme(colors.amber.800))] art-wood overflow-hidden ${className}`}>
      {/* Frame border */}
      <div className={`absolute inset-0 box-border ${matPaddingClass}`}>
        {/* Inner square where the artwork lives */}
        <div className="relative w-full h-full bg-white shadow-sm">
          <SafeImage
            src={src}
            alt={alt}
            fill
            priority={priority}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
