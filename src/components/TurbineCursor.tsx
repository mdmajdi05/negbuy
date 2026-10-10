"use client";

import { useEffect, useRef } from "react";

/**
 * Tiny turbine-rotor cursor:
 * - follows mouse with lerp
 * - rotor spins faster when mouse moves
 * - click spawns a water-drop ripple (expanding waves)
 */
export default function TurbineCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const rotorRef = useRef<HTMLDivElement>(null);
  const rippleLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const dot = dotRef.current;
    const rotor = rotorRef.current;
    const layer = rippleLayerRef.current;
    if (!dot || !rotor || !layer) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let x = mx;
    let y = my;
    let angle = 0;
    let spin = 2.2; // base idle spin
    let lastX = mx;
    let lastY = my;
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
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      const speed = Math.min(28, Math.hypot(dx, dy));
      spin += speed * 0.55; // moving => rotor accelerates
      // tilt cursor slightly toward movement direction
      dot.dataset.tilt = String(Math.max(-18, Math.min(18, dx * 1.4)));
    };

    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
    };

    const spawnRipple = (cx: number, cy: number) => {
      // Water-drop ripple: core drop + 3 expanding waves
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

      // tiny splash droplets
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
      spin += 26; // click kick => turbine jolts
      dot.classList.add("tc-kick");
      window.setTimeout(() => dot.classList.remove("tc-kick"), 220);
    };

    const render = () => {
      x += (mx - x) * 0.22;
      y += (my - y) * 0.22;
      spin += (2.2 - spin) * 0.06; // ease back to idle
      angle = (angle + spin) % 360;
      const tilt = Number(dot.dataset.tilt || 0);
      dot.dataset.tilt = String(tilt * 0.88);
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%,-50%) rotate(${tilt}deg)`;
      rotor.style.transform = `rotate(${angle}deg)`;
      frame = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    frame = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div ref={rippleLayerRef} className="tc-ripples" aria-hidden="true" />
      <div ref={dotRef} className="tc-cursor" aria-hidden="true">
        <div className="tc-ring" />
        <div ref={rotorRef} className="tc-rotor">
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <span
              key={deg}
              className="tc-blade"
              style={{ transform: `translate(-50%,-100%) rotate(${deg}deg)` }}
            />
          ))}
        </div>
        <div className="tc-hub" />
        <div className="tc-center" />
      </div>
    </>
  );
}
