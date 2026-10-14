"use client";

import { useEffect, type RefObject } from "react";

const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export interface LandingRefs {
  hero: RefObject<HTMLElement | null>;
  core: RefObject<HTMLElement | null>;
  rotor: RefObject<HTMLElement | null>;
  rings: RefObject<(HTMLElement | null)[]>;
  heroCopy: RefObject<HTMLElement | null>;
  labels: RefObject<(HTMLElement | null)[]>;
  heroProgress: RefObject<HTMLElement | null>;
  floatWord: RefObject<HTMLElement | null>;
  statement: RefObject<HTMLElement | null>;
  about: RefObject<HTMLElement | null>;
  service: RefObject<HTMLElement | null>;
  track: RefObject<HTMLElement | null>;
}

const HERO_PHASES = [
  {
    eyebrow: "Energy · Turbine · Marine · Electrical",
    lines: ["POWER", "IN", "MOTION."],
    desc: "A cinematic industrial platform for NEGBUY — connecting critical equipment, energy systems and technology across demanding industries.",
  },
  {
    eyebrow: "Turbine · Rotation · 12,400 RPM",
    lines: ["TURBINE", "AT", "SPEED."],
    desc: "Gas turbine parts, engines and overhaul — balanced to micron precision, built for continuous duty.",
  },
  {
    eyebrow: "Oil · Pressure · 8.2 Bar Flow",
    lines: ["OIL", "IN", "FLOW."],
    desc: "Lube-oil skids, pumps and filtration keep bearings alive — cooling, cleaning and protecting every rotation.",
  },
  {
    eyebrow: "Energy · Grid · 42 MW Output",
    lines: ["POWER", "TO", "GRID."],
    desc: "From combustor to megawatts — NEGBUY moves energy to plants, vessels and cities. Keep scrolling to open the machine.",
  },
];

export function useLandingAnimation(refs: LandingRefs) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Show labels/hero in a stable, readable state without motion.
      refs.labels.current?.forEach((el) => {
        if (!el) return;
        el.style.opacity = "1";
      });
      return;
    }

    const {
      hero,
      core,
      rotor,
      rings,
      heroCopy,
      labels,
      heroProgress,
      floatWord,
      statement,
      about,
      service,
      track,
    } = refs;

    const ringEls = rings.current ?? [];
    const labelEls = labels.current ?? [];

    // Cache the morph text nodes once instead of querying on every phase change.
    const eyebrow =
      heroCopy.current?.querySelector<HTMLElement>("[data-hero-eyebrow]") ??
      null;
    const heroLines = heroCopy.current
      ? Array.from(
          heroCopy.current.querySelectorAll<HTMLElement>("[data-hero-line]")
        )
      : [];
    const descEl =
      hero.current?.querySelector<HTMLElement>("[data-hero-desc]") ?? null;

    // Layout measurements are expensive (forced reflow) — cache them and only
    // refresh on resize rather than every single animation frame.
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let heroMax = 1;
    let serviceMax = 1;
    let trackTravel = 0;

    const measure = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      heroMax = hero.current
        ? Math.max(1, hero.current.offsetHeight - vh)
        : 1;
      serviceMax = service.current
        ? Math.max(1, service.current.offsetHeight - vh)
        : 1;
      trackTravel = track.current
        ? Math.max(0, track.current.scrollWidth - vw * 0.9)
        : 0;
    };

    let target = 0;
    let current = 0;
    let lastPhase = -1;
    let frame = 0;
    let running = false;
    let dirty = true;

    // Only the regions currently near the viewport get measured / animated.
    const near = { hero: true, about: false, service: false };

    const applyHeroPhase = (idx: number) => {
      const phase = HERO_PHASES[idx];
      if (!phase || !heroCopy.current) return;
      if (eyebrow && eyebrow.textContent !== phase.eyebrow) {
        eyebrow.textContent = phase.eyebrow;
      }
      heroLines.forEach((el, i) => {
        const next = phase.lines[i] ?? "";
        if (el.textContent !== next) el.textContent = next;
      });
      if (descEl && descEl.textContent !== phase.desc) {
        descEl.textContent = phase.desc;
      }
      // Restartable morph pop: remove, force reflow, add.
      heroCopy.current.classList.remove("heroSwap");
      void heroCopy.current.offsetWidth;
      heroCopy.current.classList.add("heroSwap");
    };

    const render = () => {
      const wasDirty = dirty;

      // ---- HERO: read scroll progress (only when hero is near) ----
      if (dirty && near.hero && hero.current) {
        target = clamp(-hero.current.getBoundingClientRect().top / heroMax);
      }
      current = lerp(current, target, 0.11);
      const settled = Math.abs(current - target) < 0.0005;
      if (settled) current = target;
      dirty = false;

      const active = wasDirty || !settled;

      if (active && near.hero && core.current) {
        const rotation = current * 720;
        const scale = 1 + current * 0.8;
        const moveX = current * Math.min(vw * 0.24, 310);
        const moveY = -Math.sin(current * Math.PI) * 70;
        core.current.style.transform = `translate(calc(-50% + ${moveX}px),calc(-50% + ${moveY}px)) scale(${scale}) rotateZ(${current * 16}deg)`;

        if (rotor.current) {
          rotor.current.style.transform = `rotateZ(${rotation}deg) rotateX(${current * 8}deg)`;
        }
        if (ringEls[0]) {
          ringEls[0].style.transform = `rotateX(${67 - current * 30}deg) rotateZ(${current * 340}deg)`;
        }
        if (ringEls[1]) {
          ringEls[1].style.transform = `rotateX(${67 + current * 25}deg) rotateZ(${-current * 520}deg)`;
        }
        if (ringEls[2]) {
          ringEls[2].style.transform = `rotateX(${67 - current * 18}deg) rotateZ(${current * 680}deg)`;
        }

        if (heroCopy.current) {
          heroCopy.current.style.transform = `translate3d(${-current * vw * 0.3}px,${-current * 130}px,0) scale(${1 - current * 0.36})`;
          heroCopy.current.style.opacity = String(clamp(1 - current * 2.1));

          // HERO TEXT MORPH: swap headline as user scrolls (range 0..0.6).
          const phaseIdx = Math.min(
            HERO_PHASES.length - 1,
            Math.floor(clamp(current / 0.6) * HERO_PHASES.length)
          );
          if (phaseIdx !== lastPhase) {
            lastPhase = phaseIdx;
            applyHeroPhase(phaseIdx);
          }
        }

        labelEls.forEach((el, i) => {
          if (!el) return;
          const starts = [0.06, 0.32, 0.58][i];
          const ends = [0.34, 0.64, 0.92][i];
          const q = clamp((current - starts) / (ends - starts));
          const direction = i === 1 ? -1 : 1;
          el.style.opacity = String(Math.sin(q * Math.PI));
          el.style.transform = `translate3d(${direction * (1 - q) * 110}px,${(1 - q) * 45}px,0) rotate(${(i - 1) * q * 10}deg)`;
        });

        if (heroProgress.current) {
          heroProgress.current.style.width = `${current * 100}%`;
        }
      }

      // ---- Statement section: giant word floats opposite the scroll ----
      if (
        active &&
        near.about &&
        about.current &&
        floatWord.current &&
        statement.current
      ) {
        const sr = about.current.getBoundingClientRect();
        const sp = clamp((vh - sr.top) / (vh + sr.height));
        floatWord.current.style.transform = `translate3d(${-sp * 180}px,${sp * 90}px,0) rotate(${-sp * 8}deg)`;
        statement.current.style.transform = `translate3d(${(1 - sp) * 120}px,${(1 - sp) * 30}px,0)`;
      }

      // ---- Pinned horizontal services ----
      if (active && near.service && service.current && track.current) {
        const sx = clamp(
          -service.current.getBoundingClientRect().top / serviceMax
        );
        track.current.style.transform = `translate3d(${-sx * trackTravel}px,0,0)`;
      }

      // Idle => stop the loop entirely (restarted by scroll/resize/IO).
      if (!dirty && settled) {
        running = false;
        return;
      }
      frame = requestAnimationFrame(render);
    };

    const start = () => {
      if (running) return;
      running = true;
      dirty = true;
      frame = requestAnimationFrame(render);
    };

    measure();

    // Track which animated regions are near the viewport.
    const tag = new Map<Element, keyof typeof near>();
    if (hero.current) tag.set(hero.current, "hero");
    if (about.current) tag.set(about.current, "about");
    if (service.current) tag.set(service.current, "service");

    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                const key = tag.get(entry.target);
                if (key) near[key] = entry.isIntersecting;
              });
              start();
            },
            { rootMargin: "180px 0px" }
          )
        : null;
    tag.forEach((_key, el) => io?.observe(el));

    let resizeRaf = 0;
    const onResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        measure();
        start();
      });
    };
    const onScroll = () => start();
    const onVisibility = () => {
      if (!document.hidden) start();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    start();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      cancelAnimationFrame(frame);
      io?.disconnect();
    };
  }, [refs]);
}

export function useRevealObserver(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const rootEl = root.current;
    if (!rootEl) return;

    const elements = Array.from(
      rootEl.querySelectorAll<HTMLElement>(".reveal")
    );

    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("show"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [root]);
}
