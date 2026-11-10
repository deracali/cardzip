"use client";

import { useState } from "react";

export function useMenuState() {
  const [menuOpen, setMenuOpen] = useState(false);

  return { menuOpen, setMenuOpen };
}
