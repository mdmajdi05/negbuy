"use client";

import { useEffect, useRef } from "react";

const STAGES = [
  {
    tag: "STAGE 01 / INTAKE",
    title: "AIR INTAKE",
    desc: "Giant inlet guides pull 800kg of air per second into the compressor. Rotor spools up, inlet vanes adjust angle live.",
    metric: "12,400",
    unit: "RPM ROTOR",
    bar: 22,
  },
  {
    tag: "STAGE 02 / COMPRESSION + OIL",
    title: "OIL PRESSURE",
    desc: "Lube-oil skids push ISO VG-46 oil at 8 bar through bearings. Watch the amber oil line pulse — cooling + lubrication in one loop.",
    metric: "8.2",
    unit: "BAR OIL LINE",
    bar: 55,
  },
  {
    tag: "STAGE 03 / COMBUSTION",
    title: "IGNITION CORE",
    desc: "Compressed air meets fuel. 1,400°C flame held inside the liner while the casing stays cool — the hottest controlled fire in industry.",
    metric: "1,400°",
    unit: "C COMBUSTOR",
    bar: 82,
  },
  {
    tag: "STAGE 04 / POWER OUT",
    title: "POWER OUTPUT",
    desc: "Exhaust expands through power turbine stages. Shaft torque becomes megawatts feeding the grid, ships and plants.",
    metric: "42.6",
    unit: "MW OUTPUT",
    bar: 100,
  },
];

const CARDS = [
  {
    img: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800&auto=format&fit=crop",
    alt: "Engineer inspecting gas turbine",
    no: "TW — 01",
    title: "Gas Turbine Overhaul",
    desc: "Hot-gas-path inspection, blade replacement and balancing under ISO clean-room discipline.",
    stat: "98.2% availability",
  },
  {
    img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    alt: "Industrial oil and piping systems",
    no: "TW — 02",
    title: "Lube Oil Supply Skids",
    desc: "Pumps, coolers, filters and accumulators — complete oil circulation packages for turbines.",
    stat: "8 bar continuous",
  },
  {
    img: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=800&auto=format&fit=crop",
    alt: "Container ship for marine propulsion",
    no: "TW — 03",
    title: "Marine Propulsion",
    desc: "Propulsion turbines, gearboxes and control retrofits for vessels and offshore platforms.",
    stat: "40+ vessels served",
  },
  {
    img: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=800&auto=format&fit=crop",
    alt: "Wind turbines at power plant",
    no: "TW — 04",
    title: "Power Plant Support",
    desc: "Spares, commissioning and lifetime extension for generation and solar-hybrid sites.",
    stat: "240 MW supported",
  },
];

export default function TurbineWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const fanRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const oilRef = useRef<HTMLDivElement>(null);
  const stageEls = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    let frame = 0;
    let current = 0;

    const render = () => {
      const sec = sectionRef.current;
      if (!sec) {
        frame = requestAnimationFrame(render);
        return;
      }
      const rect = sec.getBoundingClientRect();
      const max = sec.offsetHeight - window.innerHeight;
      const raw = max > 0 ? -rect.top / max : 0;
      const target = Math.max(0, Math.min(1, raw));
      current += (target - current) * (reduced ? 1 : 0.1);

      // 3D engine reacts to scroll: spins up, tilts, heats up
      if (fanRef.current) {
        const spins = 40 + current * 1400;
        fanRef.current.style.transform = `rotateZ(${spins}deg)`;
      }
      if (engineRef.current) {
        engineRef.current.style.transform = `rotateX(${52 - current * 22}deg) rotateZ(${-12 + current * 34}deg) scale(${1 + current * 0.12})`;
      }
      if (glowRef.current) {
        const heat = current;
        glowRef.current.style.opacity = String(0.25 + heat * 0.75);
        glowRef.current.style.transform = `translate(-50%,-50%) scale(${0.8 + heat * 0.9})`;
        glowRef.current.style.filter = `blur(${18 - heat * 8}px) hue-rotate(${-heat * 24}deg)`;
      }
      if (oilRef.current) {
        oilRef.current.style.setProperty("--oil-speed", `${0.6 + current * 3}s`);
        (oilRef.current as HTMLElement).style.opacity = String(
          0.55 + current * 0.45
        );
      }

      // stage text crossfade
      const idx = Math.min(
        STAGES.length - 1,
        Math.floor(current * STAGES.length)
      );
      stageEls.current.forEach((el, i) => {
        if (!el) return;
        const active = i === idx;
        el.classList.toggle("active", active);
        el.setAttribute("aria-hidden", active ? "false" : "true");
      });
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${current})`;
      }

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section
      className="worksScroll"
      ref={sectionRef}
      aria-label="How turbines work — oil supply and power stages"
    >
      <div className="worksPin">
        <div className="worksGrid" aria-hidden="true" />
        <div className="worksHead">
          <div className="kicker">01.5 / Inside the machine</div>
          <h2>
            WATCH A TURBINE
            <br />
            <span>BREATHE + BURN.</span>
          </h2>
          <p>
            Scroll — the rotor spools up, oil starts flowing and the core heats
            to full power. A live cutaway of what NEGBUY supplies and services.
          </p>
        </div>

        <div className="worksBody">
          {/* 3D ENGINE */}
          <div className="engineWrap" aria-hidden="true">
            <div className="engineGlow" ref={glowRef} />
            <div className="engine3d" ref={engineRef}>
              <div className="casing c1" />
              <div className="casing c2" />
              <div className="casing c3" />
              <div className="fan" ref={fanRef}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <span
                    key={i}
                    className="fanBlade"
                    style={{
                      transform: `translate(-50%,-100%) rotate(${i * 30}deg)`,
                    }}
                  />
                ))}
              </div>
              <div className="shaft" />
              <div className="flame f1" />
              <div className="flame f2" />
              <div className="flame f3" />
              {/* oil pipe looping around casing */}
              <div className="oilPipe" ref={oilRef}>
                <i className="oilFlow" />
                <i className="oilFlow d2" />
                <b className="oilDot o1" />
                <b className="oilDot o2" />
                <b className="oilDot o3" />
              </div>
              {/* steam / exhaust particles */}
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} className={`puff p${i + 1}`} />
              ))}
            </div>
            <div className="engineBase">
              <span>
                <i /> INLET
              </span>
              <span>
                <i /> OIL LOOP
              </span>
              <span>
                <i /> COMBUSTOR
              </span>
              <span>
                <i /> EXHAUST
              </span>
            </div>
          </div>

          {/* STAGES */}
          <div className="stages">
            {STAGES.map((s, i) => (
              <div
                key={s.tag}
                ref={(el) => {
                  stageEls.current[i] = el;
                }}
                className={`stage${i === 0 ? " active" : ""}`}
              >
                <div className="stageTag">{s.tag}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="metric">
                  <b>{s.metric}</b>
                  <small>{s.unit}</small>
                </div>
                <div className="bar">
                  <i style={{ width: `${s.bar}%` }} />
                </div>
              </div>
            ))}
            <div className="worksProgress">
              <div className="worksProgressTrack">
                <div className="worksProgressFill" ref={progressRef} />
              </div>
              <span>SCROLL TO SPOOL UP</span>
            </div>
          </div>
        </div>
      </div>

      {/* IMAGE CARDS */}
      <div className="worksCards">
        <div className="worksCardsHead reveal">
          <div className="kicker">Field work / Oil + Turbines</div>
          <h2>
            REAL MACHINES.
            <br />
            REAL SITES.
          </h2>
        </div>
        <div className="worksCardGrid">
          {CARDS.map((c) => (
            <article key={c.no} className="worksCard reveal">
              <div className="worksImg">
                {/* plain img to avoid next-image domain config */}
                <img src={c.img} alt={c.alt} loading="lazy" />
                <span className="worksShine" aria-hidden="true" />
                <span className="worksNo">{c.no}</span>
              </div>
              <div className="worksCardText">
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
                <div className="worksStat">
                  <i aria-hidden="true" />
                  {c.stat}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
