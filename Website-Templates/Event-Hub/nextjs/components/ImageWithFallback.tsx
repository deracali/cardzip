"use client";

import { useState, type ComponentProps } from "react";

export default function ImageWithFallback({ src, alt, ...props }: ComponentProps<"img">) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      {...props}
      src={failed || !src ? "/event-placeholder.svg" : src}
      alt={alt}
      onError={() => setFailed(true)}
    />
  );
}
