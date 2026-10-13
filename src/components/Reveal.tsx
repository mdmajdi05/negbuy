"use client";

import { useReveal } from "@/hooks/useReveal";

/**
 * Drop-in client island that activates the global scroll-reveal observer for
 * server-rendered pages. Renders nothing.
 */
export default function Reveal() {
  useReveal();
  return null;
}
