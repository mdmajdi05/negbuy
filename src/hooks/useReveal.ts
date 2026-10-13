"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Global scroll-reveal. Adds `.rv-in` to any `.rv` element when it enters the
 * viewport, with an optional stagger via `data-rv-delay` (ms).
 *
 * Uses IntersectionObserver for natural scroll plus a rAF-throttled scroll
 * fallback, so elements are still revealed after instant jumps (anchor links,
 * programmatic scrollTo) that could otherwise skip an observer tick.
 */
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    let nodes = Array.from(
      document.querySelectorAll<HTMLElement>(".rv:not(.rv-in)")
    );
    if (nodes.length === 0) return;

    const reveal = (el: HTMLElement) => {
      const delay = Number(el.dataset.rvDelay || 0);
      if (delay > 0) window.setTimeout(() => el.classList.add("rv-in"), delay);
      else el.classList.add("rv-in");
    };

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                reveal(entry.target as HTMLElement);
                io?.unobserve(entry.target);
              });
            },
            { rootMargin: "0px 0px -10% 0px", threshold: 0 }
          )
        : null;

    if (io) {
      nodes.forEach((n) => io.observe(n));
    } else {
      nodes.forEach(reveal);
      return;
    }

    let raf = 0;
    const sweep = () => {
      raf = 0;
      const limit = window.innerHeight * 0.92;
      nodes = nodes.filter((n) => {
        if (n.classList.contains("rv-in")) return false;
        const rect = n.getBoundingClientRect();
        if (rect.top < limit || rect.bottom <= 0) {
          reveal(n);
          return false;
        }
        return true;
      });
      if (nodes.length === 0) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(sweep);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Animated number counter that runs once when scrolled into view. */
export function useCountUp(value: number, duration = 1600) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let started = false;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(value * eased);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) {
          started = true;
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return { ref, display };
}

/** Reports vertical scroll progress (0..1) of an element through the viewport. */
export function useSectionProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      setProgress(total > 0 ? Math.max(0, Math.min(1, scrolled / total)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return { ref, progress };
}
