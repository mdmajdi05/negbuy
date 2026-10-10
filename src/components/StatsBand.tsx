"use client";

import { useEffect, useRef } from "react";

const MARQUEE = [
  "GAS TURBINES",
  "LUBE OIL SYSTEMS",
  "MARINE PROPULSION",
  "POWER GENERATION",
  "INDUSTRIAL AUTOMATION",
  "EV + SOLAR",
];

const STATS = [
  { value: 42.6, decimals: 1, suffix: " MW", label: "Power supported", sub: "Across generation sites" },
  { value: 12480, decimals: 0, suffix: "", label: "Units / shift", sub: "Factory line output", comma: true },
  { value: 99.4, decimals: 1, suffix: "%", label: "QC pass rate", sub: "Vision-inspected seams" },
  { value: 40, decimals: 0, suffix: "+", label: "Vessels served", sub: "Marine + offshore" },
];

export default function StatsBand() {
  const bandRef = useRef<HTMLElement>(null);
  const numRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const format = (v: number, i: number) => {
      const s = STATS[i];
      const fixed = v.toFixed(s.decimals);
      const withComma = s.comma
        ? Number(fixed).toLocaleString("en-US")
        : fixed;
      return `${withComma}${s.suffix}`;
    };

    const run = () => {
      numRefs.current.forEach((el, i) => {
        if (!el) return;
        const target = STATS[i].value;
        if (reduced) {
          el.textContent = format(target, i);
          return;
        }
        const t0 = performance.now();
        const dur = 1700;
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = format(target * eased, i);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            run();
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(band);
    return () => io.disconnect();
  }, []);

  const row = [...MARQUEE, ...MARQUEE];

  return (
    <section className="statsBand" ref={bandRef} aria-label="NEGBUY in numbers">
      <div className="marquee" aria-hidden="true">
        <div className="marqueeTrack">
          {[0, 1].map((half) => (
            <div key={half} className="marqueeHalf">
              {row.map((m, i) => (
                <span key={`${half}-${i}`} className="mqItem">
                  {m} <i>•</i>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="statsGrid">
        {STATS.map((s, i) => (
          <div key={s.label} className="statCell reveal">
            <b
              ref={(el) => {
                numRefs.current[i] = el;
              }}
            >
              0{s.suffix}
            </b>
            <span className="statLabel">{s.label}</span>
            <small>{s.sub}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
