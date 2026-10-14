"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

/** stable no-op subscribe used only to detect "are we on the client yet?" */
const emptySubscribe = () => () => {};

/**
 * Adaptive black & white arrow cursor:
 * - real pointer shape (tip sits exactly at the mouse point)
 * - pure-white arrow with `mix-blend-mode: difference` => it flips to
 *   black on light areas and stays white on dark ones — always visible
 * - leans slightly into the direction of movement
 * - hover of links/buttons => soft ring appears + arrow grows
 * - click => arrow kick + water-drop ripple (kept)
 */
export default function TurbineCursor() {
  // client detection without a setState-in-effect cascading render
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const dotRef = useRef<HTMLDivElement>(null);
  const rippleLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const dot = dotRef.current;
    const layer = rippleLayerRef.current;
    if (!dot || !layer) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let x = mx;
    let y = my;
    let lastX = mx;
    let targetTilt = 0;
    let tilt = 0;
    let frame = 0;
    let visible = false;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
      }
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      targetTilt = Math.max(-16, Math.min(16, dx * 1.6));
    };

    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
    };

    // ring appears over anything interactive; fades elsewhere
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element;
      const hit = t.closest
        ? t.closest(
            "a, button, [role='button'], input, textarea, select, .industry, .serviceCard, .worksCard"
          )
        : null;
      if (hit) dot.classList.add("tc-link");
      else dot.classList.remove("tc-link");
    };

    const spawnRipple = (cx: number, cy: number) => {
      // water-drop ripple: core drop + 3 expanding waves + droplets
      const wrap = document.createElement("div");
      wrap.className = "tc-ripple";
      wrap.style.left = `${cx}px`;
      wrap.style.top = `${cy}px`;

      const drop = document.createElement("span");
      drop.className = "tc-drop";
      wrap.appendChild(drop);

      for (let i = 0; i < 3; i++) {
        const wave = document.createElement("span");
        wave.className = `tc-wave w${i + 1}`;
        wrap.appendChild(wave);
      }

      for (let i = 0; i < 6; i++) {
        const s = document.createElement("span");
        s.className = "tc-splash";
        const a = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
        const d = 26 + Math.random() * 26;
        s.style.setProperty("--sx", `${Math.cos(a) * d}px`);
        s.style.setProperty("--sy", `${Math.sin(a) * d - 10}px`);
        wrap.appendChild(s);
      }

      layer.appendChild(wrap);
      window.setTimeout(() => wrap.remove(), 1100);
    };

    const onDown = (e: MouseEvent) => {
      spawnRipple(e.clientX, e.clientY);
      dot.classList.add("tc-kick");
      window.setTimeout(() => dot.classList.remove("tc-kick"), 240);
    };

    const render = () => {
      x += (mx - x) * 0.24;
      y += (my - y) * 0.24;
      tilt += (targetTilt - tilt) * 0.14;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${tilt.toFixed(2)}deg)`;
      frame = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    frame = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <>
      <div ref={rippleLayerRef} className="tc-ripples" aria-hidden="true" />
      <div ref={dotRef} className="tc-cursor" aria-hidden="true">
        <svg className="tcArrow" viewBox="0 0 24 26" aria-hidden="true">
          <path d="M0 0 L0 17.5 L5.4 13.6 L9 24.5 L12.6 22.9 L9.2 12 L16 12.4 Z" />
        </svg>
        <div className="tc-ring" />
      </div>
    </>,
    document.body
  );
}