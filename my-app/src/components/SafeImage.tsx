"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

// A thin wrapper around next/image that swaps to a fallback image URL if the original fails.
// Use for remote images that may 404 or be rate-limited.
export default function SafeImage(props: ImageProps & { fallbackSrc?: string }) {
  const { src, alt, fallbackSrc = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60", ...rest } = props;
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <Image
      {...rest}
      src={currentSrc}
      alt={alt}
      onError={() => setCurrentSrc(fallbackSrc)}
    />
  );
}
