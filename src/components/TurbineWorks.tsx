"use client";

import { useCallback, useRef } from "react";
import {
  easeTo,
  prefersReducedMotion,
  sectionProgress,
  useRafLoop,
} from "@/hooks/useRafLoop";

const STAGES = [
  {
    no: "01",
    tag: "STAGE 01 / INTAKE",
    title: "AIR INTAKE",
    desc: "Giant inlet guides pull 800kg of air per second into the compressor. Rotor spools up, inlet vanes adjust angle live.",
    metric: "12,400",
    unit: "RPM ROTOR",
    bar: 22,
  },
  {
    no: "02",
    tag: "STAGE 02 / COMPRESSION + OIL",
    title: "OIL PRESSURE",
    desc: "Lube-oil skids push ISO VG-46 oil at 8 bar through bearings. Watch the amber oil line pulse — cooling + lubrication in one loop.",
    metric: "8.2",
    unit: "BAR OIL LINE",
    bar: 55,
  },
  {
    no: "03",
    tag: "STAGE 03 / COMBUSTION",
    title: "IGNITION CORE",
    desc: "Compressed air meets fuel. 1,400°C flame held inside the liner while the casing stays cool — the hottest controlled fire in industry.",
    metric: "1,400°",
    unit: "C COMBUSTOR",
    bar: 82,
  },
  {
    no: "04",
    tag: "STAGE 04 / POWER OUT",
    title: "POWER OUTPUT",
    desc: "Exhaust expands through power turbine stages. Shaft torque becomes megawatts feeding the grid, ships and plants.",
    metric: "42.6",
    unit: "MW OUTPUT",
    bar: 100,
  },
];

const NOTES = [
  { cls: "n1", label: "INLET", value: "800 kg/s" },
  { cls: "n2", label: "OIL LOOP", value: "8 bar" },
  { cls: "n3", label: "COMBUSTOR", value: "1,400°C" },
  { cls: "n4", label: "EXHAUST", value: "42.6 MW" },
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
  const trackRef = useRef<HTMLDivElement>(null);
  const fanRef = useRef<HTMLImageElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const oilRef = useRef<HTMLDivElement>(null);
  const stageEls = useRef<(HTMLLIElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  const currentRef = useRef(0);

  const draw = useCallback(() => {
    const sec = sectionRef.current;
    if (!sec) return true;

    const target = sectionProgress(trackRef.current ?? sec);
    const next = easeTo(
      currentRef.current,
      target,
      prefersReducedMotion() ? 1 : 0.1
    );
    currentRef.current = next;

    // real turbine reacts to scroll: the fan spools up, orbit + heat follow
    if (fanRef.current) {
      const spins = next * 1080;
      fanRef.current.style.transform = `rotate(${spins}deg) scale(${
        1 + next * 0.03
      })`;
    }
    if (orbitRef.current) {
      orbitRef.current.style.transform = `rotate(${next * -55}deg)`;
    }
    if (glowRef.current) {
      const heat = next;
      glowRef.current.style.opacity = String(0.28 + heat * 0.62);
      glowRef.current.style.transform = `translate(-50%,-50%) scale(${
        0.74 + heat * 0.42
      })`;
    }
    if (oilRef.current) {
      oilRef.current.style.setProperty("--iw-spin", `${0.9 + next * 3}s`);
      oilRef.current.style.opacity = String(0.5 + next * 0.5);
    }

    // stage list: highlight the active row
    const idx = Math.min(STAGES.length - 1, Math.floor(next * STAGES.length));
    stageEls.current.forEach((el, i) => {
      if (!el) return;
      el.classList.toggle("active", i === idx);
    });
    if (readoutRef.current) {
      readoutRef.current.textContent = String(idx + 1).padStart(2, "0");
    }
    if (progressRef.current) {
      progressRef.current.style.transform = `scaleX(${next})`;
    }

    return next === target;
  }, []);

  useRafLoop(sectionRef, draw);

  return (
    <section
      className="iwScroll"
      id="inside-machine"
      ref={sectionRef}
      aria-label="How turbines work — oil supply and power stages"
    >
      {/* PINNED STAGE — scroll distance lives on .iwTrack */}
      <div className="iwTrack" ref={trackRef}>
        <div className="iwPin">
          <div className="iwGrid" aria-hidden="true" />

          <div className="iwInner">
            <header className="iwHead">
              <div className="iwHeadCopy">
                <div className="kicker">01.5 / Inside the machine</div>
                <h2>
                  WATCH A TURBINE
                  <br />
                  <span>BREATHE + BURN.</span>
                </h2>
              </div>
              <p className="iwLead">
                Scroll — the rotor spools up, oil starts flowing and the core
                heats to full power. A live look at the machines NEGBUY supplies
                and services.
              </p>
            </header>

            <div className="iwBody">
              {/* REAL TURBINE — transparent GE90 fan cut-out */}
              <figure className="iwVisual">
                <div className="iwGlow" ref={glowRef} aria-hidden="true" />
                <div className="iwOrbit" ref={orbitRef} aria-hidden="true" />
                <span className="iwAxis x" aria-hidden="true" />
                <span className="iwAxis y" aria-hidden="true" />

                <div className="iwFan" aria-hidden="true">
                  <div className="iwFanSpin">
                    <img
                      className="iwFanImg"
                      ref={fanRef}
                      src="/real/ge90-fan.webp"
                      alt=""
                      draggable={false}
                      loading="lazy"
                    />
                  </div>
                  <span className="iwHub">
                    <i />
                  </span>
                </div>

                <span className="iwArc" ref={oilRef} aria-hidden="true" />

                {NOTES.map((n) => (
                  <span className={`iwNote ${n.cls}`} key={n.cls}>
                    <b>
                      <i /> {n.label}
                    </b>
                    <small>{n.value}</small>
                  </span>
                ))}
              </figure>

              {/* STAGE LIST */}
              <ol className="iwStages">
                {STAGES.map((s, i) => (
                  <li
                    key={s.tag}
                    ref={(el) => {
                      stageEls.current[i] = el;
                    }}
                    className={`iwStage${i === 0 ? " active" : ""}`}
                  >
                    <span className="iwStageNo">{s.no}</span>
                    <div className="iwStageBody">
                      <span className="iwStageTag">{s.tag}</span>
                      <h3>{s.title}</h3>
                      <p>{s.desc}</p>
                      <div className="iwBar">
                        <i style={{ width: `${s.bar}%` }} />
                      </div>
                    </div>
                    <div className="iwStageMetric">
                      <b>{s.metric}</b>
                      <small>{s.unit}</small>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="iwProgress">
              <span className="iwProgressNo">
                <b ref={readoutRef}>01</b> / 04
              </span>
              <div className="iwProgressTrack">
                <div className="iwProgressFill" ref={progressRef} />
              </div>
              <em>SCROLL TO SPOOL UP</em>
            </div>
            <p className="iwCredit">
              Turbine photo — GE90 fan, Wikimedia Commons / CC BY-SA 2.0
            </p>
          </div>
        </div>
      </div>

      {/* FIELD WORK CARDS — normal flow, after the pinned track */}
      <div className="iwCards">
        <div className="iwCardsHead reveal">
          <div className="kicker">Field work / Oil + Turbines</div>
          <h2>
            REAL MACHINES.
            <br />
            REAL SITES.
          </h2>
        </div>
        <div className="iwCardGrid">
          {CARDS.map((c) => (
            <article key={c.no} className="iwCard reveal">
              <div className="iwShot">
                <img src={c.img} alt={c.alt} loading="lazy" />
                <span className="iwNo">{c.no}</span>
              </div>
              <div className="iwCardBody">
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
                <div className="iwStat">
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
