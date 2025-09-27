"use client";

import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";

// A thin wrapper around next/image that swaps to a fallback image URL if the original fails.
// Use for remote images that may 404 or be rate-limited.
export default function SafeImage(props: ImageProps & { fallbackSrc?: string }) {
  const { src, alt, fallbackSrc = "/textures/stone.svg", ...rest } = props;
  const [currentSrc, setCurrentSrc] = useState(src);

  // When the src prop changes (e.g., slideshow moves to next product),
  // reset currentSrc so the new image is displayed.
  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <Image
      {...rest}
      src={currentSrc}
      alt={alt}
      onError={() => setCurrentSrc(fallbackSrc)}
    />
  );
}
