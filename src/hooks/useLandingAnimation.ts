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

    let target = 0;
    let current = 0;
    let frame = 0;
    let lastPhase = -1;

    const applyHeroPhase = (idx: number) => {
      const phase = HERO_PHASES[idx];
      if (!phase || !heroCopy.current) return;
      const eyebrow = heroCopy.current.querySelector("[data-hero-eyebrow]");
      const lines = heroCopy.current.querySelectorAll("[data-hero-line]");
      const heroSection = hero.current;
      const desc = heroSection?.querySelector("[data-hero-desc]");
      if (eyebrow && eyebrow.textContent !== phase.eyebrow) {
        eyebrow.textContent = phase.eyebrow;
      }
      lines.forEach((el, i) => {
        if (el.textContent !== phase.lines[i]) el.textContent = phase.lines[i] ?? "";
      });
      if (desc && desc.textContent !== phase.desc) desc.textContent = phase.desc;
      // quick morph pop
      heroCopy.current.classList.remove("heroSwap");
      // force reflow for restartable animation
      void heroCopy.current.offsetWidth;
      heroCopy.current.classList.add("heroSwap");
    };

    const render = () => {
      const heroEl = hero.current;
      const coreEl = core.current;
      if (!heroEl || !coreEl) {
        frame = requestAnimationFrame(render);
        return;
      }

      const hr = heroEl.getBoundingClientRect();
      const heroMax = heroEl.offsetHeight - window.innerHeight;
      const p = clamp(-hr.top / heroMax);

      target = p;
      current = lerp(current, target, 0.085);

      // HERO: every major visual is driven by the scroll percentage.
      const rotation = current * 720;
      const scale = 1 + current * 0.8;
      const moveX = current * Math.min(window.innerWidth * 0.24, 310);
      const moveY = -Math.sin(current * Math.PI) * 70;
      coreEl.style.transform = `translate(calc(-50% + ${moveX}px),calc(-50% + ${moveY}px)) scale(${scale}) rotateZ(${current * 16}deg)`;

      if (rotor.current) {
        rotor.current.style.transform = `rotateZ(${rotation}deg) rotateX(${current * 8}deg)`;
      }

      const ringEls = rings.current ?? [];
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
        heroCopy.current.style.transform = `translate3d(${-current * window.innerWidth * 0.3}px,${-current * 130}px,0) scale(${1 - current * 0.36})`;
        heroCopy.current.style.opacity = String(clamp(1 - current * 2.1));

        // HERO TEXT MORPH: swap headline as user scrolls (visible range 0..0.55)
        const phaseT = clamp(current / 0.55);
        const phaseIdx = Math.min(
          HERO_PHASES.length - 1,
          Math.floor(phaseT * HERO_PHASES.length)
        );
        if (phaseIdx !== lastPhase) {
          lastPhase = phaseIdx;
          applyHeroPhase(phaseIdx);
        }
      }

      (labels.current ?? []).forEach((el, i) => {
        if (!el) return;
        const starts = [0.05, 0.3, 0.56][i];
        const ends = [0.33, 0.62, 0.9][i];
        const q = clamp((current - starts) / (ends - starts));
        const direction = i === 1 ? -1 : 1;
        el.style.opacity = String(Math.sin(q * Math.PI));
        el.style.transform = `translate3d(${direction * (1 - q) * 110}px,${(1 - q) * 45}px,0) rotate(${(i - 1) * q * 10}deg)`;
      });

      if (heroProgress.current) {
        heroProgress.current.style.width = `${current * 100}%`;
      }

      // Statement section: giant word floats opposite the scroll.
      if (about.current && floatWord.current && statement.current) {
        const sr = about.current.getBoundingClientRect();
        const sp = clamp(
          (window.innerHeight - sr.top) / (window.innerHeight + sr.height)
        );
        floatWord.current.style.transform = `translate3d(${-sp * 180}px,${sp * 90}px,0) rotate(${-sp * 8}deg)`;
        statement.current.style.transform = `translate3d(${(1 - sp) * 120}px,${(1 - sp) * 30}px,0)`;
      }

      // PINNED HORIZONTAL SERVICES: vertical scrolling drives horizontal movement.
      if (service.current && track.current) {
        const ss = service.current.getBoundingClientRect();
        const serviceMax = service.current.offsetHeight - window.innerHeight;
        const sx = clamp(-ss.top / serviceMax);
        const maxTravel = Math.max(
          0,
          track.current.scrollWidth - window.innerWidth * 0.9
        );
        track.current.style.transform = `translate3d(${-sx * maxTravel}px,0,0)`;
      }

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
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
