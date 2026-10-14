"use client";

import { useEffect, type RefObject } from "react";

/** Cached reduced-motion lookup (the query rarely changes mid-session). */
let reducedMotion: boolean | null = null;
export function prefersReducedMotion() {
  if (reducedMotion === null) {
    reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return reducedMotion;
}

/** Eases `current` toward `target` and snaps when it is close enough to matter. */
export function easeTo(current: number, target: number, k = 0.09) {
  const next = current + (target - current) * k;
  return Math.abs(target - next) < 0.0006 ? target : next;
}

/** Reads a section's scroll progress from 0..1 without touching layout twice. */
export function sectionProgress(sec: HTMLElement) {
  const max = sec.offsetHeight - window.innerHeight;
  const raw = max > 0 ? -sec.getBoundingClientRect().top / max : 0;
  return raw < 0 ? 0 : raw > 1 ? 1 : raw;
}

/**
 * Drives a requestAnimationFrame loop **only** while `host` is near the viewport
 * and the tab is visible, and parks it the moment `frame()` reports the
 * animation has settled for the current scroll position.
 *
 * Every scroll-linked section on the landing page runs through here, so a
 * ~35,000px document costs no main-thread time while the reader is somewhere
 * else — and nothing keeps rendering behind a backgrounded tab.
 *
 * `frame` must be stable (wrap it in `useCallback`) and return `true` once the
 * motion has converged; the loop restarts on the next scroll, resize or
 * visibility change.
 */
export function useRafLoop(
  host: RefObject<HTMLElement | null>,
  frame: () => boolean,
  rootMargin = "320px 0px"
) {
  useEffect(() => {
    let raf = 0;
    let running = false;
    let inView = false;

    const canRun = () => inView && !document.hidden;

    const step = () => {
      if (!canRun()) {
        running = false;
        return;
      }
      if (frame()) {
        running = false; // settled — the next scroll/visibility change wakes it
        return;
      }
      raf = requestAnimationFrame(step);
    };

    const wake = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(step);
    };

    const park = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const el = host.current;
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              inView = entries.some((entry) => entry.isIntersecting);
              if (inView) wake();
              else park();
            },
            { rootMargin }
          )
        : null;

    if (el && io) io.observe(el);
    else inView = true;

    const onMove = () => wake();
    const onVisibility = () => (document.hidden ? park() : wake());

    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    if (canRun()) wake();

    return () => {
      park();
      io?.disconnect();
      window.removeEventListener("scroll", onMove);
      window.removeEventListener("resize", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [host, frame, rootMargin]);
}
