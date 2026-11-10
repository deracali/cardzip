"use client";

import { usePathname } from "next/navigation";

export function useCurrentPath(): string {
  const pathname = usePathname();
  return pathname?.replace(/\/+$/, "") || "/";
}
